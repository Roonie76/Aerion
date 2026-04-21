import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const PUBLIC_IMAGES_DIR = path.join(ROOT, 'public', 'images');
const ASSETS_DIR = path.join(ROOT, 'src', 'assets');
const WIDTHS = [480, 800, 1200, 1800];

const SOURCE_IMAGES = [
  {
    output: 'home/hero.jpg',
    width: 2200,
    height: 1400,
    format: 'jpeg',
    render: renderHeroImage,
  },
  {
    output: 'products/fl-05.jpg',
    width: 1800,
    height: 1800,
    format: 'jpeg',
    render: ({ width, height }) =>
      renderProductImage({
        width,
        height,
        accent: '#b8933f',
        title: 'FL-05',
        series: 'Training Series',
        copy: 'Stable flight and drill-ready durability for repeated sessions.',
      }),
  },
  {
    output: 'products/fl-10.jpg',
    width: 1800,
    height: 1800,
    format: 'jpeg',
    render: ({ width, height }) =>
      renderProductImage({
        width,
        height,
        accent: '#c9a84c',
        title: 'FL-10',
        series: 'Club Series',
        copy: 'Balanced speed, crisp control, and dependable tournament prep.',
      }),
  },
  {
    output: 'products/fl-15.jpg',
    width: 1800,
    height: 1800,
    format: 'jpeg',
    render: ({ width, height }) =>
      renderProductImage({
        width,
        height,
        accent: '#e2c47a',
        title: 'FL-15',
        series: 'Tournament Series',
        copy: 'Aerion precision tuned for match-day consistency and touch.',
      }),
  },
  {
    output: 'about/workshop.jpg',
    width: 2000,
    height: 1400,
    format: 'jpeg',
    render: renderAboutImage,
  },
  {
    output: 'about/blueprint.png',
    width: 2000,
    height: 1400,
    format: 'png',
    render: renderBlueprintImage,
  },
];

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function shuttlecockMarkup({ x = 0, y = 0, scale = 1, featherColor = 'rgba(255,255,255,0.92)', coneColor = '#f5efe4', corkColor = '#c9a84c', strokeColor = 'rgba(201,168,76,0.35)' }) {
  const featherPaths = Array.from({ length: 14 }, (_, index) => {
    const offset = -270 + index * 42;
    return `<path d="M ${offset} -250 Q ${offset + 28} -70 ${offset + 10} 135" stroke="${featherColor}" stroke-width="14" stroke-linecap="round" opacity="${0.42 + index * 0.03}" />`;
  }).join('');

  return `
    <g transform="translate(${x} ${y}) scale(${scale}) rotate(-18)">
      ${featherPaths}
      <path d="M -290 -240 L 290 -240 L 92 150 L -92 150 Z" fill="url(#shuttleFill)" opacity="0.92" />
      <path d="M -260 -190 L 260 -190" stroke="${strokeColor}" stroke-width="8" opacity="0.8" />
      <path d="M -210 -100 L 210 -100" stroke="${strokeColor}" stroke-width="8" opacity="0.7" />
      <path d="M -150 0 L 150 0" stroke="${strokeColor}" stroke-width="8" opacity="0.55" />
      <ellipse cx="0" cy="210" rx="126" ry="94" fill="${corkColor}" />
      <ellipse cx="0" cy="192" rx="104" ry="72" fill="${coneColor}" />
      <ellipse cx="0" cy="172" rx="86" ry="58" fill="#fdf9f1" />
      <ellipse cx="0" cy="232" rx="146" ry="22" fill="rgba(0,0,0,0.32)" />
    </g>
  `;
}

