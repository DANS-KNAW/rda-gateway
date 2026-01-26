import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { DataSource } from 'typeorm';
import { customAlphabet } from 'nanoid';
import { Annotation } from './types/annotation.interface';
import elasticsearchConfig from 'src/config/elasticsearch.config';
import type { ConfigType } from '@nestjs/config';
import { CreateMetricDto } from './dto/create-metric.dto';
import { OrcidService } from 'src/orcid/orcid.service';
import {
  ResourceRow,
  SubjectResourceRow,
  WorkflowRelationRow,
  WorkflowRow,
  RightsResourceRow,
  RightRow,
  GorcElementResourceRow,
  GorcElementRow,
  GorcAttributeResourceRow,
  GorcAttributeRow,
  DisciplineResourceRow,
  DisciplineRow,
  IndividualResourceRow,
  IndividualRow,
  InstitutionMemberRow,
  InstitutionRow,
  InstitutionOrgTypeRow,
  OrgTypeRow,
  InstitutionRoleRelationRow,
  InstitutionRoleRow,
  InstitutionCountryRow,
  IndividualGroupRow,
  InterestGroupRow,
  WorkingGroupRow,
  GroupResourceRow,
  PathwayResourceRow,
  PathwayRow,
  ResourceRelationRow,
  RelationRow,
  ResourceKeywordRow,
  KeywordRow,
  ResourceVocabularyRow,
  UriTypeRow,
  MetricRow,
} from './types/database-rows.interface';

@Injectable()
export class KnowledgeBaseService {
  private readonly logger = new Logger(KnowledgeBaseService.name);

  constructor(
    private dataSource: DataSource,
    private readonly elasticsearchService: ElasticsearchService,
    @Inject(elasticsearchConfig.KEY)
    private readonly config: ConfigType<typeof elasticsearchConfig>,
    private readonly orcidService: OrcidService,
  ) {}

