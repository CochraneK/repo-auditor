/**
 * config.js — AI API 配置
 * 
 * 将你的 AI API Key 填入下方，
 * 即可在 Web 界面中自动生成任意主题的生存游戏题库。
 * 
 * 支持任意兼容 OpenAI 格式 API 的接口：
 * - OpenAI API (api.openai.com)
 * - 硅基流动 (siliconflow.cn)
 * - 通义千问 / DashScope
 * - 本地模型 (如 Ollama)
 * - 其他兼容接口
 */

const CONFIG = {
  // ══════════════════════════════════════════════════════════════
  // 请在此处填入你的 AI API Key
  // ══════════════════════════════════════════════════════════════
  API_KEY: 'YOUR_API_KEY_HERE',          // 例如: 'sk-xxxxx'
  
  // API 基础地址（留空则默认使用 OpenAI）
  API_BASE_URL: '',                       // 例如: 'https://api.siliconflow.cn/v1'
  
  // 模型名称（留空则默认使用 gpt-4o-mini）
  MODEL: '',                              // 例如: 'gpt-4o-mini', 'Qwen/Qwen2.5-7B-Instruct'
  
  // ══════════════════════════════════════════════════════════════
  // 服务器配置
  // ══════════════════════════════════════════════════════════════
  PORT: 3000,
  
  // 语言设置 ('zh' = 中文, 'en' = English)
  LANGUAGE: 'zh'
};

// 导出配置（Node.js 环境）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
