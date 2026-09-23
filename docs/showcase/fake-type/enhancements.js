(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const byId = (id) => document.getElementById(id);

  const copy = {
    en: {
      presets: 'Presets', demo: 'Demo', stopDemo: 'Stop demo', export: 'Export', help: 'Help',
      presetTitle: 'Choose a manuscript', presetText: 'Load a ready-made manuscript, then mash the keyboard to perform it.',
      helpTitle: 'How to play', helpText: 'FakeType treats keys as momentum, not literal characters.', close: 'Close',
      exported: 'Visible manuscript exported', demoStarted: 'Demo mode started', demoStopped: 'Demo mode stopped',
      exportEmpty: 'Type a little before exporting.', installReady: 'FakeType can work offline after this visit.',
      visibleOnly: 'Export saves the portion currently revealed on the page.',
      shortcuts: 'Shortcuts', actions: 'Actions', anyKey: 'Any unmodified key', advance: 'Advance manuscript',
      cinema: 'F', cinemaAction: 'Toggle Cinema', openText: 'Ctrl/⌘ + O', openTextAction: 'Load text',
      exportKey: 'Ctrl/⌘ + E', exportAction: 'Export visible manuscript', demoKey: 'Ctrl/⌘ + D', demoAction: 'Toggle demo',
      helpKey: 'Ctrl/⌘ + /', helpAction: 'Open help'
    },
    zh: {
      presets: '预设', demo: '演示', stopDemo: '停止演示', export: '导出', help: '帮助',
      presetTitle: '选择一份文稿', presetText: '载入现成文稿，然后随便敲键盘进行“表演式写作”。',
      helpTitle: '怎么玩', helpText: 'FakeType 把按键当作推进力，而不是把你真的按下的字符输入进去。', close: '关闭',
      exported: '已导出当前可见稿件', demoStarted: '演示模式已启动', demoStopped: '演示模式已停止',
      exportEmpty: '先敲几下，再导出。', installReady: '本次访问后，FakeType 可支持离线打开。',
      visibleOnly: '导出内容仅包含当前页面已经揭示出来的部分。',
      shortcuts: '快捷键', actions: '操作', anyKey: '任意无修饰键', advance: '推进稿件',
      cinema: 'F', cinemaAction: '切换放映模式', openText: 'Ctrl/⌘ + O', openTextAction: '导入文本',
      exportKey: 'Ctrl/⌘ + E', exportAction: '导出当前可见稿件', demoKey: 'Ctrl/⌘ + D', demoAction: '切换演示',
      helpKey: 'Ctrl/⌘ + /', helpAction: '打开帮助'
    }
  };

  const presets = [
    {
      icon: '∑',
      name: { en: 'Research Paper', zh: '研究论文' },
      note: { en: 'A compact academic paper with conventional sections.', zh: '带有标准章节结构的短学术论文。' },
      text: `# Attention as a Scarce Interface Resource

## Abstract
Interfaces compete for attention long before they compete for clicks. This paper treats attention as a finite interface resource and examines how rhythm, hierarchy, interruption, and visual silence influence perceived control.

## Introduction
Digital products often optimize the visibility of individual elements while underestimating the cost of the whole composition. A screen can contain excellent components and still feel exhausting.

## Method
We compare three interface conditions: persistent notification, contextual notification, and silent state change. Participants complete the same reading and editing tasks under each condition.

## Results
Contextual notification preserves task completion while reducing self-reported interruption. Silent state change performs best for focus but creates uncertainty when system state changes are consequential.

## Discussion
Attention should be budgeted like latency or memory. The best interface is not the interface that says the most; it is the one that interrupts at the right moment.`
    },
    {
      icon: '◉',
      name: { en: 'Keynote', zh: '演讲稿' },
      note: { en: 'Short, punchy sections for live presentation.', zh: '适合现场展示的短句式演讲稿。' },
      text: `# The Machine That Looks Busy

## Opening
We have spent decades teaching computers to look productive. Progress bars move. Cursors blink. Dashboards pulse. Activity became a visual language before it became evidence of useful work.

## The Trick
A convincing interface does not need to reveal everything. It needs rhythm, consequence, and just enough uncertainty to make the next moment feel alive.

## The Question
What happens when we separate the performance of work from the work itself?

## The Answer
We notice how much software depends on theater. FakeType makes that theater playable.

## Closing
Sometimes the interface is not a window into the process. Sometimes the interface is the performance.`
    },
    {
      icon: '⌁',
      name: { en: 'System Manifesto', zh: '系统宣言' },
      note: { en: 'A dramatic manifesto that works well with high Chaos.', zh: '适合高 Chaos 的戏剧化宣言。' },
      text: `# A Small Manifesto for Unstable Systems

## I. Structure
Every system begins by pretending its boundaries are stable.

## II. Noise
Noise is not the opposite of information. Noise is information whose role has not yet been negotiated.

## III. Control
A control panel is a promise that the machine can be understood through a handful of variables.

## IV. Failure
When the variables stop explaining the behavior, the interface becomes theater.

## V. Release
Push the slider further. Let the margins drift. Let the cursor stutter. The document is still readable. The system is still a system. It is simply admitting that control was always partial.`
    },
    {
      icon: '诊',
      name: { en: 'Clinical Note', zh: '临床记录' },
      note: { en: 'A Chinese structured note for bilingual demos.', zh: '适合中文与双语展示的结构化记录。' },
      text: `# 门诊病例讨论记录

## 主诉
患者因反复头晕、乏力两周就诊，症状以午后明显，休息后可部分缓解。

## 现病史
两周前无明显诱因出现间歇性头晕，无旋转感，无意识丧失。近期工作时间延长，睡眠减少，饮食不规律。

## 查体
一般情况稳定，交流清楚，查体配合。生命体征未见明显异常。

## 初步评估
目前信息更支持疲劳与生活节律相关因素，但仍需结合进一步检查排除其他原因。

## 计划
完善必要检查，记录症状出现时间与诱因，调整睡眠和饮食节律，并根据随访结果进一步评估。`
    }
  ];

  const state = {
    demoTimer: 0,
    demoStartedAt: 0,
    demoBackup: null,
    lang: 'en'
  };

  function lang() {
    return document.documentElement.lang.toLowerCase().startsWith('zh') ? 'zh' : 'en';
  }

  function t(key) {
    return copy[lang()][key];
  }

  function toast(message) {
    const node = byId('toast');
    if (!node) return;
    node.textContent = message;
    node.classList.add('show');
    clearTimeout(node._enhancementTimer);
    node._enhancementTimer = setTimeout(() => node.classList.remove('show'), 1800);
  }

  function updateLabels() {
    state.lang = lang();
    const mapping = {
      presetLabel: 'presets', demoLabel: state.demoTimer ? 'stopDemo' : 'demo', exportLabel: 'export', helpLabel: 'help',
      presetDialogTitle: 'presetTitle', presetDialogText: 'presetText', helpDialogTitle: 'helpTitle', helpDialogText: 'helpText',
      helpCloseBtn: 'close', presetCloseBtn: 'close', exportNote: 'visibleOnly', shortcutTitle: 'shortcuts', actionTitle: 'actions'
    };
    Object.entries(mapping).forEach(([id, key]) => {
      const node = byId(id);
      if (node) node.textContent = t(key);
    });
    renderPresets();
    renderShortcutRows();
  }

  function renderPresets() {
    const host = byId('presetGrid');
    if (!host) return;
    host.textContent = '';
    presets.forEach((preset, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'preset-card';
      button.innerHTML = `<span class="preset-icon" aria-hidden="true">${preset.icon}</span><span class="preset-copy"><strong></strong><small></small></span><span class="preset-arrow" aria-hidden="true">→</span>`;
      button.querySelector('strong').textContent = preset.name[lang()];
      button.querySelector('small').textContent = preset.note[lang()];
      button.addEventListener('click', () => loadPreset(index));
      host.appendChild(button);
    });
  }

  function renderShortcutRows() {
    const host = byId('shortcutRows');
    if (!host) return;
    const rows = [
      [t('anyKey'), t('advance')],
      [t('cinema'), t('cinemaAction')],
      [t('openText'), t('openTextAction')],
      [t('exportKey'), t('exportAction')],
      [t('demoKey'), t('demoAction')],
      [t('helpKey'), t('helpAction')]
    ];
    host.textContent = '';
    rows.forEach(([key, action]) => {
      const row = document.createElement('div');
      row.className = 'shortcut-row';
      const kbd = document.createElement('kbd');
      kbd.textContent = key;
      const text = document.createElement('span');
      text.textContent = action;
      row.append(kbd, text);
      host.appendChild(row);
    });
  }

  function loadPreset(index) {
    const preset = presets[index];
    if (!preset) return;
    byId('presetDialog')?.close();
    byId('loadBtn')?.click();
    const input = byId('textInput');
    if (!input) return;
    input.value = preset.text;
    setTimeout(() => byId('useTextBtn')?.click(), 0);
  }

  function safeFilename(title) {
    const stem = String(title || 'faketype-manuscript')
      .normalize('NFKC')
      .replace(/[\\/:*?"<>|]+/g, '-')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
    return `${stem || 'faketype-manuscript'}.md`;
  }

  function exportVisibleManuscript() {
    const title = byId('paperTitle')?.textContent.trim() || '';
    const authors = byId('authors')?.textContent.trim() || '';
    const sections = [...document.querySelectorAll('#sections .section')].map(section => ({
      heading: section.querySelector('h2')?.textContent.trim() || '',
      body: (section.querySelector('p')?.textContent || '').replace(/▍/g, '').trim()
    })).filter(section => section.heading || section.body);

    if (!title && !sections.some(section => section.body)) {
      toast(t('exportEmpty'));
      return;
    }

    const chunks = [];
    if (title) chunks.push(`# ${title}`);
    if (authors) chunks.push(`_${authors}_`);
    sections.forEach(section => {
      if (section.heading) chunks.push(`## ${section.heading}`);
      if (section.body) chunks.push(section.body);
    });
    chunks.push(`---\nExported from FakeType · ${new Date().toLocaleString()}`);

    const blob = new Blob([`${chunks.join('\n\n')}\n`], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = safeFilename(title);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast(t('exported'));
  }

  function dispatchDemoKey() {
    const keys = ['q','w','e','r','t','y','u','i','o','p','a','s','d','f','g','h','j','k','l','z','x','c','v','b','n','m',' ','.',',','Enter','Backspace'];
    const key = keys[Math.floor(Math.random() * keys.length)];
    window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    const progress = parseFloat(byId('progressFill')?.style.width || '0');
    if (progress >= 100) stopDemo(false);
  }

  function startDemo() {
    if (state.demoTimer) return;
    byId('startBtn')?.click();
    const tempo = byId('tempo');
    const chaos = byId('chaos');
    state.demoBackup = {
      tempo: tempo?.value || '64',
      chaos: chaos?.value || '36'
    };
    if (tempo) {
      tempo.value = '112';
      tempo.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (chaos) {
      chaos.value = '64';
      chaos.dispatchEvent(new Event('input', { bubbles: true }));
    }
    state.demoStartedAt = performance.now();
    state.demoTimer = window.setInterval(() => {
      const elapsed = performance.now() - state.demoStartedAt;
      if (chaos) {
        const target = Math.min(92, 64 + Math.floor(elapsed / 900));
        if (Number(chaos.value) !== target) {
          chaos.value = String(target);
          chaos.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
      dispatchDemoKey();
    }, 88);
    byId('demoBtn')?.setAttribute('aria-pressed', 'true');
    updateLabels();
    toast(t('demoStarted'));
  }

  function stopDemo(showToast = true) {
    if (!state.demoTimer) return;
    clearInterval(state.demoTimer);
    state.demoTimer = 0;
    const tempo = byId('tempo');
    const chaos = byId('chaos');
    if (state.demoBackup) {
      if (tempo) {
        tempo.value = state.demoBackup.tempo;
        tempo.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (chaos) {
        chaos.value = state.demoBackup.chaos;
        chaos.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
    state.demoBackup = null;
    byId('demoBtn')?.setAttribute('aria-pressed', 'false');
    updateLabels();
    if (showToast) toast(t('demoStopped'));
  }

  function toggleDemo() {
    if (state.demoTimer) stopDemo();
    else startDemo();
  }

  function bindButtons() {
    byId('presetBtn')?.addEventListener('click', () => byId('presetDialog')?.showModal());
    byId('demoBtn')?.addEventListener('click', toggleDemo);
    byId('exportBtn')?.addEventListener('click', exportVisibleManuscript);
    byId('helpBtn')?.addEventListener('click', () => byId('helpDialog')?.showModal());
    byId('presetCloseBtn')?.addEventListener('click', () => byId('presetDialog')?.close());
    byId('helpCloseBtn')?.addEventListener('click', () => byId('helpDialog')?.close());
  }

  function bindShortcuts() {
    window.addEventListener('keydown', (event) => {
      const mod = event.ctrlKey || event.metaKey;
      if (!mod) return;
      const key = event.key.toLowerCase();
      if (key === 'o') {
        event.preventDefault();
        byId('loadBtn')?.click();
      } else if (key === 'e') {
        event.preventDefault();
        exportVisibleManuscript();
      } else if (key === 'd') {
        event.preventDefault();
        toggleDemo();
      } else if (key === '/') {
        event.preventDefault();
        byId('helpDialog')?.showModal();
      }
    }, { capture: true });
  }

  function observeLanguage() {
    const observer = new MutationObserver(() => {
      if (state.lang !== lang()) updateLabels();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }, { once: true });
  }

  function init() {
    bindButtons();
    bindShortcuts();
    observeLanguage();
    updateLabels();
    registerServiceWorker();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
