/**
 * 游戏初始化脚本 v2.0
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('🎮 王智慧生存游戏生成器 v2.0');

  // 初始化 UI 管理器
  const ui = new UIManager();
  window.ui = ui; // 暴露到全局
  ui.init();

  // 加载主题列表
  loadThemeCards();

  // 绑定全局事件
  bindGlobalEvents();
});

// 加载主题卡片
async function loadThemeCards() {
  const grid = document.getElementById('theme-grid');
  if (!grid) return;

  // 内置主题（离线时使用）
  const localThemes = [
    { id: 'general', name: '原版-女性困境', icon: '🌸', description: '还原李智慧生存游戏，涵盖女性在各阶段的社会困境', stages: ['童年','少年','青年','中年','老年'] },
    { id: 'depression', name: '抑郁症主题', icon: '🩶', description: '与抑郁共处的生存挑战', stages: ['童年','少年','青年','中年','老年'] },
    { id: 'schizophrenia', name: '精神分裂主题', icon: '🧠', description: '幻觉与现实交织的挑战', stages: ['童年','少年','青年','中年','老年'] },
    { id: 'anxiety', name: '焦虑症主题', icon: '😰', description: '持续紧张与恐惧的挑战', stages: ['童年','少年','青年','中年','老年'] },
    { id: 'bullying', name: '霸凌主题', icon: '💢', description: '被欺凌与自我保护的挑战', stages: ['小学','初中','高中','大学','职场'] },
    { id: 'ptsd', name: 'PTSD 主题', icon: '💔', description: '创伤后应激障碍的生存挑战', stages: ['创伤前','创伤期','恢复期','重建期','整合期'] }
  ];

  // 尝试从服务器加载
  try {
    const res = await fetch('/api/themes');
    if (res.ok) {
      const data = await res.json();
      renderThemes(data.themes || localThemes);
      return;
    }
  } catch (e) {
    console.log('服务器未运行，使用本地主题');
  }

  // 使用内置数据
  renderThemes(localThemes);
}

function renderThemes(themes) {
  const grid = document.getElementById('theme-grid');
  if (!grid) return;

  const cards = themes.map(theme => `
    <button class="theme-card" data-theme-id="${theme.id}">
      <div class="theme-card-icon">${theme.icon}</div>
      <div class="theme-card-name">${theme.name}</div>
      <div class="theme-card-desc">${theme.description}</div>
      <div class="theme-card-meta">
        <span class="theme-tag">📅 ${(theme.stages || []).length}个阶段</span>
        <span class="theme-tag">👥 多角色</span>
      </div>
    </button>
  `).join('');

  grid.innerHTML = cards;
}

// 绑定全局事件
function bindGlobalEvents() {
  // 主题卡片点击
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.theme-card');
    if (card && window.ui) {
      window.ui.startSetup(card.dataset.themeId);
    }
  });

  // 键盘快捷键
  document.addEventListener('keydown', (e) => {
    // 1-4 选择选项
    if (e.key >= '1' && e.key <= '4' && !e.ctrlKey && !e.metaKey) {
      const activeScreen = document.querySelector('.screen.active');
      if (activeScreen?.id === 'game-screen') {
        const btns = document.querySelectorAll('.option-btn:not(:disabled)');
        const idx = parseInt(e.key) - 1;
        if (btns[idx]) {
          btns[idx].click();
        }
      }
    }
  });
}

// 工具函数
window.GameUtils = {
  // 格式化日期
  formatDate(timestamp) {
    const d = new Date(timestamp);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  },

  // 随机ID
  randomId() {
    return Math.random().toString(36).substring(2, 10);
  }
};