(function () {
  const meta = window.__PROJECT__;
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));

  const params = new URLSearchParams(location.hash.replace(/^#/, ""));
  if (location.hash === "#preview") switchTab("preview");
  else if (location.hash === "#source") switchTab("source");
  else switchTab("overview");
  window.addEventListener("hashchange", () => {
    if (location.hash === "#preview") switchTab("preview");
    if (location.hash === "#source") switchTab("source");
    if (location.hash === "#overview") switchTab("overview");
  });

  function switchTab(name) {
    $$(".tab").forEach(t => t.classList.toggle("active", t.dataset.tab === name));
    $$(".panel").forEach(p => p.classList.toggle("active", p.id === "panel-" + name));
    if (name === "source") loadSource();
    if (name === "preview") { const f = $("iframe.preview"); if (f && f.dataset.defer) { f.src = f.dataset.defer; f.dataset.defer = ""; } }
  }
  $$(".tab").forEach(t => t.addEventListener("click", () => { location.hash = t.dataset.tab; switchTab(t.dataset.tab); }));

  /* ---------- Source viewer ---------- */
  let loaded = false, files = [], activeIdx = -1;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  }

  async function loadSource() {
    if (loaded) return; loaded = true;
    const status = $("#src-status"); const tree = $("#src-tree");
    if (!meta.sourceAvailable) {
      status.textContent = "Source files for this project are not published in this preview.";
      return;
    }
    try {
      const res = await fetch(`../../data/src/${encodeURIComponent(meta.id)}.json`);
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      files = data.files;
      status.style.display = "none";
      renderTree();
      openFile(0);
    } catch (e) {
      status.textContent = "Could not load source files (" + e.message + ").";
    }
  }

  function renderTree() {
    const tree = $("#src-tree");
    const groups = new Map();
    files.forEach((f, i) => {
      const dir = f.path.includes("/") ? f.path.slice(0, f.path.lastIndexOf("/")) : "/";
      if (!groups.has(dir)) groups.set(dir, []);
      groups.get(dir).push({ f, i });
    });
    let html = "";
    for (const [dir, items] of groups) {
      html += `<div class="dir">${esc(dir === "/" ? "root" : dir)}</div>`;
      html += items.map(({ f, i }) =>
        `<div class="src-file" data-i="${i}"><span>${esc(f.path.split("/").pop())}</span><span class="sz">${fmtSize(f.size)}</span></div>`
      ).join("");
    }
    tree.innerHTML = html;
    tree.addEventListener("click", e => {
      const el = e.target.closest(".src-file"); if (!el) return;
      openFile(+el.dataset.i);
    });
  }

  function fmtSize(n) {
    if (n < 1024) return n + "B";
    if (n < 1024 * 1024) return Math.round(n / 1024) + "K";
    return (n / 1048576).toFixed(1) + "M";
  }

  function openFile(i) {
    if (i < 0 || i >= files.length) return;
    activeIdx = i;
    const f = files[i];
    $$("#src-tree .src-file").forEach(el => el.classList.toggle("active", +el.dataset.i === i));
    $("#src-path").textContent = f.path + (f.truncated ? "  (truncated)" : "");
    const code = $("#src-code");
    code.textContent = f.content || "";
    code.className = "language-" + (f.lang || "plaintext");
    if (window.hljs) {
      try { window.hljs.highlightElement(code); } catch (e) { }
    }
    $("#src-code-wrap").scrollTop = 0;
  }

  $("#src-prev").addEventListener("click", () => openFile(activeIdx - 1));
  $("#src-next").addEventListener("click", () => openFile(activeIdx + 1));
})();
