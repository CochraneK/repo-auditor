/**
 * 游戏核心引擎 - v2.0
 * 支持：多角色、多选项、显示/隐藏分数、多人模式、复盘报告
 */

class GameCore {
  constructor(themeData) {
    this.theme = themeData;
    this.attributes = themeData.attributes || [];
    this.roles = themeData.roles || [];
    this.stages = themeData.stages || ["童年", "少年", "青年", "中年", "老年"];
    this.scenarios = {};
    this.usedScenarioIds = new Set();
    this.currentStageIndex = 0;
    this.currentScenario = null;
    this.gameOver = false;
    this.gameComplete = false;
    this.overReason = "";
    this.history = []; // 所有选择记录
    this.showScores = true; // 是否显示分数变化
    this.gameMode = 'solo'; // 'solo' | 'multi'
    this.currentPlayer = 'self'; // 当前玩家视角
    this.roleStats = {}; // 各角色独立属性
    
    this.initRoleStats();
  }

  initRoleStats() {
    this.roles.forEach(role => {
      this.roleStats[role.id] = { ...role.initialStats };
    });
  }

  getAgeGroups() {
    return this.stages;
  }

  getCurrentStage() {
    return this.stages[this.currentStageIndex] || "童年";
  }

  setScenarios(stage, scenarioList) {
    this.scenarios[stage] = scenarioList;
  }

  loadMockScenarios(mockData) {
    // 将 mock 数据按阶段分类
    const stageMap = {
      "童年": [],
      "少年": [],
      "青年": [],
      "中年": [],
      "老年": []
    };
    
    mockData.forEach(item => {
      const stage = item.stage || "童年";
      if (stageMap[stage]) {
        stageMap[stage].push(item);
      }
    });
    
    Object.keys(stageMap).forEach(stage => {
      this.setScenarios(stage, stageMap[stage]);
    });
  }

  // 获取当前阶段可用的情景
  getAvailableScenarios() {
    const stage = this.getCurrentStage();
    const scenarios = this.scenarios[stage] || [];
    return scenarios.filter(s => !this.usedScenarioIds.has(s.id));
  }

  // 随机获取一个情景
  getRandomScenario() {
    const available = this.getAvailableScenarios();
    if (available.length === 0) {
      return null;
    }
    // 随机但倾向选择未用过的
    const idx = Math.floor(Math.random() * available.length);
    return available[idx];
  }

  // 开始新情景
  startScenario() {
    if (this.gameOver || this.gameComplete) return null;
    
    const scenario = this.getRandomScenario();
    if (!scenario) {
      // 当前阶段没有可用情景，尝试进入下一阶段
      if (this.currentStageIndex < this.stages.length - 1) {
        this.currentStageIndex++;
        return this.startScenario();
      } else {
        // 所有阶段完成
        this.gameComplete = true;
        return null;
      }
    }
    
    this.usedScenarioIds.add(scenario.id);
    this.currentScenario = scenario;
    return scenario;
  }

  // 应用选择 - 返回各角色属性变化
  applyChoice(optionId, voterId = 'self') {
    if (!this.currentScenario) return null;
    
    const option = this.currentScenario.options.find(o => o.id === optionId);
    if (!option) return null;

    const statsBefore = JSON.parse(JSON.stringify(this.roleStats));
    const changes = {}; // 各角色各属性的变化
    
    // 计算每个角色的属性变化
    this.roles.forEach(role => {
      changes[role.id] = {};
      this.attributes.forEach(attr => {
        const effectKey = `${role.id}_${attr.id}`;
        const change = option.effects?.[effectKey] || 0;
        changes[role.id][attr.id] = change;
        this.roleStats[role.id][attr.id] += change;
        // 边界处理
        if (attr.reverse) {
          // 反向属性（压力类）
          this.roleStats[role.id][attr.id] = Math.max(0, Math.min(100, this.roleStats[role.id][attr.id]));
        } else {
          this.roleStats[role.id][attr.id] = Math.max(0, Math.min(100, this.roleStats[role.id][attr.id]));
        }
      });
    });

    // 记录历史
    this.history.push({
      stage: this.getCurrentStage(),
      scenarioId: this.currentScenario.id,
      scenarioTitle: this.currentScenario.title,
      optionId: optionId,
      optionText: option.text,
      voterId: voterId,
      statsBefore: statsBefore,
      statsAfter: JSON.parse(JSON.stringify(this.roleStats)),
      changes: changes,
      timestamp: Date.now()
    });

    // 检查游戏结束条件
    this.checkGameOver();
    
    // 检查是否进入下一阶段
    this.checkStageAdvance();

    return {
      option: option,
      changes: changes,
      statsBefore: statsBefore,
      statsAfter: JSON.parse(JSON.stringify(this.roleStats)),
      gameOver: this.gameOver,
      gameComplete: this.gameComplete,
      stageComplete: this.currentScenario && 
        this.getAvailableScenarios().length === 0 && 
        this.currentStageIndex < this.stages.length - 1
    };
  }

