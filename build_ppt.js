const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");

// ─── Color Palette ──────────────────────────────────────────────
const C = {
  bg_dark:    "050C1A",
  bg_card:    "0D1B3E",
  bg_mid:     "0A1628",
  navy:       "0F2044",
  blue:       "0A84FF",
  blue_dim:   "1A5FBF",
  teal:       "00C2CB",
  white:      "FFFFFF",
  off_white:  "E2EEFF",
  muted:      "7A9CC4",
  grey:       "4A6080",
  gold:       "F5A623",
  green:      "00D4AA",
  red:        "FF4D6A",
};

// ─── Icon Helper ─────────────────────────────────────────────────
const {
  FaRobot, FaChartLine, FaDatabase, FaSearch, FaBrain,
  FaShieldAlt, FaGavel, FaExclamationTriangle, FaClock,
  FaLightbulb, FaCode, FaCheckCircle, FaMemory, FaFlask,
  FaLayerGroup, FaBolt, FaCloud, FaNetworkWired
} = require("react-icons/fa");
const { MdSecurity, MdSpeed, MdAnalytics } = require("react-icons/md");

function renderIconSvg(IconComponent, color = "#FFFFFF", size = 256) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
}
async function iconPng(IconComponent, color, size = 256) {
  const svg = renderIconSvg(IconComponent, "#" + color, size);
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

// ─── Helpers ─────────────────────────────────────────────────────
function slideNum(pres, slide, n, total = 12) {
  slide.addText(`${n} / ${total}`, {
    x: 8.8, y: 5.25, w: 1, h: 0.25,
    fontSize: 9, color: C.grey, align: "right", margin: 0
  });
}

function sectionHeader(slide, label, y = 0.28) {
  slide.addShape("RECTANGLE", {
    x: 0.5, y, w: 0.04, h: 0.22,
    fill: { color: C.blue }
  });
  slide.addText(label.toUpperCase(), {
    x: 0.64, y: y - 0.02, w: 4, h: 0.28,
    fontSize: 8, color: C.blue, bold: true, charSpacing: 3, margin: 0
  });
}

function titleText(slide, t, y = 0.55, w = 9, sz = 38) {
  slide.addText(t, {
    x: 0.5, y, w, h: 0.8,
    fontSize: sz, bold: true, color: C.white, fontFace: "Calibri",
    margin: 0
  });
}

function subtitleText(slide, t, y = 1.35, w = 9) {
  slide.addText(t, {
    x: 0.5, y, w, h: 0.35,
    fontSize: 14, color: C.muted, fontFace: "Calibri", margin: 0
  });
}

function card(slide, x, y, w, h, fillColor) {
  slide.addShape("RECTANGLE", { x, y, w, h, fill: { color: fillColor || C.bg_card }, shadow: { type: "outer", color: "000000", blur: 12, offset: 3, angle: 135, opacity: 0.4 } });
  slide.addShape("RECTANGLE", { x, y, w: 0.04, h, fill: { color: C.blue } });
}

// ─── BUILD ───────────────────────────────────────────────────────
async function build() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.title = "Autonomous Quant Lab: Adversarial Alpha Discovery";

  // SLIDE 1 — TITLE
  {
    const sl = pres.addSlide();
    sl.background = { color: C.bg_dark };

    sl.addShape("RECTANGLE", { x: 6.5, y: -0.3, w: 4.5, h: 1.5, fill: { color: C.blue, transparency: 85 } });
    sl.addShape("RECTANGLE", { x: 7.5, y: -0.3, w: 3.5, h: 3.2, fill: { color: C.blue, transparency: 92 } });
    sl.addShape("RECTANGLE", { x: 0.5, y: 0.5, w: 0.06, h: 4.6, fill: { color: C.blue } });
    sl.addText("AUTONOMOUS QUANT LAB", { x: 0.72, y: 0.55, w: 6, h: 0.3, fontSize: 9, color: C.blue, bold: true, charSpacing: 4, margin: 0 });
    sl.addText("Adversarial Alpha\nDiscovery", { x: 0.72, y: 0.9, w: 7.5, h: 2.0, fontSize: 52, bold: true, color: C.white, fontFace: "Calibri", lineSpacingMultiple: 1.1, margin: 0 });
    sl.addText("An Agentic Multi-Agent Framework for Autonomous Scientific\nDiscovery in Quantitative Finance", { x: 0.72, y: 2.95, w: 6.5, h: 0.75, fontSize: 13, color: C.muted, fontFace: "Calibri", margin: 0 });

    const agents = [
      { label: "CREATOR",  col: C.blue },
      { label: "CRITIC",   col: C.red  },
      { label: "JUDGE",    col: C.gold },
    ];
    agents.forEach((a, i) => {
      const bx = 0.72 + i * 2.05;
      sl.addShape("ROUNDED_RECTANGLE", { x: bx, y: 3.85, w: 1.75, h: 0.42, fill: { color: a.col, transparency: 75 }, rectRadius: 0.08 });
      sl.addText(a.label, { x: bx, y: 3.85, w: 1.75, h: 0.42, fontSize: 10, bold: true, color: C.white, align: "center", margin: 0 });
      if (i < 2) { sl.addShape("LINE", { x: bx + 1.78, y: 4.06, w: 0.24, h: 0, line: { color: C.grey, width: 1 } }); }
    });

    sl.addShape("LINE", { x: 0.72, y: 4.42, w: 6.5, h: 0, line: { color: C.grey, width: 0.5 } });
    const stack = ["Python", "LangGraph", "Backtrader", "ChromaDB", "yfinance", "edgartools"];
    stack.forEach((s, i) => { sl.addText(s, { x: 0.72 + i * 1.45, y: 4.5, w: 1.4, h: 0.3, fontSize: 9, color: C.muted, margin: 0 }); });

    const iconRobot = await iconPng(FaRobot, C.blue, 512);
    sl.addImage({ data: iconRobot, x: 7.8, y: 1.0, w: 1.6, h: 1.6, transparency: 10 });
    slideNum(pres, sl, 1);
  }

  // SLIDE 2 — THE CRISIS
  {
    const sl = pres.addSlide();
    sl.background = { color: C.bg_dark };
    sectionHeader(sl, "The Problem");
    titleText(sl, "Why Traditional Quant Research is Failing", 0.55, 8.5, 30);
    subtitleText(sl, "The industry faces four compounding crises that demand an autonomous solution.", 1.05);

    const challenges = [
      { icon: FaChartLine, title: "Alpha Decay", body: "Profitable inefficiencies disappear once discovered. Competitive markets absorb information faster than humans can generate new edge.", col: C.blue },
      { icon: FaBrain, title: "Overfitting", body: "Researchers inadvertently fit strategies to historical noise\u2014models excel in backtests but collapse in live markets.", col: C.red },
      { icon: FaClock, title: "Look-Ahead Bias", body: "Future information unintentionally leaks into training data, creating unrealistic performance expectations.", col: C.gold },
      { icon: FaExclamationTriangle, title: "Human Bottlenecks", body: "Limited bandwidth, slow hypothesis cycles, and cognitive bias throttle the pace of discovery.", col: C.teal },
    ];

    for (let i = 0; i < 4; i++) {
      const col = (i % 2) * 4.8 + 0.5;
      const row = Math.floor(i / 2) * 1.75 + 1.55;
      const ch = challenges[i];
      sl.addShape("RECTANGLE", { x: col, y: row, w: 4.5, h: 1.5, fill: { color: C.bg_card }, shadow: { type: "outer", color: "000000", blur: 10, offset: 2, angle: 135, opacity: 0.35 } });
      sl.addShape("RECTANGLE", { x: col, y: row, w: 0.04, h: 1.5, fill: { color: ch.col } });
      const ico = await iconPng(ch.icon, ch.col, 256);
      sl.addImage({ data: ico, x: col + 0.15, y: row + 0.35, w: 0.5, h: 0.5 });
      sl.addText(ch.title, { x: col + 0.75, y: row + 0.15, w: 3.6, h: 0.35, fontSize: 14, bold: true, color: C.white, fontFace: "Calibri", margin: 0 });
      sl.addText(ch.body, { x: col + 0.75, y: row + 0.5, w: 3.6, h: 0.85, fontSize: 10, color: C.muted, fontFace: "Calibri", margin: 0, wrap: true });
    }

    sl.addShape("RECTANGLE", { x: 0.5, y: 5.1, w: 9, h: 0.38, fill: { color: C.blue, transparency: 88 } });
    sl.addText("SOLUTION  \u2192  AI agents autonomously generate hypotheses \u00B7 Competing agents challenge assumptions \u00B7 Continuous experimentation at machine speed", { x: 0.6, y: 5.1, w: 8.8, h: 0.38, fontSize: 10, color: C.white, bold: false, margin: 0, valign: "middle" });
    slideNum(pres, sl, 2);
  }

  // SLIDE 3 — DATASETS NUMERICAL
  {
    const sl = pres.addSlide();
    sl.background = { color: C.bg_dark };
    sectionHeader(sl, "Datasets \u00B7 Numerical");
    titleText(sl, "Local Data Lake Architecture", 0.55, 7, 32);
    subtitleText(sl, "S&P 500 \u00B7 10 years \u00B7 OHLCV \u00B7 yfinance", 1.05);

    const steps = [
      { label: "yfinance API", sub: "Source" },
      { label: "Data Ingestion", sub: "Download & Validate" },
      { label: "Local Data Lake", sub: "Parquet / SQLite" },
      { label: "Backtrader Engine", sub: "Simulation-Ready" },
    ];
    steps.forEach((s, i) => {
      const sy = 1.55 + i * 0.88;
      sl.addShape("RECTANGLE", { x: 0.5, y: sy, w: 3.6, h: 0.62, fill: { color: C.bg_card }, shadow: { type: "outer", color: "000000", blur: 8, offset: 2, angle: 135, opacity: 0.3 } });
      sl.addShape("RECTANGLE", { x: 0.5, y: sy, w: 0.04, h: 0.62, fill: { color: C.blue } });
      sl.addText(s.label, { x: 0.64, y: sy + 0.04, w: 3.3, h: 0.28, fontSize: 13, bold: true, color: C.white, margin: 0 });
      sl.addText(s.sub, { x: 0.64, y: sy + 0.3, w: 3.3, h: 0.22, fontSize: 9, color: C.muted, margin: 0 });
      if (i < 3) {
        sl.addShape("LINE", { x: 2.3, y: sy + 0.62, w: 0, h: 0.26, line: { color: C.blue, width: 1.5 } });
        sl.addText("\u25BC", { x: 2.18, y: sy + 0.84, w: 0.25, h: 0.2, fontSize: 8, color: C.blue, margin: 0 });
      }
    });

    const benefits = [
      { t: "Deterministic Testing",       b: "Same dataset every experiment \u2014 fully reproducible research." },
      { t: "No External Dependencies",    b: "No API downtime, latency, or changing data sources." },
      { t: "Version-Controlled Data",     b: "Enables rigorous benchmarking and scientific repeatability." },
      { t: "Faster Backtesting",          b: "Local I/O eliminates network overhead." },
    ];
    benefits.forEach((b, i) => {
      const by = 1.55 + i * 0.88;
      sl.addShape("RECTANGLE", { x: 4.55, y: by, w: 4.95, h: 0.62, fill: { color: C.navy }, shadow: { type: "outer", color: "000000", blur: 8, offset: 2, angle: 135, opacity: 0.25 } });
      sl.addText("\u2713", { x: 4.65, y: by + 0.12, w: 0.3, h: 0.35, fontSize: 14, color: C.teal, bold: true, margin: 0 });
      sl.addText(b.t, { x: 5.0, y: by + 0.04, w: 4.3, h: 0.28, fontSize: 12, bold: true, color: C.white, margin: 0 });
      sl.addText(b.b, { x: 5.0, y: by + 0.32, w: 4.3, h: 0.24, fontSize: 9, color: C.muted, margin: 0 });
    });

    sl.addShape("RECTANGLE", { x: 4.55, y: 5.05, w: 4.95, h: 0.45, fill: { color: C.blue, transparency: 80 } });
    sl.addText("500 tickers  \u00B7  10 years  \u00B7  ~1.25M daily bars  \u00B7  OHLCV + Adjusted Close", { x: 4.65, y: 5.05, w: 4.8, h: 0.45, fontSize: 10, color: C.white, bold: true, margin: 0, valign: "middle" });
    slideNum(pres, sl, 3);
  }

  // SLIDE 4 — TEXTUAL DATA
  {
    const sl = pres.addSlide();
    sl.background = { color: C.bg_dark };
    sectionHeader(sl, "Datasets \u00B7 Textual");
    titleText(sl, "Extracting Semantic Alpha from SEC Filings", 0.55, 8.5, 28);
    subtitleText(sl, "edgartools \u00B7 10-K filings \u00B7 Risk Factors \u00B7 MD&A", 1.05);

    const pipe = [
      { step: "1", label: "Filing Ingestion",          col: C.blue },
      { step: "2", label: "Text Parsing",               col: C.blue },
      { step: "3", label: "LLM Interpretation",         col: C.teal },
      { step: "4", label: "Economic Signal Extraction", col: C.teal },
      { step: "5", label: "Strategy Hypothesis",        col: C.green },
    ];
    pipe.forEach((p, i) => {
      const py = 1.55 + i * 0.72;
      sl.addShape("RECTANGLE", { x: 0.5, y: py, w: 4.2, h: 0.56, fill: { color: C.bg_card } });
      sl.addShape("RECTANGLE", { x: 0.5, y: py, w: 0.04, h: 0.56, fill: { color: p.col } });
      sl.addShape("ROUNDED_RECTANGLE", { x: 0.6, y: py + 0.1, w: 0.36, h: 0.36, fill: { color: p.col, transparency: 70 }, rectRadius: 0.05 });
      sl.addText(p.step, { x: 0.6, y: py + 0.1, w: 0.36, h: 0.36, fontSize: 11, bold: true, color: C.white, align: "center", margin: 0 });
      sl.addText(p.label, { x: 1.1, y: py + 0.12, w: 3.5, h: 0.32, fontSize: 12, bold: true, color: C.white, margin: 0 });
      if (i < 4) { sl.addShape("LINE", { x: 2.3, y: py + 0.56, w: 0, h: 0.16, line: { color: C.grey, width: 1 } }); }
    });

    const sections = [
      { t: "Risk Factors", items: ["Operational threats", "Regulatory concerns", "Competitive risks"], col: C.red },
      { t: "MD&A Section", items: ["Executive commentary", "Future outlook", "Strategic priorities"], col: C.gold },
    ];
    sections.forEach((s, i) => {
      const sx = 5.1 + i * 2.55;
      sl.addShape("RECTANGLE", { x: sx, y: 1.55, w: 2.35, h: 2.6, fill: { color: C.bg_card }, shadow: { type: "outer", color: "000000", blur: 8, offset: 2, angle: 135, opacity: 0.3 } });
      sl.addShape("RECTANGLE", { x: sx, y: 1.55, w: 2.35, h: 0.38, fill: { color: s.col, transparency: 75 } });
      sl.addText(s.t, { x: sx + 0.08, y: 1.55, w: 2.2, h: 0.38, fontSize: 12, bold: true, color: C.white, margin: 0, valign: "middle" });
      s.items.forEach((item, j) => { sl.addText("\u2192  " + item, { x: sx + 0.1, y: 2.0 + j * 0.55, w: 2.2, h: 0.45, fontSize: 10, color: C.muted, margin: 0 }); });
    });

    sl.addShape("RECTANGLE", { x: 5.1, y: 4.35, w: 4.8, h: 1.15, fill: { color: C.navy } });
    sl.addShape("RECTANGLE", { x: 5.1, y: 4.35, w: 0.04, h: 1.15, fill: { color: C.gold } });
    sl.addText("EXAMPLE INSIGHT", { x: 5.2, y: 4.38, w: 4.6, h: 0.22, fontSize: 8, color: C.gold, bold: true, charSpacing: 2, margin: 0 });
    sl.addText("Filing signal: \"Supply-chain disruptions and inventory uncertainty\"", { x: 5.2, y: 4.6, w: 4.6, h: 0.3, fontSize: 10, color: C.off_white, italic: true, margin: 0 });
    sl.addText("Hypothesis \u2192 Firms with elevated supply-chain risk underperform peers during slowdowns.", { x: 5.2, y: 4.9, w: 4.6, h: 0.5, fontSize: 10, color: C.muted, margin: 0, wrap: true });
    slideNum(pres, sl, 4);
  }

  // SLIDE 5 — LANGGRAPH
  {
    const sl = pres.addSlide();
    sl.background = { color: C.bg_dark };
    sectionHeader(sl, "Architecture \u00B7 Cognitive Layer");
    titleText(sl, "LangGraph State Machine", 0.55, 7, 34);
    subtitleText(sl, "Central orchestration engine coordinating all autonomous agents", 1.05);

    sl.addShape("RECTANGLE", { x: 0.5, y: 1.5, w: 4.2, h: 3.85, fill: { color: C.bg_card }, shadow: { type: "outer", color: "000000", blur: 10, offset: 2, angle: 135, opacity: 0.3 } });
    sl.addShape("RECTANGLE", { x: 0.5, y: 1.5, w: 4.2, h: 0.4, fill: { color: C.blue, transparency: 70 } });
    sl.addText("Research State Object", { x: 0.6, y: 1.5, w: 4.0, h: 0.4, fontSize: 12, bold: true, color: C.white, margin: 0, valign: "middle" });

    const stateItems = [
      { k: "sec_insights",      t: "SEC Insights",      c: C.gold  },
      { k: "strategy_code",     t: "Strategy Code",     c: C.blue  },
      { k: "backtest_metrics",  t: "Backtest Metrics",  c: C.teal  },
      { k: "critic_analysis",   t: "Critic Analysis",   c: C.red   },
      { k: "judge_verdict",     t: "Judge Verdict",     c: C.green },
      { k: "memory_refs",       t: "Memory References", c: C.muted },
    ];
    stateItems.forEach((item, i) => {
      const iy = 2.02 + i * 0.5;
      sl.addShape("RECTANGLE", { x: 0.62, y: iy, w: 0.08, h: 0.26, fill: { color: item.c } });
      sl.addText(item.k + ":", { x: 0.8, y: iy, w: 1.5, h: 0.26, fontSize: 9, color: item.c, fontFace: "Consolas", margin: 0 });
      sl.addText(item.t, { x: 2.3, y: iy, w: 2.3, h: 0.26, fontSize: 9, color: C.muted, margin: 0 });
    });

    const nodes = [
      { label: "SEC\nInsights", x: 5.4, y: 1.55, col: C.gold },
      { label: "CREATOR\nAgent",  x: 7.2, y: 1.55, col: C.blue },
      { label: "CRITIC\nAgent",   x: 7.2, y: 3.0,  col: C.red  },
      { label: "JUDGE\nAgent",    x: 7.2, y: 4.45, col: C.green },
      { label: "Alpha\nVault",    x: 5.4, y: 4.45, col: C.teal },
    ];
    nodes.forEach(n => {
      sl.addShape("ROUNDED_RECTANGLE", { x: n.x, y: n.y, w: 1.6, h: 0.9, fill: { color: n.col, transparency: 78 }, rectRadius: 0.1 });
      sl.addShape("ROUNDED_RECTANGLE", { x: n.x, y: n.y, w: 1.6, h: 0.9, fill: { color: "000000", transparency: 100 }, line: { color: n.col, width: 1.5 }, rectRadius: 0.1 });
      sl.addText(n.label, { x: n.x, y: n.y, w: 1.6, h: 0.9, fontSize: 10, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
    });

    sl.addShape("LINE", { x: 7.0, y: 2.0, w: 0.2, h: 0, line: { color: C.grey, width: 1 } });
    sl.addShape("LINE", { x: 8.0, y: 2.45, w: 0, h: 0.55, line: { color: C.grey, width: 1 } });
    sl.addText("\u25BC", { x: 7.94, y: 2.93, w: 0.18, h: 0.18, fontSize: 8, color: C.grey, margin: 0 });
    sl.addShape("LINE", { x: 8.0, y: 3.9, w: 0, h: 0.55, line: { color: C.grey, width: 1 } });
    sl.addText("\u25BC", { x: 7.94, y: 4.38, w: 0.18, h: 0.18, fontSize: 8, color: C.grey, margin: 0 });
    sl.addShape("LINE", { x: 7.2, y: 4.9, w: -0.6, h: 0, line: { color: C.grey, width: 1 } });
    sl.addShape("LINE", { x: 6.2, y: 2.0, w: 1.0, h: 0, line: { color: C.grey, width: 1 } });
    sl.addText("\u2192", { x: 7.05, y: 1.91, w: 0.2, h: 0.2, fontSize: 10, color: C.grey, margin: 0 });
    sl.addText("Iterative\nFeedback Loop", { x: 5.2, y: 2.95, w: 1.7, h: 0.55, fontSize: 8, color: C.muted, align: "center", italic: true, margin: 0 });
    sl.addShape("LINE", { x: 6.0, y: 2.4, w: 0, h: 2.4, line: { color: C.grey, width: 0.75, dashType: "dash" } });
    slideNum(pres, sl, 5);
  }

  // SLIDE 6 — BACKTRADER
  {
    const sl = pres.addSlide();
    sl.background = { color: C.bg_dark };
    sectionHeader(sl, "Architecture \u00B7 Execution Sandbox");
    titleText(sl, "Secure Strategy Evaluation Environment", 0.55, 8.5, 28);
    subtitleText(sl, "Dynamic code execution \u00B7 Isolated simulation \u00B7 Standardized metrics", 1.05);

    const pipeSteps = [
      { n: "1", label: "Strategy\nGenerated",  col: C.blue },
      { n: "2", label: "Code\nCompiled",       col: C.blue },
      { n: "3", label: "Backtrader\nLoaded",   col: C.teal },
      { n: "4", label: "Simulation\nRuns",     col: C.teal },
      { n: "5", label: "Metrics\nReturned",    col: C.green },
    ];
    pipeSteps.forEach((p, i) => {
      const px = 0.5 + i * 1.85;
      sl.addShape("ROUNDED_RECTANGLE", { x: px, y: 1.55, w: 1.6, h: 1.1, fill: { color: p.col, transparency: 82 }, rectRadius: 0.1 });
      sl.addShape("ROUNDED_RECTANGLE", { x: px, y: 1.55, w: 1.6, h: 1.1, fill: { color: "000000", transparency: 100 }, line: { color: p.col, width: 1.5 }, rectRadius: 0.1 });
      sl.addText(p.n, { x: px, y: 1.57, w: 1.6, h: 0.38, fontSize: 18, bold: true, color: p.col, align: "center", margin: 0 });
      sl.addText(p.label, { x: px, y: 1.97, w: 1.6, h: 0.65, fontSize: 10, color: C.white, align: "center", margin: 0 });
      if (i < 4) { sl.addShape("LINE", { x: px + 1.63, y: 2.1, w: 0.22, h: 0, line: { color: C.grey, width: 1.5 } }); sl.addText("\u2192", { x: px + 1.65, y: 2.02, w: 0.2, h: 0.2, fontSize: 10, color: C.grey, margin: 0 }); }
    });

    sl.addShape("RECTANGLE", { x: 0.5, y: 2.85, w: 5.4, h: 1.35, fill: { color: "0A0F1A" } });
    sl.addShape("RECTANGLE", { x: 0.5, y: 2.85, w: 5.4, h: 0.28, fill: { color: C.navy } });
    sl.addText("strategy.py", { x: 0.58, y: 2.85, w: 2, h: 0.28, fontSize: 8, color: C.muted, margin: 0, valign: "middle" });
    sl.addText([
      { text: "class ", options: { color: C.blue, fontFace: "Consolas" } },
      { text: "AlphaStrategy", options: { color: C.teal, fontFace: "Consolas" } },
      { text: "(bt.Strategy):", options: { color: C.white, fontFace: "Consolas" } },
    ], { x: 0.6, y: 3.17, w: 5.2, h: 0.28, fontSize: 11, margin: 0 });
    sl.addText([
      { text: "    def ", options: { color: C.blue, fontFace: "Consolas" } },
      { text: "next", options: { color: C.gold, fontFace: "Consolas" } },
      { text: "(self):", options: { color: C.white, fontFace: "Consolas" } },
    ], { x: 0.6, y: 3.48, w: 5.2, h: 0.28, fontSize: 11, margin: 0 });
    sl.addText([
      { text: "        # Generated by Creator Agent", options: { color: C.grey, fontFace: "Consolas", italic: true } },
    ], { x: 0.6, y: 3.75, w: 5.2, h: 0.28, fontSize: 11, margin: 0 });

    const metrics = [
      { label: "Returns",     col: C.teal  },
      { label: "Sharpe",      col: C.blue  },
      { label: "Win Rate",    col: C.green },
      { label: "Drawdown",    col: C.red   },
    ];
    metrics.forEach((m, i) => {
      const mx = 6.1 + (i % 2) * 1.85;
      const my = 1.55 + Math.floor(i / 2) * 1.05;
      sl.addShape("RECTANGLE", { x: mx, y: my, w: 1.7, h: 0.75, fill: { color: C.bg_card } });
      sl.addShape("RECTANGLE", { x: mx, y: my, w: 0.04, h: 0.75, fill: { color: m.col } });
      sl.addText(m.label, { x: mx + 0.12, y: my + 0.2, w: 1.5, h: 0.35, fontSize: 12, bold: true, color: C.white, margin: 0 });
    });

    const sec = [
      { t: "Isolated Execution", b: "Local env \u00B7 No internet" },
      { t: "Fixed Dataset",      b: "Controlled inputs only"  },
      { t: "Repeatable Tests",   b: "Consistent benchmarks"   },
    ];
    sec.forEach((s, i) => {
      const sy = 2.85 + i * 0.7;
      sl.addShape("RECTANGLE", { x: 6.1, y: sy, w: 3.55, h: 0.55, fill: { color: C.navy } });
      sl.addShape("RECTANGLE", { x: 6.1, y: sy, w: 0.04, h: 0.55, fill: { color: C.blue } });
      sl.addText(s.t, { x: 6.2, y: sy + 0.03, w: 3.3, h: 0.24, fontSize: 10, bold: true, color: C.white, margin: 0 });
      sl.addText(s.b, { x: 6.2, y: sy + 0.27, w: 3.3, h: 0.22, fontSize: 9, color: C.muted, margin: 0 });
    });
    slideNum(pres, sl, 6);
  }

  // SLIDE 7 — CREATOR
  {
    const sl = pres.addSlide();
    sl.background = { color: C.bg_dark };
    sl.addShape("RECTANGLE", { x: 6.5, y: 0, w: 3.5, h: 5.625, fill: { color: C.bg_card } });
    sl.addShape("RECTANGLE", { x: 6.5, y: 0, w: 0.04, h: 5.625, fill: { color: C.blue } });
    sectionHeader(sl, "Agent 1 \u00B7 Creator");
    titleText(sl, "Alpha Generation\nEngine", 0.55, 5.8, 34);
    subtitleText(sl, "Converts data into executable investment strategies", 1.35, 5.8);

    const tasks = [
      { icon: FaSearch,    t: "Economic Interpretation", b: "Transforms SEC insights into market narratives and economic hypotheses.", c: C.gold  },
      { icon: FaLightbulb, t: "Strategy Synthesis",       b: "Generates entry/exit conditions and risk controls from hypotheses.", c: C.blue  },
      { icon: FaCode,      t: "Code Production",          b: "Outputs fully executable Backtrader strategies as Python code strings.", c: C.teal  },
    ];
    for (let i = 0; i < 3; i++) {
      const ty = 1.85 + i * 1.1;
      const tk = tasks[i];
      const ico = await iconPng(tk.icon, tk.c, 256);
      sl.addImage({ data: ico, x: 0.55, y: ty + 0.2, w: 0.45, h: 0.45 });
      sl.addText(tk.t, { x: 1.1, y: ty + 0.08, w: 5.1, h: 0.32, fontSize: 13, bold: true, color: C.white, margin: 0 });
      sl.addText(tk.b, { x: 1.1, y: ty + 0.42, w: 5.1, h: 0.45, fontSize: 10, color: C.muted, margin: 0 });
      if (i < 2) sl.addShape("LINE", { x: 0.55, y: ty + 0.92, w: 5.6, h: 0, line: { color: C.grey, width: 0.5, dashType: "dot" } });
    }

    sl.addText("EXAMPLE", { x: 6.65, y: 0.42, w: 3.2, h: 0.28, fontSize: 8, color: C.blue, bold: true, charSpacing: 3, margin: 0 });
    sl.addShape("RECTANGLE", { x: 6.65, y: 0.75, w: 3.1, h: 0.6, fill: { color: C.navy } });
    sl.addShape("RECTANGLE", { x: 6.65, y: 0.75, w: 0.04, h: 0.6, fill: { color: C.gold } });
    sl.addText("INPUT", { x: 6.75, y: 0.77, w: 2.8, h: 0.2, fontSize: 7, color: C.gold, bold: true, charSpacing: 2, margin: 0 });
    sl.addText("Rising regulatory risk across multiple filings.", { x: 6.75, y: 0.97, w: 2.9, h: 0.32, fontSize: 9, color: C.off_white, italic: true, margin: 0 });
    sl.addShape("LINE", { x: 8.2, y: 1.37, w: 0, h: 0.22, line: { color: C.grey, width: 1 } });
    sl.addText("\u25BC", { x: 8.14, y: 1.53, w: 0.18, h: 0.18, fontSize: 8, color: C.grey, margin: 0 });
    sl.addShape("RECTANGLE", { x: 6.65, y: 1.75, w: 3.1, h: 0.7, fill: { color: C.navy } });
    sl.addShape("RECTANGLE", { x: 6.65, y: 1.75, w: 0.04, h: 0.7, fill: { color: C.blue } });
    sl.addText("HYPOTHESIS", { x: 6.75, y: 1.77, w: 2.8, h: 0.2, fontSize: 7, color: C.blue, bold: true, charSpacing: 2, margin: 0 });
    sl.addText("Regulatory uncertainty \u2192 higher volatility \u2192 negative future returns.", { x: 6.75, y: 1.97, w: 2.9, h: 0.42, fontSize: 9, color: C.off_white, margin: 0, wrap: true });
    sl.addShape("LINE", { x: 8.2, y: 2.47, w: 0, h: 0.22, line: { color: C.grey, width: 1 } });
    sl.addText("\u25BC", { x: 8.14, y: 2.63, w: 0.18, h: 0.18, fontSize: 8, color: C.grey, margin: 0 });
    sl.addShape("RECTANGLE", { x: 6.65, y: 2.85, w: 3.1, h: 0.7, fill: { color: C.navy } });
    sl.addShape("RECTANGLE", { x: 6.65, y: 2.85, w: 0.04, h: 0.7, fill: { color: C.teal } });
    sl.addText("STRATEGY", { x: 6.75, y: 2.87, w: 2.8, h: 0.2, fontSize: 7, color: C.teal, bold: true, charSpacing: 2, margin: 0 });
    sl.addText("Short high-risk firms \u00B7 Long low-risk peers", { x: 6.75, y: 3.07, w: 2.9, h: 0.42, fontSize: 9, color: C.off_white, margin: 0 });
    slideNum(pres, sl, 7);
  }

  // SLIDE 8 — CRITIC
  {
    const sl = pres.addSlide();
    sl.background = { color: C.bg_dark };
    sl.addShape("RECTANGLE", { x: 0, y: 0, w: 10, h: 0.08, fill: { color: C.red } });
    sectionHeader(sl, "Agent 2 \u00B7 Critic");
    titleText(sl, "The Red Team", 0.55, 6, 38);
    subtitleText(sl, "A strategy is not robust until it survives adversarial testing.", 1.1, 6);

    const frictions = [
      { t: "Transaction Costs",   b: "Brokerage commissions on every trade",    c: C.red   },
      { t: "Slippage",            b: "Execution price deviation from signal",    c: C.red   },
      { t: "Latency",             b: "Delayed order execution penalties",        c: C.gold  },
      { t: "Spread Effects",      b: "Bid-ask realities on entry & exit",        c: C.gold  },
    ];
    frictions.forEach((f, i) => {
      const fx = 0.5 + (i % 2) * 3.1;
      const fy = 1.75 + Math.floor(i / 2) * 1.0;
      sl.addShape("RECTANGLE", { x: fx, y: fy, w: 2.85, h: 0.75, fill: { color: C.bg_card } });
      sl.addShape("RECTANGLE", { x: fx, y: fy, w: 0.04, h: 0.75, fill: { color: f.c } });
      sl.addText(f.t, { x: fx + 0.12, y: fy + 0.08, w: 2.6, h: 0.28, fontSize: 12, bold: true, color: C.white, margin: 0 });
      sl.addText(f.b, { x: fx + 0.12, y: fy + 0.38, w: 2.6, h: 0.28, fontSize: 9, color: C.muted, margin: 0 });
    });

    sl.addText("FRAGILITY DETECTION", { x: 6.8, y: 1.78, w: 3.0, h: 0.22, fontSize: 8, color: C.red, bold: true, charSpacing: 2, margin: 0 });
    const frags = ["Overfitting", "Data Leakage", "Survivorship Bias", "Unrealistic Assumptions"];
    frags.forEach((f, i) => {
      sl.addShape("RECTANGLE", { x: 6.8, y: 2.07 + i * 0.4, w: 3.0, h: 0.32, fill: { color: C.navy } });
      sl.addShape("RECTANGLE", { x: 6.8, y: 2.07 + i * 0.4, w: 0.04, h: 0.32, fill: { color: C.red } });
      sl.addText("\u26A0  " + f, { x: 6.9, y: 2.07 + i * 0.4, w: 2.8, h: 0.32, fontSize: 10, color: C.off_white, margin: 0, valign: "middle" });
    });

    sl.addShape("RECTANGLE", { x: 0.5, y: 3.92, w: 9, h: 1.45, fill: { color: C.navy } });
    sl.addShape("RECTANGLE", { x: 0.5, y: 3.92, w: 0.04, h: 1.45, fill: { color: C.red } });
    sl.addText("STRESS TEST RESULT", { x: 0.65, y: 3.95, w: 4, h: 0.22, fontSize: 8, color: C.red, bold: true, charSpacing: 2, margin: 0 });
    sl.addText("2.10", { x: 1.2, y: 4.22, w: 2, h: 0.65, fontSize: 44, bold: true, color: C.green, margin: 0 });
    sl.addText("Original\nSharpe", { x: 1.2, y: 4.88, w: 2, h: 0.35, fontSize: 8, color: C.muted, margin: 0 });
    sl.addText("\u2192", { x: 3.5, y: 4.45, w: 0.5, h: 0.4, fontSize: 22, color: C.grey, margin: 0 });
    sl.addText("0.60", { x: 4.2, y: 4.22, w: 2, h: 0.65, fontSize: 44, bold: true, color: C.red, margin: 0 });
    sl.addText("After\nFriction", { x: 4.2, y: 4.88, w: 2, h: 0.35, fontSize: 8, color: C.muted, margin: 0 });
    sl.addShape("ROUNDED_RECTANGLE", { x: 6.5, y: 4.25, w: 2.8, h: 0.7, fill: { color: C.red, transparency: 75 }, rectRadius: 0.08 });
    sl.addText("\u2717  STRATEGY REJECTED", { x: 6.5, y: 4.25, w: 2.8, h: 0.7, fontSize: 12, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
    slideNum(pres, sl, 8);
  }

  // SLIDE 9 — JUDGE
  {
    const sl = pres.addSlide();
    sl.background = { color: C.bg_dark };
    sectionHeader(sl, "Agent 3 \u00B7 Judge");
    titleText(sl, "Governance & Memory", 0.55, 7, 36);
    subtitleText(sl, "Logical consistency \u00B7 Semantic audit \u00B7 ChromaDB vector memory", 1.05);

    const audits = [
      { t: "Strategy Validity",       b: "Economic justification exists for the hypothesis",   c: C.green },
      { t: "Logical Consistency",     b: "Strategy behavior matches its stated rationale",      c: C.gold  },
      { t: "Experimental Integrity",  b: "Proper testing methodology was followed",             c: C.blue  },
    ];
    audits.forEach((a, i) => {
      const ay = 1.55 + i * 1.05;
      sl.addShape("RECTANGLE", { x: 0.5, y: ay, w: 4.5, h: 0.8, fill: { color: C.bg_card } });
      sl.addShape("RECTANGLE", { x: 0.5, y: ay, w: 0.04, h: 0.8, fill: { color: a.c } });
      sl.addShape("ROUNDED_RECTANGLE", { x: 0.62, y: ay + 0.22, w: 0.36, h: 0.36, fill: { color: a.c, transparency: 72 }, rectRadius: 0.05 });
      sl.addText("\u2713", { x: 0.62, y: ay + 0.22, w: 0.36, h: 0.36, fontSize: 12, color: C.white, bold: true, align: "center", margin: 0 });
      sl.addText(a.t, { x: 1.1, y: ay + 0.08, w: 3.7, h: 0.3, fontSize: 13, bold: true, color: C.white, margin: 0 });
      sl.addText(a.b, { x: 1.1, y: ay + 0.42, w: 3.7, h: 0.28, fontSize: 10, color: C.muted, margin: 0 });
    });

    sl.addShape("RECTANGLE", { x: 5.3, y: 1.5, w: 4.2, h: 3.75, fill: { color: C.bg_card } });
    sl.addShape("RECTANGLE", { x: 5.3, y: 1.5, w: 4.2, h: 0.42, fill: { color: C.teal, transparency: 70 } });
    sl.addText("ChromaDB Vector Memory", { x: 5.4, y: 1.5, w: 4.0, h: 0.42, fontSize: 12, bold: true, color: C.white, margin: 0, valign: "middle" });
    const memItems = [
      { t: "Previous Hypotheses",  c: C.blue  },
      { t: "Failed Experiments",   c: C.red   },
      { t: "Critic Findings",      c: C.gold  },
      { t: "Successful Patterns",  c: C.green },
    ];
    memItems.forEach((m, i) => {
      const my = 2.05 + i * 0.55;
      sl.addShape("RECTANGLE", { x: 5.45, y: my, w: 0.1, h: 0.32, fill: { color: m.c } });
      sl.addText(m.t, { x: 5.65, y: my + 0.02, w: 3.6, h: 0.32, fontSize: 11, color: C.off_white, margin: 0 });
    });
    sl.addShape("LINE", { x: 5.45, y: 4.3, w: 3.9, h: 0, line: { color: C.grey, width: 0.5, dashType: "dot" } });
    sl.addText("MEMORY-DRIVEN DECISION", { x: 5.45, y: 4.36, w: 4.0, h: 0.22, fontSize: 8, color: C.teal, bold: true, charSpacing: 2, margin: 0 });
    const steps2 = ["Embed new strategy", "Retrieve similar history", "Analyze prior failures", "Issue verdict"];
    sl.addText(steps2.map((s, i) => `${i+1}. ${s}`).join("  \u00B7  "), { x: 5.45, y: 4.62, w: 3.9, h: 0.5, fontSize: 8.5, color: C.muted, margin: 0, wrap: true });
    slideNum(pres, sl, 9);
  }

  // SLIDE 10 — PHASES 1-3
  {
    const sl = pres.addSlide();
    sl.background = { color: C.bg_dark };
    sectionHeader(sl, "Implementation \u00B7 Foundation");
    titleText(sl, "Phases 1\u20133: Building the Foundation", 0.55, 8.5, 28);

    const phases = [
      { n: "01", t: "Data Ingestion Layer", col: C.blue, items: ["Build local market database", "Download 10 years OHLCV data", "Collect SEC filings with edgartools"], deliverable: "Structured Local Data Lake" },
      { n: "02", t: "Sandbox Engine", col: C.teal, items: ["Configure Backtrader engine", "Implement dynamic code execution", "Generate performance reports"], deliverable: "Secure Simulation Environment" },
      { n: "03", t: "Vector Ledger", col: C.green, items: ["Deploy ChromaDB", "Create experiment memory system", "Enable semantic retrieval"], deliverable: "Searchable Research History" },
    ];

    phases.forEach((p, i) => {
      const px = 0.5 + i * 3.15;
      sl.addShape("RECTANGLE", { x: px, y: 1.45, w: 2.9, h: 3.85, fill: { color: C.bg_card }, shadow: { type: "outer", color: "000000", blur: 12, offset: 3, angle: 135, opacity: 0.35 } });
      sl.addShape("RECTANGLE", { x: px, y: 1.45, w: 2.9, h: 0.55, fill: { color: p.col, transparency: 75 } });
      sl.addText("PHASE " + p.n, { x: px + 0.1, y: 1.47, w: 2.7, h: 0.28, fontSize: 9, bold: true, color: C.white, charSpacing: 2, margin: 0 });
      sl.addText(p.t, { x: px + 0.1, y: 1.75, w: 2.7, h: 0.52, fontSize: 13, bold: true, color: C.white, margin: 0, wrap: true });
      p.items.forEach((item, j) => { sl.addText([{ text: "\u2192  ", options: { color: p.col, bold: true } }, { text: item, options: { color: C.muted } }], { x: px + 0.1, y: 2.35 + j * 0.5, w: 2.7, h: 0.42, fontSize: 10, margin: 0 }); });
      sl.addShape("RECTANGLE", { x: px, y: 4.75, w: 2.9, h: 0.55, fill: { color: p.col, transparency: 82 } });
      sl.addShape("RECTANGLE", { x: px, y: 4.75, w: 0.04, h: 0.55, fill: { color: p.col } });
      sl.addText("\u2713  " + p.deliverable, { x: px + 0.12, y: 4.75, w: 2.7, h: 0.55, fontSize: 9, bold: true, color: C.white, margin: 0, valign: "middle" });
    });
    slideNum(pres, sl, 10);
  }

  // SLIDE 11 — PHASES 4-6
  {
    const sl = pres.addSlide();
    sl.background = { color: C.bg_dark };
    sectionHeader(sl, "Implementation \u00B7 Deployment");
    titleText(sl, "Phases 4\u20136: Autonomous Research", 0.55, 8.5, 28);

    const phases = [
      { n: "04", t: "Creator Integration", col: C.blue, items: ["Connect LLM reasoning layer", "Automate hypothesis generation", "SEC \u2192 strategy pipeline"], deliverable: "Working Creator Agent" },
      { n: "05", t: "Adversarial Loop", col: C.red, items: ["Build Critic Agent", "Introduce market friction testing", "Automate stress evaluation"], deliverable: "Robustness Validation Framework" },
      { n: "06", t: "Orchestration", col: C.gold, items: ["Implement LangGraph workflow", "Enable end-to-end autonomy", "Schedule research cycles"], deliverable: "Fully Autonomous Quant Lab" },
    ];

    phases.forEach((p, i) => {
      const px = 0.5 + i * 3.15;
      sl.addShape("RECTANGLE", { x: px, y: 1.45, w: 2.9, h: 3.85, fill: { color: C.bg_card }, shadow: { type: "outer", color: "000000", blur: 12, offset: 3, angle: 135, opacity: 0.35 } });
      sl.addShape("RECTANGLE", { x: px, y: 1.45, w: 2.9, h: 0.55, fill: { color: p.col, transparency: 75 } });
      sl.addText("PHASE " + p.n, { x: px + 0.1, y: 1.47, w: 2.7, h: 0.28, fontSize: 9, bold: true, color: C.white, charSpacing: 2, margin: 0 });
      sl.addText(p.t, { x: px + 0.1, y: 1.75, w: 2.7, h: 0.52, fontSize: 13, bold: true, color: C.white, margin: 0, wrap: true });
      p.items.forEach((item, j) => { sl.addText([{ text: "\u2192  ", options: { color: p.col, bold: true } }, { text: item, options: { color: C.muted } }], { x: px + 0.1, y: 2.35 + j * 0.5, w: 2.7, h: 0.42, fontSize: 10, margin: 0 }); });
      sl.addShape("RECTANGLE", { x: px, y: 4.75, w: 2.9, h: 0.55, fill: { color: p.col, transparency: 82 } });
      sl.addShape("RECTANGLE", { x: px, y: 4.75, w: 0.04, h: 0.55, fill: { color: p.col } });
      sl.addText("\u2713  " + p.deliverable, { x: px + 0.12, y: 4.75, w: 2.7, h: 0.55, fontSize: 9, bold: true, color: C.white, margin: 0, valign: "middle" });
    });
    [0,1].forEach(i => { const ax = 0.5 + i * 3.15 + 2.9; sl.addText("\u2192", { x: ax + 0.05, y: 2.9, w: 0.22, h: 0.35, fontSize: 16, color: C.grey, margin: 0 }); });
    slideNum(pres, sl, 11);
  }

  // SLIDE 12 — CONCLUSION
  {
    const sl = pres.addSlide();
    sl.background = { color: C.bg_dark };
    sl.addShape("RECTANGLE", { x: 0, y: 4.9, w: 10, h: 0.725, fill: { color: C.blue, transparency: 85 } });
    sectionHeader(sl, "Conclusion");
    titleText(sl, "From Research Automation\nto Alpha Manufacturing", 0.5, 7.5, 30);

    sl.addShape("RECTANGLE", { x: 3.5, y: 1.5, w: 3.0, h: 1.1, fill: { color: C.blue, transparency: 75 }, shadow: { type: "outer", color: "000000", blur: 15, offset: 3, angle: 135, opacity: 0.5 } });
    sl.addShape("RECTANGLE", { x: 3.5, y: 1.5, w: 0.04, h: 1.1, fill: { color: C.blue } });
    sl.addText("VAULT OF\nVALIDATED ALPHA", { x: 3.5, y: 1.5, w: 3.0, h: 1.1, fontSize: 13, bold: true, color: C.white, align: "center", valign: "middle", charSpacing: 1, margin: 0 });

    const feeds = [
      { label: "CREATOR",  x: 0.5,  y: 2.3, col: C.blue  },
      { label: "CRITIC",   x: 0.5,  y: 3.3, col: C.red   },
      { label: "JUDGE",    x: 0.5,  y: 4.3, col: C.gold  },
    ];
    feeds.forEach(f => {
      sl.addShape("ROUNDED_RECTANGLE", { x: f.x, y: f.y, w: 1.6, h: 0.5, fill: { color: f.col, transparency: 80 }, rectRadius: 0.07 });
      sl.addText(f.label, { x: f.x, y: f.y, w: 1.6, h: 0.5, fontSize: 10, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
      sl.addShape("LINE", { x: 2.12, y: f.y + 0.25, w: 1.38, h: 0, line: { color: f.col, width: 1.5 } });
      sl.addText("\u2192", { x: 3.32, y: f.y + 0.15, w: 0.2, h: 0.2, fontSize: 10, color: f.col, margin: 0 });
    });

    const kpis = [
      { label: "Sharpe Ratio",        sub: "Risk-adjusted return quality",  col: C.teal  },
      { label: "Max Drawdown",        sub: "Downside risk exposure",         col: C.red   },
      { label: "Robustness Score",    sub: "Friction + stability + survival", col: C.green },
    ];
    kpis.forEach((k, i) => {
      const ky = 1.55 + i * 1.05;
      sl.addShape("RECTANGLE", { x: 6.7, y: ky, w: 2.8, h: 0.75, fill: { color: C.bg_card } });
      sl.addShape("RECTANGLE", { x: 6.7, y: ky, w: 0.04, h: 0.75, fill: { color: k.col } });
      sl.addText(k.label, { x: 6.82, y: ky + 0.08, w: 2.6, h: 0.28, fontSize: 12, bold: true, color: C.white, margin: 0 });
      sl.addText(k.sub, { x: 6.82, y: ky + 0.38, w: 2.6, h: 0.28, fontSize: 9, color: C.muted, margin: 0 });
    });

    sl.addText("An autonomous scientific research system capable of discovering, challenging, and validating investment strategies faster and more rigorously than traditional human-led quantitative research teams.", { x: 0.5, y: 4.88, w: 9, h: 0.65, fontSize: 9.5, color: C.muted, italic: true, margin: 0, valign: "middle" });
    slideNum(pres, sl, 12);
  }

  const out = "AutonomousQuantLab.pptx";
  await pres.writeFile({ fileName: out });
  console.log("Written:", out);
}

build().catch(console.error);
