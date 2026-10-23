// Prefix an internal path with the configured base (/ai-learning-nav/ on GitHub Pages).
// withBase('courses/') -> '/ai-learning-nav/courses/'
export function withBase(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  const clean = path.replace(/^\/+/, '');
  return `${base}/${clean}`;
}
