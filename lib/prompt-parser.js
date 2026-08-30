export const PromptParser = {
  calculateAspectRatio(width, height) {
    if (!width || !height || width <= 0 || height <= 0) return "16:9";
    const ratio = width / height;
    const standardRatios = [
      { name: "1:1", val: 1.0 },
      { name: "16:9", val: 16 / 9 },
      { name: "9:16", val: 9 / 16 },
      { name: "4:3", val: 4 / 3 },
      { name: "3:4", val: 3 / 4 },
      { name: "3:2", val: 3 / 2 },
      { name: "2:3", val: 2 / 3 },
      { name: "4:5", val: 4 / 5 },
      { name: "5:4", val: 5 / 4 },
      { name: "21:9", val: 21 / 9 }
    ];

    let closest = standardRatios[0];
    let minDiff = Math.abs(ratio - closest.val);

    for (let i = 1; i < standardRatios.length; i++) {
      const diff = Math.abs(ratio - standardRatios[i].val);
      if (diff < minDiff) {
        minDiff = diff;
        closest = standardRatios[i];
      }
    }
    return closest.name;
  },

  formatMidjourney(analysis, options = {}) {
    if (!analysis) return "";
    const parts = [];

    if (analysis.subject) parts.push(analysis.subject);
    if (analysis.environment && analysis.environment !== analysis.subject) {
      parts.push(analysis.environment);
    }
    if (analysis.style) parts.push(analysis.style);
    if (analysis.lighting) parts.push(analysis.lighting);
    if (analysis.colorPalette) parts.push(analysis.colorPalette);
    if (analysis.composition) parts.push(analysis.composition);
    if (analysis.camera) parts.push(analysis.camera);
    if (analysis.atmosphere) parts.push(analysis.atmosphere);
    if (analysis.renderingDetails) parts.push(analysis.renderingDetails);

    let basePrompt = parts.filter(Boolean).join(", ");

    const params = [];
    const ar = options.ar || (analysis.aspectRatio || "16:9");
    if (ar && ar !== "none" && ar !== "auto") {
      params.push(`--ar ${ar}`);
    } else if (analysis.aspectRatio) {
      params.push(`--ar ${analysis.aspectRatio}`);
    }

    const version = options.version || "6.0";
    if (version) params.push(`--v ${version}`);

    if (options.stylize !== undefined && options.stylize !== "") {
      params.push(`--stylize ${options.stylize}`);
    } else if (analysis.suggestedStylize) {
      params.push(`--stylize ${analysis.suggestedStylize}`);
    }

    if (options.style) {
      params.push(`--style ${options.style}`);
    }

    if (options.chaos) {
      params.push(`--chaos ${options.chaos}`);
    }

    return `${basePrompt} ${params.join(" ")}`.trim();
  },

  formatFlux(analysis) {
    if (!analysis) return "";
    const sentences = [];

    if (analysis.fluxPrompt) return analysis.fluxPrompt;

    if (analysis.subject) {
      sentences.push(`A high-detail photograph of ${analysis.subject.toLowerCase()}`);
    }
    if (analysis.environment) {
      sentences.push(`Set in ${analysis.environment.toLowerCase()}`);
    }
    if (analysis.composition || analysis.camera) {
      const comp = [analysis.composition, analysis.camera].filter(Boolean).join(", ");
      sentences.push(`Captured with ${comp}`);
    }
    if (analysis.lighting || analysis.colorPalette) {
      const light = [analysis.lighting, analysis.colorPalette].filter(Boolean).join(" and ");
      sentences.push(`Featuring ${light}`);
    }
    if (analysis.style) {
      sentences.push(`The visual aesthetic is ${analysis.style}`);
    }
    if (analysis.atmosphere) {
      sentences.push(`Evoking a feeling of ${analysis.atmosphere}`);
    }

    return sentences.join(". ") + ".";
  },

  formatStableDiffusion(analysis) {
    if (!analysis) return { positive: "", negative: "" };

    const qualityPrefix = "masterpiece, best quality, ultra-detailed, 8k resolution, photorealistic";
    const tagList = [];

    if (analysis.subject) tagList.push(analysis.subject);
    if (analysis.style) tagList.push(analysis.style);
    if (analysis.lighting) tagList.push(analysis.lighting);
    if (analysis.composition) tagList.push(analysis.composition);
    if (analysis.camera) tagList.push(analysis.camera);
    if (analysis.colorPalette) tagList.push(analysis.colorPalette);
    if (analysis.renderingDetails) tagList.push(analysis.renderingDetails);
    if (analysis.atmosphere) tagList.push(analysis.atmosphere);

    const positive = `${qualityPrefix}, ${tagList.join(", ")}`;
    const negative = analysis.negativePrompt ||
      "low quality, worst quality, normal quality, blurry, bad anatomy, bad hands, missing fingers, extra digit, cropped, artifacts, watermark, signature, jpeg artifacts, username, error, mutation";

    return { positive, negative };
  },

  formatDalle(analysis) {
    if (!analysis) return "";
    if (analysis.dallePrompt) return analysis.dallePrompt;

    return `Create an image featuring ${analysis.subject || "a captivating scene"}. The environment is ${analysis.environment || "carefully detailed"}. The art style is inspired by ${analysis.style || "modern visual artistry"}. Use ${analysis.lighting || "natural, balanced lighting"} with a color palette dominated by ${analysis.colorPalette || "harmonious tones"}. The shot is composed as ${analysis.composition || "an eye-level view"}, conveying ${analysis.atmosphere || "a distinct atmosphere"}.`;
  },

  extractTagCloud(analysis) {
    if (!analysis) return {};

    const cleanSplit = (str) => {
      if (!str) return [];
      return str.split(/[,;，、|]/)
        .map(t => t.trim())
        .filter(t => t.length > 0 && t.length < 50);
    };

    return {
      subject: cleanSplit(analysis.subjectTags || analysis.subject),
      style: cleanSplit(analysis.styleTags || analysis.style),
      lighting: cleanSplit(analysis.lightingTags || analysis.lighting),
      composition: cleanSplit(analysis.compositionTags || analysis.composition),
      palette: cleanSplit(analysis.colorTags || analysis.colorPalette),
      mood: cleanSplit(analysis.atmosphereTags || analysis.atmosphere)
    };
  },

  rebuildFromSelectedTags(selectedTags, format = "midjourney", options = {}) {
    const allTags = Object.values(selectedTags).flat().filter(Boolean);
    const joined = allTags.join(", ");

    if (format === "midjourney") {
      const ar = options.ar ? `--ar ${options.ar}` : "";
      const v = options.version ? `--v ${options.version}` : "--v 6.0";
      const s = options.stylize ? `--stylize ${options.stylize}` : "";
      return `${joined} ${ar} ${v} ${s}`.trim();
    }
    return joined;
  },

  getLocalizedAnalysis(analysis, lang = "en") {
    if (!analysis) return null;
    if (lang === "en" || !analysis.translations || !analysis.translations[lang]) {
      return analysis;
    }
    const trans = analysis.translations[lang];
    return {
      ...analysis,
      subject: trans.subject || analysis.subject,
      environment: trans.environment || analysis.environment,
      style: trans.style || analysis.style,
      lighting: trans.lighting || analysis.lighting,
      composition: trans.composition || analysis.composition,
      colorPalette: trans.colorPalette || analysis.colorPalette,
      atmosphere: trans.atmosphere || analysis.atmosphere
    };
  }
};