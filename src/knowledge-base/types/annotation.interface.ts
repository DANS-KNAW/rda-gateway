export interface Annotation {
  selectedText: string;
  target: AnnotationTarget;
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
  open_vocabularies?: Record<string, Vocab[]>;
}

interface Vocab {
  label: string;
  secondarySearch?: string;
  description?: string;
  value: string;
}

/**
 * Identifies a region of text using the exact text content plus surrounding context.
 * This is the most robust selector type as it works even when the document structure changes.
 */
export interface TextQuoteSelector {
  type: 'TextQuoteSelector';
  /** The exact text that was selected */
  exact: string;
  /** Text immediately before the selection (for context) */
  prefix?: string;
  /** Text immediately after the selection (for context) */
  suffix?: string;
}

/**
 * Identifies a region of text using character offsets from the start of the document body.
 * Fast and precise when the document hasn't changed, but fragile to document modifications.
 */
export interface TextPositionSelector {
  type: 'TextPositionSelector';
  /** Character offset from the start of the document's textContent */
  start: number;
  /** Character offset from the start of the document's textContent */
  end: number;
}

/**
 * Identifies a region using XPath expressions and character offsets.
 * More resilient to small changes than position selectors, but still structural.
 */
export interface RangeSelector {
  type: 'RangeSelector';
  /** XPath to the element containing the start of the selection */
  startContainer: string;
  /** Character offset within the start container */
  startOffset: number;
  /** XPath to the element containing the end of the selection */
  endContainer: string;
  /** Character offset within the end container */
  endOffset: number;
}

/**
 * Identifies a specific page in a PDF document.
 * Used in combination with other selectors for PDF annotations.
 */
export interface PageSelector {
  type: 'PageSelector';
  /** Zero-based page index */
  index: number;
  /** Optional human-readable page label */
  label?: string;
}

/**
 * Union type of all supported selector types
 */
export type Selector =
  | TextQuoteSelector
  | TextPositionSelector
  | RangeSelector
  | PageSelector;

/**
 * The target of an annotation, containing multiple selector strategies
 * for robust anchoring across document changes
 */
export interface AnnotationTarget {
  /** The URL or identifier of the document being annotated */
  source: string;
  /** Multiple selectors for the same text region (fallback strategy) */
  selector: Selector[];
}
