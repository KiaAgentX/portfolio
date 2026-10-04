(function () {
  const P = window.__PROJECTS__ || [];
  const state = { q: "", cat: "All", sort: "value" };

  const CAT_COLORS = {
    "AI & Agents": "#a78bfa",
    "Trading & Fintech": "#fbbf24",
    "E-Commerce & Marketplaces": "#f472b6",
    "Games & 3D": "#22d3ee",
    "Business & Accounting": "#a9c4de",
    "Developer Tools": "#ef4435",
    "Web & Brand Experiences": "#fb923c",
    "Learning & Content": "#34d399",
    "Docs & Strategy": "#c5c1b6",
  };
  const DOCS_CAT = "Docs & Strategy";
  const featured = [...P].sort((a, b) => b.value - a.value).slice(0, 2);
  const featuredIds = new Set(featured.map(f => f.id));

  const cats = ["All"];
  P.forEach(p => { if (!cats.includes(p.category)) cats.push(p.category); });
  cats.sort((a, b) => a === "All" ? -1 : b === "All" ? 1 : a.localeCompare(b));

  const $ = s => document.querySelector(s);
  const grid = $("#grid"), chips = $("#chips");
  const docsSection = $("#docs-section"), docsGrid = $("#docs-grid");

  const money = n => "$" + n.toLocaleString("en-US");
  const fmt = n => n.toLocaleString("en-US");
  const esc = s => String(s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

  const isDefaultView = () => state.cat === "All" && !state.q.trim();

  function renderChips() {
    chips.innerHTML = cats.map(c => {
      const n = c === "All" ? P.length : P.filter(p => p.category === c).length;
      const color = c === "All" ? "#ef4435" : (CAT_COLORS[c] || "#62647a");
      return `<span class="chip${state.cat === c ? " active" : ""}" data-c="${esc(c)}" style="--cc:${color}">
        <span class="dotc"></span>${esc(c)}<span class="n">${n}</span></span>`;
    }).join("");
  }

  function filtered() {
    const q = state.q.trim().toLowerCase();
    return P.filter(p => {
      if (state.cat !== "All" && p.category !== state.cat) return false;
      if (!q) return true;
      return (p.name + " " + p.tagline + " " + p.description + " " + p.stack.join(" ") + " " + p.language + " " + p.category).toLowerCase().includes(q);
    }).sort((a, b) =>
      state.sort === "value" ? b.value - a.value :
      state.sort === "loc" ? b.loc - a.loc :
      a.name.localeCompare(b.name));
  }

  function statusBadge(p) {
    return p.status !== "stable"
      ? `<span class="badge status-${p.status === "in-dev" ? "dev" : "beta"}">${p.status === "in-dev" ? "in dev" : "beta"}</span>` : "";
  }

  function actions(p) {
    const preview = p.previewReady
      ? `<a class="btn primary" href="projects/${encodeURIComponent(p.id)}/#preview">PREVIEW</a>`
      : `<a class="btn" href="projects/${encodeURIComponent(p.id)}/#preview">DETAILS</a>`;
    return `${preview}<a class="btn ghost" href="projects/${encodeURIComponent(p.id)}/#source">CODE</a>`;
  }

  function featureCard(p) {
    const color = CAT_COLORS[p.category] || "#62647a";
    const media = p.thumb
      ? `<img src="${p.thumb}" alt="${esc(p.name)}" loading="lazy" onerror="this.style.display='none'">`
      : `<div class="ph">${esc(p.name.slice(0, 2).toUpperCase())}</div>`;
    return `<article class="card feature" style="--cc:${color};--i:0">
      <div class="feature-body">
        <div class="feature-kicker">★ TOP PROJECT — ${money(p.value)} EST.</div>
        <div class="card-top"><span class="cat">${esc(p.category)}</span><span class="loc">${fmt(p.loc)} LOC</span></div>
        <h3><a href="projects/${encodeURIComponent(p.id)}/">${esc(p.name)}</a></h3>
        <p class="tag">${esc(p.tagline)}</p>
        <div class="feature-facts">
          <span><b>${fmt(p.loc)}</b> lines</span>
          <span><b>${fmt(p.fileCount)}</b> files</span>
          <span><b>${esc(p.language)}</b></span>
          <span>${p.stack.slice(0, 3).map(esc).join(" · ")}</span>
        </div>
        <div class="feature-cta">${actions(p)}</div>
      </div>
      <div class="feature-media">${media}</div>
    </article>`;
  }

  function card(p, i) {
    const color = CAT_COLORS[p.category] || "#62647a";
    const isFeature = isDefaultView() && featuredIds.has(p.id);
    if (isFeature) return featureCard(p);
    const cover = p.thumb ? `<div class="cover"><img src="${p.thumb}" alt="${esc(p.name)} preview" loading="lazy"></div>` : `<div class="cover"></div>`;
    return `<article class="card" style="--cc:${color};--i:${Math.min(i, 14)}">
      ${cover}
      <div class="body">
        <div class="card-top">
          <span class="cat">${esc(p.category)}</span>
          <span class="loc">${fmt(p.loc)} LOC</span>
        </div>
        <h3><a href="projects/${encodeURIComponent(p.id)}/">${esc(p.name)}</a></h3>
        <p class="tag">${esc(p.tagline)}</p>
        <div class="meta">
          <span class="badge lang">${esc(p.language)}</span>
          ${p.stack.slice(0, 3).map(s => `<span class="badge">${esc(s)}</span>`).join("")}
          ${statusBadge(p)}
        </div>
        <div class="foot">
          <div class="value" title="Market-rate estimate of equivalent agency build cost">${money(p.value)}<small>EST. VALUE</small></div>
          <div class="actions">${actions(p)}</div>
        </div>
      </div>
    </article>`;
  }

  function renderFlagships() {
    const sec = document.getElementById("flagships");
    const host = document.getElementById("stories");
    if (!sec || !host) return;
    const top = P.filter(p => !featuredIds.has(p.id) && p.thumb).sort((a, b) => b.value - a.value).slice(0, 3);
    host.innerHTML = top.map((p, i) => `<article class="story${i % 2 ? " flip" : ""}">
      <div class="story-media"><img src="${p.thumb}" alt="${esc(p.name)}" loading="lazy"></div>
      <div class="story-body">
        <span class="story-kicker">Flagship · ${money(p.value)} est.</span>
        <h3><a href="projects/${encodeURIComponent(p.id)}/">${esc(p.name)}</a></h3>
        <p>${esc(p.description)}</p>
        <div class="story-facts"><span><b>${fmt(p.loc)}</b> LOC</span><span><b>${esc(p.language)}</b></span><span>${p.stack.slice(0, 3).map(esc).join(" · ")}</span></div>
        <a class="learn" href="projects/${encodeURIComponent(p.id)}/">Learn more</a>
      </div>
    </article>`).join("");
    sec.style.display = top.length ? "" : "none";
  }

  function render() {
    const list = filtered();
    const unified = !isDefaultView(); /* search or category active -> single grid */

    let mainList = list, docsList = [];
    if (unified) {
      docsSection.style.display = "none";
    } else {
      mainList = list.filter(p => p.category !== DOCS_CAT);
      docsList = list.filter(p => p.category === DOCS_CAT);
      docsSection.style.display = docsList.length ? "" : "none";
    }

    grid.innerHTML = mainList.length
      ? mainList.map(card).join("")
      : `<div class="empty">No projects match “${esc(state.q)}”.</div>`;

    if (!unified && docsList.length) {
      docsGrid.innerHTML = docsList.map((p, i) => card(p, i)).join("");
    }

    if (window.KIA_MOTION) window.KIA_MOTION.refresh();
  }

  chips.addEventListener("click", e => {
    const c = e.target.closest(".chip"); if (!c) return;
    state.cat = c.dataset.c; renderChips(); render();
    if (window.KIA_SFX) window.KIA_SFX.blip();
  });
  $("#search").addEventListener("input", e => { state.q = e.target.value; render(); });
  $("#sort").addEventListener("change", e => {
    state.sort = e.target.value; render();
    if (window.KIA_SFX) window.KIA_SFX.blip();
  });

  function renderRoadmap() {
    const R = window.__ROADMAP__ || [];
    const el = document.getElementById("roadmap");
    if (!el) return;
    el.innerHTML = R.map((r, i) => {
      const color = CAT_COLORS[r.category] || "#a78bfa";
      return `<article class="rm-card" style="--cc:${color};--i:${Math.min(i, 9)}">
        <div class="rm-top">
          <span class="cat">${esc(r.category)}</span>
          <span class="badge planned">PLANNED</span>
        </div>
        <h3>${esc(r.name)}</h3>
        <p class="tag">${esc(r.tagline)}</p>
        <p class="signal">⌁ ${esc(r.signal)}</p>
        <div class="meta">${r.stack.slice(0, 5).map(s => `<span class="badge">${esc(s)}</span>`).join("")}</div>
        <div class="foot">
          <div class="value">${money(r.value)}<small>EST. VALUE</small></div>
          <span class="rm-status mono">v-next</span>
        </div>
      </article>`;
    }).join("");
  }

  function renderCapabilities() {
    const host = document.getElementById("caps-grid");
    if (!host) return;
    const caps = window.__CAPS__ || [];
    const max = window.__CAPMAX__ || 1;
    host.innerHTML = caps.map((c, i) => `<article class="cap-card" style="--cc:${c.color};--i:${Math.min(i, 10)}">
      <h3 class="cap-name">${esc(c.category)}</h3>
      <p class="cap-desc">${esc(c.desc || "")}</p>
      <div class="cap-stats"><span><b>${c.count}</b> projects</span><span><b>${fmt(c.loc)}</b> LOC</span></div>
      <div class="cap-bar"><i style="width:${Math.round((c.value / max) * 100)}%"></i></div>
      <div class="cap-val">${money(c.value)} shipped</div>
    </article>`).join("");
  }

  function renderLangs() {
    const host = document.getElementById("langbars");
    if (!host) return;
    const L = window.__LANGS__ || [];
    const max = Math.max.apply(null, L.map(l => l.count).concat([1]));
    host.innerHTML = L.map(l => `<div class="langbar">
      <span class="lb-name">${esc(l.name)}</span>
      <span class="lb-track"><i class="lb-fill" style="width:${Math.round((l.count / max) * 100)}%"></i></span>
      <span class="lb-n">${l.count}</span>
    </div>`).join("");
  }

  function renderSkills() {
    const host = document.getElementById("skills-grid");
    if (!host) return;
    const S = window.__SKILLS__ || [];
    host.innerHTML = S.map((s, i) => `<article class="skill-card" style="--sc:${s.color};--i:${Math.min(i, 9)}">
      <div class="skill-top"><span class="skill-name">${esc(s.name)}</span><span class="skill-n">${s.count} proj</span></div>
      <p class="tag">${esc(s.tag)}</p>
      <div class="skill-foot"><span class="skill-range">${esc(s.range)}</span><span class="skill-id">${esc(s.id)}</span></div>
    </article>`).join("");
  }

  renderChips();
  render();
  renderRoadmap();
  renderFlagships();
  renderCapabilities();
  renderLangs();
  renderSkills();

  /* ---- animated counters (skipped where IntersectionObserver missing) ---- */
  try {
    if ("IntersectionObserver" in window && !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) {
      document.querySelectorAll(".spec .v").forEach(el => {
        const txt = el.textContent;
        const num = parseFloat(txt.replace(/[^0-9.]/g, ""));
        if (!num) return;
        const prefix = txt.trim().startsWith("$") ? "$" : "";
        const dur = 900, t0 = performance.now();
        function step(t) {
          const k = Math.min(1, (t - t0) / dur);
          const e = 1 - Math.pow(1 - k, 3);
          el.textContent = prefix + Math.round(num * e).toLocaleString("en-US");
          if (k < 1) requestAnimationFrame(step);
          else el.textContent = txt;
        }
        requestAnimationFrame(step);
      });
    }
  } catch (e) { }

  /* ---- spotlight follows cursor on cards ---- */
  document.addEventListener("mousemove", e => {
    const c = e.target && e.target.closest ? e.target.closest(".card") : null;
    if (!c) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty("--mx", (((e.clientX - r.left) / r.width) * 100).toFixed(1) + "%");
    c.style.setProperty("--my", (((e.clientY - r.top) / r.height) * 100).toFixed(1) + "%");
  });

  /* ---- reveal on scroll (only when GSAP motion layer is absent) ---- */
  try {
    if (!window.gsap && "IntersectionObserver" in window && !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) {
      const els = Array.from(document.querySelectorAll(".sec-head, .capabilities, .contact, .universe-grid, .skills-cta, .docs-section, .roadmap-section, .spec, .foot-cta"));
      els.forEach(el => el.classList.add("reveal"));
      const io = new IntersectionObserver(entries => {
        entries.forEach(x => { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } });
      }, { threshold: 0.12 });
      els.forEach(el => io.observe(el));
    }
  } catch (e) { }

  /* ---- nav scroll progress ---- */
  (function () {
    const prog = document.getElementById("nav-progress");
    if (!prog) return;
    function upd() {
      const h = document.documentElement;
      const k = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
      prog.style.transform = "scaleX(" + Math.min(1, Math.max(0, k)) + ")";
    }
    window.addEventListener("scroll", upd, { passive: true });
    upd();
  })();

  /* ---- command palette (Ctrl+K) ---- */
  (function () {
    const palette = document.getElementById("palette");
    const input = document.getElementById("palette-input");
    const results = document.getElementById("palette-results");
    if (!palette || !input || !results) return;
    let list = [], sel = 0;

    function draw(q) {
      q = q.trim().toLowerCase();
      list = P.filter(p => !q || (p.name + " " + p.tagline + " " + p.category + " " + p.language + " " + p.stack.join(" ")).toLowerCase().includes(q)).slice(0, 8);
      sel = 0;
      results.innerHTML = list.length
        ? list.map((p, i) => `<div class="p-item${i === 0 ? " sel" : ""}" data-i="${i}"><span>${esc(p.name)}</span><span class="p-cat">${esc(p.category)}</span></div>`).join("")
        : `<div class="palette-empty">No matches — try “trading”, “three”, “python”…</div>`;
    }
    function open() {
      palette.hidden = false; input.value = ""; draw(""); input.focus();
    }
    function close() { palette.hidden = true; }
    function go(i) {
      const p = list[i]; if (!p) return;
      close();
      window.location.href = "projects/" + encodeURIComponent(p.id) + "/";
    }
    function move(d) {
      if (!list.length) return;
      sel = (sel + d + list.length) % list.length;
      Array.from(results.querySelectorAll(".p-item")).forEach((el, i) => el.classList.toggle("sel", i === sel));
      const cur = results.querySelector(".p-item.sel");
      if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: "nearest" });
    }

    input.addEventListener("input", () => draw(input.value));
    input.addEventListener("keydown", e => {
      if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
      else if (e.key === "Enter") { e.preventDefault(); go(sel); }
      else if (e.key === "Escape") { close(); }
    });
    results.addEventListener("click", e => {
      const it = e.target.closest(".p-item"); if (it) go(+it.dataset.i);
    });
    palette.addEventListener("click", e => { if (e.target === palette) close(); });

    document.addEventListener("keydown", e => {
      const typing = /INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || "");
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); palette.hidden ? open() : close(); }
      else if (e.key === "/" && !typing && palette.hidden) { e.preventDefault(); open(); }
      else if (e.key === "Escape" && !palette.hidden) { close(); }
    });
    const navBtn = document.getElementById("nav-search");
    if (navBtn) { navBtn.addEventListener("click", open); navBtn.addEventListener("keydown", e => { if (e.key === "Enter") open(); }); }
    const openBtn = document.getElementById("open-palette");
    if (openBtn) openBtn.addEventListener("click", open);
  })();

  /* PWA: register service worker (root scope) */
  try {
    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
      navigator.serviceWorker.register("sw.js").catch(function () { });
    }
  } catch (e) { }

  /* ---- hero particles (KIA identity) ---- */
  try {
  (function particles() {
    const canvas = document.getElementById("particles");
    if (!canvas) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext && canvas.getContext("2d");
    if (!ctx) return;
    const COLORS = ["#22d3ee", "#a78bfa", "#fbbf24", "#34d399", "#f472b6"];
    let w, h, dots = [];
    function resize() {
      const r = canvas.parentElement.getBoundingClientRect();
      w = canvas.width = r.width; h = canvas.height = r.height;
      const n = Math.min(70, Math.floor(w / 22));
      dots = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .22,
        r: Math.random() * 1.6 + .6,
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
      }));
    }
    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > w) d.vx *= -1;
        if (d.y < 0 || d.y > h) d.vy *= -1;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.283);
        ctx.fillStyle = d.c; ctx.globalAlpha = .55; ctx.fill();
      }
      ctx.globalAlpha = .12; ctx.strokeStyle = "#4b5570";
      for (let i = 0; i < dots.length; i++) for (let j = i + 1; j < dots.length; j++) {
        const a = dots[i], b = dots[j];
        const dx = a.x - b.x, dy = a.y - b.y, dist = dx * dx + dy * dy;
        if (dist < 110 * 110) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }
    resize();
    window.addEventListener("resize", resize);
    frame();
  })();
  } catch (e) { /* canvas unavailable */ }
})();