  async createDepositDocument() {
    const rawResources = await this.dataSource.query<ResourceRow[]>(
      `SELECT * FROM resource`,
    );

    // filter out all resources with resource_source = 'Annotation'
    const resources = rawResources.filter(
      (resource) => resource.resource_source !== 'Annotation',
    );

    this.logger.log(
      `Starting building of ${resources.length} deposit resources`,
    );
    const startTime = Date.now();

    const documents: Record<string, unknown>[] = [];
    for (const resource of resources) {
      const subjectResources = await this.dataSource.query<
        SubjectResourceRow[]
      >(
        `SELECT * FROM subject_resource WHERE uuid_resource = '${resource.uuid_rda}'`,
      );

      const uriType: UriTypeRow[] = [];

      const workflowsRelations = await this.dataSource.query<
        WorkflowRelationRow[]
      >(
        `SELECT * FROM resource_workflow WHERE uuid_resource = '${resource.uuid_rda}'`,
      );

      const workflows: (WorkflowRow & { status: string })[] = [];
      for (const wr of workflowsRelations) {
        const workflow = await this.dataSource.query<WorkflowRow[]>(
          `SELECT * FROM workflow WHERE "UUID_Workflow" = '${wr.uuid_adoption_state}' LIMIT 1`,
        );

        if (workflow.length < 1) {
          continue;
        }
        workflows.push({ ...workflow[0], status: wr.status });
      }

      const rightsResource = await this.dataSource.query<RightsResourceRow[]>(
        `SELECT * FROM resource_right WHERE uuid_resource = '${resource.uuid_rda}'`,
      );

      const rights: (RightRow & { relation: string })[] = [];
      for (const rr of rightsResource) {
        const right = await this.dataSource.query<RightRow[]>(
          `SELECT * FROM "right" WHERE "lod_pid" = '${rr.lod_pid}' LIMIT 1`,
        );
        if (right.length < 1) {
          continue;
        }
        rights.push({ ...right[0], relation: rr.relation });
      }

      const gorcElementsResource = await this.dataSource.query<
        GorcElementResourceRow[]
      >(
        `SELECT * FROM resource_gorc_element WHERE uuid_resource = '${resource.uuid_rda}'`,
      );

      const gorcElements: GorcElementRow[] = [];
      for (const ge of gorcElementsResource) {
        const gorcElement = await this.dataSource.query<GorcElementRow[]>(
          `SELECT * FROM gorc_element WHERE uuid_element = '${ge.uuid_element}' LIMIT 1`,
        );
        if (gorcElement.length < 1) {
          continue;
        }
        gorcElements.push(gorcElement[0]);
      }

      const gorcAttributesResource = await this.dataSource.query<
        GorcAttributeResourceRow[]
      >(
        `SELECT * FROM resource_gorc_attribute WHERE uuid_resource = '${resource.uuid_rda}'`,
      );

      const gorcAttributes: GorcAttributeRow[] = [];
      for (const ga of gorcAttributesResource) {
        const gorcAttribute = await this.dataSource.query<GorcAttributeRow[]>(
          `SELECT * FROM gorc_atribute WHERE uuid_Attribute = '${ga.uuid_attribute}' LIMIT 1`,
        );
        if (gorcAttribute.length < 1) {
          continue;
        }
        gorcAttributes.push(gorcAttribute[0]);
      }

      const disciplinesResource = await this.dataSource.query<
        DisciplineResourceRow[]
      >(
        `SELECT * FROM resource_discipline WHERE uuid_resource = '${resource.uuid_rda}'`,
      );
      const disciplines: DisciplineRow[] = [];
      for (const dr of disciplinesResource) {
        const discipline = await this.dataSource.query<DisciplineRow[]>(
          `SELECT * FROM discipline WHERE internal_identifier = '${dr.internal_identifier}' LIMIT 1`,
        );
        if (discipline.length < 1) {
          continue;
        }
        disciplines.push(discipline[0]);
      }

      const individualResources = await this.dataSource.query<
        IndividualResourceRow[]
      >(
        `SELECT * FROM individual_resource WHERE uuid_resource = '${resource.uuid_rda}'`,
      );

      const resourceInstitutions: Record<string, unknown>[] = [];
      const individuals: Record<string, unknown>[] = [];
      for (const ir of individualResources) {
        const individual = await this.dataSource.query<IndividualRow[]>(
          `SELECT * FROM individual WHERE uuid_individual = '${ir.uuid_individual}' LIMIT 1`,
        );
        if (individual.length < 1) {
          continue;
        }

        const [memberOfInstitutions, institutionsIndividual] =
          await Promise.all([
            this.dataSource.query<InstitutionMemberRow[]>(
              `SELECT * FROM individual_member WHERE uuid_individual = '${individual[0].uuid_individual}'`,
            ),
            this.dataSource.query<InstitutionMemberRow[]>(
              `SELECT * FROM individual_institution WHERE uuid_rda_member = '${individual[0].uuid_individual}'`,
            ),
          ]);

        const mapToInstitutions = (
          institution: InstitutionMemberRow,
        ): { uuid_institution: string; uuid_individual: string } => ({
          uuid_institution: institution.uuid_institution,
          uuid_individual:
            institution.uuid_individual ?? institution.member ?? '',
        });

        const individualInstitutions = [
          ...memberOfInstitutions,
          ...institutionsIndividual,
        ].map(mapToInstitutions);

        const institutions: Record<string, unknown>[] = [];
        for (const ii of individualInstitutions) {
          const institution = await this.dataSource.query<InstitutionRow[]>(
            `SELECT * FROM institution WHERE uuid_institution = '${ii.uuid_institution}' LIMIT 1`,
          );

          if (institution.length < 1) {
            continue;
          }

          const institutionOrgType = await this.dataSource.query<
            InstitutionOrgTypeRow[]
          >(
            `SELECT * FROM institution_organisation_type WHERE uuid_institution = '${ii.uuid_institution}' LIMIT 1`,
          );

          let orgType: OrgTypeRow[] | null = null;
          if (institutionOrgType.length > 0) {
            orgType = await this.dataSource.query<OrgTypeRow[]>(
              `SELECT * FROM org_type WHERE organisation_type_id = '${institutionOrgType[0].uuid_org_type}' LIMIT 1`,
            );
          }

          const institutionRole = await this.dataSource.query<
            InstitutionRoleRelationRow[]
          >(
            `SELECT * FROM institution_institution_role WHERE "UUID_Institution" = '${ii.uuid_institution}' LIMIT 1`,
          );

          let role: InstitutionRoleRow[] | null = null;
          if (institutionRole.length > 0) {
            role = await this.dataSource.query<InstitutionRoleRow[]>(
              `SELECT * FROM institution_role WHERE "InstitutionRoleID" = '${institutionRole[0].InstitutionRoleID}' LIMIT 1`,
            );
          }

          const country = await this.dataSource.query<InstitutionCountryRow[]>(
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
          this.dataSource.query<IndividualGroupRow[]>(
            `SELECT * FROM individual_group WHERE uuid_individual = '${individual[0].uuid_individual}'`,
          ),
          this.dataSource.query<IndividualGroupRow[]>(
            `SELECT * FROM individual_group_all WHERE uuid_individual = '${individual[0].uuid_individual}'`,
          ),
        ]);

        const mapToGroups = (
          group: IndividualGroupRow,
        ): { uuid_group: string; uuid_individual: string } => ({
          uuid_group: group.uuid_group,
          uuid_individual: group.uuid_individual,
        });

        const groups = [...individualGroups, ...individualGroupAll].map(
          mapToGroups,
        );

        const memberOfGroups: (InterestGroupRow | WorkingGroupRow)[] = [];
        for (const group of groups) {
          const interestGroup = await this.dataSource.query<InterestGroupRow[]>(
            `SELECT * FROM interest_group WHERE "uuid_interestGroup" = '${group.uuid_group}' LIMIT 1`,
          );

          if (interestGroup.length > 0) {
            memberOfGroups.push(interestGroup[0]);
            continue;
          }

          const workingGroup = await this.dataSource.query<WorkingGroupRow[]>(
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

      const groupsResource = await this.dataSource.query<GroupResourceRow[]>(
        `SELECT * FROM group_resource WHERE uuid_resource = '${resource.uuid_rda}'`,
      );
      const workingGroups: (WorkingGroupRow & { relation: string })[] = [];
      const interestGroups: (InterestGroupRow & { relation: string })[] = [];
      for (const gr of groupsResource) {
        const workingGroup = await this.dataSource.query<WorkingGroupRow[]>(
          `SELECT * FROM working_group WHERE uuid_working_group = '${gr.uuid_group}' LIMIT 1`,
        );
        if (workingGroup.length > 0) {
          workingGroups.push({ ...workingGroup[0], relation: gr.relation });
          continue;
        }

        const interestGroup = await this.dataSource.query<InterestGroupRow[]>(
          `SELECT * FROM interest_group WHERE "uuid_interestGroup" = '${gr.uuid_group}' LIMIT 1`,
        );

        if (interestGroup.length < 1) {
          continue;
        }
        interestGroups.push({ ...interestGroup[0], relation: gr.relation });
      }

      const pathwaysResource = await this.dataSource.query<
        PathwayResourceRow[]
      >(
        `SELECT * FROM resource_pathway WHERE uuid_resource = '${resource.uuid_rda}'`,
      );

      const pathways: PathwayRow[] = [];
      for (const pr of pathwaysResource) {
        const pathway = await this.dataSource.query<PathwayRow[]>(
          `SELECT * FROM pathway WHERE uuid_pathway = '${pr.uuid_pathway}' LIMIT 1`,
        );
        if (pathway.length < 1) {
          continue;
        }
        pathways.push(pathway[0]);
      }

      const resourceRelations = await this.dataSource.query<
        ResourceRelationRow[]
      >(
        `SELECT * FROM resource_relation WHERE uuid_resource = '${resource.uuid_rda}'`,
      );

      const relations: (RelationRow & { relation: string })[] = [];
      for (const rr of resourceRelations) {
        const relation = await this.dataSource.query<RelationRow[]>(
          `SELECT * FROM relation WHERE uuid_relation = '${rr.uuid_relation}' LIMIT 1`,
        );
        if (relation.length < 1) {
          continue;
        }
        relations.push({ ...relation[0], relation: rr.relation });
      }

      const resourceKeywords = await this.dataSource.query<
        ResourceKeywordRow[]
      >(
        `SELECT * FROM resource_keyword WHERE uuid_resource = '${resource.uuid_rda}'`,
      );

      const keywords: KeywordRow[] = [];
      for (const rk of resourceKeywords) {
        const keyword = await this.dataSource.query<KeywordRow[]>(
          `SELECT * FROM keyword WHERE uuid_keyword = '${rk.uuid_keyword}' LIMIT 1`,
        );
        if (keyword.length < 1) {
          continue;
        }
        keywords.push(keyword[0]);
      }

      // Fetch custom vocabularies from resource_vocabulary table
      const resourceVocabularies = await this.dataSource.query<
        ResourceVocabularyRow[]
      >(
        `SELECT rv.*, v.subject_scheme, v.value_scheme
         FROM resource_vocabulary rv
         LEFT JOIN vocabulary v ON rv.namespace = v.namespace AND rv.value_uri = v.value_uri
         WHERE rv.uuid_resource = $1`,
        [resource.uuid_rda],
      );

      const customVocabularies = resourceVocabularies.map((rv) => ({
        namespace: rv.namespace,
        label: rv.label,
        value: rv.value_uri,
        subject_scheme: rv.subject_scheme,
        value_scheme: rv.value_scheme,
      }));

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
        custom_vocabularies: customVocabularies,
        resource_source: 'Deposit',
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
      name: this.config.ELASTIC_ALIAS_NAME,
    });

    if (!alias) {
      const indice = await this.elasticsearchService.indices.create({
        index: this.config.ELASTIC_ALIAS_NAME + '-0001',
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
          index: this.config.ELASTIC_ALIAS_NAME + '-0001',
        });

        if (!exists) {
          throw new Error('Failed to create initial index');
        }
      }

      const aliasIndice = await this.elasticsearchService.indices.putAlias({
        index: this.config.ELASTIC_ALIAS_NAME + '-0001',
        name: this.config.ELASTIC_ALIAS_NAME,
      });

      if (!aliasIndice.acknowledged) {
        const exists = await this.elasticsearchService.indices.existsAlias({
          name: this.config.ELASTIC_ALIAS_NAME,
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
      index: this.config.ELASTIC_ALIAS_NAME,
      refresh: true,
      operations: documents.flatMap((doc) => [
        {
          index: { _index: this.config.ELASTIC_ALIAS_NAME, _id: doc.uuid_rda },
        },
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

  async getAllIndexDocuments(query: object) {
    try {
      const exists = await this.elasticsearchService.indices.existsAlias({
        name: this.config.ELASTIC_ALIAS_NAME,
      });

      if (!exists) {
        throw new NotFoundException('Alias does not exist');
      }

      const documents = await this.elasticsearchService.search({
        index: this.config.ELASTIC_ALIAS_NAME,
        ...query,
      });

      return documents;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Error fetching documents');
    }
  }

  async getDocument(documentIdentifier: string) {
    const exists = await this.elasticsearchService.indices.existsAlias({
      name: this.config.ELASTIC_ALIAS_NAME,
    });

    if (!exists) {
      throw new NotFoundException('Index does not exist');
    }

    try {
      const document = await this.elasticsearchService.get<unknown>({
        index: this.config.ELASTIC_ALIAS_NAME,
        id: documentIdentifier,
      });

      if (!document || !document.found || !document._source) {
        throw new NotFoundException('Document not found');
      }

      return document._source;
    } catch (error) {
      const esError = error as { meta?: { statusCode?: number } };
      if (esError.meta?.statusCode === 404) {
        throw new NotFoundException('Document not found');
      }
      this.logger.error(error);
      throw new InternalServerErrorException('Error fetching document');
    }
  }

  async createAnnotation(annotation: Annotation, userOrcid: string) {
    const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXZ');

    // Validate that the submitter matches the authenticated user's identity
    if (annotation.submitter !== userOrcid) {
      throw new ForbiddenException(
        "Submitter must match the authenticated user's identity",
      );
    }

    // Validate ORCID format and resolve submitter name from ORCID API
    if (!this.orcidService.isValidOrcid(annotation.submitter)) {
      throw new BadRequestException(
        `Invalid ORCID format: ${annotation.submitter}. Expected format: 0000-0000-0000-0000`,
      );
    }

    const submitterName = await this.orcidService.lookupName(
      annotation.submitter,
    );
    if (!submitterName) {
      throw new BadRequestException(
        `Could not resolve name for ORCID: ${annotation.submitter}. The ORCID may not exist or may not have a public name.`,
      );
    }

    const resource = {
      uuid: annotation.resource,
      uuid_link: null,
      uuid_rda: `rda_tiger:${nanoid()}`,
      title: annotation.title,
      alternateTitle: null,
      uri: annotation.resource,
      backupUri: null,
      uri2: null,
      backupUri2: null,
      pid_lod_type: null,
      pid_lod: null,
      dc_date: new Date().toISOString().split('T')[0],
      dc_description: annotation.description || '',
      dc_language: annotation.language.value,
      type: 'publication-other',
      dc_type: 'Other',
      card_url: null,
      resource_source: 'Annotation',
      fragment: annotation.selectedText,
      uuid_uri_type: null,
      notes: annotation.notes || null,
      last_update: null,
      pathway: null,
      pathway_uuid: null,
      group_name: null,
      group_uuid: null,
      changed: null,
      submitter: annotation.submitter,
      submitter_name: submitterName,
      annotation_target: annotation.target,
    };

    let document: Record<string, unknown> | null = null;

    // Create transaction to insert into resource and
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.query(
        `INSERT INTO resource (uuid, uuid_link, uuid_rda, title, "alternateTitle", uri, "backupUri", uri2, "backupUri2", pid_lod_type, pid_lod, dc_date, dc_description, dc_language, type, dc_type, card_url, resource_source, fragment, uuid_uri_type, notes, last_update, pathway, pathway_uuid, group_name, group_uuid, changed, submitter, submitter_name, annotation_target) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30)`,
        [
          resource.uuid,
          resource.uuid_link,
          resource.uuid_rda,
          resource.title,
          resource.alternateTitle,
          resource.uri,
          resource.backupUri,
          resource.uri2,
          resource.backupUri2,
          resource.pid_lod_type,
          resource.pid_lod,
          resource.dc_date,
          resource.dc_description,
          resource.dc_language,
          resource.type,
          resource.dc_type,
          resource.card_url,
          resource.resource_source,
          resource.fragment,
          resource.uuid_uri_type,
          resource.notes,
          resource.last_update,
          resource.pathway,
          resource.pathway_uuid,
          resource.group_name,
          resource.group_uuid,
          resource.changed,
          resource.submitter,
          resource.submitter_name,
          JSON.stringify(resource.annotation_target),
        ],
      );

      const interestGroups: (InterestGroupRow & { relation: string })[] = [];
      for (const annotationIG of annotation.interest_groups || []) {
        const groupResource = {
          relation: 'igLink',
          relation_uuid: 'rda_graph:T0ZC84O3',
          title_group: annotationIG.label,
          uuid_group: annotationIG.value,
          title_resource: resource.title,
          uuid_resource: resource.uuid_rda,
        };

        const interestGroup = (await queryRunner.query(
          `SELECT * FROM interest_group WHERE "uuid_interestGroup" = $1 LIMIT 1`,
          [groupResource.uuid_group],
        )) as InterestGroupRow[];

        if (interestGroup.length < 1) {
          throw new NotFoundException('Interest Group not found!');
        }

        await queryRunner.query(
          `INSERT INTO group_resource (relation, relation_uuid, title_group, uuid_group, title_resource, uuid_resource) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            groupResource.relation,
            groupResource.relation_uuid,
            groupResource.title_group,
            groupResource.uuid_group,
            groupResource.title_resource,
            groupResource.uuid_resource,
          ],
        );

        interestGroups.push({
          ...interestGroup[0],
          relation: groupResource.relation,
        });
      }

      const workingGroups: (WorkingGroupRow & { relation: string })[] = [];
      for (const annotationWG of annotation.working_groups || []) {
        const groupResource = {
          relation: 'wgLink',
          relation_uuid: 'rda_graph:T0ZC84O2',
          title_group: annotationWG.label,
          uuid_group: annotationWG.value,
          title_resource: resource.title,
          uuid_resource: resource.uuid_rda,
        };

        const workingGroup = (await queryRunner.query(
          `SELECT * FROM working_group WHERE uuid_working_group = $1 LIMIT 1`,
          [groupResource.uuid_group],
        )) as WorkingGroupRow[];

        if (workingGroup.length < 1) {
          throw new NotFoundException('Working Group not found!');
        }

        await queryRunner.query(
          `INSERT INTO group_resource (relation, relation_uuid, title_group, uuid_group, title_resource, uuid_resource) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            groupResource.relation,
            groupResource.relation_uuid,
            groupResource.title_group,
            groupResource.uuid_group,
            groupResource.title_resource,
            groupResource.uuid_resource,
          ],
        );

        workingGroups.push({
          ...workingGroup[0],
          relation: groupResource.relation,
        });
      }

      const pathways: (PathwayRow & { relation: string })[] = [];
      for (const annotationPathway of annotation.pathways || []) {
        const ResourcePathway = {
          pathway: annotationPathway.label,
          uuid_pathway: annotationPathway.value,
          relation_uuid: 'rda_graph:E8904E44',
          relation: 'supports',
          resource: resource.title,
          uuid_resource: resource.uuid_rda,
        };

        const pathway = (await queryRunner.query(
          `SELECT * FROM pathway WHERE uuid_pathway = $1 LIMIT 1`,
          [ResourcePathway.uuid_pathway],
        )) as PathwayRow[];

        if (pathway.length < 1) {
          throw new NotFoundException('Pathway not found!');
        }

        await queryRunner.query(
          `INSERT INTO resource_pathway (pathway, uuid_pathway, relation_uuid, relation, resource, uuid_resource) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            ResourcePathway.pathway,
            ResourcePathway.uuid_pathway,
            ResourcePathway.relation_uuid,
            ResourcePathway.relation,
            ResourcePathway.resource,
            ResourcePathway.uuid_resource,
          ],
        );

        pathways.push({
          ...pathway[0],
          relation: ResourcePathway.relation,
        });
      }

      const disciplines: DisciplineRow[] = [];
      for (const annotationDiscipline of annotation.disciplines || []) {
        const resourceDiscipline = {
          disciplines: annotationDiscipline.label,
          uuid_disciplines: annotationDiscipline.value,
          resource: resource.title,
          uuid_resource: resource.uuid_rda,
        };

        const discipline = (await queryRunner.query(
          `SELECT * FROM discipline WHERE internal_identifier = $1 LIMIT 1`,
          [resourceDiscipline.uuid_disciplines],
        )) as DisciplineRow[];

        if (discipline.length < 1) {
          throw new NotFoundException('Discipline not found!');
        }

        await queryRunner.query(
          `INSERT INTO resource_discipline (disciplines, uuid_disciplines, resource, uuid_resource) VALUES ($1, $2, $3, $4)`,
          [
            resourceDiscipline.disciplines,
            resourceDiscipline.uuid_disciplines,
            resourceDiscipline.resource,
            resourceDiscipline.uuid_resource,
          ],
        );

        disciplines.push({
          ...discipline[0],
        });
      }

      const gorcElements: GorcElementRow[] = [];
      for (const annotationGORCElement of annotation.gorc_elements || []) {
        const resourceGORCElement = {
          element: annotationGORCElement.label,
          uuid_element: annotationGORCElement.value,
          resource: resource.title,
          uuid_resource: resource.uuid_rda,
        };

        const gorcElement = (await queryRunner.query(
          `SELECT * FROM gorc_element WHERE uuid_element = $1 LIMIT 1`,
          [resourceGORCElement.uuid_element],
        )) as GorcElementRow[];

        if (gorcElement.length < 1) {
          throw new NotFoundException('GORC Element not found!');
        }

        await queryRunner.query(
          `INSERT INTO resource_gorc_element (element, uuid_element, resource, uuid_resource) VALUES ($1, $2, $3, $4)`,
          [
            resourceGORCElement.element,
            resourceGORCElement.uuid_element,
            resourceGORCElement.resource,
            resourceGORCElement.uuid_resource,
          ],
        );

        gorcElements.push({
          ...gorcElement[0],
        });
      }

      const gorcAttributes: GorcAttributeRow[] = [];
      for (const annotationGORCAttribute of annotation.gorc_attributes || []) {
        const resourceGORCAttribute = {
          attribute: annotationGORCAttribute.label,
          uuid_Attribute: annotationGORCAttribute.value,
          resource: resource.title,
          uuid_resource: resource.uuid_rda,
        };

        const gorcAttribute = (await queryRunner.query(
          `SELECT * FROM gorc_atribute WHERE uuid_Attribute = $1 LIMIT 1`,
          [resourceGORCAttribute.uuid_Attribute],
        )) as GorcAttributeRow[];

        if (gorcAttribute.length < 1) {
          throw new NotFoundException('GORC Attribute not found!');
        }

        await queryRunner.query(
          `INSERT INTO resource_gorc_attribute (attribute, "uuid_Attribute", resource, uuid_resource) VALUES ($1, $2, $3, $4)`,
          [
            resourceGORCAttribute.attribute,
            resourceGORCAttribute.uuid_Attribute,
            resourceGORCAttribute.resource,
            resourceGORCAttribute.uuid_resource,
          ],
        );

        gorcAttributes.push({
          ...gorcAttribute[0],
        });
      }

      const uriType = (await queryRunner.query(
        `SELECT * FROM uri_type WHERE uuid_uri_type = $1`,
        [annotation.resource_type.value],
      )) as UriTypeRow[];

      const keywords: KeywordRow[] = [];
      for (const annotationKeyword of annotation.keywords || []) {
        const resourceKeyword = {
          uuid_resource: resource.uuid_rda,
          uuid_keyword: annotationKeyword.value,
        };

        const keyword = (await queryRunner.query(
          `SELECT * FROM keyword WHERE uuid_keyword = $1 LIMIT 1`,
          [resourceKeyword.uuid_keyword],
        )) as KeywordRow[];

        if (keyword.length < 1) {
          throw new NotFoundException('Keyword not found!');
        }

        await queryRunner.query(
          `INSERT INTO resource_keyword (uuid_resource, uuid_keyword) VALUES ($1, $2)`,
          [resourceKeyword.uuid_resource, resourceKeyword.uuid_keyword],
        );

        keywords.push({
          ...keyword[0],
        });
      }

      // Handle open vocabularies (generic - any namespace from vocabulary table)
      const customVocabularies: {
        namespace: string;
        label: string;
        value: string;
        subject_scheme: string;
        value_scheme: string;
      }[] = [];
      if (annotation.open_vocabularies) {
        for (const [namespace, items] of Object.entries(
          annotation.open_vocabularies,
        )) {
          // Validate namespace exists in vocabulary table
          const namespaceExists = (await queryRunner.query(
            `SELECT 1 FROM vocabulary WHERE namespace = $1 LIMIT 1`,
            [namespace],
          )) as { '?column?': number }[];

          if (namespaceExists.length < 1) {
            throw new BadRequestException(
              `Unknown vocabulary namespace: ${namespace}`,
            );
          }

          // Process each item in this namespace
          for (const item of items || []) {
            // Validate the specific vocabulary item exists
            const vocabulary = (await queryRunner.query(
              `SELECT * FROM vocabulary WHERE namespace = $1 AND value_uri = $2 LIMIT 1`,
              [namespace, item.value],
            )) as { subject_scheme: string; value_scheme: string }[];

            if (vocabulary.length < 1) {
              throw new NotFoundException(
                `Vocabulary item not found: ${item.value} in namespace ${namespace}`,
              );
            }

            // Store relationship
            await queryRunner.query(
              `INSERT INTO resource_vocabulary (uuid_resource, namespace, value_uri, label) VALUES ($1, $2, $3, $4)`,
              [resource.uuid_rda, namespace, item.value, item.label],
            );

            customVocabularies.push({
              namespace,
              label: item.label,
              value: item.value,
              subject_scheme: vocabulary[0].subject_scheme,
              value_scheme: vocabulary[0].value_scheme,
            });
          }
        }
      }

      const { annotation_target, ...rest } = resource;

      document = {
        ...rest,
        interest_groups: interestGroups,
        working_groups: workingGroups,
        pathways: pathways,
        disciplines: disciplines,
        gorc_elements: gorcElements,
        gorc_attributes: gorcAttributes,
        uri_type: uriType,
        keywords: keywords,
        custom_vocabularies: customVocabularies,
        annotation_target: annotation_target,
      };

      const result = await this.elasticsearchService.index({
        index: this.config.ELASTIC_ALIAS_NAME,
        id: document.uuid_rda as string,
        document: document,
        refresh: true,
      });

      if (result.result !== 'created' && result.result !== 'updated') {
        throw new InternalServerErrorException('Error indexing annotation');
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error creating annotation: ${errorMessage}`);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Error creating annotation');
    } finally {
      await queryRunner.release();
    }

    return document;
  }

  async deleteAnnotation(uuid_rda: string, userOrcid: string) {
    // First verify the resource exists and is an annotation
    const resource = await this.dataSource.query<ResourceRow[]>(
      `SELECT * FROM resource WHERE uuid_rda = $1 AND resource_source = 'Annotation' LIMIT 1`,
      [uuid_rda],
    );

    if (resource.length < 1) {
      throw new NotFoundException('Annotation not found');
    }

    // Verify the authenticated user owns this annotation
    if (resource[0].submitter !== userOrcid) {
      throw new ForbiddenException('You can only delete your own annotations');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const exists = await this.elasticsearchService.indices.existsAlias({
        name: 'rda',
      });

      if (exists) {
        try {
          await this.elasticsearchService.delete({
            index: this.config.ELASTIC_ALIAS_NAME,
            id: uuid_rda,
            refresh: true,
          });
        } catch (error) {
          const esError = error as { meta?: { statusCode?: number } };
          if (esError.meta?.statusCode !== 404) {
            throw error;
          }
          this.logger.warn(`Document ${uuid_rda} not found in Elasticsearch`);
        }
      }

      await queryRunner.query(
        `DELETE FROM group_resource WHERE uuid_resource = $1`,
        [uuid_rda],
      );

      await queryRunner.query(
        `DELETE FROM resource_pathway WHERE uuid_resource = $1`,
        [uuid_rda],
      );

      await queryRunner.query(
        `DELETE FROM resource_discipline WHERE uuid_resource = $1`,
        [uuid_rda],
      );

      await queryRunner.query(
        `DELETE FROM resource_gorc_element WHERE uuid_resource = $1`,
        [uuid_rda],
      );

      await queryRunner.query(
        `DELETE FROM resource_gorc_attribute WHERE uuid_resource = $1`,
        [uuid_rda],
      );

      await queryRunner.query(
        `DELETE FROM resource_keyword WHERE uuid_resource = $1`,
        [uuid_rda],
      );

      await queryRunner.query(
        `DELETE FROM resource_vocabulary WHERE uuid_resource = $1`,
        [uuid_rda],
      );

      await queryRunner.query(`DELETE FROM resource WHERE uuid_rda = $1`, [
        uuid_rda,
      ]);

      await queryRunner.commitTransaction();

      this.logger.log(`Successfully deleted annotation ${uuid_rda}`);

      return {
        success: true,
        message: 'Annotation deleted successfully',
        uuid_rda,
      };
    } catch (error) {
      this.logger.error(`Error deleting annotation ${uuid_rda}:`, error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Error deleting annotation');
    } finally {
      await queryRunner.release();
    }
  }

  async indexAllAnnotations() {
    const aliasReady = await this.indexExists();
    if (!aliasReady) {
      throw new Error('Alias is not ready');
    }

    const annotations = await this.dataSource.query<ResourceRow[]>(
      "SELECT * FROM resource WHERE resource_source = 'Annotation'",
    );

    this.logger.log(
      `Starting re-indexing of ${annotations.length} annotations`,
    );
    const startTime = Date.now();

    const documents: Record<string, unknown>[] = [];

    for (const resource of annotations) {
      const groupsResource = await this.dataSource.query<GroupResourceRow[]>(
        `SELECT * FROM group_resource WHERE uuid_resource = '${resource.uuid_rda}'`,
      );

      const interestGroups: (InterestGroupRow & { relation: string })[] = [];
      const workingGroups: (WorkingGroupRow & { relation: string })[] = [];

      for (const gr of groupsResource) {
        const interestGroup = await this.dataSource.query<InterestGroupRow[]>(
          `SELECT * FROM interest_group WHERE "uuid_interestGroup" = '${gr.uuid_group}' LIMIT 1`,
        );

        if (interestGroup.length > 0) {
          interestGroups.push({ ...interestGroup[0], relation: gr.relation });
          continue;
        }

        const workingGroup = await this.dataSource.query<WorkingGroupRow[]>(
          `SELECT * FROM working_group WHERE uuid_working_group = '${gr.uuid_group}' LIMIT 1`,
        );

        if (workingGroup.length > 0) {
          workingGroups.push({ ...workingGroup[0], relation: gr.relation });
        }
      }

      const pathwaysResource = await this.dataSource.query<
        PathwayResourceRow[]
      >(
        `SELECT * FROM resource_pathway WHERE uuid_resource = '${resource.uuid_rda}'`,
      );

      const pathways: PathwayRow[] = [];
      for (const pr of pathwaysResource) {
        const pathway = await this.dataSource.query<PathwayRow[]>(
          `SELECT * FROM pathway WHERE uuid_pathway = '${pr.uuid_pathway}' LIMIT 1`,
        );
        if (pathway.length > 0) {
          pathways.push(pathway[0]);
        }
      }

      const disciplinesResource = await this.dataSource.query<
        DisciplineResourceRow[]
      >(
        `SELECT * FROM resource_discipline WHERE uuid_resource = '${resource.uuid_rda}'`,
      );

      const disciplines: DisciplineRow[] = [];
      for (const dr of disciplinesResource) {
        const discipline = await this.dataSource.query<DisciplineRow[]>(
          `SELECT * FROM discipline WHERE internal_identifier = '${dr.uuid_disciplines}' LIMIT 1`,
        );
        if (discipline.length > 0) {
          disciplines.push(discipline[0]);
        }
      }

      const gorcElementsResource = await this.dataSource.query<
        GorcElementResourceRow[]
      >(
        `SELECT * FROM resource_gorc_element WHERE uuid_resource = '${resource.uuid_rda}'`,
      );

      const gorcElements: GorcElementRow[] = [];
      for (const ge of gorcElementsResource) {
        const gorcElement = await this.dataSource.query<GorcElementRow[]>(
          `SELECT * FROM gorc_element WHERE uuid_element = '${ge.uuid_element}' LIMIT 1`,
        );
        if (gorcElement.length > 0) {
          gorcElements.push(gorcElement[0]);
        }
      }

      const gorcAttributesResource = await this.dataSource.query<
        GorcAttributeResourceRow[]
      >(
        `SELECT * FROM resource_gorc_attribute WHERE uuid_resource = '${resource.uuid_rda}'`,
      );

      const gorcAttributes: GorcAttributeRow[] = [];
      for (const ga of gorcAttributesResource) {
        const gorcAttribute = await this.dataSource.query<GorcAttributeRow[]>(
          `SELECT * FROM gorc_atribute WHERE uuid_Attribute = '${ga.uuid_Attribute}' LIMIT 1`,
        );
        if (gorcAttribute.length > 0) {
          gorcAttributes.push(gorcAttribute[0]);
        }
      }

      let uriType: UriTypeRow[] = [];
      if (resource.uuid_uri_type) {
        uriType = await this.dataSource.query<UriTypeRow[]>(
          `SELECT * FROM uri_type WHERE uuid_uri_type = '${resource.uuid_uri_type}'`,
        );
      }

      const resourceKeywords = await this.dataSource.query<
        ResourceKeywordRow[]
      >(
        `SELECT * FROM resource_keyword WHERE uuid_resource = '${resource.uuid_rda}'`,
      );

      const keywords: KeywordRow[] = [];
      for (const rk of resourceKeywords) {
        const keyword = await this.dataSource.query<KeywordRow[]>(
          `SELECT * FROM keyword WHERE uuid_keyword = '${rk.uuid_keyword}' LIMIT 1`,
        );
        if (keyword.length > 0) {
          keywords.push(keyword[0]);
        }
      }

      // Fetch custom vocabularies from resource_vocabulary table
      const resourceVocabularies = await this.dataSource.query<
        ResourceVocabularyRow[]
      >(
        `SELECT rv.*, v.subject_scheme, v.value_scheme
         FROM resource_vocabulary rv
         LEFT JOIN vocabulary v ON rv.namespace = v.namespace AND rv.value_uri = v.value_uri
         WHERE rv.uuid_resource = $1`,
        [resource.uuid_rda],
      );

      const customVocabularies = resourceVocabularies.map((rv) => ({
        namespace: rv.namespace,
        label: rv.label,
        value: rv.value_uri,
        subject_scheme: rv.subject_scheme,
        value_scheme: rv.value_scheme,
      }));

      const { annotation_target, ...rest } = resource;

      documents.push({
        ...rest,
        dc_date: resource.dc_date || new Date().toISOString().split('T')[0],
        interest_groups: interestGroups,
        working_groups: workingGroups,
        pathways: pathways,
        disciplines: disciplines,
        gorc_elements: gorcElements,
        gorc_attributes: gorcAttributes,
        uri_type: uriType,
        keywords: keywords,
        custom_vocabularies: customVocabularies,
        annotation_target: annotation_target,
      });
    }

    const endTime = Date.now();
    const timeDiff = endTime - startTime;
    this.logger.log(
      `Finished building ${annotations.length} annotation documents in ${timeDiff}ms`,
    );

    this.logger.log('Starting indexing of annotation resources');

    const action = await this.elasticsearchService.bulk({
      index: this.config.ELASTIC_ALIAS_NAME,
      refresh: true,
      operations: documents.flatMap((doc) => [
        {
          index: { _index: this.config.ELASTIC_ALIAS_NAME, _id: doc.uuid_rda },
        },
        doc,
      ]),
    });

    if (action.errors) {
      const failedDocs = action.items.filter((item) => {
        const operation =
          item.index || item.create || item.update || item.delete;
        return operation && operation.error;
      });
      this.logger.error(`Failed to index ${failedDocs.length} annotations`);
    }

    return {
      indexed: action.items.length,
      errors: action.errors,
      took: action.took,
    };
  }

  async createMetric(metricDto: CreateMetricDto): Promise<MetricRow> {
    try {
      const result = await this.dataSource.query<MetricRow[]>(
        `INSERT INTO metric (type, version, browser, browser_version, os, arch, locale, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, type, version, browser, browser_version, os, arch, locale, timestamp, created_at`,
        [
          metricDto.type,
          metricDto.version,
          metricDto.browser,
          metricDto.browserVersion,
          metricDto.os,
          metricDto.arch,
          metricDto.locale,
          metricDto.timestamp,
        ],
      );

      this.logger.log(
        `Metric created: ${metricDto.type} - ${metricDto.browser} ${metricDto.browserVersion} on ${metricDto.os}`,
      );

      return result[0];
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to create metric: ${errorMessage}`);
      throw new InternalServerErrorException('Failed to create metric');
    }
  }
}
