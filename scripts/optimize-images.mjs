import process from 'node:process';
import { readFile, readdir, rename, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const publicDir = path.join(repoRoot, 'public');

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

async function collectRasterAssets(dir, prefix = '') {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectRasterAssets(fullPath, relativePath)));
      continue;
    }

    if (entry.isFile() && rasterPattern.test(entry.name)) {
      files.push(relativePath);
    }
  }

  return files;
}

function toPosixPath(filePath) {
  return filePath.replace(/\\/g, '/');
}

function resolveInputPath(input) {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    throw new Error('Received an empty asset path.');
  }

  if (path.isAbsolute(trimmedInput)) {
    return path.resolve(trimmedInput);
  }

  const normalizedInput = path.normalize(trimmedInput);
  if (normalizedInput === 'public' || normalizedInput.startsWith(`public${path.sep}`)) {
    return path.resolve(repoRoot, normalizedInput);
  }

  return path.resolve(publicDir, normalizedInput);
}

function toRelativePublicPath(absolutePath) {
  const relativePath = path.relative(publicDir, absolutePath);

  if (!relativePath || relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new Error(`Asset path must stay inside public/: ${absolutePath}`);
  }

  return toPosixPath(relativePath);
}

export async function resolveRequestedFiles(inputs = []) {
  if (inputs.length === 0) {
    return collectRasterAssets(publicDir);
  }

  const requestedFiles = new Set();

  for (const input of inputs) {
    const absoluteInputPath = resolveInputPath(input);
    const inputStats = await stat(absoluteInputPath);
    const relativePublicPath = toRelativePublicPath(absoluteInputPath);

    if (inputStats.isDirectory()) {
      const files = await collectRasterAssets(absoluteInputPath, relativePublicPath);
      files.forEach((file) => requestedFiles.add(file));
      continue;
    }

    if (!inputStats.isFile()) {
      throw new Error(`Asset path is not a file or directory: ${input}`);
    }

    if (!rasterPattern.test(relativePublicPath)) {
      throw new Error(`Asset path must point to a .jpg or .jpeg file: ${input}`);
    }

    requestedFiles.add(relativePublicPath);
  }

  return [...requestedFiles].sort();
}

export async function main(args = process.argv.slice(2)) {
  const files = await resolveRequestedFiles(args);
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

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
