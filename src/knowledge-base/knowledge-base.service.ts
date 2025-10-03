import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { DataSource } from 'typeorm';

@Injectable()
export class KnowledgeBaseService {
  private readonly logger = new Logger(KnowledgeBaseService.name);

  constructor(
    private dataSource: DataSource,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async createDepositDocument() {
    const resources = await this.dataSource.query(`SELECT * FROM resource`);

    this.logger.log(
      `Starting building of ${resources.length} deposit resources`,
    );
    const startTime = Date.now();

    const documents: any[] = [];
    for (const resource of resources) {
      const subjectResources = await this.dataSource.query(
        `SELECT * FROM subject_resource WHERE uuid_resource = '${resource.uuid_rda}'`,
      );

      const uriType = [];

      const workflowsRelations = await this.dataSource.query(
        `SELECT * FROM resource_workflow WHERE uuid_resource = '${resource.uuid_rda}'`,
      );

      const workflows: any[] = [];
      for (const wr of workflowsRelations) {
        const workflow: any[] = await this.dataSource.query(
          `SELECT * FROM workflow WHERE "UUID_Workflow" = '${wr.uuid_adoption_state}' LIMIT 1`,
        );

        if (workflow.length < 1) {
          continue;
        }
        workflows.push({ ...workflow[0], status: wr.status });
      }

      const rightsResource = await this.dataSource.query(
        `SELECT * FROM resource_right WHERE uuid_resource = '${resource.uuid_rda}'`,
      );

      const rights: any[] = [];
      for (const rr of rightsResource) {
        const right: any[] = await this.dataSource.query(
          `SELECT * FROM "right" WHERE "lod_pid" = '${rr.lod_pid}' LIMIT 1`,
        );
        if (right.length < 1) {
          continue;
        }
        rights.push({ ...right[0], relation: rr.relation });
      }

      const gorcElementsResource = await this.dataSource.query(
        `SELECT * FROM resource_gorc_element WHERE uuid_resource = '${resource.uuid_rda}'`,
      );

      const gorcElements: any[] = [];
      for (const ge of gorcElementsResource) {
        const gorcElement: any[] = await this.dataSource.query(
          `SELECT * FROM gorc_element WHERE uuid_element = '${ge.uuid_element}' LIMIT 1`,
        );
        if (gorcElement.length < 1) {
          continue;
        }
        gorcElements.push(gorcElement[0]);
      }

      const gorcAttributesResource = await this.dataSource.query(
        `SELECT * FROM resource_gorc_attribute WHERE uuid_resource = '${resource.uuid_rda}'`,
      );

      const gorcAttributes: any[] = [];
      for (const ga of gorcAttributesResource) {
        const gorcAttribute: any[] = await this.dataSource.query(
          `SELECT * FROM gorc_attribute WHERE uuid_Attribute = '${ga.uuid_attribute}' LIMIT 1`,
        );
        if (gorcAttribute.length < 1) {
          continue;
        }
        gorcAttributes.push(gorcAttribute[0]);
      }

      const disciplinesResource = await this.dataSource.query(
        `SELECT * FROM resource_discipline WHERE uuid_resource = '${resource.uuid_rda}'`,
      );
      const disciplines: any[] = [];
      for (const dr of disciplinesResource) {
        const discipline: any[] = await this.dataSource.query(
          `SELECT * FROM discipline WHERE uuid_discipline = '${dr.uuid_discipline}' LIMIT 1`,
        );
        if (discipline.length < 1) {
          continue;
        }
        disciplines.push(discipline[0]);
      }

      const individualResources = await this.dataSource.query(
        `SELECT * FROM individual_resource WHERE uuid_resource = '${resource.uuid_rda}'`,
      );

      const resourceInstitutions: any[] = [];
      const individuals: any[] = []; // help...
      for (const ir of individualResources) {
        const individual: any[] = await this.dataSource.query(
          `SELECT * FROM individual WHERE uuid_individual = '${ir.uuid_individual}' LIMIT 1`,
        );
        if (individual.length < 1) {
          continue;
        }

        const [memberOfInstitutions, institutionsIndividual] =
          await Promise.all([
            await this.dataSource.query(
              `SELECT * FROM individual_member WHERE uuid_individual = '${individual[0].uuid_individual}'`,
            ),
            await this.dataSource.query(
              `SELECT * FROM individual_institution WHERE uuid_rda_member = '${individual[0].uuid_individual}'`,
            ),
          ]);

        const mapToInstitutions = (institution: any) => ({
          uuid_institution: institution.uuid_institution,
          uuid_individual:
            'uuid_individual' in institution
              ? institution.uuid_individual
              : institution.member,
        });

        const individualInstitutions = [
          ...memberOfInstitutions,
          ...institutionsIndividual,
        ].map(mapToInstitutions);

        const institutions: any[] = [];
        for (const ii of individualInstitutions) {
          const institution = await this.dataSource.query(
            `SELECT * FROM institution WHERE uuid_institution = '${ii.uuid_institution}' LIMIT 1`,
          );

          if (institution.length < 1) {
            continue;
          }

          const institutionOrgType = await this.dataSource.query(
            `SELECT * FROM institution_organisation_type WHERE uuid_institution = '${ii.uuid_institution}' LIMIT 1`,
          );

          let orgType = null;
          if (institutionOrgType.length > 0) {
            orgType = await this.dataSource.query(
              `SELECT * FROM org_type WHERE organisation_type_id = '${institutionOrgType[0].uuid_org_type}' LIMIT 1`,
            );
          }

          const institutionRole = await this.dataSource.query(
            `SELECT * FROM institution_institution_role WHERE "UUID_Institution" = '${ii.uuid_institution}' LIMIT 1`,
          );

          let role = null;
          if (institutionRole.length > 0) {
            role = await this.dataSource.query(
              `SELECT * FROM institution_role WHERE "InstitutionRoleID" = '${institutionRole[0].InstitutionRoleID}' LIMIT 1`,
            );
          }

          const country = await this.dataSource.query(
            `SELECT * FROM institution_country WHERE uuid_institution = '${ii.uuid_institution}' LIMIT 1`,
          );

          institutions.push({
            ...institution[0],
            institution_type: orgType,
            role: role,
            country: country[0],
          });
        }

        resourceInstitutions.push(...institutions);

        const [individualGroups, individualGroupAll] = await Promise.all([
          await this.dataSource.query(
            `SELECT * FROM individual_group WHERE uuid_individual = '${individual[0].uuid_individual}'`,
          ),
          await this.dataSource.query(
            `SELECT * FROM individual_group_all WHERE uuid_individual = '${individual[0].uuid_individual}'`,
          ),
        ]);

        const mapToGroups = (group: any) => ({
          uuid_group: group.uuid_group,
          uuid_individual: group.uuid_individual,
          // member_type:
          //   'member_type' in group ? group.member_type : group.relation,
        });

        const groups = [...individualGroups, ...individualGroupAll].map(
          mapToGroups,
        );

        const memberOfGroups: any[] = [];
        for (const group of groups) {
          const interestGroup = await this.dataSource.query(
            `SELECT * FROM interest_group WHERE "uuid_interestGroup" = '${group.uuid_group}' LIMIT 1`,
          );

          if (interestGroup.length > 0) {
            memberOfGroups.push(interestGroup[0]);
            continue;
          }

          const workingGroup = await this.dataSource.query(
            `SELECT * FROM working_group WHERE uuid_working_group = '${group.uuid_group}' LIMIT 1`,
          );

          if (workingGroup.length < 1) {
            continue;
          }

          memberOfGroups.push(workingGroup[0]);
        }

        individuals.push({
          ...individual[0],
          relation: ir.relation,
          institutions,
          groups: memberOfGroups,
        });
      }

      const groupsResource = await this.dataSource.query(
        `SELECT * FROM group_resource WHERE uuid_resource = '${resource.uuid_rda}'`,
      );
      const workingGroups: any[] = [];
      const interestGroups: any[] = [];
      for (const gr of groupsResource) {
        const workingGroup = await this.dataSource.query(
          `SELECT * FROM working_group WHERE uuid_working_group = '${gr.uuid_group}' LIMIT 1`,
        );
        if (workingGroup.length > 0) {
          workingGroups.push({ ...workingGroup[0], relation: gr.relation });
          continue;
        }

        const interestGroup = await this.dataSource.query(
          `SELECT * FROM interest_group WHERE "uuid_interestGroup" = '${gr.uuid_group}' LIMIT 1`,
        );

        if (interestGroup.length < 1) {
          continue;
        }
        interestGroups.push({ ...interestGroup[0], relation: gr.relation });
      }

      const pathwaysResource = await this.dataSource.query(
        `SELECT * FROM resource_pathway WHERE uuid_resource = '${resource.uuid_rda}'`,
      );

      const pathways: any[] = [];
      for (const pr of pathwaysResource) {
        const pathway = await this.dataSource.query(
          `SELECT * FROM pathway WHERE uuid_pathway = '${pr.uuid_pathway}' LIMIT 1`,
        );
        if (pathway.length < 1) {
          continue;
        }
        pathways.push(pathway[0]);
      }

      const resourceRelations = await this.dataSource.query(
        `SELECT * FROM resource_relation WHERE uuid_resource = '${resource.uuid_rda}'`,
      );

      const relations: any[] = [];
      for (const rr of resourceRelations) {
        const relation = await this.dataSource.query(
          `SELECT * FROM relation WHERE uuid_relation = '${rr.uuid_relation}' LIMIT 1`,
        );
        if (relation.length < 1) {
          continue;
        }
        relations.push({ ...relation[0], relation: rr.relation });
      }

      const resourceKeywords = await this.dataSource.query(
        `SELECT * FROM resource_keyword WHERE uuid_resource = '${resource.uuid_rda}'`,
      );

      const keywords: any[] = [];
      for (const rk of resourceKeywords) {
        const keyword = await this.dataSource.query(
          `SELECT * FROM keyword WHERE uuid_keyword = '${rk.uuid_keyword}' LIMIT 1`,
        );
        if (keyword.length < 1) {
          continue;
        }
        keywords.push(keyword[0]);
      }

      const uniqueInstitutes = resourceInstitutions.filter(
        (v, i, a) =>
          a.findIndex((t) => t.uuid_institution === v.uuid_institution) === i,
      );

      documents.push({
        ...resource,
        dc_date: resource.dc_date || new Date().toISOString().split('T')[0],
        subjects: subjectResources,
        uri_type: uriType,
        workflows: workflows,
        rights: rights,
        gorc_elements: gorcElements,
        gorc_attributes: gorcAttributes,
        disciplines: disciplines,
        individuals: individuals,
        working_groups: workingGroups,
        interest_groups: interestGroups,
        pathways: pathways,
        relations: relations,
        related_institutions: uniqueInstitutes,
        keywords: keywords,
        source: 'Deposit',
      });
    }

    const endTime = Date.now();
    const timeDiff = endTime - startTime;
    this.logger.log(
      `Finished building of ${resources.length} deposit resources in ${timeDiff}ms`,
    );
    return documents;
  }

  async indexExists() {
    const alias = await this.elasticsearchService.indices.existsAlias({
      name: 'rda',
    });

    if (!alias) {
      const indice = await this.elasticsearchService.indices.create({
        index: 'rda-0001',
        mappings: {
          properties: {
            dc_date: {
              type: 'date',
              format:
                'dd-MM-yyyy||d-M-yyyy||dd-M-yyyy||d-MM-yyyy||strict_date_optional_time||epoch_millis',
            },
            dc_type: { type: 'keyword' },
          },
        },
        settings: {
          number_of_shards: 1,
          number_of_replicas: 1,
        },
      });

      if (indice.acknowledged != true) {
        const exists = await this.elasticsearchService.indices.exists({
          index: 'rda-0001',
        });

        if (!exists) {
          throw new Error('Failed to create initial index');
        }
      }

      const aliasIndice = await this.elasticsearchService.indices.putAlias({
        index: 'rda-0001',
        name: 'rda',
      });

      if (!aliasIndice.acknowledged) {
        const exists = await this.elasticsearchService.indices.existsAlias({
          name: 'rda',
        });
        if (!exists) {
          throw new Error('Failed to create initial alias');
        }
      }

      return aliasIndice.acknowledged;
    }

    return true;
  }

  async indexAllDeposits() {
    const aliasReady = await this.indexExists();
    if (!aliasReady) {
      throw new Error('Alias is not ready');
    }

    const documents = await this.createDepositDocument();

    this.logger.log('Starting indexing of deposit resources');

    const action = await this.elasticsearchService.bulk({
      index: 'rda-0001',
      refresh: true,
      operations: documents.flatMap((doc) => [
        { index: { _index: 'rda-0001', _id: doc.uuid_rda } },
        doc,
      ]),
    });

    if (action.errors) {
      const failedDocs = action.items.filter((item) => {
        const operation =
          item.index || item.create || item.update || item.delete;
        return operation && operation.error;
      });
      this.logger.error(`Failed to index ${failedDocs.length} documents`);
    }

    return {
      indexed: action.items.length,
      errors: action.errors,
      took: action.took,
    };
  }

  async getAllIndexDocuments(alias: string, query: object) {
    const exists = await this.elasticsearchService.indices.existsAlias({
      name: alias,
    });

    if (!exists) {
      throw new NotFoundException('Alias does not exist');
    }

    const documents = await this.elasticsearchService.search({
      index: alias,
      ...query,
    });

    return documents;
  }

  async getDocument(index: string, documentIdentifier: string) {
    const exists = await this.elasticsearchService.indices.existsAlias({
      name: index,
    });

    if (!exists) {
      throw new NotFoundException('Index does not exist');
    }

    try {
      const document = await this.elasticsearchService.get<unknown>({
        index: index,
        id: documentIdentifier,
      });

      if (!document || !document.found || !document._source) {
        throw new NotFoundException('Document not found');
      }

      return document._source;
    } catch (error) {
      console.log(error);

      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.meta?.statusCode === 404) {
        throw new NotFoundException('Document not found');
      }
      throw error;
    }
  }
}
