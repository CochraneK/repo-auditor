/**
 * UI 管理器 - v3.0
 * 核心：旁观者视角(3轮) → 主角视角(1轮) 共情机制
 */

class UIManager {
  constructor() {
    this.game = null;
    this.theme = null;
    this.gameMode = 'solo';
    this.scoreDisplayMode = 'show';
    this.selectedThemeId = null;
  }

  init() { this.bindEvents(); }

  async loadTheme(themeId) {
    // 先尝试服务器
    try {
      const res = await fetch(`/api/theme/${themeId}`);
      if (res.ok) return await res.json();
    } catch(e) {}

    // 降级：内置主题数据
    return this.getLocalTheme(themeId);
  }

  getLocalTheme(themeId) {
    const themes = {
      general: {
        id: 'general', name: '原版-女性困境', icon: '🌸', description: '还原李智慧生存游戏',
        stages: ['童年','少年','青年','中年','老年'],
        attributes: [
          { id: 'selfEsteem', name: '自尊心', icon: '🪷', initial: 50, deathAt: 0 },
          { id: 'social', name: '社交性', icon: '🤝', initial: 50, deathAt: 0 },
          { id: 'sensitivity', name: '感受性', icon: '💧', initial: 50, deathAt: 0 },
          { id: 'compliance', name: '顺应性', icon: '🌀', initial: 50, deathAt: 0 },
          { id: 'stress', name: '压力值', icon: '⚡', initial: 0, deathAt: 100, reverse: true }
        ],
        roles: [
          { id: 'self', name: '李智慧（主角）', icon: '👩', isProtagonist: true, description: '经历一生的女性', stereotype: '善良坚韧', guardian: 'selfEsteem', initialStats: { selfEsteem: 50, social: 50, sensitivity: 50, compliance: 50, stress: 0 } },
          { id: 'father', name: '父亲', icon: '👨', description: '传统权威', stereotype: '重男轻女', guardian: 'compliance', initialStats: { selfEsteem: 55, social: 40, sensitivity: 35, compliance: 60, stress: 15 } },
          { id: 'mother', name: '母亲', icon: '👩', description: '家庭照顾者', stereotype: '过度关心', guardian: 'sensitivity', initialStats: { selfEsteem: 45, social: 50, sensitivity: 55, compliance: 45, stress: 25 } },
          { id: 'sibling', name: '弟弟', icon: '👦', description: '受偏爱的兄弟', stereotype: '受宠竞争', guardian: 'selfEsteem', initialStats: { selfEsteem: 35, social: 40, sensitivity: 30, compliance: 55, stress: 30 } },
          { id: 'friendSame', name: '同性朋友', icon: '💑', description: '闺蜜', stereotype: '理解支持', guardian: 'social', initialStats: { selfEsteem: 50, social: 55, sensitivity: 50, compliance: 35, stress: 20 } },
          { id: 'friendOpposite', name: '异性朋友', icon: '💕', description: '可能的对象', stereotype: '关心但有条件', guardian: 'sensitivity', initialStats: { selfEsteem: 55, social: 45, sensitivity: 50, compliance: 40, stress: 25 } },
          { id: 'teacher', name: '老师', icon: '👨‍🏫', description: '权威指导', stereotype: '成绩导向', guardian: 'compliance', initialStats: { selfEsteem: 40, social: 35, sensitivity: 45, compliance: 60, stress: 15 } },
          { id: 'relative', name: '亲戚', icon: '👴', description: '传统价值观', stereotype: '比较闲话', guardian: 'selfEsteem', initialStats: { selfEsteem: 30, social: 25, sensitivity: 40, compliance: 50, stress: 35 } }
        ]
      },
      bullying: {
        id: 'bullying', name: '霸凌主题', icon: '💢', description: '被欺凌与自我保护的挑战',
        stages: ['小学','初中','高中','大学','职场'],
        attributes: [
          { id: 'selfWorth', name: '自我价值', icon: '💎', initial: 50, deathAt: 0 },
          { id: 'safety', name: '安全感', icon: '🛡️', initial: 50, deathAt: 0 },
          { id: 'trust', name: '信任能力', icon: '🤝', initial: 50, deathAt: 0 },
          { id: 'resilience', name: '韧性', icon: '🦋', initial: 50, deathAt: 0 },
          { id: 'trauma', name: '创伤指数', icon: '🩸', initial: 0, deathAt: 100, reverse: true }
        ],
        roles: [
          { id: 'self', name: '自己（受害者）', icon: '🧑', isProtagonist: true, description: '正在经历霸凌的你', stereotype: '无助内化', guardian: 'selfWorth', initialStats: { selfWorth: 35, safety: 30, trust: 40, resilience: 35, trauma: 50 } },
          { id: 'father', name: '父母', icon: '👨', description: '家庭支持', stereotype: '可能不相信', guardian: 'selfWorth', initialStats: { selfWorth: 40, safety: 45, trust: 50, resilience: 40, trauma: 30 } },
          { id: 'mother', name: '母亲', icon: '👩', description: '主要照顾者', stereotype: '焦虑放大', guardian: 'safety', initialStats: { selfWorth: 35, safety: 40, trust: 45, resilience: 35, trauma: 40 } },
          { id: 'friend', name: '支持者', icon: '💪', description: '少数的帮助者', stereotype: '勇敢持续支持', guardian: 'resilience', initialStats: { selfWorth: 55, safety: 50, trust: 60, resilience: 55, trauma: 15 } },
          { id: 'teacher', name: '老师', icon: '👨‍🏫', description: '权威角色', stereotype: '可能不作为', guardian: 'safety', initialStats: { selfWorth: 35, safety: 40, trust: 30, resilience: 45, trauma: 25 } },
          { id: 'bully', name: '霸凌者', icon: '😈', description: '施害者', stereotype: '强势控制', guardian: 'safety', initialStats: { selfWorth: 60, safety: 55, trust: 25, resilience: 45, trauma: 10 } },
          { id: 'bystander', name: '旁观者', icon: '👀', description: '沉默的大多数', stereotype: '害怕牵连', guardian: 'trust', initialStats: { selfWorth: 45, safety: 50, trust: 40, resilience: 50, trauma: 20 } },
          { id: 'counselor', name: '心理辅导师', icon: '🧠', description: '专业帮助', stereotype: '支持引导', guardian: 'resilience', initialStats: { selfWorth: 50, safety: 55, trust: 65, resilience: 60, trauma: 10 } }
        ]
      },
      depression: {
        id: 'depression', name: '抑郁症主题', icon: '🩶', description: '与抑郁共处的生存挑战',
        stages: ['童年','少年','青年','中年','老年'],
        attributes: [
          { id: 'selfValue', name: '自我价值', icon: '🪷', initial: 50, deathAt: 0 },
          { id: 'connection', name: '人际连接', icon: '🤝', initial: 50, deathAt: 0 },
          { id: 'emotionReg', name: '情绪调节', icon: '💧', initial: 50, deathAt: 0 },
          { id: 'dailyFunc', name: '日常功能', icon: '🏠', initial: 50, deathAt: 0 },
          { id: 'distress', name: '痛苦指数', icon: '⚡', initial: 0, deathAt: 100, reverse: true }
        ],
        roles: [
          { id: 'self', name: '自己（患者）', icon: '🧑', isProtagonist: true, description: '与抑郁共处的你', stereotype: '敏感挣扎', guardian: 'selfValue', initialStats: { selfValue: 40, connection: 40, emotionReg: 30, dailyFunc: 40, distress: 45 } },
          { id: 'father', name: '父亲', icon: '👨', description: '传统男性角色', stereotype: '认为抑郁是矫情', guardian: 'connection', initialStats: { selfValue: 45, connection: 35, emotionReg: 50, dailyFunc: 55, distress: 20 } },
          { id: 'mother', name: '母亲', icon: '👩', description: '关爱但焦虑', stereotype: '以爱为名的控制', guardian: 'dailyFunc', initialStats: { selfValue: 40, connection: 60, emotionReg: 35, dailyFunc: 45, distress: 40 } },
          { id: 'sibling', name: '兄弟姐妹', icon: '👫', description: '竞争同龄人', stereotype: '不理解竞争', guardian: 'selfValue', initialStats: { selfValue: 35, connection: 30, emotionReg: 45, dailyFunc: 50, distress: 25 } },
          { id: 'friendSame', name: '同性朋友', icon: '💑', description: '可能疏远', stereotype: '告诉振作', guardian: 'connection', initialStats: { selfValue: 45, connection: 50, emotionReg: 40, dailyFunc: 45, distress: 35 } },
          { id: 'friendOpposite', name: '异性朋友', icon: '💕', description: '情感支持', stereotype: '方式笨拙', guardian: 'emotionReg', initialStats: { selfValue: 50, connection: 45, emotionReg: 45, dailyFunc: 40, distress: 30 } },
          { id: 'teacher', name: '老师', icon: '👨‍🏫', description: '权威评判', stereotype: '关注成绩', guardian: 'dailyFunc', initialStats: { selfValue: 30, connection: 25, emotionReg: 40, dailyFunc: 60, distress: 20 } },
          { id: 'relative', name: '亲戚', icon: '👴', description: '传统价值观', stereotype: '不够坚强', guardian: 'selfValue', initialStats: { selfValue: 25, connection: 20, emotionReg: 35, dailyFunc: 50, distress: 45 } }
        ]
      },
      schizophrenia: {
        id: 'schizophrenia', name: '精神分裂主题', icon: '🧠', description: '幻觉与现实交织的挑战',
        stages: ['童年','少年','青年','中年','老年'],
        attributes: [
          { id: 'reality', name: '现实感', icon: '🎯', initial: 50, deathAt: 0 },
          { id: 'identity', name: '自我认同', icon: '🪞', initial: 50, deathAt: 0 },
          { id: 'function', name: '社会功能', icon: '🏠', initial: 50, deathAt: 0 },
          { id: 'insight', name: '疾病觉察', icon: '💡', initial: 50, deathAt: 0 },
          { id: 'crisis', name: '危机指数', icon: '🔥', initial: 0, deathAt: 100, reverse: true }
        ],
        roles: [
          { id: 'self', name: '自己（患者）', icon: '🧑', isProtagonist: true, description: '与幻觉斗争的你', stereotype: '恐惧困惑', guardian: 'reality', initialStats: { reality: 40, identity: 45, function: 40, insight: 35, crisis: 45 } },
          { id: 'father', name: '父亲', icon: '👨', description: '家族权威', stereotype: '否认病情', guardian: 'function', initialStats: { reality: 50, identity: 40, function: 45, insight: 30, crisis: 35 } },
          { id: 'mother', name: '母亲', icon: '👩', description: '主要照顾者', stereotype: '过度保护', guardian: 'identity', initialStats: { reality: 45, identity: 55, function: 35, insight: 40, crisis: 50 } },
          { id: 'sibling', name: '兄弟姐妹', icon: '👫', description: '复杂关系', stereotype: '恐惧疏远', guardian: 'reality', initialStats: { reality: 35, identity: 40, function: 50, insight: 45, crisis: 30 } },
          { id: 'psychiatrist', name: '精神科医生', icon: '⚕️', description: '专业支持', stereotype: '权威治疗', guardian: 'insight', initialStats: { reality: 55, identity: 50, function: 45, insight: 65, crisis: 20 } },
          { id: 'nurse', name: '护士社工', icon: '🏥', description: '日常照护', stereotype: '提醒服药', guardian: 'function', initialStats: { reality: 50, identity: 45, function: 55, insight: 50, crisis: 25 } },
          { id: 'friend', name: '朋友', icon: '👤', description: '院友同伴', stereotype: '互相支持', guardian: 'identity', initialStats: { reality: 40, identity: 55, function: 40, insight: 35, crisis: 40 } },
          { id: 'neighbor', name: '邻居', icon: '🏘️', description: '社区目光', stereotype: '闲话偏见', guardian: 'function', initialStats: { reality: 30, identity: 25, function: 45, insight: 20, crisis: 35 } }
        ]
      },
      anxiety: {
        id: 'anxiety', name: '焦虑症主题', icon: '😰', description: '持续紧张与恐惧的挑战',
        stages: ['童年','少年','青年','中年','老年'],
        attributes: [
          { id: 'calm', name: '平静度', icon: '🧘', initial: 50, deathAt: 0 },
          { id: 'control', name: '掌控感', icon: '🎛️', initial: 50, deathAt: 0 },
          { id: 'social', name: '社交自信', icon: '🤝', initial: 50, deathAt: 0 },
          { id: 'function', name: '日常功能', icon: '🏠', initial: 50, deathAt: 0 },
          { id: 'panic', name: '恐慌指数', icon: '😱', initial: 0, deathAt: 100, reverse: true }
        ],
        roles: [
          { id: 'self', name: '自己（患者）', icon: '🧑', isProtagonist: true, description: '被焦虑困扰的你', stereotype: '过度担忧', guardian: 'calm', initialStats: { calm: 30, control: 35, social: 40, function: 45, panic: 50 } },
          { id: 'father', name: '父亲', icon: '👨', description: '压力来源', stereotype: '高期待粗暴', guardian: 'control', initialStats: { calm: 35, control: 40, social: 30, function: 50, panic: 40 } },
          { id: 'mother', name: '母亲', icon: '👩', description: '过度保护', stereotype: '焦虑传递', guardian: 'calm', initialStats: { calm: 25, control: 35, social: 45, function: 40, panic: 55 } },
          { id: 'therapist', name: '心理咨询师', icon: '🧠', description: '专业帮助', stereotype: '认知行为', guardian: 'control', initialStats: { calm: 60, control: 65, social: 50, function: 55, panic: 15 } },
          { id: 'friend', name: '朋友', icon: '👤', description: '支持网络', stereotype: '倾听但可能不耐烦', guardian: 'social', initialStats: { calm: 45, control: 40, social: 55, function: 50, panic: 25 } },
          { id: 'colleague', name: '同事', icon: '💼', description: '工作场景', stereotype: '竞争压力', guardian: 'function', initialStats: { calm: 35, control: 45, social: 40, function: 50, panic: 35 } },
          { id: 'partner', name: '伴侣', icon: '💑', description: '亲密关系', stereotype: '支持但疲惫', guardian: 'social', initialStats: { calm: 40, control: 45, social: 50, function: 45, panic: 30 } },
          { id: 'doctor', name: '医生', icon: '⚕️', description: '医疗支持', stereotype: '诊断用药', guardian: 'function', initialStats: { calm: 55, control: 50, social: 40, function: 60, panic: 20 } }
        ]
      },
      ptsd: {
        id: 'ptsd', name: 'PTSD 主题', icon: '💔', description: '创伤后应激障碍的生存挑战',
        stages: ['创伤前','创伤期','恢复期','重建期','整合期'],
        attributes: [
          { id: 'safety', name: '安全感', icon: '🛡️', initial: 50, deathAt: 0 },
          { id: 'trust', name: '信任感', icon: '🤝', initial: 50, deathAt: 0 },
          { id: 'identity', name: '自我认同', icon: '🪞', initial: 50, deathAt: 0 },
          { id: 'connection', name: '人际连接', icon: '💫', initial: 50, deathAt: 0 },
          { id: 'trigger', name: '触发风险', icon: '⚡', initial: 0, deathAt: 100, reverse: true }
        ],
        roles: [
          { id: 'self', name: '自己（幸存者）', icon: '🧑', isProtagonist: true, description: '与PTSD共存的你', stereotype: '警觉闪回', guardian: 'identity', initialStats: { safety: 25, trust: 20, identity: 35, connection: 30, trigger: 65 } },
          { id: 'father', name: '父亲', icon: '👨', description: '家庭权威', stereotype: '不理解要求振作', guardian: 'trust', initialStats: { safety: 45, trust: 50, identity: 40, connection: 30, trigger: 25 } },
          { id: 'mother', name: '母亲', icon: '👩', description: '主要照顾者', stereotype: '焦虑不知如何帮', guardian: 'safety', initialStats: { safety: 40, trust: 45, identity: 35, connection: 50, trigger: 35 } },
          { id: 'therapist', name: '创伤治疗师', icon: '🧠', description: '专业支持', stereotype: 'EMDR引导', guardian: 'connection', initialStats: { safety: 60, trust: 65, identity: 55, connection: 60, trigger: 15 } },
          { id: 'friend', name: '朋友', icon: '👤', description: '支持网络', stereotype: '不知说什么', guardian: 'trust', initialStats: { safety: 50, trust: 55, identity: 50, connection: 55, trigger: 30 } },
          { id: 'partner', name: '伴侣', icon: '💑', description: '亲密关系', stereotype: '照顾疲惫', guardian: 'identity', initialStats: { safety: 45, trust: 40, identity: 45, connection: 50, trigger: 40 } },
          { id: 'doctor', name: '急诊医生', icon: '⚕️', description: '最初治疗者', stereotype: '紧急处理随访缺失', guardian: 'safety', initialStats: { safety: 50, trust: 35, identity: 40, connection: 30, trigger: 45 } },
          { id: 'stranger', name: '陌生人', icon: '🚶', description: '社会环境', stereotype: '无意触发偏见', guardian: 'safety', initialStats: { safety: 30, trust: 25, identity: 35, connection: 20, trigger: 55 } }
        ]
      }
    };

    return themes[themeId] || null;
  }

  showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const s = document.getElementById(id);
    if (s) s.classList.add('active');
  }

  bindEvents() {
    document.addEventListener('click', async e => {
      // 主题卡片点击
      const card = e.target.closest('.theme-card');
      if (card) { await this.startSetup(card.dataset.themeId); return; }

      // 设置界面：开始按钮
      if (e.target.closest('#start-game-btn')) { this.beginGame(); return; }
      // 设置界面：模式选择
      const modeBtn = e.target.closest('.mode-btn');
      if (modeBtn) {
        const container = document.getElementById('setup-container');
        container.querySelectorAll('.mode-btn').forEach(x => x.classList.remove('active'));
        modeBtn.classList.add('active');
        this.gameMode = modeBtn.dataset.mode;
        return;
      }
      // 设置界面：分数模式选择
      const scoreBtn = e.target.closest('.score-mode-btn');
      if (scoreBtn) {
        const container = document.getElementById('setup-container');
        container.querySelectorAll('.score-mode-btn').forEach(x => x.classList.remove('active'));
        scoreBtn.classList.add('active');
        this.scoreDisplayMode = scoreBtn.dataset.score;
        return;
      }
      // 返回按钮
      if (e.target.closest('#back-menu-btn')) { this.showScreen('theme-screen'); return; }
      // 游戏界面：切换分数显示
      if (e.target.closest('#toggle-scores-btn')) { this.toggleScores(); return; }
      // 结果确认继续
      if (e.target.closest('#continue-btn')) { this.ackAndContinue(); return; }
      // 重新开始
      if (e.target.closest('#restart-btn')) { this.showScreen('theme-screen'); return; }
      // 选项点击
      const opt = e.target.closest('.option-btn');
      if (opt && !opt.disabled) {
        // 检查是否是评价选项
        if (opt.dataset.evaluationId) {
          await this.handleEvaluation(opt.dataset.evaluationId);
        } else {
          await this.handleChoice(opt.dataset.optionId);
        }
        return;
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key >= '1' && e.key <= '4') {
        const btns = document.querySelectorAll('.option-btn:not(:disabled)');
        const idx = parseInt(e.key) - 1;
        if (btns[idx]) btns[idx].click();
      }
    });
  }

  async startSetup(themeId) {
    this.selectedThemeId = themeId;
    const themeData = await this.loadTheme(themeId);
    if (!themeData) return;
    this.theme = themeData;
    this.game = new GameFlow(themeData);

    const scenarios = await this.loadScenarios();
    this.game.loadMockScenarios(scenarios);

    this.showSetupScreen(themeData);
  }

  async loadScenarios() {
    // 优先从服务器加载（已按主题过滤）
    try {
      const res = await fetch('/api/mock-scenarios');
      if (res.ok) {
        const all = await res.json();
        // 只取当前主题的题
        return all.filter(s => s.theme === this.selectedThemeId);
      }
    } catch(e) {}
    // 降级：使用内置数据（按主题过滤）
    const all = window.MOCK_SCENARIOS || [];
    return all.filter(s => s.theme === this.selectedThemeId);
  }

  showSetupScreen(theme) {
    const container = document.getElementById('setup-container');
    const roles = theme.roles || [];

    const roleCards = roles.map(r => {
      const guardian = theme.attributes.find(a => a.id === r.guardian);
      const typeTag = r.isProtagonist
        ? '<span class="role-type protagonist">💔 主角</span>'
        : '<span class="role-type bystander">👁️ 旁观者</span>';
      return `
        <div class="role-btn" data-role-id="${r.id}">
          <div class="role-top">
            <span class="role-icon">${r.icon}</span>
            ${typeTag}
          </div>
          <div class="role-name">${r.name}</div>
          <div class="role-desc">${r.description}</div>
          <div class="role-stereotype">刻板印象: ${r.stereotype}</div>
          ${guardian ? `<div class="role-guardian">守 ${guardian.name}</div>` : ''}
        </div>`;
    }).join('');

    container.innerHTML = `
      <div class="setup-header">
        <h2>🎮 游戏设置</h2>
        <div class="theme-badge">${theme.icon} ${theme.name}</div>
      </div>

      <div class="phase-explain">
        <div class="phase-hint-card">
          <div class="phase-hint-icon">💡</div>
          <div class="phase-hint-content">
            <h3>共情机制说明</h3>
            <p>本游戏分两个阶段：</p>
            <ol>
              <li><strong>👁️ 旁观者轮（3轮）</strong>：你先扮演旁观者角色，理解各方立场</li>
              <li><strong>💔 主角轮（1轮）</strong>：你切换到受害者视角，体验真实痛苦</li>
            </ol>
            <p>旁观者的感受往往是局部的、浅层的；主角的感受才是完整的、切肤的。这种落差，就是共情。</p>
          </div>
        </div>
      </div>

      <div class="setup-section">
        <h3>🎭 选择游戏模式</h3>
        <div class="mode-grid">
          <button class="mode-btn active" data-mode="solo">
            <span class="mode-icon">🎯</span>
            <span class="mode-name">单人体验</span>
            <span class="mode-desc">AI 引导，体验共情之旅</span>
          </button>
          <button class="mode-btn" data-mode="multi">
            <span class="mode-icon">👥</span>
            <span class="mode-name">多人团体</span>
            <span class="mode-desc">每人选一个角色，投票决策</span>
          </button>
        </div>
      </div>

      <div class="setup-section">
        <h3>📊 分数显示模式</h3>
        <div class="mode-grid">
          <button class="score-mode-btn active" data-score="show">
            <span class="mode-icon">👁️</span>
            <span class="mode-name">显示模式</span>
            <span class="mode-desc">实时显示属性变化</span>
          </button>
          <button class="score-mode-btn" data-score="hide">
            <span class="mode-icon">🎭</span>
            <span class="mode-name">隐藏模式</span>
            <span class="mode-desc">结束后公布，裁判有独立面板</span>
          </button>
        </div>
      </div>

      <div class="setup-actions">
        <button id="back-menu-btn" class="btn btn-secondary">← 返回</button>
        <button id="start-game-btn" class="btn btn-primary">🚀 开始共情之旅 →</button>
      </div>
    `;

    container.querySelectorAll('.mode-btn').forEach(b => b.onclick = () => {
      container.querySelectorAll('.mode-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      this.gameMode = b.dataset.mode;
    });
    container.querySelectorAll('.score-mode-btn').forEach(b => b.onclick = () => {
      container.querySelectorAll('.score-mode-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      this.scoreDisplayMode = b.dataset.score;
    });

    this.showScreen('setup-screen');
  }

  async beginGame() {
    if (!this.game) return;

    // 等待题库加载完成
    const scenarios = await this.loadScenarios();
    this.game.loadMockScenarios(scenarios);

    this.game.showScores = this.scoreDisplayMode === 'show';
    this.game.startBystanderPhase();
    this.showGameScreen();
    this.startScenario();
  }

  showGameScreen() {
    this.showScreen('game-screen');
    document.getElementById('game-theme-name').textContent = this.theme?.name || '';
    this.updatePhaseProgress();
    this.renderStats();
  }

  updatePhaseProgress() {
    if (!this.game) return;
    const { phase, bystanderRounds, totalBystanderRounds, currentRole } = this.game.getGameState();

    // 更新旁观者轮计数器
    const counter = document.getElementById('bystander-counter');
    if (counter) {
      counter.textContent = phase === 'bystander'
        ? `${bystanderRounds + 1}/${totalBystanderRounds}轮`
        : `${totalBystanderRounds}/${totalBystanderRounds}轮 ✅`;
    }

    // 高亮当前阶段
    ['phase-bystander','phase-protagonist','phase-report'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.remove('active','done','current');
      if (id === 'phase-bystander' && (phase === 'bystander' || phase === 'setup')) el.classList.add('active');
      if (id === 'phase-bystander' && phase !== 'bystander') el.classList.add('done');
      if (id === 'phase-protagonist') {
        if (phase === 'protagonist') el.classList.add('active','current');
        else if (phase === 'end') el.classList.add('done');
      }
      if (id === 'phase-report' && phase === 'end') el.classList.add('active','current');
    });

    // 更新当前阶段显示
    const stageEl = document.getElementById('current-stage');
    if (stageEl) {
      const stageInfo = this.game.getPhaseInfo();
      stageEl.textContent = stageInfo.name;
      stageEl.style.background = stageInfo.color;
    }

    const progressEl = document.getElementById('progress-text');
    if (progressEl) {
      progressEl.textContent = phase === 'bystander'
        ? `旁观者轮 ${bystanderRounds + 1}/${totalBystanderRounds}`
        : phase === 'protagonist'
        ? '💔 主角轮'
        : '';
    }
  }

  renderStats() {
    const panel = document.getElementById('stats-panel');
    if (!panel || !this.game) return;
    const state = this.game.getGameState();
    const { currentRole, roleStats } = state;
    const attrs = this.theme?.attributes || [];

    const myRole = currentRole;
    const myStats = roleStats[myRole?.id] || {};

    const attrHTML = attrs.map(a => {
      const val = myStats[a.id] ?? a.initial;
      const color = a.reverse ? this.valColorReverse(val) : this.valColor(val);
      return `
        <div class="stat-item">
          <div class="stat-header">
            <span>${a.icon}</span>
            <span class="stat-name">${a.name}</span>
            <span class="stat-val" style="color:${color}">${Math.round(val)}</span>
          </div>
          <div class="stat-bar-bg"><div class="stat-bar-fill" style="width:${a.reverse?val:val}%;background:${color}"></div></div>
        </div>`;
    }).join('');

    // 旁观者 vs 主角标识
    const perspectiveLabel = myRole?.isProtagonist
      ? '<span class="perspective-badge protagonist">💔 主角视角</span>'
      : '<span class="perspective-badge bystander">👁️ 旁观者视角</span>';

    panel.innerHTML = `
      <div class="stats-me">
        <div class="stats-me-header">
          <span class="stats-me-icon">${myRole?.icon || '?'}</span>
          <span class="stats-me-name">${myRole?.name || '未知角色'}</span>
        </div>
        ${perspectiveLabel}
        <div class="stats-attrs">${attrHTML}</div>
      </div>
      <div class="stats-other">
        <h4>📊 其他角色状态</h4>
        <div class="other-roles-grid">
          ${this.game.roles.filter(r => r.id !== myRole?.id).slice(0,4).map(r => {
            const rs = roleStats[r.id] || {};
            const attr0 = attrs[0];
            const v = rs[attr0?.id] ?? 50;
            return `<div class="other-role-mini">
              <span>${r.icon}</span>
              <span class="other-role-name">${r.name}</span>
              <span class="other-role-val" style="color:${this.valColor(v)}">${Math.round(v)}</span>
            </div>`;
          }).join('')}
        </div>
      </div>
    `;
  }

  valColor(v) {
    if (v >= 70) return '#27ae60';
    if (v >= 40) return '#f39c12';
    return '#e74c3c';
  }

  valColorReverse(v) {
    if (v <= 30) return '#27ae60';
    if (v <= 60) return '#f39c12';
    return '#e74c3c';
  }

  startScenario() {
    if (!this.game) return;
    const scenario = this.game.startScenario();
    if (!scenario) { this.showReport(); return; }
    this.renderScenario(scenario);
    this.renderStats();
    this.updatePhaseProgress();
  }

  // 视角转换：根据当前角色调整题目描述
  transformDescriptionForPerspective(description, currentRole, protagonist) {
    if (!currentRole || currentRole.isProtagonist) {
      // 主角视角：描述不变，"你" = 主角
      return description;
    }
    
    // 旁观者视角：将主角视角转换为第三人称视角
    // 核心规则：描述中的"你"指主角，需要转换为"她/他"
    
    const protagonistName = protagonist?.name || '主角';
    const protagonistPronoun = protagonist?.gender === 'male' ? '他' : '她';
    const protagonistTitle = protagonist?.gender === 'male' ? '他' : '她';
    
    // 分步替换，避免重复替换
    let transformed = description;
    
    // 1. 先替换特殊情况
    transformed = transformed.replace(/你自己/g, protagonistPronoun + '自己');
    transformed = transformed.replace(/你的/g, protagonistPronoun + '的');
    
    // 2. 替换独立的"你"字（不在其他词中）
    // 使用更宽松的正则，匹配"你"后面是标点、空格、换行或汉字（除了"们"）
    transformed = transformed.replace(/你(?![们])/g, protagonistPronoun);
    
    return transformed;
  }

  // 视角转换：调整选项文本
  transformOptionTextForPerspective(optionText, currentRole, protagonist) {
    if (!currentRole || currentRole.isProtagonist) {
      return optionText;
    }
    
    const protagonistPronoun = protagonist?.gender === 'male' ? '他' : '她';
    
    // 选项中的"你"也需要转换
    let transformed = optionText
      .replace(/你(?=[们了的是有在]|$)/g, protagonistPronoun)
      .replace(/你的/g, protagonistPronoun + '的');
    
    return transformed;
  }

  renderScenario(scenario) {
    const container = document.getElementById('scenario-container');
    const state = this.game.getGameState();
    
    // 检查是否是评价场景
    if (scenario.isEvaluation) {
      this.renderEvaluationScenario(scenario, state);
      return;
    }
    
    const isProtagonist = state.phase === 'protagonist' || state.currentRole?.isProtagonist;
    const protagonist = this.game.roles?.find(r => r.isProtagonist);
    const currentRole = state.currentRole;

    // 视角提示
    const perspectiveHint = isProtagonist
      ? '<div class="scenario-perspective-hint danger">💔 你是这个情景中的主角，做出你的选择</div>'
      : `<div class="scenario-perspective-hint info">👁️ 你是${currentRole?.name || '旁观者'}，观察${protagonist?.name || '主角'}的经历</div>`;

    // 根据视角转换描述
    const transformedDesc = this.transformDescriptionForPerspective(
      scenario.description, currentRole, protagonist
    );

    const optionsHTML = scenario.options.map((opt, idx) => {
      // 转换选项文本
      const transformedText = this.transformOptionTextForPerspective(
        opt.text, currentRole, protagonist
      );
      const labels = ['A', 'B', 'C', 'D'];
      let effectsHTML = '';

      if (this.scoreDisplayMode === 'show' && isProtagonist) {
        const selfRole = this.game.roles.find(r => r.id === 'self');
        const selfEffects = {};
        const attrs = this.theme?.attributes || [];
        attrs.forEach(a => {
          const key = `self_${a.id}`;
          const v = opt.effects?.[key] ?? 0;
          if (v !== 0) selfEffects[a.id] = v;
        });

        effectsHTML = Object.entries(selfEffects).map(([aid, val]) => {
          const a = attrs.find(x => x.id === aid);
          const cls = val > 0 ? 'positive' : 'negative';
          return `<span class="effect-tag ${cls}">${a?.icon || ''}${a?.name || aid} ${val > 0 ? '+' : ''}${val}</span>`;
        }).join('') || '<span class="effect-tag neutral">无直接变化</span>';
      }

      return `
        <button class="option-btn" data-option-id="${opt.id}">
          <div class="option-label">${labels[idx]}</div>
          <div class="option-content">
            <div class="option-text">${transformedText}</div>
            ${effectsHTML ? `<div class="option-effects">${effectsHTML}</div>` : ''}
          </div>
        </button>`;
    }).join('');

    container.innerHTML = `
      <div class="scenario-card">
        ${perspectiveHint}
        <div class="scenario-header">
          <span class="scenario-stage">${scenario.stage}</span>
          <span class="scenario-theme">${this.theme?.icon || ''} ${this.theme?.name || ''}</span>
        </div>
        <div class="scenario-title">${scenario.title}</div>
        <div class="scenario-desc">${transformedDesc}</div>
        <div class="options-list">${optionsHTML}</div>
      </div>
    `;
  }

  // 渲染旁观者评价场景
  renderEvaluationScenario(scenario, state) {
    const container = document.getElementById('scenario-container');
    const protagonist = this.game.roles?.find(r => r.isProtagonist);
    const currentRole = state.currentRole;
    const protagonistChoice = scenario.protagonistChoice;
    const originalScenario = scenario.scenario;

    // 评价进度
    const progress = state.evaluationProgress;
    const progressText = progress 
      ? `评价 ${progress.currentChoice + 1}/${progress.totalChoices} | 旁观者 ${progress.currentBystander + 1}/${progress.totalBystanders}`
      : '';

    // 主角的选择提示
    const protagonistHint = `
      <div class="protagonist-choice-box">
        <div class="protagonist-choice-label">🎭 ${protagonist?.name || '主角'}的选择：</div>
        <div class="protagonist-choice-text">"${protagonistChoice?.text || '未知选择'}"</div>
      </div>
    `;

    // 评价选项
    const optionsHTML = scenario.evaluationOptions.map((opt, idx) => {
      const labels = ['A', 'B', 'C', 'D'];
      const typeClass = {
        'positive': 'eval-positive',
        'neutral': 'eval-neutral',
        'concern': 'eval-concern',
        'negative': 'eval-negative'
      }[opt.type] || 'eval-neutral';

      return `
        <button class="option-btn eval-btn ${typeClass}" data-evaluation-id="${opt.id}">
          <div class="option-label">${labels[idx]}</div>
          <div class="option-content">
            <div class="option-text">${opt.text}</div>
            ${opt.description ? `<div class="option-desc">${opt.description}</div>` : ''}
          </div>
        </button>`;
    }).join('');

    container.innerHTML = `
      <div class="scenario-card evaluation-card">
        <div class="scenario-perspective-hint info">
          👁️ 你是${currentRole?.name || '旁观者'}，评价${protagonist?.name || '主角'}的选择
        </div>
        <div class="evaluation-progress">${progressText}</div>
        <div class="scenario-header">
          <span class="scenario-stage">${originalScenario.stage}</span>
          <span class="scenario-theme">${this.theme?.icon || ''} ${this.theme?.name || ''}</span>
        </div>
        <div class="scenario-title">${originalScenario.title}</div>
        <div class="scenario-desc">${originalScenario.description}</div>
        ${protagonistHint}
        <div class="evaluation-prompt">作为${currentRole?.name || '旁观者'}，你如何评价这个选择？</div>
        <div class="options-list">${optionsHTML}</div>
      </div>
    `;
  }

  async handleChoice(optionId) {
    document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
    const result = this.game.applyChoice(optionId);
    if (!result) return;
    this.showResultOverlay(result);
    await this.waitForAck();
    this.continueGame();
  }

  // 处理旁观者评价
  async handleEvaluation(evaluationId) {
    document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
    const result = this.game.applyBystanderEvaluation(evaluationId);
    if (!result) return;
    
    // 显示评价结果
    this.showEvaluationResult(result);
    await this.waitForAck();
    this.continueGame();
  }

  // 显示评价结果
  showEvaluationResult(result) {
    const overlay = document.getElementById('result-overlay');
    const attrs = this.theme?.attributes || [];
    
    const changesHTML = Object.entries(result.effects || {})
      .filter(([roleId, attrs]) => Object.values(attrs).some(v => v !== 0))
      .map(([roleId, attrs]) => {
        const role = this.game.roles?.find(r => r.id === roleId);
        const roleChanges = Object.entries(attrs)
          .filter(([_, v]) => v !== 0)
          .map(([attrId, val]) => {
            const attr = attrs.find(a => a.id === attrId);
            const cls = val > 0 ? 'positive' : 'negative';
            return `<span class="effect-tag ${cls}">${attr?.icon || ''}${attr?.name || attrId} ${val > 0 ? '+' : ''}${val}</span>`;
          }).join('');
        return `<div class="role-changes"><strong>${role?.name || roleId}</strong>: ${roleChanges}</div>`;
      }).join('');

    overlay.innerHTML = `
      <div class="result-card">
        <div class="result-title">评价已记录</div>
        ${changesHTML ? `<div class="result-effects">${changesHTML}</div>` : '<div class="result-effects neutral">评价已影响主角的属性</div>'}
        <div class="result-continue">点击继续...</div>
      </div>
    `;
    overlay.classList.add('active');
  }

  showResultOverlay(result) {
    const isProtagonist = this.game.phase === 'protagonist';
    const state = this.game.getGameState();
    const myRole = state.currentRole;
    const myEffects = result.effects[myRole?.id] || {};
    const attrs = this.theme?.attributes || [];

    const changesHTML = Object.entries(myEffects)
      .filter(([_, v]) => v !== 0)
      .map(([aid, val]) => {
        const a = attrs.find(x => x.id === aid);
        const cls = val > 0 ? 'positive' : 'negative';
        return `<div class="change-item ${cls}">
          <span>${a?.icon || ''}</span>
          <span>${a?.name || aid}</span>
          <span class="change-arrow">${val > 0 ? '+' : ''}${val}</span>
        </div>`;
      }).join('') || '<div class="change-item neutral">属性无变化</div>';

    // 旁观者视角模糊处理
    const visibleChanges = isProtagonist || this.scoreDisplayMode === 'show'
      ? `<div class="result-changes"><h4>📊 你的属性变化</h4>${changesHTML}</div>`
      : `<div class="result-hidden"><p>👁️ 旁观者视角：属性变化将在主角轮揭晓</p></div>`;

    // 共情感悟提示
    const empathyNote = state.phase === 'protagonist' && this.game.history.length > 0
      ? `<div class="empathy-note">💡 回想一下你旁观者轮做过的选择，现在感受是否不同？</div>`
      : '';

    const statusHTML = result.gameOver
      ? `<span class="status-death">💀 游戏结束</span>`
      : result.gameComplete || state.phase === 'end'
      ? `<span class="status-win">🏆 共情完成</span>`
      : `<span class="status-ok">✅ 继续</span>`;

    const overlay = document.createElement('div');
    overlay.id = 'result-overlay';
    overlay.innerHTML = `
      <div class="result-card">
        <h3>🎯 ${myRole?.isProtagonist ? '💔 主角视角' : '👁️ 旁观者视角'}</h3>
        <div class="result-option">「${result.option.text}」</div>
        ${visibleChanges}
        ${empathyNote}
        <div class="result-status">${statusHTML}</div>
        <button id="continue-btn" class="btn btn-primary">继续 →</button>
      </div>`;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('visible'), 50);
  }

  waitForAck() {
    return new Promise(r => { this._ack = r; });
  }

  ackAndContinue() {
    if (this._ack) { this._ack(); this._ack = null; }
    const o = document.getElementById('result-overlay');
    if (o) { o.classList.remove('visible'); setTimeout(() => o.remove(), 300); }
  }

  continueGame() {
    if (!this.game) return;
    if (this.game.gameOver || this.game.gameComplete || this.game.phase === 'end') {
      this.showReport(); return;
    }
    if (this.game.phase === 'bystander') {
      this.game.advanceBystanderRound();
    }
    this.startScenario();
  }

  toggleScores() {
    this.scoreDisplayMode = this.scoreDisplayMode === 'show' ? 'hide' : 'show';
    if (this.game) this.game.showScores = this.scoreDisplayMode === 'show';
    const btn = document.getElementById('toggle-scores-btn');
    if (btn) btn.textContent = this.scoreDisplayMode === 'show' ? '🎭 隐藏效果' : '👁️ 显示效果';
  }

  showReport() {
    this.showScreen('report-screen');
    const container = document.getElementById('report-container');
    const report = this.game.generateReport();
    const history = this.game.history;

    const bystanderChoices = history.filter(h => h.phase === 'bystander');
    const protagonistChoices = history.filter(h => h.phase === 'protagonist');

    // 共情分析
    const empathyAnalysis = this.generateEmpathyAnalysis(bystanderChoices, protagonistChoices);

    container.innerHTML = `
      <div class="report-header">
        <h2>📋 共情复盘报告</h2>
        <div class="report-theme">${this.theme?.icon || ''} ${this.theme?.name || ''}</div>
      </div>

      <div class="report-section empathy-journey">
        <h3>🗺️ 共情之旅</h3>
        <div class="journey-stats">
          <div class="journey-stat">
            <span class="journey-num">${bystanderChoices.length}</span>
            <span class="journey-label">旁观者轮选择</span>
            <span class="journey-sub">理解了 ${bystanderChoices.length} 个情景中各方的立场</span>
          </div>
          <div class="journey-stat danger">
            <span class="journey-num">${protagonistChoices.length}</span>
            <span class="journey-label">主角轮选择</span>
            <span class="journey-sub">以当事人身份体验了 ${protagonistChoices.length} 个情景</span>
          </div>
          <div class="journey-stat insight">
            <span class="journey-num">💡</span>
            <span class="journey-label">认知差距</span>
            <span class="journey-sub">旁观者感受 ${bystanderChoices.length > 0 ? '浅层的、局部的' : '—'} vs 主角体验完整痛苦</span>
          </div>
        </div>
      </div>

      <div class="report-section empathy-insights">
        <h3>🧠 共情洞察</h3>
        <div class="insights-content">${empathyAnalysis}</div>
      </div>

      <div class="report-section">
        <h3>📜 旁观者轮记录（${bystanderChoices.length}轮）</h3>
        <div class="choice-timeline">
          ${bystanderChoices.map((h, i) => `
            <div class="timeline-item bystander">
              <div class="timeline-marker">${i+1}</div>
              <div class="timeline-content">
                <div class="timeline-meta">
                  <span class="timeline-role">${h.roleIcon} ${h.roleName}</span>
                  <span class="timeline-stage">${h.scenarioStage}</span>
                </div>
                <div class="timeline-scenario">${h.scenarioTitle}</div>
                <div class="timeline-choice">→ ${h.optionText}</div>
              </div>
            </div>`).join('')}
        </div>
      </div>

      <div class="report-section protagonist-section">
        <h3>💔 主角轮记录（${protagonistChoices.length}轮）</h3>
        ${protagonistChoices.length === 0 ? '<p class="no-protagonist">主角轮尚未开始</p>' : `
        <div class="choice-timeline">
          ${protagonistChoices.map((h, i) => `
            <div class="timeline-item protagonist">
              <div class="timeline-marker">💔</div>
              <div class="timeline-content">
                <div class="timeline-meta">
                  <span class="timeline-role">${h.roleIcon} ${h.roleName}</span>
                  <span class="timeline-stage">${h.scenarioStage}</span>
                </div>
                <div class="timeline-scenario">${h.scenarioTitle}</div>
                <div class="timeline-choice">→ ${h.optionText}</div>
              </div>
            </div>`).join('')}
        </div>
        `}
      </div>

      <div class="report-section ai-analysis">
        <h3>🤖 AI 深度分析</h3>
        <div class="ai-content">${this.generateAIAdvice()}</div>
      </div>

      <div class="report-actions">
        <button id="restart-btn" class="btn btn-primary">🔄 再来一局</button>
        <button id="back-menu-btn" class="btn btn-secondary">← 返回主题</button>
      </div>
    `;

    this.updatePhaseProgress();
  }

  generateEmpathyAnalysis(bystanderChoices, protagonistChoices) {
    const bystanderThemes = bystanderChoices.map(h => h.scenarioTitle).slice(0, 3);
    const protagonistTheme = protagonistChoices[0]?.scenarioTitle || '';

    return `
      <div class="empathy-gap">
        <h4>📌 共情鸿沟分析</h4>
        <p>你在旁观者轮体验了以下情景：</p>
        <ul>
          ${bystanderThemes.map(t => `<li>「${t}」</li>`).join('')}
        </ul>
        ${protagonistTheme ? `<p>当你切换到主角视角体验「${protagonistTheme}」时，你是否感受到了完全不同的重量？</p>` : ''}
        <p class="empathy-conclusion">旁观者看到的是表面，<strong>主角经历的是切肤之痛</strong>。这就是为什么真正的共情，需要想象力，也需要勇气。</p>
      </div>

      <div class="perspective-reflection">
        <h4>🔍 反思问题</h4>
        <ul>
          <li>旁观时，你觉得哪个选择最"合理"？主角体验时，感受是否相同？</li>
          <li>旁观者轮你关注的是谁的利益？主角轮你关注的是谁？</li>
          <li>这种视角转换，让你对类似情境中的当事人产生了什么新的理解？</li>
        </ul>
      </div>
    `;
  }

  generateAIAdvice() {
    const theme = this.selectedThemeId;
    const advices = {
      bullying: {
        title: '关于霸凌',
        points: [
          '被霸凌不是你的错。那些旁观者的沉默、霸凌者的嚣张，都不是你的问题。',
          '求助是需要勇气的。你的沉默不是因为软弱，而是因为曾经求助的尝试没有被好好回应。',
          '如果你身边有人正在被霸凌，你的存在和表态很重要。有时候一句"我看到了"就能改变很多。'
        ]
      },
      depression: {
        title: '关于抑郁',
        points: [
          '"振作起来"是最没用的话。抑郁不是选择，而是真实的状态。你不需要为自己的情绪道歉。',
          '寻求专业帮助不是软弱。就像感冒需要看医生一样，心理也需要专业的支持。',
          '身边的人可能不知道如何帮助你。主动说出你需要什么，哪怕是"陪我坐一会儿"这样简单的要求。'
        ]
      },
      general: {
        title: '关于女性困境',
        points: [
          '你的价值不取决于你对别人的有用程度，也不取决于别人怎么评价你。',
          '"女孩子应该..."这句话不应该限制你的人生选择。',
          '求助和支持网络很重要。不要独自承担所有的压力。'
        ]
      },
      schizophrenia: {
        title: '关于精神健康',
        points: [
          '精神疾病和身体疾病一样，都是身体功能的问题，不需要羞耻。',
          '坚持治疗很重要，但也要和医生沟通药物的副作用，找到适合自己的方案。',
          '社会对精神疾病的偏见仍然存在。寻求理解你的人，而不是强迫每个人都懂你。'
        ]
      }
    };

    const advice = advices[theme] || advices['general'];
    return `
      <div class="advice-section">
        <h4>${advice.title}</h4>
        <ul class="advice-list">
          ${advice.points.map(p => `<li>${p}</li>`).join('')}
        </ul>
      </div>
      <div class="general-advice">
        <h4>给所有玩家的话</h4>
        <p>共情不是天赋，而是练习。希望这个游戏让你对生活中的"弱者"多了几分理解和温柔。</p>
      </div>
    `;
  }
}

window.UIManager = UIManager;
