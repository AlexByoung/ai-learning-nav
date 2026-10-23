import { getCollection, type CollectionEntry } from 'astro:content';
import { parse } from 'yaml';
import coursesYaml from '../data/courses.yaml?raw';
import pathsYaml from '../data/paths.yaml?raw';

export type Course = CollectionEntry<'courses'>['data'];
export type Path = CollectionEntry<'paths'>['data'];
export type ResolvedPath = Path & { courses: { course: Course; note: string }[] };

// getCollection() does not preserve file order, so re-sort by the id order in the YAML source.
function yamlOrder(source: string): Map<string, number> {
  const items = parse(source) as { id?: unknown }[];
  return new Map(items.map((item, i) => [String(item.id), i]));
}

function inFileOrder<T extends { id: string }>(items: T[], source: string): T[] {
  const order = yamlOrder(source);
  return [...items].sort((a, b) => (order.get(a.id) ?? Infinity) - (order.get(b.id) ?? Infinity));
}

// Courses keep their YAML order; the first entry is shown first.
export async function getCourses(): Promise<Course[]> {
  const entries = await getCollection('courses');
  if (entries.length === 0) {
    // The file loader only logs YAML parse errors, so fail loudly here instead of shipping an empty site.
    throw new Error('src/data/courses.yaml 没有读到任何课程（可能是 YAML 语法错误）。');
  }
  return inFileOrder(
    entries.map((e) => e.data),
    coursesYaml,
  );
}

export async function getPaths(): Promise<ResolvedPath[]> {
  const [entries, courses] = await Promise.all([getCollection('paths'), getCourses()]);
  const byId = new Map(courses.map((c) => [c.id, c]));
  return inFileOrder(
    entries.map((e) => e.data),
    pathsYaml,
  ).map((data) => ({
    ...data,
    courses: data.steps.map((step) => {
      const course = byId.get(step.course.id);
      if (!course) {
        throw new Error(`paths.yaml 路线 "${data.id}" 引用了不存在的课程 id "${step.course.id}"。`);
      }
      return { course, note: step.note };
    }),
  }));
}

export function hasVideo(course: Course): boolean {
  return course.formats.includes('video') || Boolean(course.links.youtube);
}

export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