function baseSvg({ width, height, accent = '#c9a84c', title = '', subtitle = '', kicker = '', lines = '' }) {
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#05060a" />
          <stop offset="55%" stop-color="#0c111c" />
          <stop offset="100%" stop-color="#18120a" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.28" />
          <stop offset="65%" stop-color="${accent}" stop-opacity="0.02" />
          <stop offset="100%" stop-color="${accent}" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="shuttleFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fbf8f2" />
          <stop offset="100%" stop-color="#dfd2bf" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)" />
      <circle cx="${Math.round(width * 0.7)}" cy="${Math.round(height * 0.28)}" r="${Math.round(Math.min(width, height) * 0.32)}" fill="url(#glow)" />
      <circle cx="${Math.round(width * 0.22)}" cy="${Math.round(height * 0.82)}" r="${Math.round(Math.min(width, height) * 0.22)}" fill="url(#glow)" opacity="0.7" />
      <g opacity="0.1" stroke="${accent}" stroke-width="1">
        <path d="M 80 ${Math.round(height * 0.18)} H ${width - 80}" />
        <path d="M 80 ${Math.round(height * 0.82)} H ${width - 80}" />
        <path d="M ${Math.round(width * 0.12)} 80 V ${height - 80}" />
        <path d="M ${Math.round(width * 0.88)} 80 V ${height - 80}" />
      </g>
      <g opacity="0.14" stroke="rgba(255,255,255,0.08)" stroke-width="1">
        <path d="M 0 ${Math.round(height * 0.7)} H ${width}" />
        <path d="M 0 ${Math.round(height * 0.42)} H ${width}" />
        <path d="M ${Math.round(width * 0.32)} 0 V ${height}" />
        <path d="M ${Math.round(width * 0.56)} 0 V ${height}" />
      </g>
      ${lines}
      ${kicker ? `<text x="110" y="132" fill="${accent}" font-size="42" letter-spacing="12" font-family="Arial, sans-serif" font-weight="700">${escapeXml(kicker)}</text>` : ''}
      ${title ? `<text x="110" y="${Math.round(height * 0.72)}" fill="#f0ede8" font-size="158" letter-spacing="-6" font-family="Arial, sans-serif" font-weight="900">${escapeXml(title)}</text>` : ''}
      ${subtitle ? `<text x="116" y="${Math.round(height * 0.8)}" fill="rgba(240,237,232,0.78)" font-size="42" letter-spacing="2" font-family="Arial, sans-serif">${escapeXml(subtitle)}</text>` : ''}
    </svg>
  `;
}

function renderHeroImage({ width, height }) {
  return Buffer.from(
    baseSvg({
      width,
      height,
      accent: '#c9a84c',
      lines: `
        <g opacity="0.22" stroke="rgba(201,168,76,0.22)" stroke-width="8">
          <path d="M 120 ${Math.round(height * 0.88)} C ${Math.round(width * 0.28)} ${Math.round(height * 0.76)}, ${Math.round(width * 0.42)} ${Math.round(height * 0.78)}, ${Math.round(width * 0.54)} ${Math.round(height * 0.84)}" />
          <path d="M ${Math.round(width * 0.72)} ${Math.round(height * 0.12)} C ${Math.round(width * 0.84)} ${Math.round(height * 0.22)}, ${Math.round(width * 0.92)} ${Math.round(height * 0.34)}, ${Math.round(width * 0.98)} ${Math.round(height * 0.5)}" />
        </g>
        ${shuttlecockMarkup({ x: Math.round(width * 0.73), y: Math.round(height * 0.48), scale: 0.78 })}
      `,
    })
  );
}

function renderProductImage({ width, height, accent, title, series, copy }) {
  return Buffer.from(
    baseSvg({
      width,
      height,
      accent,
      kicker: 'AERION',
      title,
      subtitle: series,
      lines: `
        <g opacity="0.3" stroke="${accent}" stroke-width="5">
          <path d="M 120 ${Math.round(height * 0.2)} H ${Math.round(width * 0.42)}" />
          <path d="M 120 ${Math.round(height * 0.86)} H ${Math.round(width * 0.55)}" />
        </g>
        ${shuttlecockMarkup({ x: Math.round(width * 0.64), y: Math.round(height * 0.46), scale: 0.68, corkColor: accent })}
        <text x="116" y="${Math.round(height * 0.84)}" fill="rgba(240,237,232,0.72)" font-size="34" letter-spacing="1.5" font-family="Arial, sans-serif">${escapeXml(copy)}</text>
      `,
    })
  );
}

function renderAboutImage({ width, height }) {
  return Buffer.from(
    baseSvg({
      width,
      height,
      accent: '#c9a84c',
      kicker: 'AERION WORKSHOP',
      title: 'CRAFTED',
      subtitle: 'Feather selection, cork engineering, binding integrity.',
      lines: `
        <g opacity="0.16" stroke="rgba(201,168,76,0.22)" stroke-width="3">
          <path d="M ${Math.round(width * 0.1)} ${Math.round(height * 0.24)} H ${Math.round(width * 0.42)}" />
          <path d="M ${Math.round(width * 0.1)} ${Math.round(height * 0.3)} H ${Math.round(width * 0.5)}" />
          <path d="M ${Math.round(width * 0.1)} ${Math.round(height * 0.36)} H ${Math.round(width * 0.44)}" />
        </g>
        ${shuttlecockMarkup({ x: Math.round(width * 0.72), y: Math.round(height * 0.48), scale: 0.72 })}
      `,
    })
  );
}

async function renderBlueprintImage({ width, height }) {
  const blueprintPath = path.join(ASSETS_DIR, 'about-blueprint.png');
  const blueprint = await sharp(blueprintPath)
    .resize({ width: 1060, height: 1060, fit: 'contain', background: { r: 5, g: 6, b: 10, alpha: 0 } })
    .tint('#d8c27d')
    .png()
    .toBuffer();

  const overlay = Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bpbg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#05060a" />
          <stop offset="100%" stop-color="#0d1118" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bpbg)" />
      <g opacity="0.12" stroke="#c9a84c" stroke-width="1">
        <path d="M 80 120 H ${width - 80}" />
        <path d="M 80 ${height - 120} H ${width - 80}" />
        <path d="M 120 80 V ${height - 80}" />
        <path d="M ${width - 120} 80 V ${height - 80}" />
        <path d="M 0 ${Math.round(height * 0.5)} H ${width}" />
      </g>
      <text x="140" y="170" fill="#c9a84c" font-size="44" letter-spacing="11" font-family="Arial, sans-serif" font-weight="700">AERION BLUEPRINT</text>
      <text x="140" y="1230" fill="rgba(240,237,232,0.72)" font-size="46" letter-spacing="2" font-family="Arial, sans-serif">Flight geometry and material tolerances.</text>
    </svg>
  `);

  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: '#05060a',
    },
  })
    .composite([
      { input: overlay },
      { input: blueprint, top: 180, left: 780, blend: 'screen' },
    ])
    .png()
    .toBuffer();
}

