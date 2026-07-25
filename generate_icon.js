const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

async function generateIcon() {
  const assetsDir = path.join(__dirname, "assets");
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  // Create a 512x512 gradient icon with SVG
  const svgBuffer = Buffer.from(`
    <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#09090B" />
          <stop offset="100%" stop-color="#18181B" />
        </linearGradient>
        <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#8B5CF6" />
          <stop offset="100%" stop-color="#7C3AED" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="16" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      <!-- Background Card -->
      <rect width="512" height="512" rx="128" fill="url(#bgGrad)" />
      <rect width="504" height="504" x="4" y="4" rx="124" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="8" />

      <!-- PRAMAAN Trust Badge Shield / P -->
      <g transform="translate(106, 96)">
        <path d="M150 0 L270 45 V150 C270 240 150 300 150 300 C150 300 30 240 30 150 V45 Z" fill="url(#accentGrad)" filter="url(#glow)" />
        <path d="M150 20 L250 58 V145 C250 220 150 275 150 275 C150 275 50 220 50 145 V58 Z" fill="#09090B" opacity="0.4" />
        <!-- Inner Verification Check -->
        <path d="M105 145 L135 175 L195 115" fill="none" stroke="#FAFAFA" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" />
      </g>
    </svg>
  `);

  const outputPath = path.join(assetsDir, "icon.png");
  await sharp(svgBuffer).png().toFile(outputPath);
  console.log("Successfully generated assets/icon.png (512x512)");
}

generateIcon().catch(err => {
  console.error("Icon generation failed:", err);
  process.exit(1);
});
