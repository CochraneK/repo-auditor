(() => {
  const DATA_URL = "https://raw.githubusercontent.com/CochraneK/repo-auditor/main/portfolio/registry.json";
  const REPO_BASE = "https://github.com/CochraneK/";
  const BAND_LABELS = {
    "P0-NOW": "P0 · 现在",
    "P1-NEXT": "P1 · 接下来",
    "P2-PLANNED": "P2 · 计划中",
    "P3-LATER": "P3 · 后续",
    "P4-LOW": "P4 · 低优先",
    "STOP": "STOP"
  };

  const $ = id => document.getElementById(id);
  let data = null;

  function esc(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("repo-auditor-theme", theme);
  }

  function initTheme() {
    const saved = localStorage.getItem("repo-auditor-theme");
    if (saved) return setTheme(saved);
    setTheme(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }

  const scoreSort = (a,b) => (b.priority_score - a.priority_score) || a.name.localeCompare(b.name);

  function assertPublicOnly(repos) {
    const leaked = repos.filter(r => r.visibility !== "public");
    if (leaked.length) throw new Error("Public registry contains non-public repository records.");
  }

  function renderSummary(repos) {
    $("totalCount").textContent = repos.length;
    $("nowCount").textContent = repos.filter(r => r.priority_band === "P0-NOW").length;
    $("continueCount").textContent = repos.filter(r => r.work_status === "CONTINUE").length;
    $("stopCount").textContent = repos.filter(r => r.work_status === "STOP").length;
    $("snapshot").textContent = `Snapshot · ${data.snapshot_date || "—"}`;
  }

  function renderFocus(repos) {
    const focus = repos.filter(r => r.work_status === "CONTINUE").sort(scoreSort).slice(0,8);
    $("focusGrid").innerHTML = focus.map((r,i) => `
      <a class="focus-card" href="${REPO_BASE}${encodeURIComponent(r.name)}" target="_blank" rel="noreferrer">
        <span class="focus-rank">#${i+1}</span>
        <div class="focus-score">${r.priority_score}</div>
        <div class="focus-name">${esc(r.name)}</div>
        <p class="focus-reason">${esc(r.reason || "暂无备注")}</p>
        <div class="badges">
          <span class="badge public">public</span>
          <span class="badge">${esc(BAND_LABELS[r.priority_band] || r.priority_band)}</span>
        </div>
      </a>
    `).join("");
  }

  function laneHtml(title, key, repos) {
    const items = repos.filter(r => key === "LATER"
      ? ["P2-PLANNED","P3-LATER","P4-LOW"].includes(r.priority_band)
      : r.priority_band === key).sort(scoreSort);

    return `
      <article class="lane">
        <div class="lane-head"><strong>${esc(title)}</strong><span>${items.length} 个</span></div>
        ${items.length ? items.map(r => `
          <a class="lane-item" href="${REPO_BASE}${encodeURIComponent(r.name)}" target="_blank" rel="noreferrer">
            <span class="lane-score">${r.priority_score}</span>
            <span>
              <span class="lane-name">${esc(r.name)}</span>
              <span class="lane-sub">public · ${esc(BAND_LABELS[r.priority_band] || r.priority_band)}</span>
            </span>
          </a>
        `).join("") : '<p class="muted">暂无项目</p>'}
      </article>
    `;
  }

  function renderLanes(repos) {
    $("lanes").innerHTML = [
      laneHtml("🔥 NOW","P0-NOW",repos),
      laneHtml("⏭ NEXT","P1-NEXT",repos),
      laneHtml("🗓 LATER","LATER",repos),
      laneHtml("✓ DON’T TOUCH","STOP",repos)
    ].join("");
  }

  function renderTable() {
    const repos = data.repositories || [];
    const q = $("searchInput").value.trim().toLowerCase();
    const status = $("statusFilter").value;
    const priority = $("priorityFilter").value;

    const filtered = repos.filter(r => {
      const haystack = `${r.name} ${r.reason || ""}`.toLowerCase();
      if (q && !haystack.includes(q)) return false;
      if (status !== "all" && r.work_status !== status) return false;
      if (priority !== "all" && r.priority_band !== priority) return false;
      return true;
    }).sort(scoreSort);

    $("repoRows").innerHTML = filtered.map(r => `
      <tr>
        <td class="score-cell">${r.priority_score}</td>
        <td><a class="repo-link" href="${REPO_BASE}${encodeURIComponent(r.name)}" target="_blank" rel="noreferrer">${esc(r.name)} ↗</a></td>
        <td><span class="status ${r.work_status === "STOP" ? "stop" : "continue"}">${esc(r.work_status)}</span><div class="lane-sub">${esc(BAND_LABELS[r.priority_band] || r.priority_band)}</div></td>
        <td class="reason">${esc(r.reason || "—")}</td>
        <td>${esc(r.last_commit_date || "—")}</td>
      </tr>
    `).join("");
    $("resultCount").textContent = `显示 ${filtered.length} / ${repos.length} 个公开项目`;
  }

  async function load() {
    initTheme();
    try {
      const response = await fetch(`${DATA_URL}?t=${Date.now()}`, {cache:"no-store"});
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      data = await response.json();
      const repos = data.repositories || [];
      assertPublicOnly(repos);
      renderSummary(repos);
      renderFocus(repos);
      renderLanes(repos);
      renderTable();
      $("loading").classList.add("hidden");
      $("app").classList.remove("hidden");
    } catch (error) {
      $("loading").classList.add("hidden");
      $("error").classList.remove("hidden");
      $("error").innerHTML = `工作台暂时无法读取公开总控数据。<br><small>${esc(error.message)}</small>`;
    }
  }

  ["searchInput","statusFilter","priorityFilter"].forEach(id => {
    $(id).addEventListener(id === "searchInput" ? "input" : "change", renderTable);
  });

  $("themeToggle").addEventListener("click", () => {
    setTheme((document.documentElement.dataset.theme || "light") === "dark" ? "light" : "dark");
  });

  load();
})();
