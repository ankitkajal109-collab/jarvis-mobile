import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    table[i] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function renderArcReactor(width, height, isMaskable = false) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const ihdrChunk = makeChunk('IHDR', ihdr);

  const cx = width / 2;
  const cy = height / 2;
  // If maskable, safe zone radius is 0.38 of min dim; otherwise 0.46
  const maxR = (Math.min(width, height) / 2) * (isMaskable ? 0.72 : 0.90);

  const rawRows = [];

  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * 4);
    row[0] = 0; // Filter 0

    for (let x = 0; x < width; x++) {
      const idx = 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx); // -PI to PI
      const normDist = dist / maxR;

      // Base background: Deep sci-fi navy/black
      let r = 3;
      let g = 7;
      let b = 18;
      let a = 255;

      // Ambient radial blue glow
      if (normDist < 1.2) {
        const glowFactor = Math.max(0, 1 - normDist / 1.2);
        r += Math.round(15 * glowFactor);
        g += Math.round(50 * glowFactor);
        b += Math.round(90 * glowFactor);
      }

      // Outer dashed tech ring (normDist ~ 0.92 to 0.96)
      if (normDist >= 0.90 && normDist <= 0.95) {
        const seg = Math.floor(((angle + Math.PI) / (2 * Math.PI)) * 36);
        if (seg % 2 === 0) {
          r = 14; g = 165; b = 233; // Sky blue
        }
      }

      // Main outer cyan ring (normDist ~ 0.78 to 0.84)
      if (normDist >= 0.78 && normDist <= 0.84) {
        r = 56; g = 189; b = 248;
      }

      // Segmented arc blocks (normDist ~ 0.58 to 0.72, 8 segments)
      if (normDist >= 0.58 && normDist <= 0.72) {
        const seg = Math.floor(((angle + Math.PI + 0.2) / (2 * Math.PI)) * 8);
        const withinSeg = (((angle + Math.PI + 0.2) / (2 * Math.PI)) * 8) % 1;
        if (withinSeg > 0.2 && withinSeg < 0.8) {
          r = 6; g = 182; b = 212; // Cyan
        }
      }

      // Inner glowing core ring (normDist ~ 0.38 to 0.44)
      if (normDist >= 0.38 && normDist <= 0.44) {
        r = 125; g = 211; b = 252;
      }

      // Core plasma glow (normDist < 0.38)
      if (normDist < 0.38) {
        const coreIntensity = Math.max(0, 1 - normDist / 0.38);
        // Blend from intense sky-blue to brilliant white at center
        if (normDist < 0.12) {
          r = 255; g = 255; b = 255; // Pure white fusion core
        } else {
          r = Math.round(180 + 75 * coreIntensity);
          g = Math.round(230 + 25 * coreIntensity);
          b = 255;
        }
      }

      // 4 Tech crosshair lines at 0, 90, 180, 270 deg
      const isCrosshairH = Math.abs(dy) <= (width > 200 ? 3 : 1) && ((dist > maxR * 0.48 && dist < maxR * 0.78) || (dist > maxR * 0.88 && dist < maxR * 1.05));
      const isCrosshairV = Math.abs(dx) <= (width > 200 ? 3 : 1) && ((dist > maxR * 0.48 && dist < maxR * 0.78) || (dist > maxR * 0.88 && dist < maxR * 1.05));
      if (isCrosshairH || isCrosshairV) {
        r = 224; g = 242; b = 254;
      }

      row[idx] = Math.min(255, r);
      row[idx + 1] = Math.min(255, g);
      row[idx + 2] = Math.min(255, b);
      row[idx + 3] = a;
    }
    rawRows.push(row);
  }

  const rawData = Buffer.concat(rawRows);
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. 192x192
const pwa192 = renderArcReactor(192, 192, false);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), pwa192);
console.log('Generated pwa-192x192.png');

// 2. 512x512
const pwa512 = renderArcReactor(512, 512, false);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), pwa512);
console.log('Generated pwa-512x512.png');

// 3. 512x512 maskable (safe zone margin)
const pwaMaskable512 = renderArcReactor(512, 512, true);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pwaMaskable512);
console.log('Generated pwa-maskable-512x512.png');

// 4. Apple Touch Icon 180x180
const appleTouch = renderArcReactor(180, 180, false);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouch);
console.log('Generated apple-touch-icon.png');

// 5. Favicon 32x32
const fav32 = renderArcReactor(32, 32, false);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), fav32);
console.log('Generated favicon.ico');

console.log('All PWA icons generated successfully!');