async function writeSourceImage(definition) {
  const outputPath = path.join(PUBLIC_IMAGES_DIR, definition.output);
  await ensureDir(path.dirname(outputPath));

  const rendered = await definition.render({
    width: definition.width,
    height: definition.height,
  });

  let pipeline = sharp(rendered).resize({
    width: definition.width,
    height: definition.height,
    fit: 'cover',
  });

  if (definition.format === 'png') {
    await pipeline.png({ compressionLevel: 9 }).toFile(outputPath);
    return;
  }

  await pipeline.jpeg({ quality: 92, mozjpeg: true }).toFile(outputPath);
}

async function collectSourceImages(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectSourceImages(fullPath)));
      continue;
    }

    if (!/\.(jpe?g|png)$/i.test(entry.name)) {
      continue;
    }

    if (/-\d+\.(avif|webp)$/i.test(entry.name)) {
      continue;
    }

    files.push(fullPath);
  }

  return files;
}

async function writeResponsiveVariants(sourcePath) {
  const ext = path.extname(sourcePath);
  const basePath = sourcePath.slice(0, -ext.length);
  const metadata = await sharp(sourcePath).metadata();
  const sourceWidth = metadata.width || 0;

  for (const width of WIDTHS.filter((candidate) => candidate <= sourceWidth)) {
    await sharp(sourcePath)
      .resize({ width, withoutEnlargement: true })
      .avif({ quality: 58, effort: 6 })
      .toFile(`${basePath}-${width}.avif`);

    await sharp(sourcePath)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 78, effort: 6 })
      .toFile(`${basePath}-${width}.webp`);
  }
}

async function main() {
  await ensureDir(PUBLIC_IMAGES_DIR);

  for (const source of SOURCE_IMAGES) {
    await writeSourceImage(source);
  }

  const sourceImages = await collectSourceImages(PUBLIC_IMAGES_DIR);

  for (const sourceImage of sourceImages) {
    await writeResponsiveVariants(sourceImage);
  }

  console.log(`Generated ${sourceImages.length} source images with responsive AVIF/WebP variants.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
