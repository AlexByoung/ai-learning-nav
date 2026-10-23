// Section entrances: fire once as each [data-reveal] / [data-slice] element enters. Content is visible
// without JavaScript (the hidden state only applies under html.js) and under reduced motion.
// A [data-slice] starts fully clipped, so its parent is what gets observed.
const targets = new Map<Element, HTMLElement[]>();
const add = (watch: Element | null, el: HTMLElement) => {
  if (!watch) return;
  targets.set(watch, [...(targets.get(watch) ?? []), el]);
};
document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => add(el, el));
document.querySelectorAll<HTMLElement>('[data-slice]').forEach((el) => add(el.parentElement, el));

const show = (watch: Element) => targets.get(watch)?.forEach((el) => el.classList.add('is-in'));

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          show(entry.target);
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0 },
  );
  targets.forEach((_, watch) => io.observe(watch));
} else {
  targets.forEach((_, watch) => show(watch));
}
