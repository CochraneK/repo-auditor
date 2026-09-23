(() => {
  const DATA_URL="./data/registry.json";
  const SHOWCASE_URL="./showcase/manifest.json";
  const OVERVIEW_URL="./data/portfolio-overview.json";
  const REPO_BASE="https://github.com/CochraneK/";
  const API_BASE="https://api.github.com/repos/CochraneK/";
  const $=id=>document.getElementById(id);
  let data={repositories:[]}, showcases={items:[]}, overview=null;

  const esc=(v="")=>String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
  const repoUrl=name=>REPO_BASE+encodeURIComponent(name);
  const ageDays=date=>{
    if(!date||!data.snapshot_date)return null;
    return Math.max(0,Math.round((new Date(data.snapshot_date+"T00:00:00Z")-new Date(date+"T00:00:00Z"))/86400000));
  };
  const ageLabel=date=>{
    const d=ageDays(date); if(d===null)return "—"; if(d===0)return "today"; if(d===1)return "1 day ago";
    if(d<30)return d+" days ago"; if(d<365)return Math.round(d/30)+" months ago"; return (d/365).toFixed(1)+" years ago";
  };
  const scoreSort=(a,b)=>(b.priority_score-a.priority_score)||a.name.localeCompare(b.name);

  function initTheme(){
    const saved=localStorage.getItem("repo-auditor-theme-v2");
    document.documentElement.dataset.theme=saved||"light";
  }
  function setTheme(theme){document.documentElement.dataset.theme=theme;localStorage.setItem("repo-auditor-theme-v2",theme)}

  function enrichAIReadiness(repos){
    const rows=Array.isArray(overview?.public_ai_readiness)?overview.public_ai_readiness:[];
    const byName=new Map(rows.map(row=>[row?.name,row]));
    repos.forEach(repo=>{const value=byName.get(repo.name);if(value)repo._aiReadiness=value});
  }

  function aiReadinessChip(repo){
    const r=repo._aiReadiness;if(!r)return "";
    const state=r.ai_readiness_state||"UNKNOWN";
    const score=Number.isInteger(r.ai_readiness_score)?r.ai_readiness_score:"—";
    const klass=state==="AI_READY"?"ready":state==="PARTIAL"?"partial":state==="NOT_READY"?"not-ready":"unknown";
    const label=state==="AI_READY"?"AI ready":state==="PARTIAL"?"AI partial":state==="NOT_READY"?"AI not ready":"AI unknown";
    return `<span class="badge ai-readiness ${klass}" title="AI readiness · ${esc(score)}/100">${esc(label)}</span>`;
  }

  async function loadAudit(repo){
    if(!repo.latest_audit)return;
    try{
      const path=repo.latest_audit.replace(/\.md$/i,".json");
      const [a,h]=await Promise.all([
        fetch("./data/"+path+"?t="+Date.now(),{cache:"no-store"}),
        fetch(API_BASE+encodeURIComponent(repo.name)+"/commits?per_page=1",{cache:"no-store",headers:{Accept:"application/vnd.github+json"}})
      ]);
      if(!a.ok)throw new Error("audit "+a.status);
      const sidecar=await a.json();
      let head="";
      if(h.ok){const commits=await h.json();head=Array.isArray(commits)&&commits[0]?.sha||""}
      const audited=sidecar.audited_commit||"";
      const open=(sidecar.findings||[]).filter(f=>f.status==="open");
      repo._audit={
        state:head&&audited&&head===audited?"current":"stale",
        open,
        date:sidecar.audit_date||"",
        report:"./data/"+path,
        p0:open.filter(f=>f.severity==="P0").length,
        p1:open.filter(f=>f.severity==="P1").length
      };
    }catch(e){repo._audit={state:"unknown",open:[],date:"",report:"",p0:0,p1:0}}
  }

  function attentionRepos(){
    return data.repositories.map(r=>{
      const age=ageDays(r.last_commit_date)||0;
      const audit=r._audit;
      const urgentAudit=(audit?.p0||0)+(audit?.p1||0);
      const staleHigh=r.work_status==="CONTINUE"&&((r.priority_score>=70&&age>=30)||(r.priority_score>=50&&age>=90));
      return {...r,_attention:urgentAudit?3:staleHigh?2:(audit?.state==="stale"?1:0),_age:age};
    }).filter(r=>r._attention>0).sort((a,b)=>b._attention-a._attention||scoreSort(a,b));
  }

  function attentionReason(r){
    if((r._audit?.p0||0)+(r._audit?.p1||0)>0)return `${r._audit.p0} P0 · ${r._audit.p1} P1 open findings`;
    if(r._attention===2)return "High-priority work has gone quiet";
    if(r._audit?.state==="stale")return "Recorded audit is behind repository HEAD";
    return "Review recommended";
  }

  function renderMetrics(){
    const repos=data.repositories||[];
    const attention=attentionRepos();
    const fresh=repos.filter(r=>r._audit?.state==="current").length;
    const count=(showcases.items||[]).length;
    $("repoCount").textContent=repos.length;
    $("attentionCount").textContent=attention.length;
    $("freshAuditCount").textContent=fresh;
    $("showcaseCount").textContent=count;
    $("showcaseCountLarge").textContent=count;
    $("snapshotDate").textContent="Snapshot · "+(data.snapshot_date||"—");
    $("footerDate").textContent=data.snapshot_date||"—";
  }

  function renderAttention(){
    const items=attentionRepos().slice(0,3);
    $("attentionList").innerHTML=items.length?items.map(r=>`
      <a class="attention-card" href="${repoUrl(r.name)}" target="_blank" rel="noreferrer">
        <div class="attention-top"><span class="attention-name">${esc(r.name)}</span><span class="attention-tag">ATTENTION</span></div>
        <p>${esc(attentionReason(r))}</p>
        <div class="attention-bottom"><span>${esc(r.priority_band)}</span><span>${esc(ageLabel(r.last_commit_date))} →</span></div>
      </a>`).join(""):`<div class="empty">No high-signal attention items right now.</div>`;
  }

  function filteredRepos(){
    const q=$("searchInput").value.trim().toLowerCase(), status=$("statusFilter").value, sort=$("sortFilter").value;
    const rows=(data.repositories||[]).filter(r=>{
      const hay=(r.name+" "+(r.reason||"")).toLowerCase();
      return (!q||hay.includes(q))&&(status==="all"||r.work_status===status);
    });
    if(sort==="recent")return rows.sort((a,b)=>String(b.last_commit_date||"").localeCompare(String(a.last_commit_date||"")));
    if(sort==="name")return rows.sort((a,b)=>a.name.localeCompare(b.name));
    return rows.sort(scoreSort);
  }

  function statusLabel(r){return r.work_status==="STOP"?"Maintenance":"Continue"}
  function bandClass(r){return r.priority_band==="P0-NOW"?"now":r.work_status==="STOP"?"stop":"active"}

  function renderRepositories(){
    const repos=filteredRepos();
    $("resultCount").textContent=repos.length+" / "+data.repositories.length;
    $("repoList").innerHTML=repos.map(r=>`
      <article class="repo-row">
        <div class="repo-title">
          <a href="${repoUrl(r.name)}" target="_blank" rel="noreferrer">${esc(r.name)}</a>
          <small>${esc(ageLabel(r.last_commit_date))}</small>
        </div>
        <div class="repo-note">${esc(r.reason||"No note.")}</div>
        <span class="pill ${bandClass(r)}">${esc(statusLabel(r))}</span>
        <a class="repo-arrow" href="${repoUrl(r.name)}" target="_blank" rel="noreferrer" aria-label="Open ${esc(r.name)}">→</a>
      </article>`).join("")||`<div class="empty">No repositories match this view.</div>`;
  }

  function renderAudits(){
    const audited=(data.repositories||[]).filter(r=>r._audit);
    const findings=audited.flatMap(r=>(r._audit.open||[]).map(f=>({repo:r,f})));
    const rank={P0:0,P1:1,P2:2,P3:3};
    findings.sort((a,b)=>(rank[a.f.severity]??9)-(rank[b.f.severity]??9)||b.repo.priority_score-a.repo.priority_score);
    const fresh=audited.filter(r=>r._audit.state==="current").length;
    $("auditMeta").textContent=`${audited.length} audited · ${fresh} fresh`;
    $("auditList").innerHTML=findings.slice(0,8).map(({repo,f})=>`
      <article class="audit-row">
        <span class="severity ${esc(f.severity||"P3")}">${esc(f.severity||"P3")}</span>
        <span class="audit-repo">${esc(repo.name)}</span>
        <div class="audit-copy"><strong>${esc(f.title||"Open finding")}</strong><p>${esc(f.recommendation||"Review evidence and remediate.")}</p></div>
        <a class="audit-link" href="${repo._audit.report}" target="_blank" rel="noreferrer">Evidence ↗</a>
      </article>`).join("")||`<div class="empty">No open structured findings in the published audit set.</div>`;
  }

  function renderPalette(q=""){
    q=q.trim().toLowerCase();
    const rows=(data.repositories||[]).filter(r=>!q||(r.name+" "+(r.reason||"")).toLowerCase().includes(q)).sort(scoreSort).slice(0,10);
    $("paletteResults").innerHTML=rows.map(r=>`
      <a class="palette-result" href="${repoUrl(r.name)}" target="_blank" rel="noreferrer">
        <span><strong>${esc(r.name)}</strong><span>${esc(r.priority_band)} · ${esc(statusLabel(r))}</span></span><span>→</span>
      </a>`).join("")||`<div class="empty" style="padding:16px">No match.</div>`;
  }

  function openPalette(){$("palette").classList.remove("hidden");$("paletteInput").value="";renderPalette();requestAnimationFrame(()=>$("paletteInput").focus())}
  function closePalette(){$("palette").classList.add("hidden")}

  function wire(){
    ["searchInput","statusFilter","sortFilter"].forEach(id=>$(id).addEventListener(id==="searchInput"?"input":"change",renderRepositories));
    $("themeToggle").addEventListener("click",()=>setTheme(document.documentElement.dataset.theme==="dark"?"light":"dark"));
    $("sidebarToggle").addEventListener("click",()=>$("sidebar").classList.toggle("open"));
    $("findButton").addEventListener("click",openPalette);
    $("paletteInput").addEventListener("input",e=>renderPalette(e.target.value));
    $("palette").addEventListener("click",e=>{if(e.target===$("palette"))closePalette()});
    document.addEventListener("keydown",e=>{
      const tag=document.activeElement?.tagName?.toLowerCase(), typing=["input","textarea","select"].includes(tag);
      if(e.key==="/"&&!typing&&$("palette").classList.contains("hidden")){e.preventDefault();openPalette()}
      if(e.key==="Escape")closePalette();
    });
    const links=[...document.querySelectorAll(".nav-item")], sections=links.map(a=>$(a.dataset.section)).filter(Boolean);
    links.forEach(a=>a.addEventListener("click",()=>{$("sidebar").classList.remove("open");$("currentView").textContent=a.textContent.trim()}));
    if("IntersectionObserver"in window){
      const io=new IntersectionObserver(entries=>{
        const v=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0]; if(!v)return;
        links.forEach(a=>a.classList.toggle("is-active",a.dataset.section===v.target.id));
        const active=links.find(a=>a.dataset.section===v.target.id); if(active)$("currentView").textContent=active.textContent.trim();
      },{rootMargin:"-20% 0px -68% 0px",threshold:[0,.15,.4]});
      sections.forEach(s=>io.observe(s));
    }
  }

  async function load(){
    initTheme();
    try{
      const [r,s,o]=await Promise.all([
        fetch(DATA_URL+"?t="+Date.now(),{cache:"no-store"}),
        fetch(SHOWCASE_URL+"?t="+Date.now(),{cache:"no-store"}).catch(()=>null),
        fetch(OVERVIEW_URL+"?t="+Date.now(),{cache:"no-store"}).catch(()=>null)
      ]);
      if(!r.ok)throw new Error("registry HTTP "+r.status);
      data=await r.json();
      if((data.repositories||[]).some(x=>x.visibility!=="public"))throw new Error("Public registry contains non-public records.");
      if(s?.ok)showcases=await s.json();
      if(o?.ok)overview=await o.json();
      const repos=data.repositories||[];
      enrichAIReadiness(repos);
      await Promise.all(repos.filter(x=>x.latest_audit).map(loadAudit));
      renderMetrics();renderAttention();renderRepositories();renderAudits();renderPalette();wire();
      $("loading").classList.add("hidden");$("app").classList.remove("hidden");
    }catch(e){
      $("loading").classList.add("hidden");$("error").classList.remove("hidden");
      $("error").innerHTML="Unable to load the public control surface.<br><small>"+esc(e.message||e)+"</small>";
    }
  }
  load();
})();