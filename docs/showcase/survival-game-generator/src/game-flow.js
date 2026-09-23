/**
 * 游戏流程引擎 - v4.0
 * 核心设计：主角视角(先做选择) → 旁观者视角(评价主角选择) = 真正的共情机制
 */

class GameFlow {
  constructor(themeData) {
    this.theme = themeData;
    this.attributes = themeData.attributes || [];
    this.roles = themeData.roles || [];
    this.stages = themeData.stages || ["童年", "少年", "青年", "中年", "老年"];
    this.scenarios = {};
    this.usedScenarioIds = new Set();
    this.history = [];

    // === v4.0 新设计：游戏流程 ===
    this.phase = 'setup';        // setup | protagonist | bystander_evaluation | end
    this.currentRole = null;     // 当前扮演的角色
    this.currentScenario = null;
    this.gameOver = false;
    this.gameComplete = false;
    this.overReason = "";
    this.showScores = true;
    this.gameMode = 'solo';
    
    // 主角选择记录（用于旁观者评价）
    this.protagonistChoices = [];  // 主角做出的所有选择
    this.currentEvaluationIndex = 0;  // 当前评价的主角选择索引
    this.evaluationBystanderIndex = 0;  // 当前旁观者索引
    this.evaluationRound = 0;  // 评价轮次
    
    // 旁观者角色池（不含主角自己）
    this.bystanderRoles = this.roles.filter(r => !r.isProtagonist);
    // 主角角色池
    this.protagonistRoles = this.roles.filter(r => r.isProtagonist);
    
    this.roleStats = {};
    this.initRoleStats();
  }

  initRoleStats() {
    this.roles.forEach(role => {
      this.roleStats[role.id] = { ...role.initialStats };
    });
  }

  getCurrentPhase() {
    return this.phase;
  }

  getPhaseInfo() {
    const phaseLabels = {
      'setup': { name: '角色选择', icon: '🎭', color: '#7c5cbf' },
      'protagonist': { name: '主角视角 - 做出选择', icon: '💔', color: '#e74c3c' },
      'bystander_evaluation': { name: `旁观者评价 (${this.evaluationBystanderIndex + 1}/${this.bystanderRoles.length}人)`, icon: '👁️', color: '#3498db' },
      'end': { name: '复盘总结', icon: '📋', color: '#27ae60' }
    };
    return phaseLabels[this.phase] || phaseLabels['setup'];
  }

  // === 流程控制 ===

  // 开始主角轮（先让主角做选择）
  startProtagonistPhase() {
    this.phase = 'protagonist';
    this.protagonistChoices = [];  // 清空主角选择记录
    this.currentRole = this.protagonistRoles[0] || this.roles.find(r => r.isProtagonist) || this.roles[0];
    return this.currentRole;
  }

  // 开始旁观者评价轮（主角完成后）
  startBystanderEvaluationPhase() {
    if (this.protagonistChoices.length === 0) {
      // 主角没有做出任何选择，直接结束
      this.phase = 'end';
      this.gameComplete = true;
      return null;
    }
    
    this.phase = 'bystander_evaluation';
    this.evaluationBystanderIndex = 0;
    this.currentEvaluationIndex = 0;
    this.evaluationRound = 0;
    this.currentRole = this.bystanderRoles[0];
    return this.currentRole;
  }

  // 切换到下一个旁观者
  advanceToNextBystander() {
    this.evaluationBystanderIndex++;
    if (this.evaluationBystanderIndex >= this.bystanderRoles.length) {
      // 所有旁观者都评价完了，游戏结束
      this.phase = 'end';
      this.gameComplete = true;
      return null;
    }
    this.currentRole = this.bystanderRoles[this.evaluationBystanderIndex];
    this.currentEvaluationIndex = 0;  // 从第一个主角选择开始
    return this.currentRole;
  }

