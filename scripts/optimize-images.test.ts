import { describe, expect, it, vi } from 'vitest';

import { main, resolveRequestedFiles } from './optimize-images.mjs';

describe('resolveRequestedFiles', () => {
  it('should accept a file path with or without the public/ prefix', async () => {
    await expect(resolveRequestedFiles(['moon/erlanger-crater.jpg'])).resolves.toEqual(['moon/erlanger-crater.jpg']);

    await expect(resolveRequestedFiles(['public/moon/erlanger-crater.jpg'])).resolves.toEqual(['moon/erlanger-crater.jpg']);
  });

  it('should expand a public subdirectory into raster assets only', async () => {
    const files = await resolveRequestedFiles(['public/moon']);

    expect(files).toContain('moon/erlanger-crater.jpg');
    expect(files).toContain('moon/moon-2k.jpg');
    expect(files.every((file) => /\.(jpe?g|png)$/i.test(file))).toBe(true);
  });

  it('should reject paths outside public', async () => {
    await expect(resolveRequestedFiles(['../README.md'])).rejects.toThrow(/inside public/i);
  });

  it('should accept png raster assets', async () => {
    await expect(resolveRequestedFiles(['public/ch2/orientale-lro.png'])).resolves.toEqual(['ch2/orientale-lro.png']);
  });

  it('should skip excluded assets during directory expansion', async () => {
    const files = await resolveRequestedFiles();

    expect(files).not.toContain('favicon-32x32.png');
  });

  it('should reject excluded assets when requested explicitly', async () => {
    await expect(resolveRequestedFiles(['public/favicon-32x32.png'])).rejects.toThrow('Asset is excluded from optimization: favicon-32x32.png');
  });
});

describe('main', () => {
  it('should report configured responsive variants for selected raster assets', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const tableSpy = vi.spyOn(console, 'table').mockImplementation(() => {});

    await main(['public/ch2/hertzsprung.jpg']);

    expect(tableSpy).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          file: 'ch2/hertzsprung.jpg',
          avif: '—',
          responsiveAvif: expect.stringContaining('ch2/hertzsprung-800.avif'),
        }),
      ])
    );
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Responsive AVIF variants total:'));
  }, 15000);
});
