import process from 'node:process';
import {
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
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
  ['moon/erlanger-crater.jpg', 1800],
  ['ch6/high-latitude-water.jpg', 900],
]);

const qualityOverrides = new Map([
  ['moon/moon-2k.jpg', { jpeg: 84, avif: 76 }],
  ['moon/moon-8k.jpg', { jpeg: 82, avif: 74 }],
]);

const excludedAssets = new Set(['favicon-32x32.png']);

const responsiveVariantWidths = new Map([
  ['ch2/hertzsprung.jpg', [800, 1600]],
  ['ch2/hertzsprung-topographic.jpg', [800, 1600]],
  ['ch2/orientale-lro.png', [800, 1600]],
  ['ch2/orientale-topographic.jpg', [800, 1600]],
]);
const responsiveVariantAssets = new Set(responsiveVariantWidths.keys());

const defaultQuality = { jpeg: 76, avif: 55 };
const rasterPattern = /\.(jpe?g|png)$/i;
const jpegPattern = /\.jpe?g$/i;
const pngPattern = /\.png$/i;

function replaceExtension(filePath, nextExtension) {
  return filePath.replace(rasterPattern, nextExtension);
}

function insertWidthSuffix(filePath, width) {
  return filePath.replace(rasterPattern, `-${width}$&`);
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

async function encodeSourceBuffer(pipeline, relativePath, jpegQuality) {
  if (jpegPattern.test(relativePath)) {
    return pipeline
      .jpeg({
        quality: jpegQuality,
        mozjpeg: true,
        progressive: true,
        chromaSubsampling: '4:4:4',
      })
      .toBuffer();
  }

  if (pngPattern.test(relativePath)) {
    return pipeline
      .png({
        compressionLevel: 9,
        adaptiveFiltering: true,
      })
      .toBuffer();
  }

  throw new Error(`Unsupported raster format: ${relativePath}`);
}

async function encodeAvifBuffer(pipeline, quality) {
  return pipeline
    .avif({
      quality,
      effort: 4,
    })
    .toBuffer();
}

async function writeResponsiveVariants(relativePath, sourceBuffer, quality) {
  const widths = responsiveVariantWidths.get(relativePath) ?? [];

  const outputs = [];
  for (const width of widths) {
    const outputRelativePath = replaceExtension(
      insertWidthSuffix(relativePath, width),
      '.avif'
    );
    const outputPath = path.join(publicDir, outputRelativePath);
    const buffer = await encodeAvifBuffer(
      sharp(sourceBuffer, { sequentialRead: true }).rotate().resize({
        width,
        fit: 'inside',
        withoutEnlargement: true,
      }),
      quality
    );
    await writeBufferAtomically(outputPath, buffer);
    outputs.push({
      file: outputRelativePath,
      size: buffer.byteLength,
    });
  }

  return outputs;
}

async function removeFileIfPresent(filePath) {
  await rm(filePath, { force: true });
}

async function optimizeAsset(relativePath) {
  const inputPath = path.join(publicDir, relativePath);
  const avifPath = path.join(
    publicDir,
    replaceExtension(relativePath, '.avif')
  );
  const shouldGenerateDefaultAvif = !responsiveVariantAssets.has(relativePath);
  const sourceBuffer = await readFile(inputPath);
  const { maxWidth, jpeg, avif } = getTransformOptions(relativePath);

  const buildPipeline = () => {
    let pipeline = sharp(sourceBuffer, { sequentialRead: true }).rotate();
    if (maxWidth) {
      pipeline = pipeline.resize({
        width: maxWidth,
        fit: 'inside',
        withoutEnlargement: true,
      });
    }
    return pipeline;
  };

  const before = sourceBuffer.byteLength;

  const sourceCandidate = await encodeSourceBuffer(
    buildPipeline(),
    relativePath,
    jpeg
  );
  const optimizedSource =
    maxWidth || sourceCandidate.byteLength < sourceBuffer.byteLength
      ? sourceCandidate
      : sourceBuffer;
  await writeBufferAtomically(inputPath, optimizedSource);

  let avifQuality = avif;
  let optimizedAvif = Buffer.alloc(0);

  if (shouldGenerateDefaultAvif) {
    optimizedAvif = await encodeAvifBuffer(buildPipeline(), avifQuality);

    while (
      optimizedAvif.byteLength >= optimizedSource.byteLength &&
      avifQuality > 35
    ) {
      avifQuality -= 5;
      optimizedAvif = await encodeAvifBuffer(buildPipeline(), avifQuality);
    }

    await writeBufferAtomically(avifPath, optimizedAvif);
  } else {
    await removeFileIfPresent(avifPath);
  }

  const responsiveVariants = await writeResponsiveVariants(
    relativePath,
    sourceBuffer,
    avifQuality
  );

  return {
    relativePath,
    before,
    sourceAfter: optimizedSource.byteLength,
    avifAfter: optimizedAvif.byteLength,
    responsiveVariants,
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

    if (
      entry.isFile() &&
      rasterPattern.test(entry.name) &&
      !excludedAssets.has(relativePath)
    ) {
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
  if (
    normalizedInput === 'public' ||
    normalizedInput.startsWith(`public${path.sep}`)
  ) {
    return path.resolve(repoRoot, normalizedInput);
  }

  return path.resolve(publicDir, normalizedInput);
}

function toRelativePublicPath(absolutePath) {
  const relativePath = path.relative(publicDir, absolutePath);

  if (
    !relativePath ||
    relativePath.startsWith('..') ||
    path.isAbsolute(relativePath)
  ) {
    throw new Error(`Asset path must stay inside public/: ${absolutePath}`);
  }

  return toPosixPath(relativePath);
}

export async function resolveRequestedFiles(inputs = []) {
  const filteredInputs = inputs.filter((input) => input !== '--');

  if (filteredInputs.length === 0) {
    return collectRasterAssets(publicDir);
  }

  const requestedFiles = new Set();

  for (const input of filteredInputs) {
    const absoluteInputPath = resolveInputPath(input);
    const inputStats = await stat(absoluteInputPath);
    const relativePublicPath = toRelativePublicPath(absoluteInputPath);

    if (inputStats.isDirectory()) {
      const files = await collectRasterAssets(
        absoluteInputPath,
        relativePublicPath
      );
      files.forEach((file) => requestedFiles.add(file));
      continue;
    }

    if (!inputStats.isFile()) {
      throw new Error(`Asset path is not a file or directory: ${input}`);
    }

    if (!rasterPattern.test(relativePublicPath)) {
      throw new Error(
        `Asset path must point to a .jpg, .jpeg, or .png file: ${input}`
      );
    }

    if (excludedAssets.has(relativePublicPath)) {
      throw new Error(
        `Asset is excluded from optimization: ${relativePublicPath}`
      );
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
  const totalSourceAfter = results.reduce(
    (sum, result) => sum + result.sourceAfter,
    0
  );
  const totalAvifAfter = results.reduce(
    (sum, result) => sum + result.avifAfter,
    0
  );
  const totalResponsiveAvifAfter = results.reduce(
    (sum, result) =>
      sum +
      result.responsiveVariants.reduce(
        (variantSum, variant) => variantSum + variant.size,
        0
      ),
    0
  );

  console.log(`Optimized ${results.length} raster assets.`);
  console.table(
    results.map((result) => ({
      file: result.relativePath,
      before: formatSize(result.before),
      source: formatSize(result.sourceAfter),
      avif: result.avifAfter === 0 ? '—' : formatSize(result.avifAfter),
      responsiveAvif:
        result.responsiveVariants.length === 0
          ? '—'
          : result.responsiveVariants
              .map((variant) => `${variant.file} (${formatSize(variant.size)})`)
              .join(', '),
    }))
  );
  console.log(
    `Source total: ${formatSize(totalBefore)} -> ${formatSize(totalSourceAfter)}`
  );
  console.log(`AVIF siblings total: ${formatSize(totalAvifAfter)}`);
  console.log(
    `Responsive AVIF variants total: ${formatSize(totalResponsiveAvifAfter)}`
  );
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