  // 获取当前要评价的主角选择
  getCurrentProtagonistChoice() {
    if (this.phase !== 'bystander_evaluation') return null;
    if (this.currentEvaluationIndex >= this.protagonistChoices.length) return null;
    return this.protagonistChoices[this.currentEvaluationIndex];
  }

  // 旁观者评价完当前选择，进入下一个
  advanceEvaluation() {
    this.currentEvaluationIndex++;
    if (this.currentEvaluationIndex >= this.protagonistChoices.length) {
      // 当前旁观者评价完所有主角选择，切换到下一个旁观者
      return this.advanceToNextBystander();
    }
    return this.currentRole;
  }

  // 生成旁观者评价选项
  generateEvaluationOptions() {
    const choice = this.getCurrentProtagonistChoice();
    if (!choice) return [];
    
    const scenario = choice.scenario;
    const protagonistOption = choice.option;
    
    // 基础评价选项
    const baseOptions = [
      {
        id: 'eval_support',
        text: '支持这个选择',
        type: 'positive',
        description: '认为这是一个好的选择'
      },
      {
        id: 'eval_understand',
        text: '理解这个选择',
        type: 'neutral',
        description: '虽然不一定认同，但能理解'
      },
      {
        id: 'eval_worry',
        text: '对此担忧',
        type: 'concern',
        description: '担心这个选择会带来问题'
      },
      {
        id: 'eval_oppose',
        text: '反对这个选择',
        type: 'negative',
        description: '认为这不是一个好的选择'
      }
    ];
    
    return baseOptions;
  }

  // 应用旁观者评价
  applyEvaluation(evaluationId) {
    const choice = this.getCurrentProtagonistChoice();
    if (!choice) return null;
    
    // 评价对属性的影响（比主角直接选择的影响小）
    const EVALUATION_MULTIPLIER = 0.3;
    
    const statsBefore = JSON.parse(JSON.stringify(this.roleStats));
    const effects = {};
    
    // 基于评价类型计算影响
    const evaluationEffects = {
      'eval_support': { selfEsteem: 5, stress: -3 },
      'eval_understand': { selfEsteem: 2 },
      'eval_worry': { selfEsteem: -2, stress: 5 },
      'eval_oppose': { selfEsteem: -5, stress: 8 }
    };
    
    const evalEffect = evaluationEffects[evaluationId] || {};
    
    // 应用到主角属性
    this.roles.forEach(role => {
      effects[role.id] = {};
      this.attributes.forEach(attr => {
        let change = 0;
        if (role.isProtagonist && evalEffect[attr.id]) {
          change = Math.round(evalEffect[attr.id] * EVALUATION_MULTIPLIER);
        }
        effects[role.id][attr.id] = change;
        this.roleStats[role.id][attr.id] = Math.max(0, Math.min(100, this.roleStats[role.id][attr.id] + change));
      });
    });
    
    // 记录评价历史
    this.history.push({
      phase: 'bystander_evaluation',
      roleId: this.currentRole.id,
      roleName: this.currentRole.name,
      scenarioId: choice.scenario.id,
      scenarioTitle: choice.scenario.title,
      protagonistChoice: choice.option.text,
      evaluationId,
      evaluationText: this.generateEvaluationOptions().find(o => o.id === evaluationId)?.text || evaluationId,
      statsBefore,
      statsAfter: JSON.parse(JSON.stringify(this.roleStats)),
      effects,
      timestamp: Date.now()
    });
    
    // 检查游戏结束
    this.checkGameOver();
    
    return {
      evaluationId,
      effects,
      statsBefore,
      statsAfter: JSON.parse(JSON.stringify(this.roleStats)),
      gameOver: this.gameOver
    };
  }

  // 兼容旧接口：开始旁观者轮（现在改为开始主角轮）
  startBystanderPhase() {
    // 为了兼容性，现在直接开始主角轮
    this.startProtagonistPhase();
  }

