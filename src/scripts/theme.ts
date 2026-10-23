// Light/dark toggle (cycles auto -> light -> dark) and the hue picker, both remembered in localStorage.
const THEME_KEY = 'ai-learning-nav:theme';
const HUE_KEY = 'ai-learning-nav:hue';
const DEFAULT_HUE = 165;
const ORDER = ['auto', 'light', 'dark'] as const;
type Theme = (typeof ORDER)[number];

function get(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function set(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Storage unavailable: the choice still applies for this page view.
  }
}

// ---- Light / dark ----

const root = document.documentElement;
const savedTheme = get(THEME_KEY);
let theme: Theme = savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'auto';

function applyTheme() {
  if (theme === 'auto') delete root.dataset.theme;
  else root.dataset.theme = theme;
  for (const btn of document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')) {
    const label = btn.getAttribute(`data-label-${theme}`) ?? theme;
    btn.title = label;
    btn.setAttribute('aria-label', `${btn.dataset.labelBase ?? ''}：${label}`);
    for (const icon of btn.querySelectorAll<HTMLElement>('[data-theme-icon]')) {
      icon.hidden = icon.dataset.themeIcon !== theme;
    }
  }
}

for (const btn of document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')) {
  btn.addEventListener('click', () => {
    theme = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
    set(THEME_KEY, theme === 'auto' ? null : theme);
    applyTheme();
  });
}
applyTheme();

// ---- Hue ----

const panel = document.querySelector<HTMLElement>('[data-hue-panel]');
const toggle = document.querySelector<HTMLButtonElement>('[data-hue-toggle]');
const input = document.querySelector<HTMLInputElement>('[data-hue-input]');
const output = document.querySelector<HTMLOutputElement>('[data-hue-value]');
const reset = document.querySelector<HTMLButtonElement>('[data-hue-reset]');

function applyHue(hue: number, persist: boolean) {
  root.style.setProperty('--hue', String(hue));
  if (input) input.value = String(hue);
  if (output) output.value = String(hue);
  if (reset) reset.style.visibility = hue === DEFAULT_HUE ? 'hidden' : 'visible';
  if (persist) set(HUE_KEY, hue === DEFAULT_HUE ? null : String(hue));
}

const savedHue = Number(get(HUE_KEY));
applyHue(Number.isInteger(savedHue) && savedHue >= 0 && savedHue <= 360 && get(HUE_KEY) !== null ? savedHue : DEFAULT_HUE, false);

function setOpen(open: boolean) {
  if (!panel || !toggle) return;
  panel.hidden = !open;
  toggle.setAttribute('aria-expanded', String(open));
}

toggle?.addEventListener('click', (event) => {
  event.stopPropagation();
  setOpen(Boolean(panel?.hidden));
});
input?.addEventListener('input', () => applyHue(Number(input.value), true));
reset?.addEventListener('click', () => applyHue(DEFAULT_HUE, true));
document.addEventListener('click', (event) => {
  if (panel && !panel.hidden && !panel.contains(event.target as Node)) setOpen(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && panel && !panel.hidden) {
    setOpen(false);
    toggle?.focus();
  }
});
