export type vocab = {
  id: string;
  label: string;
  value: string;
  description?: string;
  url?: string;
};

export class Annotation {
  page_url: string;
  annotation: string;
  uritype: string;
  citation: {
    title: string;
    description?: string;
    notes?: string;
    submitter?: string;
    language: {
      id: string;
      label: string;
      value: string;
    };
    created_at: string;
    resource?: string;
  };
  vocabularies: {
    pathways?: vocab[];
    gorc_attributes?: vocab[];
    gorc_elements?: vocab[];
    working_groups?: vocab[];
    interest_groups?: vocab[];
    domains?: vocab[];
  };
}