  // 加载题库
  loadMockScenarios(mockData) {
    const stageMap = {};
    this.stages.forEach(s => stageMap[s] = []);
    
    mockData.forEach(item => {
      const stage = item.stage || this.stages[0];
      if (stageMap[stage]) {
        stageMap[stage].push(item);
      }
    });
    
    this.stages.forEach(stage => {
      this.scenarios[stage] = stageMap[stage] || [];
    });
  }

  getAvailableScenarios() {
    // 主角轮：从所有阶段获取未使用的题目
    let all = [];
    for (const stage of this.stages) {
      const available = (this.scenarios[stage] || [])
        .filter(s => !this.usedScenarioIds.has(s.id));
      all = all.concat(available);
    }
    return all;
  }

  getRandomScenario() {
    const available = this.getAvailableScenarios();
    if (available.length === 0) return null;
    const idx = Math.floor(Math.random() * available.length);
    return available[idx];
  }

  startScenario() {
    if (this.gameOver || this.gameComplete) return null;
    
    // 旁观者评价阶段：返回当前要评价的主角选择
    if (this.phase === 'bystander_evaluation') {
      const choice = this.getCurrentProtagonistChoice();
      if (!choice) {
        // 没有更多选择需要评价
        this.advanceEvaluation();
        return this.startScenario();
      }
      // 返回一个特殊的"评价场景"对象
      return {
        isEvaluation: true,
        scenario: choice.scenario,
        protagonistChoice: choice.option,
        evaluationOptions: this.generateEvaluationOptions()
      };
    }
    
    // 主角阶段：获取新题目
    const scenario = this.getRandomScenario();
    if (!scenario) {
      // 主角轮结束，进入旁观者评价阶段
      this.startBystanderEvaluationPhase();
      return this.startScenario();
    }

    this.usedScenarioIds.add(scenario.id);
    this.currentScenario = scenario;
    return scenario;
  }

  // === 选择处理 ===

  applyChoice(optionId) {
    if (!this.currentScenario) return null;

    const option = this.currentScenario.options.find(o => o.id === optionId);
    if (!option) return null;

    const statsBefore = JSON.parse(JSON.stringify(this.roleStats));
    
    // 主角视角：完整效果
    const effects = this.computeEffects(option, statsBefore);
    
    // 应用效果
    this.roles.forEach(role => {
      this.attributes.forEach(attr => {
        const change = effects[role.id]?.[attr.id] || 0;
        this.roleStats[role.id][attr.id] = Math.max(0, Math.min(100, this.roleStats[role.id][attr.id] + change));
      });
    });

    // 记录主角选择（用于旁观者评价）
    if (this.phase === 'protagonist') {
      this.protagonistChoices.push({
        scenario: this.currentScenario,
        option: option,
        effects: effects,
        timestamp: Date.now()
      });
    }

    // 记录历史
    this.history.push({
      phase: this.phase,
      roleId: this.currentRole.id,
      roleName: this.currentRole.name,
      roleIcon: this.currentRole.icon,
      scenarioId: this.currentScenario.id,
      scenarioTitle: this.currentScenario.title,
      scenarioStage: this.currentScenario.stage,
      optionId,
      optionText: option.text,
      statsBefore,
      statsAfter: JSON.parse(JSON.stringify(this.roleStats)),
      effects,
      timestamp: Date.now()
    });

    // 检查游戏结束
    this.checkGameOver();
    
    return {
      option,
      effects,
      statsBefore,
      statsAfter: JSON.parse(JSON.stringify(this.roleStats)),
      gameOver: this.gameOver,
      gameComplete: this.gameComplete,
      phase: this.phase
    };
  }

  // 处理旁观者评价
  applyBystanderEvaluation(evaluationId) {
    const result = this.applyEvaluation(evaluationId);
    if (result) {
      // 评价完成后，进入下一个评价
      this.advanceEvaluation();
    }
    return result;
  }

