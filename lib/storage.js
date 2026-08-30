const DEFAULT_SETTINGS = {
  provider: "gemini",
  performanceMode: "fast", // "fast" | "pro"
  maxImageDimension: 1280,
  imageQuality: 0.90,
  endpoints: {
    openai: "https://api.openai.com/v1",
    gemini: "https://generativelanguage.googleapis.com/v1beta",
    claude: "https://api.anthropic.com/v1",
    custom: "https://api.openai.com/v1"
  },
  apiKeys: {
    openai: "",
    gemini: "",
    claude: "",
    custom: ""
  },
  models: {
    openai: "gpt-5.5-instant",
    gemini: "gemini-3.7-flash",
    claude: "claude-5-sonnet",
    custom: "qwen3.8-27b"
  },
  cachedModelLists: {
    gemini: ["gemini-3.7-flash", "gemini-3.5-pro", "gemini-2.0-flash", "gemini-2.0-flash-exp", "gemini-1.5-pro"],
    openai: ["gpt-5.6-sol", "gpt-5.5-instant", "o3-mini", "o3", "o1", "gpt-4o", "gpt-4.5"],
    claude: ["claude-5-sonnet", "claude-5-opus", "claude-3-7-sonnet", "claude-3-5-sonnet", "claude-3-5-haiku"],
    custom: ["qwen3.8-27b", "kimi-k3", "glm-5.3-flash", "deepseek-v4-flash-vision-exp", "qwen2.5-vl-72b", "deepseek-vl2"]
  },
  temperature: 0.3,
  defaultLanguage: "en",
  showFloatingCard: true,
  midjourneyPreset: {
    version: "6.1",
    stylize: 250,
    style: "raw",
    ar: "auto"
  },
  maxHistory: 100
};

export const StorageService = {
  async getSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get(["pc_settings"], (res) => {
        if (!res.pc_settings) {
          resolve(DEFAULT_SETTINGS);
        } else {
          resolve({
            ...DEFAULT_SETTINGS,
            ...res.pc_settings,
            cachedModelLists: {
              ...DEFAULT_SETTINGS.cachedModelLists,
              ...(res.pc_settings.cachedModelLists || {})
            }
          });
        }
      });
    });
  },

  async saveSettings(newSettings) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ pc_settings: newSettings }, () => {
        resolve(newSettings);
      });
    });
  },

  async getHistory() {
    return new Promise((resolve) => {
      chrome.storage.local.get(["pc_history"], (res) => {
        resolve(res.pc_history || []);
      });
    });
  },

  async addHistoryItem(item) {
    const history = await this.getHistory();
    const settings = await this.getSettings();
    history.unshift(item);
    const max = settings.maxHistory || 100;
    const trimmed = history.slice(0, max);
    return new Promise((resolve) => {
      chrome.storage.local.set({ pc_history: trimmed }, () => {
        resolve(trimmed);
      });
    });
  },

  async toggleFavorite(id) {
    const history = await this.getHistory();
    const updated = history.map(item => {
      if (item.id === id) {
        return { ...item, favorite: !item.favorite };
      }
      return item;
    });
    return new Promise((resolve) => {
      chrome.storage.local.set({ pc_history: updated }, () => {
        resolve(updated);
      });
    });
  },

  async deleteHistoryItem(id) {
    const history = await this.getHistory();
    const updated = history.filter(item => item.id !== id);
    return new Promise((resolve) => {
      chrome.storage.local.set({ pc_history: updated }, () => {
        resolve(updated);
      });
    });
  },

  async clearHistory(keepFavorites = false) {
    let history = await this.getHistory();
    if (keepFavorites) {
      history = history.filter(item => item.favorite);
    } else {
      history = [];
    }
    return new Promise((resolve) => {
      chrome.storage.local.set({ pc_history: history }, () => {
        resolve(history);
      });
    });
  },

  async exportHistory() {
    const history = await this.getHistory();
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: "application/json" });
    return {
      url: URL.createObjectURL(blob),
      count: history.length
    };
  },

  async importHistory(jsonString) {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) throw new Error("无效的历史记录格式");
    return new Promise((resolve) => {
      chrome.storage.local.set({ pc_history: parsed }, () => {
        resolve(parsed);
      });
    });
  }
};