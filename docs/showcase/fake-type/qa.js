(() => {
  'use strict';

  const byId = (id) => document.getElementById(id);
  const isZh = () => document.documentElement.lang.toLowerCase().startsWith('zh');

  function installSkipLink() {
    if (document.querySelector('.skip-link')) return;
    const link = document.createElement('a');
    link.className = 'skip-link';
    link.href = '#paper';
    link.textContent = isZh() ? '跳到稿件' : 'Skip to manuscript';
    document.body.prepend(link);
  }

  function syncActionLabels() {
    document.querySelectorAll('.actions button').forEach((button) => {
      const label = button.querySelector('.label')?.textContent.trim();
      if (label) {
        button.setAttribute('aria-label', label);
        button.title = label;
      }
    });
    const pdfLabel = document.querySelector('label[for="pdfInput"]');
    if (pdfLabel) {
      const text = isZh() ? '导入 PDF' : 'Import PDF';
      pdfLabel.setAttribute('aria-label', text);
      pdfLabel.title = text;
    }
    const help = byId('helpBtn');
    if (help) {
      const text = isZh() ? '帮助' : 'Help';
      help.setAttribute('aria-label', text);
      help.title = text;
    }
  }

  function keyEventValue(text) {
    if (text === 'Space') return ' ';
    if (text === 'Enter') return 'Enter';
    if (text === '⌫') return 'Backspace';
    return text;
  }

  function setupKeyboardInteraction() {
    const keyboard = byId('keyboard');
    if (!keyboard) return;
    keyboard.setAttribute('role', 'group');
    keyboard.setAttribute('aria-label', isZh() ? '可点击的虚拟键盘' : 'Interactive virtual keyboard');

    keyboard.querySelectorAll('.key').forEach((key) => {
      const text = key.textContent.trim();
      key.setAttribute('role', 'button');
      key.setAttribute('tabindex', '0');
      key.setAttribute('aria-label', isZh() ? `输入 ${text}` : `Type ${text}`);

      if (!key.dataset.qaPointerBound) {
        key.dataset.qaPointerBound = '1';
        key.addEventListener('click', () => {
          const value = keyEventValue(key.textContent.trim());
          window.dispatchEvent(new KeyboardEvent('keydown', {
            key: value,
            bubbles: true,
            cancelable: true
          }));
        });
      }
    });
  }

  function routeTypingAwayFromButtons() {
    window.addEventListener('keydown', (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target;
      if (!target?.matches?.('button')) return;
      if (['Enter', ' ', 'Tab', 'Escape'].includes(event.key)) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      target.blur();
      window.dispatchEvent(new KeyboardEvent('keydown', {
        key: event.key,
        code: event.code,
        bubbles: true,
        cancelable: true,
        shiftKey: event.shiftKey
      }));
    }, true);
  }

  function quietLargeLiveRegions() {
    const paper = byId('paper');
    if (paper) paper.removeAttribute('aria-live');
  }

  function setupProgressBars() {
    const mainFill = byId('progressFill');
    const mainTrack = mainFill?.parentElement;
    if (mainFill && mainTrack) {
      mainTrack.setAttribute('role', 'progressbar');
      mainTrack.setAttribute('aria-valuemin', '0');
      mainTrack.setAttribute('aria-valuemax', '100');
      const update = () => mainTrack.setAttribute('aria-valuenow', String(Math.round(parseFloat(mainFill.style.width) || 0)));
      update();
      new MutationObserver(update).observe(mainFill, { attributes: true, attributeFilter: ['style'] });
    }

    const pdfFill = byId('pdfProgressFill');
    const pdfTrack = pdfFill?.parentElement;
    if (pdfFill && pdfTrack) {
      pdfTrack.setAttribute('role', 'progressbar');
      pdfTrack.setAttribute('aria-valuemin', '0');
      pdfTrack.setAttribute('aria-valuemax', '100');
      const update = () => pdfTrack.setAttribute('aria-valuenow', String(Math.round(parseFloat(pdfFill.style.width) || 0)));
      update();
      new MutationObserver(update).observe(pdfFill, { attributes: true, attributeFilter: ['style'] });
    }
  }

  function enhancePdfFailureMessage() {
    const toast = byId('toast');
    if (!toast) return;
    let rewriting = false;
    const observer = new MutationObserver(() => {
      if (rewriting) return;
      const text = toast.textContent || '';
      const noText = /No extractable text found|没有可提取的文字/.test(text);
      if (!noText || /OCR|扫描/.test(text)) return;
      rewriting = true;
      toast.textContent = isZh()
        ? '没有可提取的文字。这个 PDF 可能是扫描件；请先 OCR，或直接粘贴文本。'
        : 'No extractable text found. This may be a scanned PDF; run OCR first or paste the text instead.';
      window.setTimeout(() => { rewriting = false; }, 0);
    });
    observer.observe(toast, { childList: true, characterData: true, subtree: true });
  }

  function rejectLargePdf(file) {
    if (!file || file.size <= 80 * 1024 * 1024 || !/\.pdf$/i.test(file.name)) return false;
    const toast = byId('toast');
    if (!toast) return true;
    toast.textContent = isZh()
      ? 'PDF 超过 80 MB。为避免浏览器卡死，请先压缩或拆分文件。'
      : 'This PDF is over 80 MB. Compress or split it first to avoid freezing the browser.';
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 3200);
    return true;
  }

  function guardVeryLargePdf() {
    const input = byId('pdfInput');
    if (input) {
      input.addEventListener('change', (event) => {
        const file = event.target.files?.[0];
        if (!rejectLargePdf(file)) return;
        event.stopImmediatePropagation();
        input.value = '';
      }, true);
    }

    document.addEventListener('drop', (event) => {
      const file = event.dataTransfer?.files?.[0];
      if (!rejectLargePdf(file)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);
  }

  function addShortcutMetadata() {
    const shortcuts = {
      loadBtn: 'Control+O Meta+O',
      exportBtn: 'Control+E Meta+E',
      demoBtn: 'Control+D Meta+D',
      helpBtn: 'Control+/ Meta+/',
      cinemaBtn: 'F'
    };
    Object.entries(shortcuts).forEach(([id, value]) => byId(id)?.setAttribute('aria-keyshortcuts', value));
  }

  function observeLanguageAndLabels() {
    const refresh = () => {
      syncActionLabels();
      setupKeyboardInteraction();
      const skip = document.querySelector('.skip-link');
      if (skip) skip.textContent = isZh() ? '跳到稿件' : 'Skip to manuscript';
    };
    const rootObserver = new MutationObserver(refresh);
    rootObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    const actions = document.querySelector('.actions');
    if (actions) new MutationObserver(syncActionLabels).observe(actions, { childList: true, characterData: true, subtree: true });
  }

  function init() {
    installSkipLink();
    syncActionLabels();
    setupKeyboardInteraction();
    routeTypingAwayFromButtons();
    quietLargeLiveRegions();
    setupProgressBars();
    enhancePdfFailureMessage();
    guardVeryLargePdf();
    addShortcutMetadata();
    observeLanguageAndLabels();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
