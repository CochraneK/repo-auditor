/**
 * ai-client.js — AI 客户端
 * 
 * 单人模式下，AI 作为裁判和旁白：
 * 1. 在每道题前叙述背景（基于主题）
 * 2. 玩家做出选择后，AI 给出点评和叙述
 * 3. 可以生成额外的扩展题目
 */

class AIClient {
  constructor(apiBaseUrl = '') {
    this.apiBaseUrl = apiBaseUrl;
    this.apiKey = '';
  }

  setApiKey(key) {
    this.apiKey = key;
  }

  // 调用本地后端或直接 AI API
  async _request(prompt, systemPrompt) {
    const apiKey = this.apiKey || document.getElementById('api-key-input')?.value || '';
    
    // 如果没有 API Key，使用模拟 AI 回复
    if (!apiKey) {
      return this._mockAI(prompt, systemPrompt);
    }

    try {
      const resp = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, systemPrompt, apiKey })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'API 错误');
      return data.reply;
    } catch (e) {
      console.warn('AI 请求失败，使用模拟回复:', e.message);
      return this._mockAI(prompt, systemPrompt);
    }
  }

  // 生成题目叙事（单人模式下，AI 在显示题目前的铺垫）
  async narrateScenario(scenario, themeName, playerRole) {
    const system = `你是《王智慧生存游戏》中的旁白 AI。你的任务是用温暖细腻的笔触，为每个生活困境铺垫氛围。

要求：
- 用第二人称"你"来叙述（代入主角视角）
- 150-250字左右
- 情感细腻，但不过度渲染
- 结尾引出问题，但不透露选项`;

    const prompt = `请为以下场景写一段叙事铺垫：

主题：${themeName}
年龄段：${scenario.ageGroup || '未知'}
场景：${scenario.title}
背景描述：${scenario.description}

请用细腻的笔触描写这个场景，让玩家感受到主角的处境。注意：你不需要重复场景描述中的内容，而是要补充情感和氛围。`;

    return this._request(prompt, system);
  }

  // 点评选择（单人模式）
  async judgeChoice(scenario, chosenOption, oldStats, newStats, themeName) {
    const system = `你是《王智慧生存游戏》中的裁判 AI。你需要为玩家的选择给出温和而有深度的点评。

要求：
- 150-200字
- 先肯定选择的合理性和出发点
- 再分析可能带来的后果
- 联系真实生活，给出有启发性的思考
- 语言温暖，不要说教`;

    const attrChanges = Object.entries(newStats)
      .filter(([k, v]) => oldStats[k] !== v)
      .map(([k, v]) => {
        const names = { selfEsteem: '自尊心', social: '社交性', sensitivity: '感受性', compliance: '顺应性', stress: '压力值' };
        const diff = v - oldStats[k];
        const sign = diff > 0 ? '↑' : '↓';
        return `${names[k] || k} ${sign}${Math.abs(diff)}（${oldStats[k]} → ${v}）`;
      }).join('、');

    const prompt = `请点评以下游戏选择：

游戏主题：${themeName}
场景标题：${scenario.title}
选项："${chosenOption.text}"
数值变化：${attrChanges}

请从心理学视角，温和地分析这个选择对主角的影响，以及它在现实生活中的映照。`;

    return this._request(prompt, system);
  }

  // 扩展题目
  async expandScenarios(themeName, ageGroup, count = 5) {
    try {
      const resp = await fetch('/api/expand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: 'general', ageGroup, count, apiKey: this.apiKey })
      });
      const data = await resp.json();
      if (data.success) return data.scenarios;
    } catch (e) {
      console.error('扩展题目失败:', e);
    }
    return [];
  }

  // 生成完整游戏题库
  async generateFullGame(themeId, apiKey) {
    try {
      const resp = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: themeId, apiKey })
      });
      const data = await resp.json();
      return data;
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // ─── 模拟 AI 回复 ────────────────────────────────────────────────────────────
  // 当没有 API Key 时使用的预设回复

  _mockAI(prompt, systemPrompt) {
    const mockReplies = [
      '人生没有标准答案，你的选择塑造了独特的轨迹。',
      '每个选择背后都有代价，也都有收获，这就是生活的真实。',
      '有时候，选择本身比结果更重要，因为它展示了你的价值观。',
      '面对困境，有时候"不完美地前进"比"完美地等待"更有意义。',
      '你的感受是真实的，不必为自己的情绪感到羞耻。',
      '生活的难题很少有完美的解法，但每个认真对待问题的人都值得尊敬。',
      '有时候退让不是软弱，而是为了在重要的事情上坚持。',
      '每个人都在用自己的方式对抗生活的不完美，你也不例外。'
    ];
    
    const rand = mockReplies[Math.floor(Math.random() * mockReplies.length)];
    return Promise.resolve(rand);
  }
}

// 全局实例
const aiClient = new AIClient();