  // 检查游戏结束
  checkGameOver() {
    // 检查所有角色的任一属性是否归零/满值
    for (const roleId in this.roleStats) {
      const stats = this.roleStats[roleId];
      const role = this.roles.find(r => r.id === roleId);
      
      for (const attrId in stats) {
        const attr = this.attributes.find(a => a.id === attrId);
        const val = stats[attrId];
        
        if (attr.reverse) {
          // 反向属性（压力类）
          if (val >= attr.deathAt) {
            this.gameOver = true;
            this.overReason = `${role.name}的${attr.name}达到${val}，游戏结束`;
            return;
          }
        } else {
          if (val <= attr.deathAt) {
            this.gameOver = true;
            this.overReason = `${role.name}的${attr.name}降至${val}，游戏结束`;
            return;
          }
        }
      }
    }
  }

  // 检查是否进入下一阶段
  checkStageAdvance() {
    const available = this.getAvailableScenarios();
    if (available.length === 0 && this.currentStageIndex < this.stages.length - 1) {
      this.currentStageIndex++;
    }
  }

  // 获取游戏状态
  getGameState() {
    return {
      currentStage: this.getCurrentStage(),
      stageIndex: this.currentStageIndex,
      totalStages: this.stages.length,
      roleStats: this.roleStats,
      usedCount: this.usedScenarioIds.size,
      gameOver: this.gameOver,
      gameComplete: this.gameComplete,
      overReason: this.overReason,
      historyLength: this.history.length
    };
  }

  // 切换分数显示模式
  toggleScoreDisplay() {
    this.showScores = !this.showScores;
    return this.showScores;
  }

  // 设置游戏模式
  setGameMode(mode) {
    this.gameMode = mode; // 'solo' | 'multi'
  }

  // 设置当前玩家视角
  setCurrentPlayer(playerId) {
    if (this.roles.find(r => r.id === playerId)) {
      this.currentPlayer = playerId;
    }
  }

  // 生成复盘报告数据
  generateReport() {
    const report = {
      theme: this.theme.name,
      totalScenarios: this.history.length,
      stages: {},
      roleAnalysis: {},
      keyDecisions: [],
      aiSuggestions: ""
    };

    // 按阶段统计
    this.stages.forEach(stage => {
      const stageHistory = this.history.filter(h => h.stage === stage);
      report.stages[stage] = {
        count: stageHistory.length,
        options: stageHistory.map(h => h.optionText)
      };
    });

    // 各角色分析
    this.roles.forEach(role => {
      const roleHistory = this.history.filter(h => h.voterId === role.id || h.voterId === 'self');
      const startStats = roleHistory[0]?.statsBefore?.[role.id] || role.initialStats;
      const endStats = this.roleStats[role.id];
      
      const changes = {};
      this.attributes.forEach(attr => {
        changes[attr.id] = {
          start: startStats[attr.id],
          end: endStats[attr.id],
          change: endStats[attr.id] - startStats[attr.id]
        };
      });

      report.roleAnalysis[role.id] = {
        name: role.name,
        guardian: role.guardian,
        changes: changes,
        decisions: roleHistory.map(h => ({
          scenario: h.scenarioTitle,
          choice: h.optionText
        }))
      };
    });

    // 关键决策
    const criticalDecisions = this.history.filter((h, idx) => {
      // 属性变化超过15的决策
      for (const roleId in h.changes) {
        for (const attrId in h.changes[roleId]) {
          if (Math.abs(h.changes[roleId][attrId]) >= 15) {
            return true;
          }
        }
      }
      return false;
    });
    report.keyDecisions = criticalDecisions.map(h => ({
      stage: h.stage,
      scenario: h.scenarioTitle,
      choice: h.optionText
    }));

    return report;
  }

  // 重置游戏
  reset() {
    this.usedScenarioIds.clear();
    this.currentStageIndex = 0;
    this.currentScenario = null;
    this.gameOver = false;
    this.gameComplete = false;
    this.overReason = "";
    this.history = [];
    this.initRoleStats();
  }
}

// 导出
window.GameCore = GameCore;