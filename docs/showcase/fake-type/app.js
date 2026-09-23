(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const params = new URLSearchParams(location.search);

  const ui = {
    en: {
      tagline: 'Mash the keyboard. Write anything.', auto: 'Auto', pause: 'Pause', load: 'Load text', sound: 'Sound', storm: 'Storm', reset: 'Reset', cinema: 'Cinema', share: 'Share',
      controls: 'Controls', source: 'Source', builtin: 'Built-in draft', pasted: 'Custom text', pdf: 'PDF', phase: 'Phase', title: 'Title', done: 'Done', speed: 'Speed', tempo: 'Tempo', chaos: 'Chaos',
      privacy: 'Imported files stay in your browser. Nothing is uploaded.', keyboard: 'Keyboard pulse', feed: 'Recent edits', pdfProgress: 'PDF import', cancelImport: 'Cancel import',
      heroTitle: 'Mash the keyboard.<br>Write anything.', heroText: 'Every key advances the manuscript. Import your own text or PDF, then type nonsense and watch it become something convincing.', start: 'Start typing →', heroLoad: 'Load my text', hint: 'Tip: you do not need to type the correct letters.',
      dialogTitle: 'Load your text', dialogText: 'Paste plain text or Markdown. Headings become manuscript sections.', drop: 'Drop a .txt or .md file here', cancel: 'Cancel', use: 'Use this text', loading: 'Reading PDF…', analyzing: 'Analyzing page', error: 'Could not read that file', loaded: 'Loaded', copied: 'Share link copied', live: 'LIVE MANUSCRIPT', exitCinema: 'Exit cinema',
      revise: 'revise −', body: 'Body', importCanceled: 'PDF import canceled', noText: 'No extractable text found in this PDF.'
    },
    zh: {
      tagline: '随便敲。什么都能写。', auto: '自动', pause: '暂停', load: '导入文本', sound: '声音', storm: '风暴', reset: '重置', cinema: '放映', share: '分享',
      controls: '控制', source: '来源', builtin: '内置草稿', pasted: '自定义文本', pdf: 'PDF', phase: '阶段', title: '标题', done: '完成', speed: '速度', tempo: '节奏', chaos: '混沌',
      privacy: '导入内容只在浏览器本地处理，不会上传。', keyboard: '键盘回声', feed: '最近编辑', pdfProgress: 'PDF 导入', cancelImport: '取消导入',
      heroTitle: '随便敲键盘。<br>文字自己出现。', heroText: '每一次按键都会推进稿件。导入自己的文本或 PDF，然后随便乱敲，看它逐渐变成一篇像模像样的文稿。', start: '开始乱敲 →', heroLoad: '导入我的文本', hint: '提示：完全不需要按“正确”的字母。',
      dialogTitle: '导入你的文本', dialogText: '粘贴纯文本或 Markdown，标题会自动变成章节。', drop: '把 .txt 或 .md 文件拖到这里', cancel: '取消', use: '使用这段文本', loading: '正在读取 PDF…', analyzing: '正在分析第', error: '无法读取该文件', loaded: '已载入', copied: '分享链接已复制', live: '实时稿件', exitCinema: '退出放映',
      revise: '修订 −', body: '正文', importCanceled: '已取消 PDF 导入', noText: '这个 PDF 中没有可提取的文字。'
    }
  };

  const builtIn = {
    title: { en: 'Entropy, Revision, and the Performance of Academic Writing', zh: '熵、修订与学术写作的表演性' },
    authors: 'FakeType Research Unit · 2026',
    sections: [
      { name: { en: 'Abstract', zh: '摘要' }, text: { en: 'We present a kinetic writing interface that transforms arbitrary keyboard activity into a structured manuscript. The system makes drafting visible as performance: insertion, revision, rhythm and disorder become parts of the page itself.', zh: '我们提出一种动态写作界面，把任意键盘活动转译成结构化稿件。系统把写作过程变成可见的表演：插入、修订、节奏与混乱都会成为页面本身的一部分。' } },
      { name: { en: 'Introduction', zh: '引言' }, text: { en: 'Most writing software assumes that keystrokes correspond to intended characters. FakeType breaks that contract. Any key becomes momentum, allowing the writer to perform fluency while the document follows a hidden structure.', zh: '大多数写作软件都默认按键对应作者真正想输入的字符。FakeType 刻意打破这一契约：任何按键都只提供推进力，让使用者表演流畅写作，而文稿沿着隐藏结构自行展开。' } },
      { name: { en: 'Method', zh: '方法' }, text: { en: 'Keyboard events are mapped to reveal, revision and punctuation operators. Tempo controls automatic cadence. Chaos increases reversals, burst size and visual instability. Imported manuscripts remain local to the browser.', zh: '键盘事件被映射为揭示、修订和标点操作。节奏控制自动推进速度；混沌提高回退、突发推进与视觉失稳的概率。导入的稿件始终保留在浏览器本地。' } },
      { name: { en: 'Results', zh: '结果' }, text: { en: 'The resulting document appears deliberate even when its input is nonsense. As chaos rises, orderly academic typography gradually gives way to kinetic fragments, exposing the distance between the performance of writing and the content being written.', zh: '即使输入完全没有意义，最终文稿仍显得有意图。随着混沌上升，规整的学术排版逐渐让位于动态碎片，从而暴露“写作的表演”与“被写出的内容”之间的距离。' } },
      { name: { en: 'Discussion', zh: '讨论' }, text: { en: 'The joke works because form is persuasive. A cursor, a title, section headings and the rhythm of revision can make randomness look purposeful. FakeType turns that observation into an instrument you can play.', zh: '这个玩笑之所以成立，是因为形式本身具有说服力。光标、标题、章节和修订节奏足以让随机行为看起来充满目的。FakeType 把这种观察变成了一件可以演奏的工具。' } }
    ]
  };

  const keys = ['Q','W','E','R','T','Y','U','I','O','P','A','S','D','F','G','H','J','K','L',';','Z','X','C','V','B','N','M',',','.','/','Space','Enter','⌫'];
  const state = {
    lang: params.get('lang') === 'zh' ? 'zh' : 'en',
    source: 'builtin', sourceName: '', title: structuredClone(builtIn.title), authors: builtIn.authors, sections: structuredClone(builtIn.sections),
    titleP: 0, sectionP: [], active: 0,
    tempo: clampNumber(params.get('tempo'), 24, 150, 64),
    chaos: clampNumber(params.get('chaos'), 0, 100, 36) / 100,
    running: false, sound: params.get('sound') !== '0', storm: params.get('storm') === '1', finished: false,
    history: [], lastTs: 0, accumulator: 0, raf: 0,
    pdfToken: 0, pdfTask: null, pdfBusy: false
  };
  state.sectionP = state.sections.map(() => 0);

  const els = {};
  const keyMap = new Map();
  const particles = [];
  let audioContext = null;
  let toastTimer = 0;
  let stormContext = null;
  let stormDpr = 1;

  function clampNumber(value, min, max, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
  }

  function locale() { return ui[state.lang]; }
  function localized(value) {
    if (typeof value === 'string') return value;
    return value?.[state.lang] || value?.en || value?.zh || '';
  }

  function cacheElements() {
    ['tagline','autoBtn','autoLabel','loadBtn','loadLabel','pdfInput','langBtn','soundBtn','soundLabel','stormBtn','stormLabel','resetBtn','resetLabel','cinemaBtn','cinemaLabel','shareBtn','shareLabel','controlTitle','sourceText','sourceValue','phaseText','phaseValue','speedText','speedValue','tempoText','tempoValue','tempo','chaosText','chaosValue','chaos','privacy','keyboardTitle','keyboard','feedTitle','feed','paperKicker','paperTitle','authors','sections','progressFill','hero','heroTitle','heroText','startBtn','heroLoadBtn','heroHint','loadDialog','dialogTitle','dialogText','textInput','dropZone','cancelBtn','useTextBtn','toast','storm','pdfProgressCard','pdfProgressTitle','pdfProgressText','pdfProgressFill','cancelPdfBtn','cinemaExit'].forEach(id => { els[id] = document.getElementById(id); });
  }

  function initKeyboard() {
    els.keyboard.textContent = '';
    keys.forEach(key => {
      const node = document.createElement('div');
      node.className = 'key';
      node.textContent = key;
      node.dataset.key = key.toLowerCase();
      els.keyboard.appendChild(node);
      keyMap.set(key.toLowerCase(), node);
    });
  }

  function setLanguage(lang) {
    state.lang = lang === 'zh' ? 'zh' : 'en';
    const x = locale();
    document.documentElement.lang = state.lang === 'zh' ? 'zh-CN' : 'en';
    els.tagline.textContent = x.tagline;
    els.loadLabel.textContent = x.load;
    els.soundLabel.textContent = x.sound;
    els.stormLabel.textContent = x.storm;
    els.resetLabel.textContent = x.reset;
    els.cinemaLabel.textContent = x.cinema;
    els.shareLabel.textContent = x.share;
    els.controlTitle.textContent = x.controls;
    els.sourceText.textContent = x.source;
    els.phaseText.textContent = x.phase;
    els.speedText.textContent = x.speed;
    els.tempoText.textContent = x.tempo;
    els.chaosText.textContent = x.chaos;
    els.privacy.textContent = x.privacy;
    els.keyboardTitle.textContent = x.keyboard;
    els.feedTitle.textContent = x.feed;
    els.paperKicker.textContent = x.live;
    els.heroTitle.innerHTML = x.heroTitle;
    els.heroText.textContent = x.heroText;
    els.startBtn.textContent = x.start;
    els.heroLoadBtn.textContent = x.heroLoad;
    els.heroHint.textContent = x.hint;
    els.dialogTitle.textContent = x.dialogTitle;
    els.dialogText.textContent = x.dialogText;
    els.dropZone.textContent = x.drop;
    els.cancelBtn.textContent = x.cancel;
    els.useTextBtn.textContent = x.use;
    els.pdfProgressTitle.textContent = x.pdfProgress;
    els.cancelPdfBtn.textContent = x.cancelImport;
    els.cinemaExit.textContent = x.exitCinema;
    els.langBtn.textContent = state.lang === 'en' ? '中文' : 'EN';
    syncRunButton();
    render(true);
  }

  function sourceLabel() {
    if (state.source === 'builtin') return locale().builtin;
    if (state.source === 'pdf') return `${locale().pdf}: ${state.sourceName}`;
    return state.sourceName || locale().pasted;
  }

  function phaseLabel() {
    if (state.titleP < 1) return locale().title;
    if (state.finished) return locale().done;
    return localized(state.sections[state.active]?.name) || locale().body;
  }

  function progress() {
    const total = Math.max(1, state.sections.length + 1);
    return (state.titleP + state.sectionP.reduce((sum, value) => sum + value, 0)) / total;
  }

  function speedLabel() {
    const value = 1 + state.tempo / 82 + state.chaos * 1.9;
    return `${value.toFixed(1)}×`;
  }

  function chaosTier() {
    if (state.chaos >= .82) return 4;
    if (state.chaos >= .58) return 3;
    if (state.chaos >= .30) return 2;
    if (state.chaos >= .10) return 1;
    return 0;
  }

  function applyChaosClass() {
    for (let i = 1; i <= 4; i += 1) document.body.classList.toggle(`chaos-${i}`, chaosTier() === i);
  }

  function render(force = false) {
    if (!state.sections.length) return;
    els.sourceValue.textContent = sourceLabel();
    els.phaseValue.textContent = phaseLabel();
    els.speedValue.textContent = speedLabel();
    els.progressFill.style.width = `${Math.round(progress() * 100)}%`;
    const title = localized(state.title);
    els.paperTitle.textContent = title.slice(0, Math.round(title.length * state.titleP));
    els.authors.textContent = state.titleP > .72 ? state.authors : '';

    if (force || els.sections.children.length !== state.sections.length) {
      els.sections.textContent = '';
      state.sections.forEach(() => {
        const section = document.createElement('section');
        section.className = 'section';
        section.innerHTML = '<h2></h2><p></p>';
        els.sections.appendChild(section);
      });
    }

    state.sections.forEach((section, index) => {
      const node = els.sections.children[index];
      const p = state.sectionP[index] || 0;
      node.classList.toggle('active', index === state.active && !state.finished && state.titleP >= 1);
      node.classList.toggle('done', p >= 1);
      node.querySelector('h2').textContent = localized(section.name);
      const full = localized(section.text);
      const visible = full.slice(0, Math.round(full.length * p));
      const body = node.querySelector('p');
      body.textContent = visible;
      if (index === state.active && !state.finished && p < 1 && state.titleP >= 1) {
        const cursor = document.createElement('span');
        cursor.className = 'cursor';
        cursor.textContent = '▍';
        body.appendChild(cursor);
      }
    });
    renderFeed();
    applyChaosClass();
  }

  function renderFeed() {
    els.feed.textContent = '';
    state.history.slice(0, 7).forEach(item => {
      const row = document.createElement('div');
      row.className = 'feed-item';
      const key = document.createElement('span');
      const note = document.createElement('span');
      key.textContent = item.key;
      note.textContent = item.note;
      row.append(key, note);
      els.feed.appendChild(row);
    });
  }

  function flashKey(raw) {
    const normalized = raw === ' ' ? 'space' : String(raw).toLowerCase();
    const node = keyMap.get(normalized) || keyMap.get('space');
    if (!node) return;
    node.classList.add('live');
    clearTimeout(node._timer);
    node._timer = setTimeout(() => node.classList.remove('live'), 95);
  }

  function ensureAudio() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioContext) audioContext = new AudioContextClass();
    if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
    return audioContext;
  }

  function playSound(kind = 'type') {
    if (!state.sound) return;
    const context = ensureAudio();
    if (!context) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    oscillator.type = kind === 'back' ? 'triangle' : 'square';
    oscillator.frequency.value = kind === 'back' ? 180 : 420 + Math.random() * 120 + state.chaos * 70;
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(.035, now + .003);
    gain.gain.exponentialRampToValueAtTime(.0001, now + .045);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + .055);
  }

  function addHistory(key, note) {
    state.history.unshift({ key, note });
    if (state.history.length > 10) state.history.length = 10;
  }

  function currentWords() {
    const text = state.titleP < 1 ? localized(state.title) : localized(state.sections[state.active]?.text);
    return (text.match(/[\u3400-\u9fff]{1,4}|[A-Za-z][A-Za-z-]{2,18}/g) || ['type', 'draft', 'entropy']).slice(0, 60);
  }

  function emitStroke(raw = 'A') {
    if (state.finished || state.pdfBusy) return;
    const key = raw === ' ' ? 'Space' : String(raw).slice(0, 10);
    flashKey(key);
    const back = state.titleP >= 1 && Math.random() < state.chaos * .12;

    if (back) {
      const index = state.active;
      state.sectionP[index] = Math.max(0, (state.sectionP[index] || 0) - (.008 + Math.random() * .018));
      addHistory(key, locale().revise);
      playSound('back');
    } else {
      const amount = .008 + Math.random() * (.014 + state.chaos * .038);
      if (state.titleP < 1) {
        state.titleP = Math.min(1, state.titleP + amount * 1.8);
        addHistory(key, state.lang === 'zh' ? '标题 +' : 'title +');
      } else {
        state.sectionP[state.active] = Math.min(1, (state.sectionP[state.active] || 0) + amount);
        const name = localized(state.sections[state.active].name);
        addHistory(key, `${name} +`);
        if (state.sectionP[state.active] >= 1) {
          if (state.active < state.sections.length - 1) state.active += 1;
          else {
            state.finished = true;
            state.running = false;
            syncRunButton();
          }
        }
      }
      playSound();
    }

    if (state.storm || state.chaos >= .84) spawnStorm(currentWords(), 2 + Math.round(state.chaos * 6));
    render();
    ensureLoop();
  }

  function resetProgress() {
    state.titleP = 0;
    state.sectionP = state.sections.map(() => 0);
    state.active = 0;
    state.finished = false;
    state.running = false;
    state.history = [];
    state.accumulator = 0;
    state.lastTs = 0;
    particles.length = 0;
    clearStorm();
    syncRunButton();
    render(true);
  }

  function syncRunButton() {
    els.autoLabel.textContent = state.running ? locale().pause : locale().auto;
    els.autoBtn.setAttribute('aria-pressed', String(state.running));
  }

  function animationStep(timestamp) {
    if (!state.lastTs) state.lastTs = timestamp;
    const delta = Math.min(90, timestamp - state.lastTs);
    state.lastTs = timestamp;

    if (state.running && !state.finished && !state.pdfBusy) {
      state.accumulator += delta;
      const interval = Math.max(38, 3800 / state.tempo);
      let guard = 0;
      while (state.accumulator >= interval && guard < 6) {
        state.accumulator -= interval;
        emitStroke(keys[Math.floor(Math.random() * keys.length)]);
        guard += 1;
      }
    }

    if (particles.length) drawStorm(delta);
    if (state.running || particles.length) state.raf = requestAnimationFrame(animationStep);
    else {
      state.raf = 0;
      state.lastTs = 0;
    }
  }

  function ensureLoop() {
    if ((state.running || particles.length) && !state.raf) state.raf = requestAnimationFrame(animationStep);
  }

  function resizeStorm() {
    const width = innerWidth;
    const height = innerHeight;
    stormDpr = Math.min(2, devicePixelRatio || 1);
    if (els.storm.width !== Math.round(width * stormDpr) || els.storm.height !== Math.round(height * stormDpr)) {
      els.storm.width = Math.round(width * stormDpr);
      els.storm.height = Math.round(height * stormDpr);
    }
    if (!stormContext) stormContext = els.storm.getContext('2d');
    stormContext?.setTransform(stormDpr, 0, 0, stormDpr, 0, 0);
    return { width, height };
  }

  function clearStorm() {
    if (!stormContext) return;
    const { width, height } = resizeStorm();
    stormContext.clearRect(0, 0, width, height);
  }

  function spawnStorm(words, count) {
    if (reducedMotion || !words.length) return;
    els.storm.hidden = false;
    for (let i = 0; i < count; i += 1) {
      particles.push({
        word: words[Math.floor(Math.random() * words.length)],
        x: (Math.random() - .5) * 1.7,
        y: (Math.random() - .5) * 1.15,
        z: 1.5 + Math.random() * 1.6,
        vz: (.00055 + Math.random() * .0006) * (1 + state.chaos * 1.7),
        spin: (Math.random() - .5) * .35,
        spinSpeed: (Math.random() - .5) * .00055,
        size: 10 + Math.random() * 8
      });
    }
    if (particles.length > 220) particles.splice(0, particles.length - 220);
    ensureLoop();
  }

  function drawStorm(delta) {
    const { width, height } = resizeStorm();
    if (!stormContext) return;
    stormContext.clearRect(0, 0, width, height);
    const cx = width / 2;
    const cy = height / 2;
    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const p = particles[i];
      p.z -= p.vz * delta;
      p.spin += p.spinSpeed * delta;
      if (p.z < .08) { particles.splice(i, 1); continue; }
      const scale = 1 / (p.z * .72 + .16);
      const x = cx + p.x * width * .36 * scale;
      const y = cy + p.y * height * .36 * scale;
      const fontSize = Math.max(11, Math.min(90, p.size * scale));
      let alpha = Math.min(.88, Math.max(.06, (2.75 - p.z) * .44));
      if (p.z < .24) alpha *= p.z / .24;
      stormContext.save();
      stormContext.translate(x, y);
      stormContext.rotate(p.spin);
      stormContext.globalAlpha = alpha;
      stormContext.fillStyle = i % 3 === 0 ? '#8f2f25' : '#1d1b18';
      stormContext.shadowColor = stormContext.fillStyle;
      stormContext.shadowBlur = Math.min(24, 8 * scale);
      stormContext.font = `600 ${fontSize}px Georgia, serif`;
      stormContext.textAlign = 'center';
      stormContext.textBaseline = 'middle';
      stormContext.fillText(p.word, 0, 0);
      stormContext.restore();
    }
    if (!particles.length) {
      els.storm.hidden = true;
      stormContext.clearRect(0, 0, width, height);
    }
  }

  function parseText(text) {
    const clean = String(text || '').replace(/\r/g, '').trim();
    if (!clean) return null;
    const lines = clean.split('\n');
    let title = '';
    let current = null;
    let body = [];
    const sections = [];

    const push = () => {
      const value = body.join('\n').trim();
      if (current && value) sections.push({ name: { en: current, zh: current }, text: { en: value, zh: value } });
      body = [];
    };

    for (const raw of lines) {
      const line = raw.trimEnd();
      const md = line.match(/^#{1,3}\s+(.+)/);
      const named = line.match(/^(abstract|introduction|methods?|methodology|results?|discussion|conclusions?|references|摘要|引言|方法|结果|讨论|结论|参考文献)\s*[:：]?\s*$/i);
      if (!title && /^#\s+/.test(line)) { title = line.replace(/^#\s+/, '').trim(); continue; }
      if (md || named) {
        push();
        current = (md ? md[1] : named[1]).trim();
        continue;
      }
      body.push(raw);
    }

    if (!current) current = locale().body;
    push();
    if (!sections.length) sections.push({ name: { en: 'Body', zh: '正文' }, text: { en: clean, zh: clean } });
    if (!title) title = lines.find(line => line.trim())?.replace(/^#+\s*/, '').slice(0, 140) || 'Imported text';
    return { title: { en: title, zh: title }, authors: '', sections };
  }

  function loadDocument(documentData, source, name = '') {
    state.source = source;
    state.sourceName = name;
    state.title = documentData.title;
    state.authors = documentData.authors || '';
    state.sections = documentData.sections.length ? documentData.sections : [{ name: { en: 'Body', zh: '正文' }, text: { en: '', zh: '' } }];
    state.sectionP = state.sections.map(() => 0);
    els.hero.classList.add('hidden');
    resetProgress();
    toast(`${locale().loaded}: ${name || localized(documentData.title)}`);
  }

  function useText(text, name = '') {
    const doc = parseText(text);
    if (!doc) return;
    loadDocument(doc, 'text', name || locale().pasted);
    els.loadDialog.close();
    els.textInput.value = '';
  }

  function normalizePdfText(text) {
    return String(text || '').replace(/\u0000/g, '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').replace(/[ \t]{2,}/g, ' ').trim();
  }

  function groupPdfItems(content, viewport) {
    const items = content.items.map(item => {
      const transform = item.transform || [];
      return { text: String(item.str || '').trim(), x: Number(transform[4] || 0), y: Number(transform[5] || 0), width: Number(item.width || 0) };
    }).filter(item => item.text);

    const rows = [];
    for (const item of items) {
      let row = rows.find(candidate => Math.abs(candidate.y - item.y) < 2.6);
      if (!row) { row = { y: item.y, items: [] }; rows.push(row); }
      row.items.push(item);
    }
    rows.sort((a, b) => b.y - a.y);
    rows.forEach(row => row.items.sort((a, b) => a.x - b.x));

    const splitThreshold = viewport.width * .12;
    const fragments = [];
    rows.forEach(row => {
      let part = [];
      let lastEnd = null;
      const flush = () => {
        if (!part.length) return;
        const text = part.map(item => item.text).join(' ').replace(/\s+/g, ' ').trim();
        if (text) fragments.push({ y: row.y, x: part[0].x, end: part[part.length - 1].x + part[part.length - 1].width, text });
        part = [];
      };
      row.items.forEach(item => {
        if (lastEnd !== null && item.x - lastEnd > splitThreshold) flush();
        part.push(item);
        lastEnd = item.x + item.width;
      });
      flush();
    });

    const mid = viewport.width / 2;
    const left = fragments.filter(f => f.x < mid * .94 && f.end < mid * 1.08);
    const right = fragments.filter(f => f.x > mid * .88);
    const spanning = fragments.filter(f => f.x < mid * .72 && f.end > mid * 1.28);
    const looksTwoColumn = left.length >= 6 && right.length >= 6 && (left.length + right.length) > fragments.length * .62;

    if (!looksTwoColumn) return fragments.sort((a, b) => b.y - a.y || a.x - b.x).map(f => f.text);

    const topBoundary = Math.max(...left.map(f => f.y), ...right.map(f => f.y));
    const topSpanning = spanning.filter(f => f.y >= topBoundary - viewport.height * .09).sort((a, b) => b.y - a.y);
    const topSet = new Set(topSpanning);
    const leftColumn = left.filter(f => !topSet.has(f)).sort((a, b) => b.y - a.y);
    const rightColumn = right.filter(f => !topSet.has(f)).sort((a, b) => b.y - a.y);
    const leftovers = fragments.filter(f => !topSet.has(f) && !left.includes(f) && !right.includes(f)).sort((a, b) => b.y - a.y || a.x - b.x);
    return [...topSpanning, ...leftColumn, ...rightColumn, ...leftovers].map(f => f.text);
  }

  const headingRules = [
    ['abstract', /^(abstract|摘要)(?:$|\b|[:：.\s])/i],
    ['introduction', /^(introduction|引言|绪论|导言)(?:$|\b|[:：.\s])/i],
    ['methods', /^(materials\s+and\s+methods|methods?|methodology|方法|材料与方法|研究方法)(?:$|\b|[:：.\s])/i],
    ['results', /^(results?|结果|实验结果)(?:$|\b|[:：.\s])/i],
    ['discussion', /^(discussion|讨论)(?:$|\b|[:：.\s])/i],
    ['conclusion', /^(conclusions?|结论|总结)(?:$|\b|[:：.\s])/i],
    ['references', /^(references|bibliography|works cited|参考文献|文献)(?:$|\b|[:：.\s])/i],
    ['appendix', /^(appendix|supplementary|附录|补充材料)(?:$|\b|[:：.\s])/i]
  ];

  function headingFromLine(line) {
    const clean = normalizePdfText(line).replace(/^\s*(?:\d+(?:\.\d+)*[.)]?|[IVXLCM]+[.)])\s+/i, '').trim();
    if (!clean || clean.length > 150) return null;
    for (const [kind, regex] of headingRules) {
      if (regex.test(clean)) return { kind, label: clean.replace(/[:：.]+$/, '') };
    }
    const numbered = /^\s*(?:\d+(?:\.\d+)*[.)]?|[IVXLCM]+[.)])\s+[A-Za-z][A-Za-z ,&/\-]{2,70}$/i.test(line);
    if (numbered && !/[.!?。]$/.test(line)) return { kind: 'custom', label: clean };
    return null;
  }

  function labelForKind(kind, fallback = '') {
    const map = {
      abstract: { en: 'Abstract', zh: '摘要' }, introduction: { en: 'Introduction', zh: '引言' }, methods: { en: 'Methods', zh: '方法' }, results: { en: 'Results', zh: '结果' }, discussion: { en: 'Discussion', zh: '讨论' }, conclusion: { en: 'Conclusion', zh: '结论' }, references: { en: 'References', zh: '参考文献' }, appendix: { en: 'Appendix', zh: '附录' }, body: { en: 'Body', zh: '正文' }
    };
    return kind === 'custom' ? { en: fallback, zh: fallback } : map[kind] || map.body;
  }

  function buildPdfDocument(file, metadataTitle, pages) {
    const records = pages.flatMap((lines, pageIndex) => lines.map(text => ({ text: normalizePdfText(text), page: pageIndex + 1 })).filter(record => record.text));
    const metadata = normalizePdfText(metadataTitle || '').replace(/\.pdf$/i, '');
    const firstCandidate = records.find(record => !headingFromLine(record.text) && record.text.length >= 6 && record.text.length <= 180);
    const title = metadata && metadata.toLowerCase() !== 'untitled' ? metadata : (firstCandidate?.text || file.name.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' '));
    const titleIndex = firstCandidate ? records.indexOf(firstCandidate) : -1;

    const authors = [];
    let cursor = Math.max(0, titleIndex + 1);
    while (cursor < records.length && authors.length < 4) {
      const text = records[cursor].text;
      if (headingFromLine(text) || text.length > 160 || (/[.!?。]$/.test(text) && text.length > 60)) break;
      authors.push(text);
      cursor += 1;
    }

    const sections = [];
    let current = null;
    let leading = [];
    const makeSection = (kind, name, lines) => {
      const joined = kind === 'references' ? lines.join('\n') : lines.join(' ').replace(/-\s+/g, '').replace(/\s+/g, ' ').trim();
      if (!joined) return;
      sections.push({ name: labelForKind(kind, name), text: { en: joined, zh: joined } });
    };
    const flush = () => {
      if (current) makeSection(current.kind, current.name, current.lines);
      current = null;
    };

    records.slice(cursor).forEach(record => {
      const heading = headingFromLine(record.text);
      if (heading) {
        if (!current && leading.length) { makeSection(leading.join(' ').length < 2200 ? 'abstract' : 'body', '', leading); leading = []; }
        flush();
        current = { kind: heading.kind, name: heading.label, lines: [] };
      } else if (current) current.lines.push(record.text);
      else leading.push(record.text);
    });
    flush();
    if (leading.length) makeSection('body', '', leading);

    if (!sections.length) {
      const all = records.map(record => record.text).join(' ');
      for (let offset = 0; offset < all.length; offset += 3600) {
        const chunk = all.slice(offset, offset + 3600).trim();
        if (chunk) sections.push({ name: { en: `Part ${sections.length + 1}`, zh: `第 ${sections.length + 1} 部分` }, text: { en: chunk, zh: chunk } });
      }
    }

    return { title: { en: title, zh: title }, authors: authors.join(' · '), sections };
  }

  function showPdfProgress(message, ratio) {
    els.pdfProgressCard.hidden = false;
    els.pdfProgressText.textContent = message;
    els.pdfProgressFill.style.width = `${Math.max(0, Math.min(100, Math.round(ratio * 100)))}%`;
  }

  function hidePdfProgress() {
    els.pdfProgressCard.hidden = true;
    els.pdfProgressFill.style.width = '0%';
  }

  async function importPdf(file) {
    if (!file || state.pdfBusy) return;
    const token = ++state.pdfToken;
    state.pdfBusy = true;
    state.running = false;
    syncRunButton();
    showPdfProgress(locale().loading, 0);
    els.pdfInput.disabled = true;

    try {
      const pdfjs = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.mjs');
      pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.mjs';
      if (token !== state.pdfToken) throw new DOMException('Canceled', 'AbortError');

      const data = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data });
      state.pdfTask = loadingTask;
      loadingTask.onProgress = ({ loaded, total }) => {
        if (token !== state.pdfToken) return;
        const ratio = total ? Math.min(.35, (loaded / total) * .35) : .1;
        showPdfProgress(locale().loading, ratio);
      };
      const pdf = await loadingTask.promise;
      const metadata = await pdf.getMetadata().catch(() => null);
      const pages = [];
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        if (token !== state.pdfToken) throw new DOMException('Canceled', 'AbortError');
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1 });
        const content = await page.getTextContent();
        pages.push(groupPdfItems(content, viewport));
        showPdfProgress(`${locale().analyzing} ${pageNumber} / ${pdf.numPages}`, .35 + (pageNumber / pdf.numPages) * .65);
        page.cleanup?.();
      }
      await pdf.destroy?.();
      if (token !== state.pdfToken) throw new DOMException('Canceled', 'AbortError');
      const doc = buildPdfDocument(file, metadata?.info?.Title || '', pages);
      if (!doc.sections.length || !doc.sections.some(section => localized(section.text).trim())) throw new Error(locale().noText);
      loadDocument(doc, 'pdf', file.name);
    } catch (error) {
      if (error?.name === 'AbortError' || token !== state.pdfToken) toast(locale().importCanceled);
      else { console.error(error); toast(error?.message || locale().error); }
    } finally {
      if (token === state.pdfToken) {
        state.pdfBusy = false;
        state.pdfTask = null;
        els.pdfInput.disabled = false;
        els.pdfInput.value = '';
        hidePdfProgress();
      }
    }
  }

  async function cancelPdfImport() {
    if (!state.pdfBusy) return;
    state.pdfToken += 1;
    try { await state.pdfTask?.destroy?.(); } catch (_) {}
    state.pdfTask = null;
    state.pdfBusy = false;
    els.pdfInput.disabled = false;
    els.pdfInput.value = '';
    hidePdfProgress();
    toast(locale().importCanceled);
  }

  function toast(message) {
    clearTimeout(toastTimer);
    els.toast.textContent = message;
    els.toast.classList.add('show');
    toastTimer = setTimeout(() => els.toast.classList.remove('show'), 1800);
  }

  async function toggleCinema(force) {
    const next = typeof force === 'boolean' ? force : !document.documentElement.classList.contains('cinema');
    document.documentElement.classList.toggle('cinema', next);
    if (next && !document.fullscreenElement) {
      try { await document.documentElement.requestFullscreen?.(); } catch (_) {}
    } else if (!next && document.fullscreenElement) {
      try { await document.exitFullscreen?.(); } catch (_) {}
    }
  }

  async function shareSettings() {
    const url = new URL(location.href);
    url.search = '';
    url.searchParams.set('lang', state.lang);
    url.searchParams.set('tempo', String(state.tempo));
    url.searchParams.set('chaos', String(Math.round(state.chaos * 100)));
    if (state.storm) url.searchParams.set('storm', '1');
    if (!state.sound) url.searchParams.set('sound', '0');
    if (document.documentElement.classList.contains('cinema')) url.searchParams.set('cinema', '1');
    const shareData = { title: 'FakeType', text: locale().tagline, url: url.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else { await navigator.clipboard.writeText(url.href); toast(locale().copied); }
    } catch (error) {
      if (error?.name !== 'AbortError') {
        try { await navigator.clipboard.writeText(url.href); toast(locale().copied); } catch (_) {}
      }
    }
  }

  function openLoadDialog() {
    els.hero.classList.add('hidden');
    els.loadDialog.showModal();
    setTimeout(() => els.textInput.focus(), 30);
  }

  function handleFile(file) {
    if (!file) return;
    if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) { importPdf(file); return; }
    if (/\.(txt|md|markdown)$/i.test(file.name) || file.type.startsWith('text/')) {
      const reader = new FileReader();
      reader.onload = () => useText(String(reader.result || ''), file.name);
      reader.onerror = () => toast(locale().error);
      reader.readAsText(file);
    }
  }

  function bindEvents() {
    els.startBtn.addEventListener('click', () => { els.hero.classList.add('hidden'); ensureAudio(); });
    els.heroLoadBtn.addEventListener('click', openLoadDialog);
    els.loadBtn.addEventListener('click', openLoadDialog);
    els.useTextBtn.addEventListener('click', () => useText(els.textInput.value));

    els.autoBtn.addEventListener('click', () => {
      ensureAudio();
      if (state.finished) resetProgress();
      state.running = !state.running;
      syncRunButton();
      ensureLoop();
    });
    els.resetBtn.addEventListener('click', resetProgress);
    els.langBtn.addEventListener('click', () => setLanguage(state.lang === 'en' ? 'zh' : 'en'));
    els.soundBtn.addEventListener('click', () => { state.sound = !state.sound; els.soundBtn.setAttribute('aria-pressed', String(state.sound)); if (state.sound) ensureAudio(); });
    els.stormBtn.addEventListener('click', () => { state.storm = !state.storm; els.stormBtn.setAttribute('aria-pressed', String(state.storm)); if (!state.storm && !particles.length) clearStorm(); });
    els.cinemaBtn.addEventListener('click', () => toggleCinema());
    els.cinemaExit.addEventListener('click', () => toggleCinema(false));
    els.shareBtn.addEventListener('click', shareSettings);

    els.tempo.addEventListener('input', event => { state.tempo = Number(event.target.value); els.tempoValue.textContent = String(state.tempo); render(); });
    els.chaos.addEventListener('input', event => { state.chaos = Number(event.target.value) / 100; els.chaosValue.textContent = `${Math.round(state.chaos * 100)}%`; render(); });
    els.pdfInput.addEventListener('change', event => handleFile(event.target.files?.[0]));
    els.cancelPdfBtn.addEventListener('click', cancelPdfImport);

    ['dragenter', 'dragover'].forEach(name => els.dropZone.addEventListener(name, event => { event.preventDefault(); els.dropZone.classList.add('drag'); }));
    ['dragleave', 'drop'].forEach(name => els.dropZone.addEventListener(name, event => { event.preventDefault(); els.dropZone.classList.remove('drag'); }));
    els.dropZone.addEventListener('drop', event => handleFile(event.dataTransfer?.files?.[0]));

    document.addEventListener('dragover', event => event.preventDefault());
    document.addEventListener('drop', event => {
      if (els.loadDialog.open && els.dropZone.contains(event.target)) return;
      const file = event.dataTransfer?.files?.[0];
      if (file) { event.preventDefault(); els.hero.classList.add('hidden'); handleFile(file); }
    });

    window.addEventListener('keydown', event => {
      const target = event.target;
      const editing = target && (target.matches?.('input, textarea, button, select') || target.closest?.('dialog'));
      if (event.key === 'Escape' && document.documentElement.classList.contains('cinema')) { toggleCinema(false); return; }
      if (!editing && (event.key === 'f' || event.key === 'F')) { event.preventDefault(); toggleCinema(); return; }
      if (editing || event.metaKey || event.ctrlKey || event.altKey) return;
      if ([' ', 'Tab', 'Enter', 'Backspace'].includes(event.key)) event.preventDefault();
      els.hero.classList.add('hidden');
      ensureAudio();
      emitStroke(event.key === 'Backspace' ? '⌫' : event.key);
    });

    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement && document.documentElement.classList.contains('cinema')) document.documentElement.classList.remove('cinema');
    });
    window.addEventListener('resize', () => { if (particles.length) resizeStorm(); });
  }

  function initFromUrl() {
    els.tempo.value = String(state.tempo);
    els.tempoValue.textContent = String(state.tempo);
    els.chaos.value = String(Math.round(state.chaos * 100));
    els.chaosValue.textContent = `${Math.round(state.chaos * 100)}%`;
    els.soundBtn.setAttribute('aria-pressed', String(state.sound));
    els.stormBtn.setAttribute('aria-pressed', String(state.storm));
    if (params.get('cinema') === '1') {
      els.hero.classList.add('hidden');
      document.documentElement.classList.add('cinema');
    }
  }

  function init() {
    cacheElements();
    initKeyboard();
    bindEvents();
    initFromUrl();
    setLanguage(state.lang);
    render(true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
