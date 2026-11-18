/* Development only: NODE_PATH must include a local installation of sharp.
 * No dependency or generation runs in visitors' browsers.
 */
'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'assets/share');
const uri = (type, data) => `data:${type};base64,${data.toString('base64')}`;

async function main() {
  const owl = uri('image/jpeg', await fs.readFile(path.join(root, 'assets/brand/jol-logo.jpg')));
  const wave = uri('image/svg+xml', await fs.readFile(path.join(output, 'soft-blue-wave.svg')));
  const qrSvg = await fs.readFile(path.join(output, 'try-it-zero-qr.svg'));
  // Integral module scaling preserves the four-module quiet zone and crisp edges.
  for (const [name, size] of [['try-it-zero-qr', 1110], ['website-qr', 990]]) {
    await sharp(path.join(output, `${name}.svg`), { density: 600 })
      .resize(size, size, { kernel: 'nearest' }).withMetadata({ density: 300 })
      .png().toFile(path.join(output, `${name}.png`));
  }
  const qr = uri('image/png', await sharp(qrSvg, { density: 600 })
    .resize(444, 444, { kernel: 'nearest' }).png().toBuffer());
  const text = (x, y, size, value, options = '') =>
    `<text x="${x}" y="${y}" font-size="${size}" ${options}>${value}</text>`;
  const svg = (w, h, content) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" fill="white"/><g font-family="Arial, sans-serif" text-anchor="middle" fill="#0b306a">${content}</g></svg>`);
  const square = svg(1080, 1080,
    text(540, 150, 83, 'JUST ONE LOOK', 'font-weight="700" letter-spacing="2"') +
    `<image href="${owl}" x="50" y="290" width="370" height="511"/>` +
    text(715, 400, 60, 'Look at Yourself', 'fill="#151c27"') +
    text(710, 565, 104, '~ Try It ~', 'font-weight="700" fill="#0864c9"') +
    text(710, 735, 49, 'justonelook.org/try-it/') +
    `<image href="${wave}" x="0" y="825" width="1080" height="255" preserveAspectRatio="none"/>`);
  const card = svg(1800, 1200,
    text(900, 170, 112, 'JUST ONE LOOK', 'font-weight="700" letter-spacing="4"') +
    `<image href="${owl}" x="85" y="300" width="420" height="580"/>` +
    text(885, 450, 79, 'Look at Yourself', 'fill="#151c27"') +
    text(880, 650, 128, '~ Try It ~', 'font-weight="700" fill="#0864c9"') +
    text(880, 860, 67, 'justonelook.org/try-it/') +
    `<image href="${qr}" x="1290" y="320" width="444" height="444"/>` +
    `<image href="${wave}" x="0" y="935" width="1800" height="265" preserveAspectRatio="none"/>`);
  for (const [name, source] of [['social-invitation', square], ['printable-invitation', card]]) {
    await sharp(source).withMetadata({ density: 300 }).png().toFile(path.join(output, `${name}.png`));
    console.log(`Generated assets/share/${name}.png`);
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
