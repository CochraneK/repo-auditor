(() => {
  const DATA_URL = "https://raw.githubusercontent.com/CochraneK/repo-auditor/main/portfolio/registry.json";
  const REPO_BASE = "https://github.com/CochraneK/";
  const BAND_LABELS = {
    "P0-NOW": "P0 · NOW",
    "P1-NEXT": "P1 · NEXT",
    "P2-PLANNED": "P2 · PLANNED",
    "P3-LATER": "P3 · LATER",
    "P4-LOW": "P4 · LOW",
    "STOP": "DON'T TOUCH"
  };
  const BOARD_ORDER = ["P0-NOW","P1-NEXT","P2-PLANNED","P3-LATER","P4-LOW","STOP"];

  const $ = id => document.getElementById(id);
  let data = null;
  let currentView = localStorage.getItem("repo-auditor-view") || "cards";

  function esc(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function repoUrl(name, suffix = "") {
    return REPO_BASE + encodeURIComponent(name) + suffix;
  }

  function scoreSort(a, b) {
    return (b.priority_score - a.priority_score) || a.name.localeCompare(b.name);
  }

  function recentSort(a, b) {
    return String(b.last_commit_date || "").localeCompare(String(a.last_commit_date || "")) || scoreSort(a,b);
  }

  function dateToUtc(value) {
    return new Date(value + "T00:00:00Z");
  }

  function ageDays(value) {
    if (!value || !data?.snapshot_date) return null;
    return Math.max(0, Math.round((dateToUtc(data.snapshot_date) - dateToUtc(value)) / 86400000));
  }

  function ageLabel(value) {
    const days = ageDays(value);
    if (days === null) return "无提交日期";
    if (days === 0) return "今天";
    if (days === 1) return "1 天前";
    if (days < 30) return days + " 天前";
    if (days < 365) return Math.round(days / 30) + " 个月前";
    return (days / 365).toFixed(1) + " 年前";
  }

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("repo-auditor-theme", theme);
  }

  function initTheme() {
    const saved = localStorage.getItem("repo-auditor-theme");
    if (saved) return setTheme(saved);
    const light = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    setTheme(light ? "light" : "dark");
  }

  function assertPublicOnly(repos) {
    const leaked = repos.filter(r => r.visibility !== "public");
    if (leaked.length) throw new Error("Public registry contains non-public repository records.");
  }

  function badgeClass(band) {
    if (band === "STOP") return "stop";
    if (band === "P0-NOW") return "now";
    return "";
  }

  function renderHero(repos) {
    const top = repos.filter(r => r.work_status === "CONTINUE").sort(scoreSort)[0];
    $("snapshotText").textContent = "Snapshot · " + (data.snapshot_date || "—");
    if (!top) {
      $("heroFocus").innerHTML = '<div class="hero-focus-card"><p>暂无 CONTINUE 项目。</p></div>';
      return;
    }
    $("heroFocus").innerHTML = `
      <div class="hero-focus-card">
        <div class="hero-focus-top">
          <div>
            <div class="hero-mini-label">CURRENT #1</div>
            <div class="hero-score">${top.priority_score}</div>
          </div>
          <span class="badge ${badgeClass(top.priority_band)}">${esc(BAND_LABELS[top.priority_band])}</span>
        </div>
        <h3>${esc(top.name)}</h3>
        <p>${esc(top.reason || "暂无备注")}</p>
        <div class="hero-actions">
          <a class="button primary" href="${repoUrl(top.name)}" target="_blank" rel="noreferrer">打开仓库 ↗</a>
          <a class="button secondary" href="${repoUrl(top.name, "/issues")}" target="_blank" rel="noreferrer">Issues</a>
        </div>
      </div>
    `;
  }

  function renderMetrics(repos) {
    const active = repos.filter(r => r.work_status === "CONTINUE");
    const avg = active.length ? Math.round(active.reduce((sum,r) => sum + r.priority_score, 0) / active.length) : 0;
    $("totalCount").textContent = repos.length;
    $("nowCount").textContent = repos.filter(r => r.priority_band === "P0-NOW").length;
    $("continueCount").textContent = active.length;
    $("stopCount").textContent = repos.filter(r => r.work_status === "STOP").length;
    $("avgScore").textContent = avg;
  }

  function renderDistribution(repos) {
    const max = Math.max(1, ...BOARD_ORDER.map(b => repos.filter(r => r.priority_band === b).length));
    $("priorityDistribution").innerHTML = BOARD_ORDER.map(band => {
      const count = repos.filter(r => r.priority_band === band).length;
      const pct = Math.max(3, Math.round(count / max * 100));
      return `
        <div class="distribution-row">
          <span class="distribution-label">${esc(BAND_LABELS[band])}</span>
          <span class="distribution-track"><span class="distribution-bar" style="width:${pct}%"></span></span>
          <span class="distribution-count">${count}</span>
        </div>
      `;
    }).join("");
  }

  function renderRecent(repos) {
    const recent = [...repos].sort(recentSort).slice(0, 7);
    $("recentActivity").innerHTML = recent.map(r => `
      <div class="recent-item">
        <div class="recent-main">
          <div class="recent-name">${esc(r.name)}</div>
          <div class="recent-sub">${esc(BAND_LABELS[r.priority_band])} · ${r.work_status}</div>
        </div>
        <div class="recent-date">${esc(ageLabel(r.last_commit_date))}</div>
      </div>
    `).join("");
  }

  function renderFocus(repos) {
    const focus = repos.filter(r => r.work_status === "CONTINUE").sort(scoreSort).slice(0, 8);
    $("focusGrid").innerHTML = focus.map((r, i) => `
      <a class="focus-card" href="${repoUrl(r.name)}" target="_blank" rel="noreferrer">
        <span class="focus-rank">FOCUS #${i + 1}</span>
        <div class="focus-score">${r.priority_score}</div>
        <div class="focus-name">${esc(r.name)}</div>
        <p class="focus-reason">${esc(r.reason || "暂无备注")}</p>
        <div class="badges">
          <span class="badge ${badgeClass(r.priority_band)}">${esc(BAND_LABELS[r.priority_band])}</span>
          <span class="badge">commit · ${esc(ageLabel(r.last_commit_date))}</span>
        </div>
      </a>
    `).join("");
  }

  function getAttention(repos) {
    return repos
      .filter(r => r.work_status === "CONTINUE")
      .map(r => ({...r, _age: ageDays(r.last_commit_date) ?? 0}))
      .filter(r => (r.priority_score >= 70 && r._age >= 30) || (r.priority_score >= 50 && r._age >= 90))
      .sort((a,b) => b.priority_score - a.priority_score || b._age - a._age)
      .slice(0, 8);
  }

  function renderAttention(repos) {
    const items = getAttention(repos);
    if (!items.length) {
      $("attentionGrid").innerHTML = '<article class="attention-card"><strong>目前没有明显积压。</strong><p>高优先级项目的提交节奏和计划基本一致。</p></article>';
      return;
    }
    $("attentionGrid").innerHTML = items.map(r => `
      <article class="attention-card">
        <div class="attention-head">
          <span class="attention-title">${esc(r.name)}</span>
          <span class="attention-score">${r.priority_score} pts</span>
        </div>
        <p>${esc(r.reason || "暂无备注")}</p>
        <div class="attention-meta">
          <span>${esc(BAND_LABELS[r.priority_band])}</span>
          <span>·</span>
          <span>最近提交 ${esc(ageLabel(r.last_commit_date))}</span>
          <span>·</span>
          <a href="${repoUrl(r.name)}" target="_blank" rel="noreferrer">打开 ↗</a>
        </div>
      </article>
    `).join("");
  }

  function renderBoard(repos) {
    $("priorityBoard").innerHTML = BOARD_ORDER.map(band => {
      const items = repos.filter(r => r.priority_band === band).sort(scoreSort);
      return `
        <section class="board-column">
          <div class="board-head">
            <span class="board-title">${esc(BAND_LABELS[band])}</span>
            <span class="board-count">${items.length}</span>
          </div>
          <div class="board-list">
            ${items.map(r => `
              <a class="board-card" href="${repoUrl(r.name)}" target="_blank" rel="noreferrer">
                <div class="board-card-top">
                  <span class="board-card-name">${esc(r.name)}</span>
                  <span class="board-card-score">${r.priority_score}</span>
                </div>
                <p>${esc(r.reason || "暂无备注")}</p>
              </a>
            `).join("") || '<p class="recent-sub">暂无项目</p>'}
          </div>
        </section>
      `;
    }).join("");
  }

  function getFilteredRepos() {
    const repos = data.repositories || [];
    const q = $("searchInput").value.trim().toLowerCase();
    const status = $("statusFilter").value;
    const priority = $("priorityFilter").value;
    const sort = $("sortFilter").value;

    const filtered = repos.filter(r => {
      const haystack = (r.name + " " + (r.reason || "")).toLowerCase();
      if (q && !haystack.includes(q)) return false;
      if (status !== "all" && r.work_status !== status) return false;
      if (priority !== "all" && r.priority_band !== priority) return false;
      return true;
    });

    if (sort === "recent") return filtered.sort(recentSort);
    if (sort === "name") return filtered.sort((a,b) => a.name.localeCompare(b.name));
    return filtered.sort(scoreSort);
  }

  function renderRepoCards(repos) {
    $("repoCards").innerHTML = repos.map(r => `
      <article class="repo-card">
        <div class="repo-card-top">
          <div>
            <div class="repo-score">${r.priority_score}</div>
            <div class="badges">
              <span class="badge ${badgeClass(r.priority_band)}">${esc(BAND_LABELS[r.priority_band])}</span>
              <span class="badge ${r.work_status === "STOP" ? "stop" : "public"}">${esc(r.work_status)}</span>
            </div>
          </div>
          <span class="badge public">public</span>
        </div>
        <div class="repo-name">${esc(r.name)}</div>
        <p class="repo-reason">${esc(r.reason || "暂无备注")}</p>
        <div class="repo-bottom">
          <span class="repo-date">Last commit · ${esc(ageLabel(r.last_commit_date))}</span>
          <div class="quick-links">
            <a class="quick-link" href="${repoUrl(r.name)}" target="_blank" rel="noreferrer">Code ↗</a>
            <a class="quick-link" href="${repoUrl(r.name, "/issues")}" target="_blank" rel="noreferrer">Issues</a>
            <a class="quick-link" href="${repoUrl(r.name, "/actions")}" target="_blank" rel="noreferrer">Actions</a>
          </div>
        </div>
      </article>
    `).join("");
  }

  function renderRepoTable(repos) {
    $("repoRows").innerHTML = repos.map(r => `
      <tr>
        <td class="table-score">${r.priority_score}</td>
        <td><a class="table-repo" href="${repoUrl(r.name)}" target="_blank" rel="noreferrer">${esc(r.name)} ↗</a></td>
        <td><span class="badge ${badgeClass(r.priority_band)}">${esc(BAND_LABELS[r.priority_band])}</span></td>
        <td><span class="${r.work_status === "STOP" ? "status-stop" : "status-continue"}">${esc(r.work_status)}</span></td>
        <td class="table-note">${esc(r.reason || "—")}</td>
        <td>${esc(r.last_commit_date || "—")}<div class="recent-sub">${esc(ageLabel(r.last_commit_date))}</div></td>
        <td><a class="quick-link" href="${repoUrl(r.name, "/actions")}" target="_blank" rel="noreferrer">Actions ↗</a></td>
      </tr>
    `).join("");
  }

  function applyView() {
    const cards = currentView === "cards";
    $("repoCards").classList.toggle("hidden", !cards);
    $("tableWrap").classList.toggle("hidden", cards);
    $("cardViewButton").classList.toggle("active", cards);
    $("tableViewButton").classList.toggle("active", !cards);
  }

  function renderRepositories() {
    const repos = getFilteredRepos();
    renderRepoCards(repos);
    renderRepoTable(repos);
    $("resultCount").textContent = "显示 " + repos.length + " / " + (data.repositories || []).length + " 个公开项目";
    applyView();
  }

  function openCommandPalette() {
    $("commandPalette").classList.remove("hidden");
    $("commandInput").value = "";
    renderCommandResults("");
    requestAnimationFrame(() => $("commandInput").focus());
  }

  function closeCommandPalette() {
    $("commandPalette").classList.add("hidden");
  }

  function renderCommandResults(query) {
    const q = query.trim().toLowerCase();
    const repos = (data?.repositories || [])
      .filter(r => !q || (r.name + " " + (r.reason || "")).toLowerCase().includes(q))
      .sort(scoreSort)
      .slice(0, 12);

    $("commandResults").innerHTML = repos.map(r => `
      <a class="command-result" href="${repoUrl(r.name)}" target="_blank" rel="noreferrer">
        <span class="command-result-score">${r.priority_score}</span>
        <span>
          <strong>${esc(r.name)}</strong>
          <span>${esc(r.reason || "暂无备注")}</span>
        </span>
        <span class="command-result-band">${esc(BAND_LABELS[r.priority_band])}</span>
      </a>
    `).join("") || '<div class="recent-sub" style="padding:18px">没有匹配的项目。</div>';
  }

  function initNavigation() {
    const links = [...document.querySelectorAll(".nav-item")];
    const sections = links
      .map(link => document.getElementById(link.dataset.section))
      .filter(Boolean);

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        links.forEach(l => l.classList.toggle("active", l.dataset.section === visible.target.id));
      }, { rootMargin: "-18% 0px -68% 0px", threshold: [0,.1,.3] });
      sections.forEach(s => observer.observe(s));
    }

    links.forEach(link => link.addEventListener("click", () => {
      $("sidebar").classList.remove("open");
    }));
  }

  function wireEvents() {
    ["searchInput","statusFilter","priorityFilter","sortFilter"].forEach(id => {
      $(id).addEventListener(id === "searchInput" ? "input" : "change", renderRepositories);
    });

    $("clearFilters").addEventListener("click", () => {
      $("searchInput").value = "";
      $("statusFilter").value = "all";
      $("priorityFilter").value = "all";
      $("sortFilter").value = "priority";
      renderRepositories();
    });

    $("cardViewButton").addEventListener("click", () => {
      currentView = "cards";
      localStorage.setItem("repo-auditor-view", currentView);
      applyView();
    });
    $("tableViewButton").addEventListener("click", () => {
      currentView = "table";
      localStorage.setItem("repo-auditor-view", currentView);
      applyView();
    });

    $("themeToggle").addEventListener("click", () => {
      const current = document.documentElement.dataset.theme || "dark";
      setTheme(current === "dark" ? "light" : "dark");
    });

    $("sidebarToggle").addEventListener("click", () => $("sidebar").classList.toggle("open"));

    $("commandButton").addEventListener("click", openCommandPalette);
    $("commandInput").addEventListener("input", e => renderCommandResults(e.target.value));
    $("commandPalette").addEventListener("click", e => {
      if (e.target === $("commandPalette")) closeCommandPalette();
    });

    document.addEventListener("keydown", e => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      const typing = tag === "input" || tag === "textarea" || tag === "select";
      if (e.key === "/" && !typing && $("commandPalette").classList.contains("hidden")) {
        e.preventDefault();
        openCommandPalette();
      }
      if (e.key === "Escape") closeCommandPalette();
    });
  }

  async function load() {
    initTheme();
    try {
      const response = await fetch(DATA_URL + "?t=" + Date.now(), { cache: "no-store" });
      if (!response.ok) throw new Error("HTTP " + response.status);
      data = await response.json();

      const repos = data.repositories || [];
      assertPublicOnly(repos);

      renderHero(repos);
      renderMetrics(repos);
      renderDistribution(repos);
      renderRecent(repos);
      renderFocus(repos);
      renderAttention(repos);
      renderBoard(repos);
      renderRepositories();
      renderCommandResults("");

      $("loading").classList.add("hidden");
      $("app").classList.remove("hidden");

      wireEvents();
      initNavigation();
    } catch (error) {
      $("loading").classList.add("hidden");
      $("error").classList.remove("hidden");
      $("error").innerHTML = "工作台暂时无法读取公开总控数据。<br><small>" + esc(error.message) + "</small>";
    }
  }

  load();
})();