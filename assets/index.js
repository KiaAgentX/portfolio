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
    return `<article class="card" style="--cc:${color};--i:${Math.min(i, 14)}">
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
    </article>`;
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
  }

  chips.addEventListener("click", e => {
    const c = e.target.closest(".chip"); if (!c) return;
    state.cat = c.dataset.c; renderChips(); render();
  });
  $("#search").addEventListener("input", e => { state.q = e.target.value; render(); });
  $("#sort").addEventListener("change", e => { state.sort = e.target.value; render(); });

  renderChips();
  render();

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
