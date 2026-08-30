import { StorageService } from "../lib/storage.js";
import { PromptParser } from "../lib/prompt-parser.js";
import { AIService } from "../lib/ai-service.js";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    if (chrome.runtime.lastError) console.warn(chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: "pc-extract-image",
      title: "提取图片 AI 提示词 (PromptCard)",
      contexts: ["image"]
    }, () => { if (chrome.runtime.lastError) console.warn(chrome.runtime.lastError); });

    chrome.contextMenus.create({
      id: "pc-snip-area",
      title: "框选屏幕区域提取提示词 (PromptCard)",
      contexts: ["page", "selection", "frame"]
    }, () => { if (chrome.runtime.lastError) console.warn(chrome.runtime.lastError); });
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab || !tab.id) return;

  if (info.menuItemId === "pc-extract-image" && info.srcUrl) {
    chrome.tabs.sendMessage(tab.id, {
      action: "EXTRACT_IMAGE_PROMPT",
      srcUrl: info.srcUrl,
      pageUrl: tab.url
    }).catch(async () => {
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content/content.js"] });
      await chrome.scripting.insertCSS({ target: { tabId: tab.id }, files: ["content/content.css"] });
      chrome.tabs.sendMessage(tab.id, { action: "EXTRACT_IMAGE_PROMPT", srcUrl: info.srcUrl, pageUrl: tab.url });
    });
  } else if (info.menuItemId === "pc-snip-area") {
    chrome.tabs.sendMessage(tab.id, { action: "START_SCREEN_SNIPPER" }).catch(async () => {
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content/content.js"] });
      await chrome.scripting.insertCSS({ target: { tabId: tab.id }, files: ["content/content.css"] });
      chrome.tabs.sendMessage(tab.id, { action: "START_SCREEN_SNIPPER" });
    });
  }
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "take-screenshot") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "START_SCREEN_SNIPPER" });
      }
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "CAPTURE_TAB") {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
      if (chrome.runtime.lastError || !dataUrl) {
        sendResponse({ success: false, error: chrome.runtime.lastError?.message || "截图失败" });
      } else {
        sendResponse({ success: true, dataUrl });
      }
    });
    return true;
  }

  if (request.action === "FETCH_IMAGE_AS_BASE64") {
    fetchImageWithAntiLeechBypass(request.url, request.pageUrl)
      .then(res => sendResponse({ success: true, ...res }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (request.action === "ANALYZE_IMAGE") {
    analyzeImageWorkflow(request.imageBase64, request.mimeType, request.imageMeta)
      .then(data => sendResponse({ success: true, ...data }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (request.action === "OPEN_OPTIONS") {
    chrome.runtime.openOptionsPage();
    sendResponse({ success: true });
    return false;
  }

  if (request.action === "OPEN_SIDEPANEL") {
    if (chrome.sidePanel?.open && sender.tab?.windowId) {
      chrome.sidePanel.open({ windowId: sender.tab.windowId });
    }
    sendResponse({ success: true });
    return false;
  }
});

async function fetchImageWithAntiLeechBypass(imageUrl, pageUrl) {
  try {
    let headers = {
      "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
    };

    let refererUrl = pageUrl;
    if (!refererUrl && imageUrl && imageUrl.startsWith("http")) {
      try {
        const u = new URL(imageUrl);
        refererUrl = u.origin + "/";
      } catch (e) {}
    }

    if (chrome.declarativeNetRequest?.updateSessionRules) {
      try {
        const ruleId = 9999;
        await chrome.declarativeNetRequest.updateSessionRules({
          removeRuleIds: [ruleId],
          addRules: [{
            id: ruleId,
            priority: 1,
            action: {
              type: "modifyHeaders",
              requestHeaders: [
                { header: "Referer", operation: "set", value: refererUrl || imageUrl },
                { header: "Sec-Fetch-Site", operation: "set", value: "same-origin" },
                { header: "Sec-Fetch-Mode", operation: "set", value: "no-cors" }
              ]
            },
            condition: {
              urlFilter: imageUrl.replace(/[?#].*$/, ""),
              resourceTypes: ["xmlhttprequest", "image", "other"]
            }
          }]
        });
      } catch (e) {}
    }

    const res = await fetch(imageUrl, {
      method: "GET",
      headers: headers,
      credentials: "omit"
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    }
    const base64Raw = btoa(binary);
    let contentType = res.headers.get("content-type") || "image/jpeg";
    if (contentType.includes(";")) contentType = contentType.split(";")[0].trim();
    if (!contentType.startsWith("image/")) contentType = "image/jpeg";

    const dataUrl = `data:${contentType};base64,${base64Raw}`;
    return { base64: dataUrl, mimeType: contentType };
  } catch (err) {
    throw new Error(`下载图片失败: ${err.message}`);
  }
}

async function analyzeImageWorkflow(imageBase64, mimeType = "image/jpeg", imageMeta = {}) {
  const settings = await StorageService.getSettings();
  const analysis = await AIService.analyzeImage(imageBase64, mimeType, settings, imageMeta);

  if (imageMeta.width && imageMeta.height) {
    analysis.aspectRatio = PromptParser.calculateAspectRatio(imageMeta.width, imageMeta.height);
  }

  const prompts = {
    midjourney: PromptParser.formatMidjourney(analysis, settings.midjourneyPreset),
    flux: PromptParser.formatFlux(analysis),
    stableDiffusion: PromptParser.formatStableDiffusion(analysis),
    dalle: PromptParser.formatDalle(analysis)
  };

  const tagCloud = PromptParser.extractTagCloud(analysis);

  const historyItem = {
    id: "pc_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
    timestamp: Date.now(),
    thumbnail: imageBase64.length < 500000 ? imageBase64 : null,
    provider: settings.provider || "mock",
    analysis,
    prompts,
    tagCloud,
    favorite: false
  };

  await StorageService.addHistoryItem(historyItem);
  return { analysis, prompts, tagCloud, historyItem, provider: settings.provider || "mock" };
}