import { upload } from "@imagekit/javascript";
import { imagekitAuthUrl } from "../_constants/urls";

interface ImageKitAuthParams {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
}

async function getAuthParams(): Promise<ImageKitAuthParams> {
  const res = await fetch(imagekitAuthUrl);
  if (!res.ok) throw new Error("ImageKit auth request failed");
  return res.json() as Promise<ImageKitAuthParams>;
}

/**
 * Compresses an image to WebP using the browser Canvas API.
 * - Skips GIFs (would lose animation).
 * - Caps width at maxWidth px, preserving aspect ratio.
 * - Returns original File unchanged if WebP encoding is unsupported.
 */
async function compressToWebP(
  file: File,
  maxWidth = 1920,
  quality = 0.82,
): Promise<File> {
  // Skip animated GIFs — canvas would strip animation.
  if (file.type === "image/gif") return file;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file); // fallback to original if canvas unavailable
        return;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file); // fallback to original
            return;
          }
          const baseName = file.name.replace(/\.[^.]+$/, "");
          resolve(new File([blob], `${baseName}.webp`, { type: "image/webp" }));
        },
        "image/webp",
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Format not renderable by the browser (e.g. HEIC, TIFF).
      // Skip compression and upload the original file as-is.
      resolve(file);
    };

    img.src = objectUrl;
  });
}

export const ImageKitService = {
  /**
   * Compresses to WebP, then uploads to ImageKit and returns the CDN URL.
   * The private key stays on the server; only the short-lived signature
   * is sent to the client.
   */
  async uploadImage(
    file: File,
    onProgress?: (pct: number) => void,
  ): Promise<string> {
    const urlEndpoint = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT as string;
    if (!urlEndpoint) throw new Error("VITE_IMAGEKIT_URL_ENDPOINT is not set");

    // Compress + convert to WebP before uploading.
    const compressed = await compressToWebP(file);

    const { token, expire, signature, publicKey } = await getAuthParams();

    // Sanitise the filename so it's safe for ImageKit's storage rules.
    const safeName = `forum_${Date.now()}_${compressed.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

    const response = await upload({
      file: compressed,
      fileName: safeName,
      token,
      expire,
      signature,
      publicKey,
      folder: "/forum-images/",
      useUniqueFileName: true,
      onProgress: onProgress
        ? (event) => {
            if (event.total > 0) {
              onProgress(Math.round((event.loaded / event.total) * 100));
            }
          }
        : undefined,
    });

    // Append auto-quality + auto-format transform so ImageKit serves
    // WebP/AVIF and compresses the image on every delivery request.
    const optimizedUrl = `${response.url}?tr=q-auto,f-auto`;
    return optimizedUrl;
  },
};
