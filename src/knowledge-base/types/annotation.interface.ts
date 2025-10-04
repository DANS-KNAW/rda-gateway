export interface Annotation {
  selectedText: string;
  title: string;
  description?: string;
  notes?: string;
  language: Vocab;
  resource: string;
  resource_type: Vocab;
  keywords?: Vocab[];
  pathways?: Vocab[];
  gorc_elements?: Vocab[];
  gorc_attributes?: Vocab[];
  interest_groups?: Vocab[];
  working_groups?: Vocab[];
  disciplines?: Vocab[];
  submitter: string;
}

interface Vocab {
  label: string;
  secondarySearch?: string;
  description?: string;
  value: string;
}
