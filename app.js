(() => {
  const DATA_URL = "./portfolio/registry.json";
  const REPO = "https://github.com/CochraneK/";
  const BAND = {
    "P0-NOW":"P0 · NOW","P1-NEXT":"P1 · NEXT","P2-PLANNED":"P2 · PLANNED",
    "P3-LATER":"P3 · LATER","P4-LOW":"P4 · LOW","STOP":"DON'T TOUCH"
  };
  const BAND_DESC = {
    "P0-NOW":"现在 / 下周","P1-NEXT":"本月推进","P2-PLANNED":"已有计划",
    "P3-LATER":"后续再做","P4-LOW":"低优先保留","STOP":"当前不用做"
  };
  const ORDER = ["P0-NOW","P1-NEXT","P2-PLANNED","P3-LATER","P4-LOW","STOP"];
  const CATEGORY_META = {
    "研究": {icon:"◌", color:"research"},
    "工作工具": {icon:"⌁", color:"work"},
    "AI / 产品": {icon:"◇", color:"product"},
    "创作 / 游戏": {icon:"✦", color:"creative"},
    "Skills / 工具": {icon:"⌘", color:"skills"},
    "Legacy": {icon:"○", color:"legacy"}
  };
  const CATEGORY_MAP = {
    "AI-Ques":"研究","ARIS-GCA-Bees":"研究","neuropharm":"研究","psy-exp":"研究","VA_emotion":"研究",
    "FLP-Webui":"工作工具","RVC_factor":"工作工具","Voice-compare":"工作工具","Voicemod_Portrait":"工作工具",
    "ai-uni":"AI / 产品","anydoor":"AI / 产品","cris":"AI / 产品","persona-test":"AI / 产品","scientist-calendar":"AI / 产品","we-read":"AI / 产品","NewsMail":"AI / 产品","yihot":"AI / 产品",
    "changan":"创作 / 游戏","gray-walker":"创作 / 游戏","Ji-Sui-Le":"创作 / 游戏","red-map":"创作 / 游戏","survival-game-generator":"创作 / 游戏","Animal-Age":"创作 / 游戏",
    "dsh-gate-game-plugin":"Skills / 工具","emperor-skill":"Skills / 工具","fake_type":"Skills / 工具","mao-skill":"Skills / 工具","ming":"Skills / 工具","pudding-skill":"Skills / 工具","repo-auditor":"Skills / 工具",
    "NaoDao_code":"Legacy","Submit-forms-automatically":"Legacy","wechat-article-analysis":"Legacy"
  };

  const $ = id => document.getElementById(id);
  let state = null;
  let view = "cards";

  function esc(v=""){return String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}
  function category(r){return CATEGORY_MAP[r.name] || "Skills / 工具"}
  function repoUrl(r,suffix=""){return REPO + encodeURIComponent(r.name) + suffix}
  function byScore(a,b){return b.priority_score-a.priority_score || a.name.localeCompare(b.name)}
  function byRecent(a,b){return String(b.last_commit_date||"").localeCompare(String(a.last_commit_date||"")) || byScore(a,b)}
  function date(v){return new Date(v+"T00:00:00Z")}
  function ageDays(v){if(!v||!state?.snapshot_date)return null;return Math.max(0,Math.round((date(state.snapshot_date)-date(v))/86400000))}
  function ageText(v){const d=ageDays(v);if(d===null)return "无日期";if(d===0)return "今天";if(d===1)return "1 天前";if(d<30)return d+" 天前";if(d<365)return Math.round(d/30)+" 个月前";return (d/365).toFixed(1)+" 年前"}
  function tagClass(r){return r.priority_band==="STOP"?"stop":r.priority_band==="P0-NOW"?"now":""}

  function setTheme(next){
    const style=document.createElement("style");
    style.textContent="*,*::before,*::after{transition:none!important}";
    document.head.appendChild(style);
    document.documentElement.dataset.theme=next;
    localStorage.setItem("repo-studio-theme",next);
    void document.documentElement.offsetHeight;
    requestAnimationFrame(()=>style.remove());
  }
  function initTheme(){
    const saved=localStorage.getItem("repo-studio-theme");
    const light=window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches;
    setTheme(saved || (light?"light":"dark"));
  }

  function renderHero(repos){
    const active=repos.filter(r=>r.work_status==="CONTINUE").sort(byScore);
    const top=active[0];
    $("snapshot").textContent="PUBLIC PORTFOLIO · "+(state.snapshot_date||"");
    $("heroScore").textContent=top?.priority_score ?? "—";
    $("heroName").textContent=top?.name ?? "—";
    $("repoCount").textContent=repos.length;
    $("nowCount").textContent=repos.filter(r=>r.priority_band==="P0-NOW").length;
    $("continueCount").textContent=active.length;
    $("stopCount").textContent=repos.filter(r=>r.work_status==="STOP").length;
    $("avgScore").textContent=active.length?Math.round(active.reduce((n,r)=>n+r.priority_score,0)/active.length):0;
  }

  function spotlightCard(r,i){
    const c=category(r);
    return `<a class="spotlight-card" style="--category-color:var(--${CATEGORY_META[c].color})" href="${repoUrl(r)}" target="_blank" rel="noreferrer">
      <div class="spotlight-top"><span class="spotlight-index">FOCUS 0${i+1}</span><span class="spotlight-score">${r.priority_score}</span></div>
      <h3>${esc(r.name)}</h3><p>${esc(r.reason||"暂无备注")}</p>
      <div class="spotlight-footer"><span class="category-pill">${esc(c)}</span><span class="spotlight-link">打开仓库 ↗</span></div>
    </a>`;
  }
  function renderSpotlight(repos){
    $("spotlight").innerHTML=repos.filter(r=>r.work_status==="CONTINUE").sort(byScore).slice(0,3).map(spotlightCard).join("");
  }

  function renderCategories(repos){
    const categories=Object.keys(CATEGORY_META);
    $("categoryGrid").innerHTML=categories.map(c=>{
      const items=repos.filter(r=>category(r)===c);
      const active=items.filter(r=>r.work_status==="CONTINUE").length;
      return `<button class="category-card" data-category="${esc(c)}" type="button">
        <span class="category-icon" aria-hidden="true">${CATEGORY_META[c].icon}</span>
        <strong>${esc(c)}</strong><span>${items.length} 个仓库 · ${active} 个继续</span>
      </button>`;
    }).join("");
    const select=$("categoryFilter");
    select.innerHTML='<option value="all">全部类型</option>'+categories.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join("");
    document.querySelectorAll(".category-card").forEach(btn=>btn.addEventListener("click",()=>{
      select.value=btn.dataset.category;
      $("repos").scrollIntoView({behavior:"smooth"});
      renderRepos();
    }));
  }

  function renderPriorityMap(repos){
    $("priorityMap").innerHTML=ORDER.map(b=>{
      const items=repos.filter(r=>r.priority_band===b).sort(byScore);
      return `<div class="priority-row">
        <div class="priority-label"><strong>${esc(BAND[b])}</strong><span>${esc(BAND_DESC[b])}</span></div>
        <div class="priority-track">${items.map(r=>`<a class="priority-chip" href="${repoUrl(r)}" target="_blank" rel="noreferrer"><b>${r.priority_score}</b>${esc(r.name)}</a>`).join("")||'<span class="priority-chip">暂无项目</span>'}</div>
        <span class="priority-count">${items.length}</span>
      </div>`;
    }).join("");
  }

  function renderAttention(repos){
    const items=repos.filter(r=>r.work_status==="CONTINUE").map(r=>({...r,_age:ageDays(r.last_commit_date)||0}))
      .filter(r=>(r.priority_score>=70&&r._age>=30)||(r.priority_score>=50&&r._age>=90)).sort((a,b)=>b.priority_score-a.priority_score||b._age-a._age).slice(0,6);
    $("attention").innerHTML=items.length?items.map(r=>`<article class="attention-card">
      <header><strong>${esc(r.name)}</strong><span class="attention-score">${r.priority_score} pts</span></header>
      <p>${esc(r.reason||"暂无备注")}</p><div class="attention-meta">${esc(category(r))} · 最近提交 ${esc(ageText(r.last_commit_date))}</div>
    </article>`).join(""):'<article class="attention-card"><strong>目前没有明显积压。</strong><p>高优先级项目的提交节奏与计划基本一致。</p></article>';
  }

  function filtered(){
    const q=$("searchInput").value.trim().toLowerCase(),c=$("categoryFilter").value,p=$("priorityFilter").value,s=$("sortFilter").value;
    let rows=state.repositories.filter(r=>{
      const hay=(r.name+" "+(r.reason||"")+" "+category(r)).toLowerCase();
      return (!q||hay.includes(q))&&(c==="all"||category(r)===c)&&(p==="all"||r.priority_band===p);
    });
    if(s==="recent")rows.sort(byRecent);else if(s==="name")rows.sort((a,b)=>a.name.localeCompare(b.name));else rows.sort(byScore);
    return rows;
  }

  function card(r){
    const c=category(r);
    return `<article class="repo-card" data-category="${esc(c)}">
      <div class="repo-top"><span class="repo-score">${r.priority_score}</span><span class="repo-category">${esc(c)}</span></div>
      <h3>${esc(r.name)}</h3><p>${esc(r.reason||"暂无备注")}</p>
      <div class="repo-meta"><span class="tag ${tagClass(r)}">${esc(BAND[r.priority_band])}</span><span class="tag">${esc(ageText(r.last_commit_date))}</span></div>
      <div class="repo-actions"><a href="${repoUrl(r)}" target="_blank" rel="noreferrer">Code ↗</a><a href="${repoUrl(r,"/issues")}" target="_blank" rel="noreferrer">Issues</a><a href="${repoUrl(r,"/actions")}" target="_blank" rel="noreferrer">Actions</a></div>
    </article>`;
  }
  function renderRepos(){
    const rows=filtered();
    $("repoCards").innerHTML=rows.map(card).join("");
    $("repoRows").innerHTML=rows.map(r=>`<tr>
      <td class="table-score">${r.priority_score}</td><td><a class="table-repo" href="${repoUrl(r)}" target="_blank" rel="noreferrer">${esc(r.name)} ↗</a></td>
      <td>${esc(category(r))}</td><td>${esc(BAND[r.priority_band])}</td><td class="table-note">${esc(r.reason||"—")}</td><td>${esc(r.last_commit_date||"—")} · ${esc(ageText(r.last_commit_date))}</td>
    </tr>`).join("");
    $("resultCount").textContent="显示 "+rows.length+" / "+state.repositories.length+" 个公开仓库";
  }

  function setView(next){
    view=next;const cards=next==="cards";
    $("repoCards").classList.toggle("hidden",!cards);$("repoTableWrap").classList.toggle("hidden",cards);
    $("cardView").classList.toggle("active",cards);$("tableView").classList.toggle("active",!cards);
    $("cardView").setAttribute("aria-pressed",String(cards));$("tableView").setAttribute("aria-pressed",String(!cards));
  }

  async function load(){
    initTheme();
    try{
      const res=await fetch(DATA_URL+"?t="+Date.now(),{cache:"no-store"});if(!res.ok)throw new Error("HTTP "+res.status);
      state=await res.json();
      if(state.repositories.some(r=>r.visibility!=="public"))throw new Error("公开数据源包含非 public 项目");
      renderHero(state.repositories);renderSpotlight(state.repositories);renderCategories(state.repositories);renderPriorityMap(state.repositories);renderAttention(state.repositories);renderRepos();
      $("loadState").remove();
    }catch(e){$("loadState").textContent="载入失败："+e.message;$("loadState").style.color="var(--danger)"}
  }

  ["searchInput","categoryFilter","priorityFilter","sortFilter"].forEach(id=>$(id).addEventListener(id==="searchInput"?"input":"change",renderRepos));
  $("clearFilters").addEventListener("click",()=>{$("searchInput").value="";$("categoryFilter").value="all";$("priorityFilter").value="all";$("sortFilter").value="priority";renderRepos()});
  $("cardView").addEventListener("click",()=>setView("cards"));$("tableView").addEventListener("click",()=>setView("table"));
  $("themeToggle").addEventListener("click",()=>setTheme(document.documentElement.dataset.theme==="dark"?"light":"dark"));
  $("searchJump").addEventListener("click",()=>{$("repos").scrollIntoView({behavior:"smooth"});setTimeout(()=>$("searchInput").focus(),250)});
  load();
})();