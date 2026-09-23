/* ==================== Synthetic Mock Adapter for Public Showcase ==================== */
"use strict";

// Fully synthetic data created for the public repo-auditor showcase.
// It is NOT copied from the source project's SQLite database or real participants.
const MOCK_COUNSELORS = [
  {"id":101,"name":"Demo Counselor A","avatar_path":null,"note":"Synthetic showcase profile","created_at":"2026-01-01T09:00:00","sex":"female","client_count":2,"audio_count":1,"type":"counselor"},
  {"id":102,"name":"Demo Counselor B","avatar_path":null,"note":"Synthetic showcase profile","created_at":"2026-01-01T09:05:00","sex":"male","client_count":1,"audio_count":1,"type":"counselor"}
];

const MOCK_CLIENTS = {
  101: [
    {"id":201,"counselor_id":101,"name":"Demo Client A","avatar_path":null,"note":"","created_at":"2026-01-02T10:00:00","sex":"male","audio_count":2,"type":"client"},
    {"id":202,"counselor_id":101,"name":"Demo Client B","avatar_path":null,"note":"","created_at":"2026-01-02T10:05:00","sex":"female","audio_count":1,"type":"client"}
  ],
  102: [
    {"id":203,"counselor_id":102,"name":"Demo Client C","avatar_path":null,"note":"","created_at":"2026-01-02T10:10:00","sex":"female","audio_count":1,"type":"client"}
  ]
};

const MOCK_AUDIOS = {
  "counselor-101": [
    {"id":301,"person_type":"counselor","person_id":101,"stored_filename":"synthetic_counselor_a.wav","original_name":"synthetic_counselor_a","pitch_hz":176.2,"gender":0.61,"duration":8.4,"rms":0.041,"zcr":0.026,"centroid":2180.0,"uploaded_at":"2026-01-03T09:00:00","transcript":"Synthetic showcase audio metadata.","audio_role":"original","target_client_id":null,"target_client_name":""}
  ],
  "counselor-102": [
    {"id":302,"person_type":"counselor","person_id":102,"stored_filename":"synthetic_counselor_b.wav","original_name":"synthetic_counselor_b","pitch_hz":128.4,"gender":0.18,"duration":7.1,"rms":0.036,"zcr":0.021,"centroid":1945.0,"uploaded_at":"2026-01-03T09:05:00","transcript":"Synthetic showcase audio metadata.","audio_role":"original","target_client_id":null,"target_client_name":""}
  ],
  "client-201": [
    {"id":401,"person_type":"client","person_id":201,"stored_filename":"synthetic_client_a1.wav","original_name":"synthetic_client_a1","pitch_hz":119.8,"gender":0.12,"duration":6.8,"rms":0.052,"zcr":0.031,"centroid":2310.0,"uploaded_at":"2026-01-03T10:00:00","transcript":"Synthetic showcase audio metadata.","audio_role":"original","target_client_id":null,"target_client_name":""},
    {"id":402,"person_type":"client","person_id":201,"stored_filename":"synthetic_client_a2.wav","original_name":"synthetic_client_a2","pitch_hz":124.6,"gender":0.16,"duration":9.2,"rms":0.047,"zcr":0.028,"centroid":2255.0,"uploaded_at":"2026-01-03T10:05:00","transcript":"Synthetic showcase audio metadata.","audio_role":"original","target_client_id":null,"target_client_name":""}
  ],
  "client-202": [
    {"id":403,"person_type":"client","person_id":202,"stored_filename":"synthetic_client_b.wav","original_name":"synthetic_client_b","pitch_hz":204.1,"gender":0.79,"duration":7.7,"rms":0.044,"zcr":0.034,"centroid":2490.0,"uploaded_at":"2026-01-03T10:10:00","transcript":"Synthetic showcase audio metadata.","audio_role":"original","target_client_id":null,"target_client_name":""}
  ],
  "client-203": [
    {"id":404,"person_type":"client","person_id":203,"stored_filename":"synthetic_client_c.wav","original_name":"synthetic_client_c","pitch_hz":191.3,"gender":0.72,"duration":8.0,"rms":0.039,"zcr":0.029,"centroid":2385.0,"uploaded_at":"2026-01-03T10:15:00","transcript":"Synthetic showcase audio metadata.","audio_role":"original","target_client_id":null,"target_client_name":""}
  ]
};

const MOCK_ALL_AUDIOS = Object.entries(MOCK_AUDIOS).flatMap(([key, rows]) => {
  const [person_type] = key.split("-");
  return rows.map(row => {
    let person_name = "";
    let counselor_id = null;
    if (person_type === "counselor") {
      person_name = MOCK_COUNSELORS.find(x => x.id === row.person_id)?.name || "Demo Counselor";
    } else {
      for (const [cid, clients] of Object.entries(MOCK_CLIENTS)) {
        const found = clients.find(x => x.id === row.person_id);
        if (found) { person_name = found.name; counselor_id = Number(cid); break; }
      }
    }
    return {...row, person_name, person_sex: person_type === "counselor"
      ? (MOCK_COUNSELORS.find(x => x.id === row.person_id)?.sex || "")
      : (Object.values(MOCK_CLIENTS).flat().find(x => x.id === row.person_id)?.sex || ""),
      counselor_id};
  });
});

