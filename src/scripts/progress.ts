// Per-course progress (want / doing / done), stored only in this browser's localStorage.
import { PROGRESS_STATES, type ProgressState } from '../data/taxonomy';
import { t } from '../i18n';

const KEY = 'ai-learning-nav:progress:v1';
type ProgressMap = Record<string, ProgressState>;

let storageOk = true;

function load(): ProgressMap {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    if (!parsed || typeof parsed !== 'object') return {};
    const out: ProgressMap = {};
    for (const [id, state] of Object.entries(parsed as Record<string, unknown>)) {
      if ((PROGRESS_STATES as readonly unknown[]).includes(state)) out[id] = state as ProgressState;
    }
    return out;
  } catch {
    storageOk = false;
    return {};
  }
}

function save(map: ProgressMap) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    storageOk = false;
  }
}

let progress = load();

function render() {
  // Every element that represents a course: its state attribute and its state label.
  for (const el of document.querySelectorAll<HTMLElement>('[data-course-id]')) {
    const state = progress[el.dataset.courseId!];
    if (state) el.dataset.progress = state;
    else delete el.dataset.progress;
    const pill = el.querySelector<HTMLElement>('[data-state-pill]');
    if (pill) pill.textContent = state ? t.progress.states[state] : '';
  }

  // The three buttons on each course row.
  for (const group of document.querySelectorAll<HTMLElement>('[data-progress-for]')) {
    const state = progress[group.dataset.progressFor!];
    for (const btn of group.querySelectorAll<HTMLButtonElement>('button[data-state]')) {
      btn.setAttribute('aria-pressed', String(btn.dataset.state === state));
    }
  }

  // Totals, counted only over courses that exist on the site.
  const known = new Set(
    (document.querySelector<HTMLElement>('[data-progress-stats]')?.dataset.courseIds ?? '').split(',').filter(Boolean),
  );
  const counts: Record<ProgressState, number> = { want: 0, doing: 0, done: 0 };
  for (const [id, state] of Object.entries(progress)) {
    if (known.size === 0 || known.has(id)) counts[state]++;
  }
  for (const el of document.querySelectorAll<HTMLElement>('[data-progress-count]')) {
    el.textContent = String(counts[el.dataset.progressCount as ProgressState] ?? 0);
  }

  // The next course on the route that is not done yet.
  for (const el of document.querySelectorAll<HTMLElement>('[data-next]')) {
    const steps = (el.dataset.route ?? '').split('||').map((s) => s.split('::'));
    const next = steps.find(([id]) => progress[id] !== 'done');
    el.textContent = next ? (el.dataset.template ?? '').replace('{title}', next[1]) : (el.dataset.none ?? '');
  }

  // Route progress ("已学完 x / n").
  for (const el of document.querySelectorAll<HTMLElement>('[data-path-progress]')) {
    const ids = (el.dataset.courseIds ?? '').split(',').filter(Boolean);
    const done = ids.filter((id) => progress[id] === 'done').length;
    el.textContent = (el.dataset.template ?? '{done} / {total}').replace('{done}', String(done)).replace('{total}', String(ids.length));
  }

  for (const el of document.querySelectorAll<HTMLElement>('[data-storage-warning]')) {
    el.hidden = storageOk;
  }
}

document.addEventListener('click', (event) => {
  const btn = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-progress-for] button[data-state]');
  if (!btn) return;
  const id = btn.closest<HTMLElement>('[data-progress-for]')!.dataset.progressFor!;
  const state = btn.dataset.state as ProgressState;
  // Pressing the active state again clears it.
  if (progress[id] === state) delete progress[id];
  else progress[id] = state;
  save(progress);
  render();
});

// Keep several open tabs in sync.
window.addEventListener('storage', (event) => {
  if (event.key === KEY) {
    progress = load();
    render();
  }
});

render();
