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
  // Card buttons
  for (const group of document.querySelectorAll<HTMLElement>('[data-progress-for]')) {
    const id = group.dataset.progressFor!;
    const state = progress[id];
    for (const btn of group.querySelectorAll<HTMLButtonElement>('button[data-state]')) {
      btn.setAttribute('aria-pressed', String(btn.dataset.state === state));
    }
    const card = group.closest<HTMLElement>('[data-course-id]');
    if (card) {
      if (state) card.dataset.progress = state;
      else delete card.dataset.progress;
      const pill = card.querySelector<HTMLElement>('[data-state-pill]');
      if (pill) pill.textContent = state ? t.progress.states[state] : '';
    }
  }

  // Home page totals
  const counts = { want: 0, doing: 0, done: 0 };
  const known = new Set(
    (document.querySelector<HTMLElement>('[data-progress-stats]')?.dataset.courseIds ?? '').split(',').filter(Boolean),
  );
  for (const [id, state] of Object.entries(progress)) {
    if (known.size === 0 || known.has(id)) counts[state]++;
  }
  for (const el of document.querySelectorAll<HTMLElement>('[data-progress-count]')) {
    el.textContent = String(counts[el.dataset.progressCount as ProgressState] ?? 0);
  }
  for (const el of document.querySelectorAll<HTMLElement>('[data-progress-bar]')) {
    const total = Number(el.dataset.total) || 1;
    const key = el.dataset.progressBar as ProgressState;
    el.style.width = `${(counts[key] / total) * 100}%`;
  }
  const empty = document.querySelector<HTMLElement>('[data-progress-empty]');
  if (empty) empty.hidden = counts.want + counts.doing + counts.done > 0;

  // Path progress ("已学完 x / n")
  for (const el of document.querySelectorAll<HTMLElement>('[data-path-progress]')) {
    const ids = (el.dataset.courseIds ?? '').split(',').filter(Boolean);
    const done = ids.filter((id) => progress[id] === 'done').length;
    const template = el.dataset.template ?? '{done} / {total}';
    el.textContent = template.replace('{done}', String(done)).replace('{total}', String(ids.length));
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
  // Clicking the active state again clears it.
  if (progress[id] === state) delete progress[id];
  else progress[id] = state;
  save(progress);
  render();
});

// Keep multiple open tabs in sync.
window.addEventListener('storage', (event) => {
  if (event.key === KEY) {
    progress = load();
    render();
  }
});

render();
