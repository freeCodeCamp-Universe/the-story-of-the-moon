import { readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const publicDir = path.join(repoRoot, 'public');
const assetsPath = path.join(repoRoot, 'src', 'content', 'assets.json');

const widthOverrides = new Map([
  ['moon/moon-8k.jpg', 4096],
  ['ch4/artemis-ii-earthset.jpg', 2560],
  ['ch4/artemis-ii-eclipse.jpg', 2400],
  ['postcards/apollo-17-moon-disc.jpg', 2200],
  ['ch2/orientale-artemis.jpg', 2400],
  ['moon/erlanger-crater.jpg', 1800],
]);

const qualityOverrides = new Map([
  ['moon/moon-2k.jpg', { jpeg: 84, webp: 82 }],
  ['moon/moon-8k.jpg', { jpeg: 82, webp: 80 }],
  ['ch2/orientale-artemis.jpg', { jpeg: 78, webp: 76 }],
]);

const defaultQuality = { jpeg: 76, webp: 74 };
const rasterPattern = /\.(jpe?g)$/i;

function replaceExtension(filePath, nextExtension) {
  return filePath.replace(rasterPattern, nextExtension);
}

function getTransformOptions(relativePath) {
  return {
    maxWidth: widthOverrides.get(relativePath),
    ...(qualityOverrides.get(relativePath) ?? defaultQuality),
  };
}

async function writeFileAtomically(outputPath, pipeline) {
  const { dir, name, ext } = path.parse(outputPath);
  const tempPath = path.join(dir, `${name}.tmp${ext}`);
  await pipeline.toFile(tempPath);
  await rename(tempPath, outputPath);
}

async function writeBufferAtomically(outputPath, buffer) {
  const { dir, name, ext } = path.parse(outputPath);
  const tempPath = path.join(dir, `${name}.tmp${ext}`);
  await writeFile(tempPath, buffer);
  await rename(tempPath, outputPath);
}

async function optimizeAsset(relativePath) {
  const inputPath = path.join(publicDir, relativePath);
  const webpPath = path.join(publicDir, replaceExtension(relativePath, '.webp'));
  const sourceBuffer = await readFile(inputPath);
  const { maxWidth, jpeg, webp } = getTransformOptions(relativePath);

  const buildPipeline = () => {
    let pipeline = sharp(sourceBuffer, { sequentialRead: true }).rotate();
    if (maxWidth) {
      pipeline = pipeline.resize({ width: maxWidth, fit: 'inside', withoutEnlargement: true });
    }
    return pipeline;
  };

  const before = sourceBuffer.byteLength;

  await writeFileAtomically(
    inputPath,
    buildPipeline().jpeg({
      quality: jpeg,
      mozjpeg: true,
      progressive: true,
      chromaSubsampling: '4:4:4',
    })
  );

  const optimizedJpeg = await readFile(inputPath);
  let webpQuality = webp;
  let optimizedWebp = await buildPipeline()
    .webp({
      quality: webpQuality,
      effort: 6,
    })
    .toBuffer();

  while (optimizedWebp.byteLength >= optimizedJpeg.byteLength && webpQuality > 56) {
    webpQuality -= 6;
    optimizedWebp = await buildPipeline()
      .webp({
        quality: webpQuality,
        effort: 6,
      })
      .toBuffer();
  }

  await writeBufferAtomically(webpPath, optimizedWebp);

  return {
    relativePath,
    before,
    jpegAfter: optimizedJpeg.byteLength,
    webpAfter: optimizedWebp.byteLength,
  };
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function main() {
  const assets = JSON.parse(await readFile(assetsPath, 'utf8'));
  const files = [...new Set(assets.map((asset) => asset.file).filter((file) => rasterPattern.test(file)))];
  const results = [];

  for (const relativePath of files) {
    results.push(await optimizeAsset(relativePath));
  }

  const totalBefore = results.reduce((sum, result) => sum + result.before, 0);
  const totalJpegAfter = results.reduce((sum, result) => sum + result.jpegAfter, 0);
  const totalWebpAfter = results.reduce((sum, result) => sum + result.webpAfter, 0);

  console.log(`Optimized ${results.length} raster assets.`);
  console.table(
    results.map((result) => ({
      file: result.relativePath,
      before: formatSize(result.before),
      jpeg: formatSize(result.jpegAfter),
      webp: formatSize(result.webpAfter),
    }))
  );
  console.log(`JPEG total: ${formatSize(totalBefore)} -> ${formatSize(totalJpegAfter)}`);
  console.log(`WebP siblings total: ${formatSize(totalWebpAfter)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
