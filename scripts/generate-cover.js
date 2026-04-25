/**
 * 封面图生成脚本
 * 用法: node scripts/generate-cover.js <topic-name> [output-path]
 * 
 * 生成纯色渐变背景+标题文字的封面图，用于小红书私密发布
 * 输出 PNG 格式，尺寸 1080x1440（小红书推荐比例 3:4）
 */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

// 预设渐变色方案（避免单调）
const GRADIENTS = [
  { from: "#1a1a2e", to: "#16213e", accent: "#e94560" },  // 深蓝+红
  { from: "#0f0c29", to: "#302b63", accent: "#24243e" },  // 深紫
  { from: "#141e30", to: "#243b55", accent: "#4a90d9" },  // 钢蓝
  { from: "#1f1c2c", to: "#928dab", accent: "#6c63ff" },  // 暗薰衣草
  { from: "#0c0c1d", to: "#1a1a3e", accent: "#8b5cf6" },  // 暗紫+亮紫
  { from: "#0d1117", to: "#161b22", accent: "#58a6ff" },  // GitHub Dark
  { from: "#1a1a2e", to: "#0f3460", accent: "#e94560" },  // 深夜红
  { from: "#0a0a23", to: "#1b1b4b", accent: "#00d2ff" },  // 暗蓝+青
];

/**
 * 生成封面图 SVG
 */
function generateCoverSvg(title, gradientIndex = 0) {
  const gradient = GRADIENTS[gradientIndex % GRADIENTS.length];
  const width = 1080;
  const height = 1440;

  // 截断标题，确保不超过20字（小红书标题限制）
  const displayTitle = title.length > 20 ? title.substring(0, 18) + "…" : title;

  // 计算字体大小（根据标题长度自适应）
  let fontSize = 72;
  if (displayTitle.length > 12) fontSize = 60;
  if (displayTitle.length > 16) fontSize = 48;

  const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${gradient.from}" />
      <stop offset="100%" style="stop-color:${gradient.to}" />
    </linearGradient>
    <linearGradient id="accent-line" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${gradient.accent};stop-opacity:0" />
      <stop offset="50%" style="stop-color:${gradient.accent};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${gradient.accent};stop-opacity:0" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="20" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- 背景 -->
  <rect width="${width}" height="${height}" fill="url(#bg)" />
  
  <!-- 装饰圆 -->
  <circle cx="${width * 0.8}" cy="${height * 0.2}" r="200" fill="${gradient.accent}" opacity="0.06" />
  <circle cx="${width * 0.2}" cy="${height * 0.75}" r="280" fill="${gradient.accent}" opacity="0.04" />
  
  <!-- 顶部装饰线 -->
  <rect x="120" y="200" width="${width - 240}" height="1" fill="url(#accent-line)" />
  
  <!-- 标题文字 -->
  <text 
    x="${width / 2}" 
    y="${height * 0.42}" 
    text-anchor="middle" 
    font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" 
    font-size="${fontSize}" 
    font-weight="700" 
    fill="white"
    filter="url(#glow)"
  >${displayTitle}</text>
  
  <!-- 副标题 -->
  <text 
    x="${width / 2}" 
    y="${height * 0.52}" 
    text-anchor="middle" 
    font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" 
    font-size="24" 
    fill="rgba(255,255,255,0.4)"
    letter-spacing="8"
  >知 识 整 合</text>
  
  <!-- 底部装饰线 -->
  <rect x="120" y="${height - 280}" width="${width - 240}" height="1" fill="url(#accent-line)" />
  
  <!-- 底部品牌 -->
  <text 
    x="${width / 2}" 
    y="${height - 220}" 
    text-anchor="middle" 
    font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" 
    font-size="18" 
    fill="rgba(255,255,255,0.2)"
  >⛏️ KnowledgeMine</text>
</svg>`;

  return svg;
}

/**
 * 生成封面图并保存为 PNG
 */
async function generateCover(topicName, outputPath) {
  const gradientIndex = topicName.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const svg = generateCoverSvg(topicName, gradientIndex);

  const defaultOutput = path.join(
    __dirname,
    "..",
    "topics",
    topicName,
    "cover.png"
  );
  const finalOutput = outputPath || defaultOutput;

  // 确保输出目录存在
  const outputDir = path.dirname(finalOutput);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  await sharp(Buffer.from(svg)).png().toFile(finalOutput);
  console.log(`✅ 封面图已生成: ${finalOutput}`);
  return finalOutput;
}

// CLI 调用
const args = process.argv.slice(2);
if (args.length >= 1) {
  generateCover(args[0], args[1]).catch(console.error);
}

module.exports = { generateCover, generateCoverSvg };
