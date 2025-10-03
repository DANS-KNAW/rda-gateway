interface Subject {
  uuid_resource: string;
  resource: string;
  keyword: string;
}

interface UriType {
  uuid_uri_type: string;
  uri_type: string;
  description: string;
}

interface Workflow {
  UUID_Workflow: string;
  WorkflowState: string;
  Description: string;
  status: string;
}

interface Rights {
  lod_pid: string;
  description: string;
  type: string;
  data_source: string;
  relation: string;
}

interface InstitutionType {
  internal_identifier: string;
  rda_uuid: string;
  organisation_type_id: string;
  organisation_type: string;
  link_text: string;
  description: string;
}

interface InstitutionRole {
  internal_identifier: string;
  InstitutionRoleID: string;
  InstitutionRole: string;
  RDA_taxonomy: string;
  Description: string;
}

interface InstitutionCountry {
  uuid_institution: string;
  institution: string;
  uuid_country: string;
  country: string;
}

interface Institution {
  uuid_institution: string;
  institution: string;
  english_name: string;
  parent_institution: string;
  institution_type: InstitutionType | null;
  role: InstitutionRole | null;
  country: InstitutionCountry | null;
}

interface InterestGroup {
  uuid_interestGroup: string;
  title: string;
  description: string;
  uuid_domain: string;
  domains: string;
  url: string;
  status: string;
  sub_status: string;
  relation?: string;
}

interface WorkingGroup {
  uuid_working_group: string;
  title: string;
  description: string;
  uuid_domain: string;
  domains: string;
  url: string;
  backup_url: string;
  status: string;
  sub_status: string;
  relation?: string;
}

interface Individual {
  uuid_individual: string;
  combined_name: string;
  lastName: string;
  firstName: string;
  fullName: string;
  revision_id: string;
  title: string;
  privacy_ticked: string;
  short_bio: string;
  rda_page: string;
  linked_in: string;
  twitter: string;
  identifier_type: string;
  identifier: string;
  source: string;
  uuid_rda_country: string;
  country: string;
  check: string;
  relation: string;
  institutions: Institution[];
  groups: (InterestGroup | WorkingGroup)[];
}

interface Discipline {
  internal_identifier: string;
  uuid: string;
  list_item: string;
  description: string;
  description_source: string;
  taxonomy_parent: string;
  taxonomy_terms: string;
  uuid_parent: string;
  url: string;
}

interface GorcElement {
  uuid_element: string;
  element: string;
  description: string;
}

interface GorcAttribute {
  uuid_attribute: string;
  attribute: string;
  description: string;
}

interface Pathway {
  uuid_pathway: string;
  pathway: string;
  description: string;
  data_source: string;
  relation: string;
}

interface Keyword {
  uuid_keyword: string;
  keyword: string;
}

interface Relation {
  // Define structure if relations are present in your data
}

// export interface ElasticDocument {
//   uuid: string;
//   uuid_link: string | null;
//   uuid_rda: string;
//   title: string;
//   alternateTitle: string | null;
//   uri: string;
//   backupUri: string | null;
//   uri2: string | null;
//   backupUri2: string | null;
//   pid_lod_type: string | null;
//   pid_lod: string | null;
//   dc_date: string | null;
//   dc_description: string;
//   dc_language: string;
//   type: string;
//   dc_type: string;
//   card_url: string | null;
//   source: string;
//   fragment: string | null;
//   uuid_uri_type: string | null;
//   notes: string | null;
//   subjects?: Subject[];
//   uri_type: UriType[];
//   workflows?: Workflow[];
//   rights?: Rights[];
//   gorc_elements: GorcElement[];
//   gorc_attributes: GorcAttribute[];
//   disciplines: Discipline[];
//   individuals?: Individual[];
//   working_groups?: WorkingGroup[];
//   interest_groups?: InterestGroup[];
//   pathways?: Pathway[];
//   relations?: Relation[];
//   related_institutions?: Institution[];
//   keywords: Keyword[];
// }

interface ElasticDocument {
  uuid: string;
  uuid_link: string | null;
  uuid_rda: string;
  title: string;
  alternateTitle: string | null;
  uri: string;
  backupUri: string | null;
  uri2: string | null;
  backupUri2: string | null;
  pid_lod_type: string | null;
  pid_lod: string | null;
  dc_date: string | null;
  dc_description: string;
  dc_language: string;
  type: string;
  dc_type: string;
  card_url: string | null;
  resource_source: string | null;
  fragment: string | null;
  uuid_uri_type: string | null;
  notes: string | null;
  subjects?: Subject[];
  uri_type: UriType[];
  workflows?: Workflow[];
  rights?: Rights[];
  gorc_elements: GorcElement[];
  gorc_attributes: GorcAttribute[];
  disciplines: Discipline[];
  individuals?: Individual[];
  working_groups?: WorkingGroup[];
  interest_groups?: InterestGroup[];
  pathways?: Pathway[];
  relations?: Relation[];
  related_institutions?: Institution[];
  keywords: Keyword[];
}
