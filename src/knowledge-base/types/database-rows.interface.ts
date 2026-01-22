/**
 * Type definitions for raw database query results.
 * These interfaces represent the structure of rows returned from PostgreSQL queries.
 */

export interface ResourceRow {
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
  resource_source: string;
  fragment: string | null;
  uuid_uri_type: string | null;
  notes: string | null;
  last_update: string | null;
  pathway: string | null;
  pathway_uuid: string | null;
  group_name: string | null;
  group_uuid: string | null;
  changed: string | null;
  submitter?: string;
  submitter_name?: string;
  annotation_target?: string;
}

export interface SubjectResourceRow {
  uuid_resource: string;
  resource: string;
  keyword: string;
}

export interface WorkflowRelationRow {
  uuid_resource: string;
  uuid_adoption_state: string;
  status: string;
}

export interface WorkflowRow {
  UUID_Workflow: string;
  WorkflowState: string;
  Description: string;
}

export interface RightsResourceRow {
  uuid_resource: string;
  lod_pid: string;
  relation: string;
}

export interface RightRow {
  lod_pid: string;
  description: string;
  type: string;
  data_source: string;
}

export interface GorcElementResourceRow {
  uuid_resource: string;
  uuid_element: string;
}

export interface GorcElementRow {
  uuid_element: string;
  element: string;
  description: string;
}

export interface GorcAttributeResourceRow {
  uuid_resource: string;
  uuid_attribute: string;
  uuid_Attribute?: string;
}

export interface GorcAttributeRow {
  uuid_attribute?: string;
  uuid_Attribute?: string;
  attribute: string;
  description: string;
}

export interface DisciplineResourceRow {
  uuid_resource: string;
  internal_identifier: string;
  uuid_disciplines?: string;
}

export interface DisciplineRow {
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

export interface IndividualResourceRow {
  uuid_resource: string;
  uuid_individual: string;
  relation: string;
}

export interface IndividualRow {
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
}

export interface InstitutionMemberRow {
  uuid_individual: string;
  uuid_institution: string;
  member?: string;
}

export interface InstitutionRow {
  uuid_institution: string;
  institution: string;
  english_name: string;
  parent_institution: string;
}

export interface InstitutionOrgTypeRow {
  uuid_institution: string;
  uuid_org_type: string;
}

export interface OrgTypeRow {
  internal_identifier: string;
  rda_uuid: string;
  organisation_type_id: string;
  organisation_type: string;
  link_text: string;
  description: string;
}

export interface InstitutionRoleRelationRow {
  UUID_Institution: string;
  InstitutionRoleID: string;
}

export interface InstitutionRoleRow {
  internal_identifier: string;
  InstitutionRoleID: string;
  InstitutionRole: string;
  RDA_taxonomy: string;
  Description: string;
}

export interface InstitutionCountryRow {
  uuid_institution: string;
  institution: string;
  uuid_country: string;
  country: string;
}

export interface IndividualGroupRow {
  uuid_individual: string;
  uuid_group: string;
}

export interface InterestGroupRow {
  uuid_interestGroup: string;
  title: string;
  description: string;
  uuid_domain: string;
  domains: string;
  url: string;
  status: string;
  sub_status: string;
}

export interface WorkingGroupRow {
  uuid_working_group: string;
  title: string;
  description: string;
  uuid_domain: string;
  domains: string;
  url: string;
  backup_url: string;
  status: string;
  sub_status: string;
}

export interface GroupResourceRow {
  uuid_resource: string;
  uuid_group: string;
  relation: string;
}

export interface PathwayResourceRow {
  uuid_resource: string;
  uuid_pathway: string;
}

export interface PathwayRow {
  uuid_pathway: string;
  pathway: string;
  description: string;
  data_source: string;
}

export interface ResourceRelationRow {
  uuid_resource: string;
  uuid_relation: string;
  relation: string;
}

export interface RelationRow {
  uuid_relation: string;
}

export interface ResourceKeywordRow {
  uuid_resource: string;
  uuid_keyword: string;
}

export interface KeywordRow {
  uuid_keyword: string;
  keyword: string;
}

export interface ResourceVocabularyRow {
  uuid_resource: string;
  namespace: string;
  value_uri: string;
  label: string;
  subject_scheme?: string;
  value_scheme?: string;
}

export interface UriTypeRow {
  uuid_uri_type: string;
  uri_type: string;
  description: string;
}

export interface MetricRow {
  id: number;
  type: string;
  version: string;
  browser: string;
  browser_version: string;
  os: string;
  arch: string;
  locale: string;
  timestamp: string;
  created_at: string;
}
