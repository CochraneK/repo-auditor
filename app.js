(() => {
  const DATA_URL="./portfolio/registry.json";
  const REPO_BASE="https://github.com/CochraneK/";
  const BANDS={
    "P0-NOW":{label:"P0",name:"Now",color:"#6e77ff"},
    "P1-NEXT":{label:"P1",name:"Next",color:"#61c997"},
    "P2-PLANNED":{label:"P2",name:"Planned",color:"#d8a34d"},
    "P3-LATER":{label:"P3",name:"Later",color:"#7b8798"},
    "P4-LOW":{label:"P4",name:"Low",color:"#5f6874"},
    "STOP":{label:"—",name:"Don't touch",color:"#4c545e"}
  };
  const WORKSTREAMS={
    "Research":{color:"#8c7cf0",repos:["AI-Ques","ARIS-GCA-Bees","neuropharm","psy-exp","VA_emotion"]},
    "Work tools":{color:"#48a9a6",repos:["FLP-Webui","RVC_factor","Voice-compare","Voicemod_Portrait"]},
    "Products":{color:"#5f90db",repos:["ai-uni","anydoor","cris","persona-test","scientist-calendar","we-read","NewsMail","yihot"]},
    "Creative":{color:"#c77b58",repos:["changan","gray-walker","Ji-Sui-Le","red-map","survival-game-generator","Animal-Age"]},
    "Skills":{color:"#b69b4a",repos:["dsh-gate-game-plugin","emperor-skill","fake_type","mao-skill","ming","pudding-skill","repo-auditor"]},
    "Legacy":{color:"#77808d",repos:["NaoDao_code","Submit-forms-automatically","wechat-article-analysis"]}
  };
  const VIEWS={
    focus:{title:"Focus",desc:"现在最值得投入时间的仓库。"},
    all:{title:"All repositories",desc:"全部 Public 仓库，按你的当前管理判断组织。"},
    later:{title:"Later",desc:"确定还会做，但现在不应该占据注意力。"},
    stopped:{title:"Don't touch",desc:"当前不需要继续投入；这不等于删除或归档。"}
  };

  const $=id=>document.getElementById(id);
  let data=null,currentView="focus",statusFilter="all",selectedWorkstream="all";

  const esc=(v="")=>String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
  const repoUrl=(name)=>REPO_BASE+encodeURIComponent(name);
  const byScore=(a,b)=>b.priority_score-a.priority_score||a.name.localeCompare(b.name);
  const byRecent=(a,b)=>String(b.last_commit_date||"").localeCompare(String(a.last_commit_date||""))||byScore(a,b);
  const date=v=>new Date(v+"T00:00:00Z");
  function ageDays(v){if(!v||!data?.snapshot_date)return null;return Math.max(0,Math.round((date(data.snapshot_date)-date(v))/86400000))}
  function age(v){const d=ageDays(v);if(d===null)return"—";if(d===0)return"today";if(d===1)return"1d ago";if(d<30)return d+"d ago";if(d<365)return Math.round(d/30)+"mo ago";return(d/365).toFixed(1)+"y ago"}
  function workstreamOf(name){
    for(const [key,val] of Object.entries(WORKSTREAMS))if(val.repos.includes(name))return key;
    return "Skills";
  }
  function workstreamColor(name){return WORKSTREAMS[workstreamOf(name)]?.color||"#77808d"}

  function setTheme(theme){
    const guard=document.createElement("style");guard.textContent="*,*::before,*::after{transition:none!important}";
    document.head.appendChild(guard);
    document.documentElement.dataset.theme=theme;
    localStorage.setItem("repo-workspace-theme",theme);
    void document.documentElement.offsetHeight;
    requestAnimationFrame(()=>guard.remove());
  }
  function initTheme(){
    const saved=localStorage.getItem("repo-workspace-theme");
    const light=window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches;
    setTheme(saved||(light?"light":"dark"));
  }

  function renderSummary(repos){
    const active=repos.filter(r=>r.work_status==="CONTINUE");
    $("repoCount").textContent=repos.length;
    $("nowCount").textContent=repos.filter(r=>r.priority_band==="P0-NOW").length;
    $("continueCount").textContent=active.length;
    $("stopCount").textContent=repos.filter(r=>r.work_status==="STOP").length;
    $("avgScore").textContent=active.length?Math.round(active.reduce((s,r)=>s+r.priority_score,0)/active.length):0;
    $("allNavCount").textContent=repos.length;
    $("focusNavCount").textContent=repos.filter(r=>r.priority_score>=70&&r.work_status==="CONTINUE").length;
    $("laterNavCount").textContent=repos.filter(r=>["P2-PLANNED","P3-LATER","P4-LOW"].includes(r.priority_band)).length;
    $("stopNavCount").textContent=repos.filter(r=>r.work_status==="STOP").length;
    $("snapshotDate").textContent="Snapshot · "+(data.snapshot_date||"");
  }

  function repoRow(r){
    const band=BANDS[r.priority_band]||BANDS.STOP;
    const ws=workstreamOf(r.name);
    return `<a class="repo-row" href="${repoUrl(r.name)}" target="_blank" rel="noreferrer">
      <span class="priority-cell">
        <i class="priority-mark" style="--priority-color:${band.color}"></i>
        <span class="score">${r.priority_score}</span>
      </span>
      <span class="repo-main">
        <span class="repo-name">${esc(r.name)}</span>
        <span class="repo-note">${esc(r.reason||"No note")}</span>
      </span>
      <span class="workstream"><i class="dot" style="--workstream-color:${workstreamColor(r.name)}"></i>${esc(ws)}</span>
      <span class="commit-age">${esc(age(r.last_commit_date))}</span>
      <span class="row-arrow">›</span>
    </a>`;
  }

  function renderFocus(repos){
    const focus=repos.filter(r=>r.work_status==="CONTINUE").sort(byScore).slice(0,8);
    $("focusList").innerHTML=focus.map(repoRow).join("");
    $("focusCountText").textContent=focus.length+" repositories";
  }

  function renderSignals(repos){
    const items=repos
      .filter(r=>r.work_status==="CONTINUE")
      .map(r=>({...r,_age:ageDays(r.last_commit_date)||0}))
      .filter(r=>(r.priority_score>=70&&r._age>=30)||(r.priority_score>=50&&r._age>=90))
      .sort((a,b)=>b.priority_score-a.priority_score||b._age-a._age)
      .slice(0,5);
    $("signalsList").innerHTML=items.length?items.map(r=>`<div class="signal">
      <div class="signal-top"><strong>${esc(r.name)}</strong><span class="signal-score">${r.priority_score}</span></div>
      <p>High priority · last commit ${esc(age(r.last_commit_date))}</p>
    </div>`).join(""):'<div class="signal"><strong>No stale high-priority work</strong><p>Priority and recent activity currently align.</p></div>';
  }

  function renderDistribution(repos){
    const order=["P0-NOW","P1-NEXT","P2-PLANNED","P3-LATER","P4-LOW","STOP"];
    const max=Math.max(1,...order.map(k=>repos.filter(r=>r.priority_band===k).length));
    $("distribution").innerHTML=order.map(k=>{
      const count=repos.filter(r=>r.priority_band===k).length;
      return `<div class="dist-row"><span class="dist-label">${BANDS[k].label} · ${BANDS[k].name}</span><span class="dist-track"><i class="dist-bar" style="width:${Math.max(4,count/max*100)}%;background:${BANDS[k].color}"></i></span><span class="dist-count">${count}</span></div>`;
    }).join("");
  }

  function renderWorkstreamNav(repos){
    $("workstreamNav").innerHTML=Object.entries(WORKSTREAMS).map(([name,meta])=>{
      const count=repos.filter(r=>workstreamOf(r.name)===name).length;
      return `<button class="workstream-button" type="button" data-workstream="${esc(name)}">
        <i class="workstream-dot" style="--dot:${meta.color}"></i><span>${esc(name)}</span><span class="workstream-count">${count}</span>
      </button>`;
    }).join("");
    $("workstreamFilter").innerHTML='<option value="all">All workstreams</option>'+Object.keys(WORKSTREAMS).map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join("");
    document.querySelectorAll(".workstream-button").forEach(btn=>btn.addEventListener("click",()=>{
      selectedWorkstream=btn.dataset.workstream;
      $("workstreamFilter").value=selectedWorkstream;
      switchView("all");
      renderPortfolio();
    }));
  }

  function viewBaseRows(){
    const repos=data.repositories||[];
    if(currentView==="later")return repos.filter(r=>["P2-PLANNED","P3-LATER","P4-LOW"].includes(r.priority_band));
    if(currentView==="stopped")return repos.filter(r=>r.work_status==="STOP");
    return repos;
  }

  function portfolioRows(){
    const q=$("searchInput").value.trim().toLowerCase();
    const priority=$("priorityFilter").value;
    const sort=$("sortFilter").value;
    const ws=$("workstreamFilter").value;
    let rows=viewBaseRows().filter(r=>{
      const hay=(r.name+" "+(r.reason||"")+" "+workstreamOf(r.name)).toLowerCase();
      return (!q||hay.includes(q))
        &&(statusFilter==="all"||r.work_status===statusFilter)
        &&(priority==="all"||r.priority_band===priority)
        &&(ws==="all"||workstreamOf(r.name)===ws);
    });
    if(sort==="recent")rows.sort(byRecent);
    else if(sort==="name")rows.sort((a,b)=>a.name.localeCompare(b.name));
    else rows.sort(byScore);
    return rows;
  }

  function renderPortfolio(){
    if(!data)return;
    const rows=portfolioRows();
    $("portfolioList").innerHTML=rows.map(repoRow).join("");
    $("resultCount").textContent=rows.length+" / "+viewBaseRows().length+" repositories";
  }

  function switchView(view){
    currentView=view;
    document.querySelectorAll(".nav-item").forEach(btn=>btn.classList.toggle("is-active",btn.dataset.view===view));
    $("currentViewLabel").textContent=VIEWS[view].title;
    $("viewTitle").textContent=VIEWS[view].title;
    $("viewDescription").textContent=VIEWS[view].desc;
    const focus=view==="focus";
    $("focusLayout").classList.toggle("hidden",!focus);
    $("portfolioPanel").classList.toggle("hidden",focus);
    if(!focus)renderPortfolio();
  }

  function wire(){
    document.querySelectorAll(".nav-item").forEach(btn=>btn.addEventListener("click",()=>switchView(btn.dataset.view)));
    document.querySelectorAll(".segmented button").forEach(btn=>btn.addEventListener("click",()=>{
      statusFilter=btn.dataset.status;
      document.querySelectorAll(".segmented button").forEach(b=>b.classList.toggle("is-active",b===btn));
      renderPortfolio();
    }));
    ["searchInput","workstreamFilter","priorityFilter","sortFilter"].forEach(id=>$(id).addEventListener(id==="searchInput"?"input":"change",renderPortfolio));
    $("clearFilters").addEventListener("click",()=>{
      $("searchInput").value="";$("workstreamFilter").value="all";$("priorityFilter").value="all";$("sortFilter").value="priority";
      statusFilter="all";
      document.querySelectorAll(".segmented button").forEach((b,i)=>b.classList.toggle("is-active",i===0));
      renderPortfolio();
    });
    $("themeToggle").addEventListener("click",()=>setTheme(document.documentElement.dataset.theme==="dark"?"light":"dark"));
  }

  async function load(){
    initTheme();wire();
    try{
      const res=await fetch(DATA_URL+"?t="+Date.now(),{cache:"no-store"});
      if(!res.ok)throw new Error("HTTP "+res.status);
      data=await res.json();
      if((data.repositories||[]).some(r=>r.visibility!=="public"))throw new Error("Public registry contains non-public repositories");
      renderSummary(data.repositories);renderFocus(data.repositories);renderSignals(data.repositories);renderDistribution(data.repositories);renderWorkstreamNav(data.repositories);
      $("loading").remove();
    }catch(err){
      $("loading").textContent="Could not load portfolio: "+err.message;
      $("loading").style.color="var(--red)";
    }
  }

  load();
})();