const MOCK_REPORTS = [];

// ---------- Mock API ----------
window.api = async function api(path, opts = {}) {
  await new Promise(r => setTimeout(r, 80));

  const mCounselors = path.match(/^\/api\/counselors\/?$/);
  const mCounselor = path.match(/^\/api\/counselors\/(\d+)$/);
  const mClients = path.match(/^\/api\/counselors\/(\d+)\/clients$/);
  const mClient = path.match(/^\/api\/clients\/(\d+)$/);
  const mAllAudio = path.match(/^\/api\/audios\/?$/);
  const mPersonAudio = path.match(/^\/api\/persons\/(counselor|client)\/(\d+)\/audios$/);
  const mAudio = path.match(/^\/api\/audios\/(\d+)$/);
  const mAudioNameSuggestion = path.match(/^\/api\/persons\/(counselor|client)\/(\d+)\/audio_name_suggestion/);
  const mReports = path.match(/^\/api\/reports\/?$/);
  const mReportHtmlSingle = path.match(/^\/api\/report_html_single\/(\d+)$/);
  const mCompare = path.match(/^\/api\/compare$/);

  // GET /api/counselors
  if (mCounselors && (!opts.method || opts.method === "GET")) {
    return [...MOCK_COUNSELORS];
  }

  // POST /api/counselors
  if (mCounselors && opts.method === "POST") {
    toast("【演示模式】不支持添加数据", "bad");
    throw new Error("演示模式：数据为只读");
  }

  // GET /api/counselors/:id
  if (mCounselor && (!opts.method || opts.method === "GET")) {
    const cid = parseInt(mCounselor[1]);
    const c = MOCK_COUNSELORS.find(x => x.id === cid);
    if (!c) throw new Error("Not found");
    return { ...c };
  }

  // PUT/POST /api/counselors/:id
  if (mCounselor && (opts.method === "PUT" || opts.method === "POST")) {
    toast("【演示模式】不支持修改数据", "bad");
    throw new Error("演示模式：数据为只读");
  }

  // DELETE /api/counselors/:id
  if (mCounselor && opts.method === "DELETE") {
    toast("【演示模式】不支持删除数据", "bad");
    throw new Error("演示模式：数据为只读");
  }

  // GET /api/counselors/:id/clients
  if (mClients && (!opts.method || opts.method === "GET")) {
    const cid = parseInt(mClients[1]);
    return [...(MOCK_CLIENTS[cid] || [])];
  }

  // POST /api/counselors/:id/clients
  if (mClients && opts.method === "POST") {
    toast("【演示模式】不支持添加数据", "bad");
    throw new Error("演示模式：数据为只读");
  }

  // GET /api/clients/:id
  if (mClient && (!opts.method || opts.method === "GET")) {
    const clid = parseInt(mClient[1]);
    for (const cs of Object.values(MOCK_CLIENTS)) {
      const cl = cs.find(x => x.id === clid);
      if (cl) return { ...cl };
    }
    throw new Error("Not found");
  }

  // DELETE /api/clients/:id
  if (mClient && opts.method === "DELETE") {
    toast("【演示模式】不支持删除数据", "bad");
    throw new Error("演示模式：数据为只读");
  }

  // GET /api/audios
  if (mAllAudio && (!opts.method || opts.method === "GET")) {
    return [...MOCK_ALL_AUDIOS];
  }

  // GET /api/persons/:type/:id/audios
  if (mPersonAudio && (!opts.method || opts.method === "GET")) {
    const ptype = mPersonAudio[1];
    const pid = parseInt(mPersonAudio[2]);
    const key = `${ptype}-${pid}`;
    return [...(MOCK_AUDIOS[key] || [])];
  }

  // POST /api/persons/:type/:id/audios
  if (mPersonAudio && opts.method === "POST") {
    toast("【演示模式】不支持上传音频", "bad");
    throw new Error("演示模式：数据为只读");
  }

  // GET /api/audios/:id
  if (mAudio && (!opts.method || opts.method === "GET")) {
    const aid = parseInt(mAudio[1]);
    for (const list of Object.values(MOCK_AUDIOS)) {
      const a = list.find(x => x.id === aid);
      if (a) return { ...a };
    }
    throw new Error("Not found");
  }

  // DELETE /api/audios/:id
  if (mAudio && opts.method === "DELETE") {
    toast("【演示模式】不支持删除音频", "bad");
    throw new Error("演示模式：数据为只读");
  }

  // PUT /api/audios/:id/meta
  if (path.match(/^\/api\/audios\/(\d+)\/meta$/) && opts.method === "PUT") {
    toast("【演示模式】不支持修改音频", "bad");
    throw new Error("演示模式：数据为只读");
  }

  // PUT /api/audios/:id/transcript
  if (path.match(/^\/api\/audios\/(\d+)\/transcript$/) && opts.method === "PUT") {
    toast("【演示模式】不支持修改备注", "bad");
    throw new Error("演示模式：数据为只读");
  }

  // GET /api/persons/:type/:id/audio_name_suggestion
  if (mAudioNameSuggestion && (!opts.method || opts.method === "GET")) {
    return { name: "sample_name" };
  }

  // GET /api/reports (with or without query string)
  const mReportsWithQuery = path.match(/^\/api\/reports(\?.*)?$/);
  if (mReportsWithQuery && (!opts.method || opts.method === "GET")) {
    const urlParams = new URLSearchParams(path.split("?")[1] || "");
    const reportType = urlParams.get("report_type");
    let reports = MOCK_REPORTS.map(r => ({ ...r }));
    if (reportType) {
      reports = reports.filter(r => r.report_type === reportType);
    }
    return reports;
  }

  // DELETE /api/reports/:id
  const mDeleteReport = path.match(/^\/api\/reports\/(\d+)$/);
  if (mDeleteReport && opts.method === "DELETE") {
    toast("【演示模式】不支持删除报告", "bad");
    throw new Error("演示模式：数据为只读");
  }

  // GET /api/report_html_single/:id
  if (mReportHtmlSingle && (!opts.method || opts.method === "GET")) {
    const aid = parseInt(mReportHtmlSingle[1]);
    const report = MOCK_REPORTS.find(r => r.report_type === "single" && r.a_audio_id === aid);
    if (report) {
      return { url: report.url };
    }
    throw new Error("未找到报告");
  }

  // POST /api/compare
  if (mCompare && opts.method === "POST") {
    return {
      decision: {
        verdict: "Uncertain",
        confidence: "Low",
        reason: "Speaker embedding strongly similar (timbre). pitch differs by 5.8 semitones (large). formant F2 differs by 403 Hz (strong difference). spectral centroid moderately different. Evidence is mixed; further manual inspection recommended.",
        speaker_sim: 0.81,
        pitch_sim: 0.52,
        decision_score: 0.64,
        mfcc_sim: 0.77,
        src_pitch: 140.47,
        tgt_pitch: 100.75,
        semitones: -5.76,
        recommended_f0_up_key: -6,
        f2_diff: 403,
        cent_diff: 376.7,
      }
    };
  }

  // GET /api/report/:a/:b
  const mReportPair = path.match(/^\/api\/report\/(\d+)\/(\d+)$/);
  if (mReportPair && (!opts.method || opts.method === "GET")) {
    const aId = parseInt(mReportPair[1]);
    const bId = parseInt(mReportPair[2]);
    const report = MOCK_REPORTS.find(r => r.report_type === "pair" && r.a_audio_id === aId && r.b_audio_id === bId);
    if (report) {
      return { url: report.url };
    }
    throw new Error("未找到报告");
  }

  // GET /api/report_html/:a/:b
  const mReportHtmlPair = path.match(/^\/api\/report_html\/(\d+)\/(\d+)$/);
  if (mReportHtmlPair && (!opts.method || opts.method === "GET")) {
    const aId = parseInt(mReportHtmlPair[1]);
    const bId = parseInt(mReportHtmlPair[2]);
    const report = MOCK_REPORTS.find(r => r.report_type === "pair" && r.a_audio_id === aId && r.b_audio_id === bId);
    if (report) {
      return { url: report.url };
    }
    throw new Error("未找到报告");
  }

  // Fallback
  if (!opts.method || opts.method === "GET") {
    return [];
  }

  throw new Error(`演示模式：未模拟的 API 端点 ${path}`);
};

// ---------- Override avatarHTML to use local avatar path ----------
window.avatarHTML = function avatarHTML(person, variant = "") {
  const cls = "avatar" + (variant ? " " + variant : "") + (person && person.sex ? ` sex-${person.sex}` : "");
  if (person.avatar_path) {
    return `<div class="${cls}"><img src="avatars/${encodeURIComponent(person.avatar_path)}" alt=""></div>`;
  }
  const initial = (person.name || "?").trim().charAt(0).toUpperCase();
  return `<div class="${cls}">${initial}</div>`;
};

// ---------- Show demo banner ----------
document.addEventListener("DOMContentLoaded", () => {
  const banner = document.createElement("div");
  banner.className = "demo-banner";
  banner.innerHTML = `
    <span>🎬 演示模式 — 数据为只读 Mock 数据，所有修改/上传/分析操作均不会生效</span>
    <a href="../" class="demo-banner-link">返回项目首页</a>
  `;
  document.body.insertBefore(banner, document.body.firstChild);
});

// ---------- app.js will call switchView("people") on load, api() is already mocked ----------
// app.js loads AFTER this file, so its switchView() will use the mocked api()
