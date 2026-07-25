import fs from 'fs';
import path from 'path';

const assetsDir = path.resolve('assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// 1x1 base64 transparent PNG, extended to valid PNG header
const pngBuffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

fs.writeFileSync(path.join(assetsDir, 'icon.png'), pngBuffer);
fs.writeFileSync(path.join(assetsDir, 'icon512.png'), pngBuffer);

console.log('Icon assets generated at assets/icon.png and assets/icon512.png');
