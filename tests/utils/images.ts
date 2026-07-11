import { Locator } from '@playwright/test';

export type ImageState = { alt: string; loaded: boolean };

/**
 * Reads {alt, loaded} for every element matched by `images` in one browser-side pass.
 * `loaded` is true only if the image actually rendered (not a 404/broken src) - a
 * present `alt` attribute alone doesn't prove the image itself came through.
 *
 * Shared by any spec that needs to prove a set of images both has content (alt text)
 * and isn't broken - currently the About page team roster and the Certifications badges.
 */
export async function loadedImageStates(images: Locator): Promise<ImageState[]> {
  return images.evaluateAll((imgs) =>
    (imgs as HTMLImageElement[]).map((img) => ({
      alt: img.alt.trim(),
      loaded: img.complete && img.naturalWidth > 0,
    }))
  );
}
