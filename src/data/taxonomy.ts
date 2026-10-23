// Stable keys used in the YAML data. Display labels live in src/i18n.
// The order here is the display order on the site.
export const CATEGORIES = ['foundations', 'llm', 'agents', 'infra', 'apps'] as const;
export const LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
export const FORMATS = ['video', 'slides', 'assignments', 'notes'] as const;
export const PROGRESS_STATES = ['want', 'doing', 'done'] as const;

export type Category = (typeof CATEGORIES)[number];
export type Level = (typeof LEVELS)[number];
export type Format = (typeof FORMATS)[number];
export type ProgressState = (typeof PROGRESS_STATES)[number];

// Material Symbols icon names used for each category in the UI.
export const CATEGORY_ICONS: Record<Category, string> = {
  foundations: 'functions-rounded',
  llm: 'psychology-outline-rounded',
  agents: 'smart-toy-outline-rounded',
  infra: 'memory-outline-rounded',
  apps: 'construction-rounded',
};
