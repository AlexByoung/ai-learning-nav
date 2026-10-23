// Stable keys used in the YAML data. Display labels live in src/i18n.

// The five layers of the stack, top (closest to the user) to bottom (closest to the machine).
// This order drives every list on the site and the layer mark beside each course.
export const CATEGORIES = ['apps', 'agents', 'llm', 'foundations', 'infra'] as const;
export const LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
export const FORMATS = ['video', 'slides', 'assignments', 'notes'] as const;
export const PROGRESS_STATES = ['want', 'doing', 'done'] as const;

export type Category = (typeof CATEGORIES)[number];
export type Level = (typeof LEVELS)[number];
export type Format = (typeof FORMATS)[number];
export type ProgressState = (typeof PROGRESS_STATES)[number];
