import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../firebase';
import { compressImageFileToDataUrl } from '../utils/storage';

export type PortfolioImageFolder = 'projects' | 'sketches' | 'profile' | 'models';

export interface UploadedImageResult {
  url: string;
  source: 'storage' | 'data-url';
}

function sanitizeFilename(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-');
  return cleaned.slice(0, 80) || 'upload.jpg';
}

/**
 * Uploads an image to Firebase Cloud Storage under /portfolio/{folder}/ and falls back
 * to bounded JPEG data-URL compression if Cloud Storage is unavailable.
 */
export async function uploadPortfolioImage(
  file: File,
  folder: PortfolioImageFolder
): Promise<UploadedImageResult> {
  const safeName = sanitizeFilename(file.name || 'image.jpg');
  const objectPath = `portfolio/${folder}/${Date.now()}-${safeName}`;
  const storageRef = ref(storage, objectPath);

  try {
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type || 'image/jpeg',
    });
    const url = await getDownloadURL(snapshot.ref);
    return { url, source: 'storage' };
  } catch (error) {
    console.warn('Firebase Storage upload unavailable, falling back to compressed data URL:', error);
    const maxDimension = folder === 'profile' ? 1200 : 1400;
    const maxDataUrlLength = folder === 'profile' ? 220000 : 400000;
    const dataUrl = await compressImageFileToDataUrl(file, maxDimension, maxDataUrlLength);
    return { url: dataUrl, source: 'data-url' };
  }
}

/**
 * Uploads a 3D model (.glb or .obj) to Firebase Cloud Storage under /portfolio/models/.
 */
export async function uploadModelFile(file: File): Promise<string> {
  const lower = (file.name || '').toLowerCase();
  const isGlb = lower.endsWith('.glb');
  const isObj = lower.endsWith('.obj');
  if (!isGlb && !isObj) {
    throw new Error('Please upload a .glb or .obj 3D model file.');
  }

  const safeName = sanitizeFilename(file.name || 'model.glb');
  const objectPath = `portfolio/models/${Date.now()}-${safeName}`;
  const storageRef = ref(storage, objectPath);

  const contentType = isGlb
    ? 'model/gltf-binary'
    : file.type || 'text/plain';

  try {
    const snapshot = await uploadBytes(storageRef, file, { contentType });
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error('Failed to upload 3D model to Firebase Storage:', error);
    throw new Error(
      'Could not upload 3D model to Firebase Storage. Ensure storage.rules are deployed or place the .glb under public/assets/models/ and paste its path.'
    );
  }
}