  // 根据视角计算效果
  // 新设计：主角视角为主，旁观者评价影响较小
  computeEffects(option, statsBefore) {
    const baseEffects = option.effects || {};
    const effects = {};

    // 主角视角：完整效果（100%）
    this.roles.forEach(role => {
      effects[role.id] = {};
      this.attributes.forEach(attr => {
        // 支持两种格式：roleId_attrId 或 self_attrId
        const baseChange = baseEffects[`${role.id}_${attr.id}`] || 
                          baseEffects[`self_${attr.id}`] || 0;
        effects[role.id][attr.id] = baseChange;
      });
    });

    return effects;
  }

  checkGameOver() {
    for (const roleId in this.roleStats) {
      const stats = this.roleStats[roleId];
      for (const attrId in stats) {
        const attr = this.attributes.find(a => a.id === attrId);
        const val = stats[attrId];
        if (attr.reverse) {
          if (val >= attr.deathAt) {
            this.gameOver = true;
            this.overReason = `${this.roles.find(r=>r.id===roleId)?.name}的${attr.name}达到${val}，游戏结束`;
            return;
          }
        } else {
          if (val <= attr.deathAt) {
            this.gameOver = true;
            this.overReason = `${this.roles.find(r=>r.id===roleId)?.name}的${attr.name}降至${val}，游戏结束`;
            return;
          }
        }
      }
    }
  }

  getGameState() {
    return {
      phase: this.phase,
      phaseInfo: this.getPhaseInfo(),
      currentRole: this.currentRole,
      roleStats: this.roleStats,
      historyLength: this.history.length,
      gameOver: this.gameOver,
      gameComplete: this.gameComplete,
      // 新增：主角选择数量
      protagonistChoicesCount: this.protagonistChoices.length,
      // 新增：当前评价进度
      evaluationProgress: this.phase === 'bystander_evaluation' ? {
        currentChoice: this.currentEvaluationIndex,
        totalChoices: this.protagonistChoices.length,
        currentBystander: this.evaluationBystanderIndex,
        totalBystanders: this.bystanderRoles.length
      } : null
    };
  }

  generateReport() {
    const protagonistHistory = this.history.filter(h => h.phase === 'protagonist');
    const evaluationHistory = this.history.filter(h => h.phase === 'bystander_evaluation');

    return {
      theme: this.theme.name,
      totalRounds: this.history.length,
      protagonistChoices: protagonistHistory.length,
      evaluations: evaluationHistory.length,
      protagonistDecisions: protagonistHistory.map(h => ({
        scenario: h.scenarioTitle,
        choice: h.optionText,
        stage: h.scenarioStage
      })),
      bystanderEvaluations: this.bystanderRoles.map(role => {
        const roleEvals = evaluationHistory.filter(h => h.roleId === role.id);
        return {
          role: role.name,
          evaluations: roleEvals.map(e => ({
            scenario: e.scenarioTitle,
            protagonistChoice: e.protagonistChoice,
            evaluation: e.evaluationText
          }))
        };
      }),
      empathyAnalysis: {
        totalChoices: protagonistHistory.length,
        totalEvaluations: evaluationHistory.length,
        insights: [
          '主角先做出了选择，体验了真实的处境',
          '旁观者从各自的视角评价了主角的选择',
          '这种顺序让旁观者能够"看到"主角的决定，而非凭空猜测',
          '真正的共情是理解他人的选择，而非替他人做选择'
        ]
      }
    };
  }

  reset() {
    this.usedScenarioIds.clear();
    this.history = [];
    this.phase = 'setup';
    this.currentRole = null;
    this.currentScenario = null;
    this.gameOver = false;
    this.gameComplete = false;
    this.overReason = "";
    this.protagonistChoices = [];
    this.currentEvaluationIndex = 0;
    this.evaluationBystanderIndex = 0;
    this.evaluationRound = 0;
    this.initRoleStats();
  }
}

if (typeof window !== 'undefined') {
  window.GameFlow = GameFlow;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameFlow;
}
