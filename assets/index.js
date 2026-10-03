(function () {
  const P = window.__PROJECTS__ || [];
  const state = { q: "", cat: "All", sort: "value" };

  const cats = ["All"];
  P.forEach(p => { if (!cats.includes(p.category)) cats.push(p.category); });
  cats.sort((a, b) => a === "All" ? -1 : b === "All" ? 1 : a.localeCompare(b));

  const $ = s => document.querySelector(s);
  const grid = $("#grid"), chips = $("#chips");

  const money = n => "$" + n.toLocaleString("en-US");

  function renderChips() {
    chips.innerHTML = cats.map(c => {
      const n = c === "All" ? P.length : P.filter(p => p.category === c).length;
      return `<span class="chip${state.cat === c ? " active" : ""}" data-c="${esc(c)}">${esc(c)}<span class="n">${n}</span></span>`;
    }).join("");
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  }

  function filtered() {
    const q = state.q.trim().toLowerCase();
    let list = P.filter(p => {
      if (state.cat !== "All" && p.category !== state.cat) return false;
      if (!q) return true;
      return (p.name + " " + p.tagline + " " + p.description + " " + p.stack.join(" ") + " " + p.language + " " + p.category).toLowerCase().includes(q);
    });
    if (state.sort === "value") list.sort((a, b) => b.value - a.value);
    else if (state.sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    else if (state.sort === "loc") list.sort((a, b) => b.loc - a.loc);
    return list;
  }

  function card(p) {
    const status = p.status !== "stable" ? `<span class="badge status-${p.status === "in-dev" ? "dev" : "beta"}">${p.status === "in-dev" ? "in development" : "beta"}</span>` : "";
    const previewBtn = p.previewReady
      ? `<a class="btn primary" href="projects/${encodeURIComponent(p.id)}/#preview">Preview</a>`
      : `<a class="btn" href="projects/${encodeURIComponent(p.id)}/#preview" title="Preview availability">Details</a>`;
    return `<article class="card">
      <span class="cat">${esc(p.category)}</span>
      <h3><a href="projects/${encodeURIComponent(p.id)}/">${esc(p.name)}</a></h3>
      <p class="tag">${esc(p.tagline)}</p>
      <div class="meta">
        <span class="badge lang">${esc(p.language)}</span>
        ${p.stack.slice(0, 3).map(s => `<span class="badge">${esc(s)}</span>`).join("")}
        ${status}
      </div>
      <div class="foot">
        <div class="value" title="Market-rate estimate of equivalent agency build cost">${money(p.value)}<small>EST. MARKET VALUE</small></div>
        <div class="actions">${previewBtn}<a class="btn ghost" href="projects/${encodeURIComponent(p.id)}/#source">Code</a></div>
      </div>
    </article>`;
  }

  function render() {
    const list = filtered();
    grid.innerHTML = list.length ? list.map(card).join("") : `<div class="empty">No projects match “${esc(state.q)}”.</div>`;
  }

  chips.addEventListener("click", e => {
    const c = e.target.closest(".chip"); if (!c) return;
    state.cat = c.dataset.c; renderChips(); render();
  });
  $("#search").addEventListener("input", e => { state.q = e.target.value; render(); });
  $("#sort").addEventListener("change", e => { state.sort = e.target.value; render(); });

  renderChips();
  render();
})();
