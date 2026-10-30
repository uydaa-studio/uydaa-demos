// Moteur uydaa : une séquence d'images qui avance avec le défilement (effet « site Apple »).
// Usage : <section data-scrub="frames/" data-count="72"><canvas></canvas>…</section>
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll("[data-scrub]").forEach((section) => {
    const canvas = section.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    const count = +section.dataset.count;
    const src = (i) => `${section.dataset.scrub}${String(i + 1).padStart(3, "0")}.webp`;
    const frames = [];
    let current = -1;

    const load = (i) => {
      if (frames[i]) return frames[i];
      const img = new Image();
      img.src = src(i);
      img.onload = () => { if (i === current) draw(i, true); };
      return (frames[i] = img);
    };

    function draw(i, force) {
      if (i === current && !force) return;
      current = i;
      const img = load(i);
      if (!img.complete || !img.naturalWidth) return;
      const w = canvas.width, h = canvas.height;
      const s = Math.max(w / img.naturalWidth, h / img.naturalHeight); // cover
      const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    }

    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      draw(Math.max(current, 0), true);
    }

    function progress() {
      const r = section.getBoundingClientRect();
      const total = r.height - innerHeight;
      return total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
    }

    // Les blocs [data-from] apparaissent quand la progression dépasse leur seuil (0 à 1).
    const steps = [...section.querySelectorAll("[data-from]")];
    function update() {
      const p = reduce ? 0.5 : progress();
      draw(Math.round(p * (count - 1)));
      steps.forEach((el) => el.classList.toggle("on", p >= +el.dataset.from && p < +(el.dataset.to || 2)));
      section.style.setProperty("--p", p.toFixed(3));
    }

    // Première image tout de suite, les autres en arrière-plan.
    load(0).onload = () => draw(0, true);
    requestIdleCallback ? requestIdleCallback(() => { for (let i = 1; i < count; i++) load(i); })
                        : setTimeout(() => { for (let i = 1; i < count; i++) load(i); }, 300);

    let ticking = false;
    addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { update(); ticking = false; });
    }, { passive: true });
    addEventListener("resize", resize);
    resize();
    update();
  });
})();
