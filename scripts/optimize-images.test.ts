import { describe, expect, it } from 'vitest';

import { resolveRequestedFiles } from './optimize-images.mjs';

describe('resolveRequestedFiles', () => {
  it('should accept a file path with or without the public/ prefix', async () => {
    await expect(resolveRequestedFiles(['moon/erlanger-crater.jpg'])).resolves.toEqual([
      'moon/erlanger-crater.jpg',
    ]);

    await expect(resolveRequestedFiles(['public/moon/erlanger-crater.jpg'])).resolves.toEqual([
      'moon/erlanger-crater.jpg',
    ]);
  });

  it('should expand a public subdirectory into raster assets only', async () => {
    const files = await resolveRequestedFiles(['public/moon']);

    expect(files).toContain('moon/erlanger-crater.jpg');
    expect(files).toContain('moon/moon-2k.jpg');
    expect(files.every((file) => /\.(jpe?g)$/i.test(file))).toBe(true);
  });

  it('should reject paths outside public', async () => {
    await expect(resolveRequestedFiles(['../README.md'])).rejects.toThrow(/inside public/i);
  });
});
