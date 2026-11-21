import { Model3DItem } from '../types/portfolio';
import { CanvasSurface, parseCanvasSurface } from './portfolioLogic';

const SURFACE_KEY = 'hqy_arch_surface_v1';
const MODELS_KEY = 'hqy_arch_models_v1';
const QUALITY_STEPS = [0.84, 0.72, 0.6, 0.48, 0.36];
const MAX_DIMENSION_ATTEMPTS = 8;

export function loadLocalModels(fallback: Model3DItem[]): Model3DItem[] {
  try {
    const raw = window.localStorage.getItem(MODELS_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallback;
    return parsed as Model3DItem[];
  } catch {
    return fallback;
  }
}

export function saveLocalModels(models: Model3DItem[]): boolean {
  try {
    window.localStorage.setItem(MODELS_KEY, JSON.stringify(models));
    return true;
  } catch {
    return false;
  }
}

export function loadCanvasSurface(): CanvasSurface {
  try {
    return parseCanvasSurface(window.localStorage.getItem(SURFACE_KEY));
  } catch {
    return 'paper';
  }
}

export function saveCanvasSurface(surface: CanvasSurface): void {
  try {
    window.localStorage.setItem(SURFACE_KEY, surface);
  } catch {
    // ignore storage errors
  }
}

/**
 * Compresses an uploaded image file on the client so fallback data URLs stay
 * safely below Firestore field size limits without mid-byte truncation.
 */
export function compressImageFileToDataUrl(
  file: File,
  maxDimension = 1400,
  maxDataUrlLength = 400000
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const rawResult = String(reader.result || '');
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image file.'));
      img.onload = () => {
        const initialScale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        let width = Math.max(1, Math.round(img.width * initialScale));
        let height = Math.max(1, Math.round(img.height * initialScale));
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          if (rawResult.length <= maxDataUrlLength) {
            resolve(rawResult);
          } else {
            reject(new Error('Image exceeds maximum data URL size and canvas is unavailable.'));
          }
          return;
        }

        for (let attempt = 0; attempt < MAX_DIMENSION_ATTEMPTS; attempt += 1) {
          canvas.width = width;
          canvas.height = height;
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          for (const quality of QUALITY_STEPS) {
            const candidate = canvas.toDataURL('image/jpeg', quality);
            if (candidate.length <= maxDataUrlLength) {
              resolve(candidate);
              return;
            }
          }

          if (width <= 1 && height <= 1) break;
          width = Math.max(1, Math.round(width * 0.8));
          height = Math.max(1, Math.round(height * 0.8));
        }

        reject(new Error('Image could not be compressed within the Firestore size limit.'));
      };
      img.src = rawResult;
    };
    reader.readAsDataURL(file);
  });
}
