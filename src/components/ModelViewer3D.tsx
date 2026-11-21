import { Maximize2, Minimize2, RotateCcw, RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

export type RenderMode = 'clay' | 'materials' | 'wireframe';

interface ModelViewer3DProps {
  modelUrl: string;
  format: 'glb' | 'obj';
  title: string;
  /** Live viewport visibility from IntersectionObserver; pauses rendering when scrolled away. */
  isVisible?: boolean;
}

// Enable Three.js built-in loader cache so switching back to previously viewed models avoids re-fetching
THREE.Cache.enabled = true;

let cachedIsSoftwareGl: boolean | null = null;
function detectSoftwareWebGL(): boolean {
  if (cachedIsSoftwareGl !== null) return cachedIsSoftwareGl;
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) {
      cachedIsSoftwareGl = true;
      return true;
    }
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    cachedIsSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    return cachedIsSoftwareGl;
  } catch {
    cachedIsSoftwareGl = false;
    return false;
  }
}

function isGlassMaterial(mat: THREE.Material | undefined): boolean {
  if (!mat) return false;
  const name = (mat.name || '').toLowerCase();
  if (name.includes('glass')) return true;
  if ('transparent' in mat && mat.transparent && 'opacity' in mat && Number(mat.opacity) < 0.95) {
    return true;
  }
  return false;
}

function disposeMaterial(mat: THREE.Material | THREE.Material[]) {
  if (Array.isArray(mat)) {
    mat.forEach((m) => m.dispose());
  } else {
    mat.dispose();
  }
}

/**
 * Samples world-space vertices to compute 10th–90th percentile bounds so models with
 * sparse outer site context still frame tightly around the main architectural cluster.
 */
function computeClusterCameraFocus(root: THREE.Object3D, fallbackSize: THREE.Vector3) {
  root.updateMatrixWorld(true);

  let totalVerts = 0;
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      const pos = obj.geometry?.attributes?.position;
      if (pos) totalVerts += pos.count;
    }
  });

  const maxDim = Math.max(fallbackSize.x, fallbackSize.y, fallbackSize.z, 1);
  if (totalVerts === 0) {
    const focusCenter = new THREE.Vector3(0, Math.min(fallbackSize.y * 0.38, maxDim * 0.2), 0);
    return { focusCenter, focusMax: maxDim };
  }

  const stride = Math.max(1, Math.floor(totalVerts / 15000));
  const xs: number[] = [];
  const ys: number[] = [];
  const zs: number[] = [];
  const v = new THREE.Vector3();

  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    const pos = obj.geometry?.attributes?.position;
    if (!pos) return;
    for (let i = 0; i < pos.count; i += stride) {
      v.fromBufferAttribute(pos, i).applyMatrix4(obj.matrixWorld);
      xs.push(v.x);
      ys.push(v.y);
      zs.push(v.z);
    }
  });

  if (xs.length === 0) {
    const focusCenter = new THREE.Vector3(0, Math.min(fallbackSize.y * 0.38, maxDim * 0.2), 0);
    return { focusCenter, focusMax: maxDim };
  }

  xs.sort((a, b) => a - b);
  ys.sort((a, b) => a - b);
  zs.sort((a, b) => a - b);

  const lo = Math.floor(0.1 * (xs.length - 1));
  const hi = Math.ceil(0.9 * (xs.length - 1));

  const focusCenter = new THREE.Vector3(
    (xs[lo] + xs[hi]) * 0.5,
    (ys[lo] + ys[hi]) * 0.5,
    (zs[lo] + zs[hi]) * 0.5
  );
  const focusMax = Math.max(xs[hi] - xs[lo], ys[hi] - ys[lo], zs[hi] - zs[lo], 0.5);

  return { focusCenter, focusMax };
}

export function ModelViewer3D({
  modelUrl,
  format,
  title,
  isVisible = true,
}: ModelViewer3DProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);

  const [renderMode, setRenderMode] = useState<RenderMode>('materials');
  const [autoRotate, setAutoRotate] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const defaultViewRef = useRef<{
    position: THREE.Vector3;
    target: THREE.Vector3;
  } | null>(null);
  const loadedRootRef = useRef<THREE.Object3D | null>(null);
  const originalMaterialsRef = useRef<Map<THREE.Mesh, THREE.Material | THREE.Material[]>>(
    new Map()
  );
  const modeMaterialsRef = useRef<THREE.Material[]>([]);

  const renderModeRef = useRef<RenderMode>(renderMode);
  const autoRotateRef = useRef<boolean>(autoRotate);
  const isVisibleRef = useRef<boolean>(isVisible);
  const requestRenderRef = useRef<() => void>(() => {});

  renderModeRef.current = renderMode;
  autoRotateRef.current = autoRotate;
  isVisibleRef.current = isVisible;

  const applyRenderMode = (mode: RenderMode) => {
    const root = loadedRootRef.current;
    if (!root) return;

    // Dispose previously synthesized mode materials (not the original ones)
    modeMaterialsRef.current.forEach((m) => m.dispose());
    modeMaterialsRef.current = [];

    let clayOpaque: THREE.MeshStandardMaterial | null = null;
    let clayGlass: THREE.MeshStandardMaterial | null = null;
    let wireMat: THREE.MeshBasicMaterial | null = null;

    if (mode === 'clay') {
      clayOpaque = new THREE.MeshStandardMaterial({
        color: 0xefece6,
        roughness: 0.86,
        metalness: 0.04,
        side: THREE.DoubleSide,
        flatShading: true,
      });
      clayGlass = new THREE.MeshStandardMaterial({
        color: 0xb8d4e3,
        roughness: 0.16,
        metalness: 0.1,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
        flatShading: true,
      });
      modeMaterialsRef.current.push(clayOpaque, clayGlass);
    } else if (mode === 'wireframe') {
      wireMat = new THREE.MeshBasicMaterial({
        color: 0x2c2c2a,
        wireframe: true,
      });
      modeMaterialsRef.current.push(wireMat);
    }

    root.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      const original = originalMaterialsRef.current.get(obj);
      if (!original) return;

      if (mode === 'materials') {
        obj.material = original;
        return;
      }

      if (mode === 'wireframe' && wireMat) {
        obj.material = wireMat;
        return;
      }

      if (mode === 'clay' && clayOpaque && clayGlass) {
        if (Array.isArray(original)) {
          obj.material = original.map((m) => (isGlassMaterial(m) ? clayGlass! : clayOpaque!));
        } else {
          obj.material = isGlassMaterial(original) ? clayGlass : clayOpaque;
        }
      }
    });

    requestRenderRef.current();
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(document.fullscreenElement === wrapperRef.current);
      requestRenderRef.current();
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  useEffect(() => {
    const isSoftwareGl = detectSoftwareWebGL();
    if (controlsRef.current) {
      controlsRef.current.autoRotate = !isSoftwareGl && autoRotate && isVisible;
      controlsRef.current.autoRotateSpeed = 0.85;
    }
    if (isVisible) {
      requestRenderRef.current();
    }
  }, [autoRotate, isVisible]);

  useEffect(() => {
    applyRenderMode(renderMode);
  }, [renderMode]);

  useEffect(() => {
    const host = canvasHostRef.current;
    if (!host) return;

    const isSoftwareGl = detectSoftwareWebGL();
    let cancelled = false;
    setIsLoading(true);
    setLoadProgress(0);
    setLoadError(null);

    const width = Math.max(host.clientWidth, 300);
    const height = Math.max(host.clientHeight, 360);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#F5F4EF');

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.05, 500);
    camera.position.set(8, 5, 8);
    cameraRef.current = camera;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setIsLoading(false);
      setLoadError('WebGL is unavailable in this browser environment.');
      return;
    }

    // Cap pixel ratio at 1 on software WebGL and 1.5 on HiDPI GPUs for smooth frame pacing
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    host.innerHTML = '';
    host.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.08;
    controls.autoRotate = !isSoftwareGl && autoRotateRef.current && isVisibleRef.current;
    controls.autoRotateSpeed = 0.85;
    controls.maxPolarAngle = Math.PI * 0.52;
    controlsRef.current = controls;

    // Architectural studio lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xe6e2d5, 1.15);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffaf0, 1.4);
    keyLight.position.set(12, 18, 10);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xdbeafe, 0.55);
    rimLight.position.set(-10, 8, -12);
    scene.add(rimLight);

    const grid = new THREE.GridHelper(20, 40, 0xd4d2c9, 0xe7e5dc);
    grid.position.y = -0.005;
    scene.add(grid);

    // Coalesced on-demand rendering: 0 GPU work while idle or off-screen.
    // On software WebGL, pace redraws with WebGL2 fenceSync so the main thread never stalls.
    let rafId = 0;
    let timerId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let isInteracting = false;
    let dampingUntil = 0;
    const prevCamPos = new THREE.Vector3();
    const prevTarget = new THREE.Vector3();

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (typeof gl.fenceSync !== 'function') {
        timerId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (cancelled) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          timerId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          timerId = window.setTimeout(cb, 80);
        }
      };
      timerId = window.setTimeout(poll, 5);
    };

    const requestRender = () => {
      if (cancelled) return;
      if (!isVisibleRef.current) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      rafId = requestAnimationFrame(() => {
        if (cancelled) return;
        renderDirty = false;

        prevCamPos.copy(camera.position);
        prevTarget.copy(controls.target);

        const shouldAutoRotate = !isSoftwareGl && autoRotateRef.current && isVisibleRef.current;
        controls.autoRotate = shouldAutoRotate;
        controls.update();

        renderer.render(scene, camera);

        const cameraMoved =
          prevCamPos.distanceToSquared(camera.position) > 1e-7 ||
          prevTarget.distanceToSquared(controls.target) > 1e-7;
        const stillDamping =
          !isSoftwareGl && (isInteracting || (cameraMoved && performance.now() < dampingUntil));

        const done = () => {
          renderBusy = false;
          if (cancelled || !isVisibleRef.current) return;
          if (renderDirty || shouldAutoRotate || stillDamping) {
            requestRender();
          }
        };

        if (isSoftwareGl) {
          afterDraw(done);
        } else {
          done();
        }
      });
    };

    requestRenderRef.current = requestRender;

    const handleControlStart = () => {
      isInteracting = true;
      dampingUntil = performance.now() + 800;
      requestRender();
    };
    const handleControlChange = () => {
      dampingUntil = performance.now() + 650;
      requestRender();
    };
    const handleControlEnd = () => {
      isInteracting = false;
      dampingUntil = performance.now() + 650;
      requestRender();
    };

    controls.addEventListener('start', handleControlStart);
    controls.addEventListener('change', handleControlChange);
    controls.addEventListener('end', handleControlEnd);

    const handleLoadedModel = (root: THREE.Object3D) => {
      if (cancelled) return;

      originalMaterialsRef.current.clear();

      root.traverse((obj) => {
        if (!(obj instanceof THREE.Mesh)) return;
        const hasNormals = Boolean(obj.geometry?.attributes?.normal);
        const setFlatIfNoNormals = (m: THREE.Material) => {
          if (!hasNormals && 'flatShading' in m) {
            (m as THREE.MeshStandardMaterial).flatShading = true;
            m.needsUpdate = true;
          }
          if ('side' in m) {
            m.side = THREE.DoubleSide;
          }
        };

        if (Array.isArray(obj.material)) {
          obj.material.forEach(setFlatIfNoNormals);
        } else if (obj.material) {
          setFlatIfNoNormals(obj.material);
        }

        originalMaterialsRef.current.set(obj, obj.material);
      });

      // Normalize placement onto floor grid and auto-frame camera around dense cluster
      const box = new THREE.Box3().setFromObject(root);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      root.position.x -= center.x;
      root.position.z -= center.z;
      root.position.y -= box.min.y;

      const maxDim = Math.max(size.x, size.y, size.z, 1);
      const { focusCenter, focusMax } = computeClusterCameraFocus(root, size);

      let target: THREE.Vector3;
      let camPos: THREE.Vector3;
      let frameSpan: number;

      if (focusMax >= maxDim * 0.55) {
        const sphereRadius = Math.max(size.length() * 0.5, 0.5);
        const halfFovRad = THREE.MathUtils.degToRad(camera.fov * 0.5);
        const aspect = Math.max(camera.aspect, 0.75);
        const halfHorizFovRad = Math.atan(Math.tan(halfFovRad) * aspect);
        const fitDist =
          Math.max(
            sphereRadius / Math.sin(halfFovRad),
            sphereRadius / Math.sin(halfHorizFovRad)
          ) * 1.04;

        target = new THREE.Vector3(0, size.y * 0.48, 0);
        camPos = new THREE.Vector3(1.0, 0.54, 1.0)
          .normalize()
          .multiplyScalar(fitDist)
          .add(target);
        frameSpan = Math.max(maxDim, sphereRadius * 2);
      } else {
        target = focusCenter.clone();
        camPos = new THREE.Vector3(
          focusCenter.x + focusMax * 1.02,
          focusCenter.y + focusMax * 0.52,
          focusCenter.z + focusMax * 1.02
        );
        frameSpan = Math.max(maxDim, focusMax);
      }

      camera.near = Math.max(0.01, frameSpan * 0.002);
      camera.far = frameSpan * 30;
      camera.position.copy(camPos);
      camera.updateProjectionMatrix();

      controls.target.copy(target);
      controls.minDistance = frameSpan * 0.05;
      controls.maxDistance = frameSpan * 5;
      controls.update();

      defaultViewRef.current = {
        position: camPos.clone(),
        target: target.clone(),
      };

      scene.add(root);
      loadedRootRef.current = root;
      applyRenderMode(renderModeRef.current);
      setIsLoading(false);
      setLoadProgress(100);
      requestRender();
    };

    const onProgress = (evt: ProgressEvent<EventTarget>) => {
      if (cancelled || !evt.lengthComputable || evt.total <= 0) return;
      setLoadProgress(Math.min(99, Math.round((evt.loaded / evt.total) * 100)));
    };

    const onError = () => {
      if (cancelled) return;
      setIsLoading(false);
      setLoadError('Could not load 3D model file. Check that the asset path is accessible.');
    };

    if (format === 'obj') {
      const objLoader = new OBJLoader();
      objLoader.load(modelUrl, handleLoadedModel, onProgress, onError);
    } else {
      const gltfLoader = new GLTFLoader();
      gltfLoader.load(modelUrl, (gltf) => handleLoadedModel(gltf.scene), onProgress, onError);
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = Math.max(entry.contentRect.width, 200);
      const h = Math.max(entry.contentRect.height, 260);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    });
    resizeObserver.observe(host);

    // Render initial empty floor grid frame once
    requestRender();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
      resizeObserver.disconnect();
      controls.removeEventListener('start', handleControlStart);
      controls.removeEventListener('change', handleControlChange);
      controls.removeEventListener('end', handleControlEnd);
      controls.dispose();

      if (loadedRootRef.current) {
        loadedRootRef.current.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry?.dispose();
          }
        });
      }
      originalMaterialsRef.current.forEach((mat) => disposeMaterial(mat));
      originalMaterialsRef.current.clear();
      modeMaterialsRef.current.forEach((mat) => mat.dispose());
      modeMaterialsRef.current = [];

      grid.geometry.dispose();
      if (Array.isArray(grid.material)) {
        grid.material.forEach((m) => m.dispose());
      } else {
        grid.material.dispose();
      }

      renderer.dispose();
      if (renderer.domElement.parentElement === host) {
        host.removeChild(renderer.domElement);
      }
      loadedRootRef.current = null;
      controlsRef.current = null;
      cameraRef.current = null;
      requestRenderRef.current = () => {};
    };
  }, [modelUrl, format]);

  const handleResetView = () => {
    const cam = cameraRef.current;
    const ctrls = controlsRef.current;
    const def = defaultViewRef.current;
    if (!cam || !ctrls || !def) return;
    cam.position.copy(def.position);
    ctrls.target.copy(def.target);
    ctrls.update();
    requestRenderRef.current();
  };

  const handleToggleFullscreen = async () => {
    const el = wrapperRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement === el) {
        await document.exitFullscreen();
      } else {
        await el.requestFullscreen();
      }
    } catch {
      // ignore browser fullscreen restriction
    }
  };

  return (
    <div
      ref={wrapperRef}
      className="relative flex flex-col w-full h-full min-h-[440px] sm:min-h-[520px] bg-[#F5F4EF] border border-[#E5E5E0] rounded-xl overflow-hidden select-none"
      aria-label={`Interactive 3D viewport for ${title}`}
    >
      {/* Top Toolbar (solid drafting surface, zero backdrop-blur over WebGL) */}
      <div className="z-10 px-3.5 py-2.5 bg-[#FAFAF8] border-b border-[#E5E5E0] flex flex-wrap items-center justify-between gap-2">
        <div
          role="group"
          aria-label="3D render mode"
          className="inline-flex items-center gap-1 p-0.5 bg-[#EFECE6] border border-[#E2E0D8] rounded-md"
        >
          {(
            [
              { id: 'materials', label: 'Materials' },
              { id: 'clay', label: 'Clay' },
              { id: 'wireframe', label: 'Wireframe' },
            ] as const
          ).map((mode) => {
            const active = renderMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setRenderMode(mode.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  active
                    ? 'bg-white text-[#141413] shadow-xs'
                    : 'text-[#575652] hover:text-[#141413]'
                }`}
              >
                {mode.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setAutoRotate((prev) => !prev)}
            aria-pressed={autoRotate}
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded border transition-colors ${
              autoRotate
                ? 'bg-[#1D4ED8] text-white border-[#1D4ED8]'
                : 'bg-white text-[#2C2C2A] border-[#DFDED8] hover:border-[#141413]'
            }`}
          >
            <RefreshCw className={`w-3 h-3 ${autoRotate ? 'animate-spin' : ''}`} aria-hidden="true" />
            Orbit
          </button>

          <button
            type="button"
            onClick={handleResetView}
            title="Reset camera view"
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-white text-[#2C2C2A] border border-[#DFDED8] hover:border-[#141413] rounded transition-colors"
          >
            <RotateCcw className="w-3 h-3" aria-hidden="true" />
            Reset
          </button>

          <button
            type="button"
            onClick={handleToggleFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen 3D viewer' : 'Enter fullscreen 3D viewer'}
            className="inline-flex items-center justify-center w-7 h-7 bg-white text-[#2C2C2A] border border-[#DFDED8] hover:border-[#141413] rounded transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Three.js Canvas Host */}
      <div className="relative flex-1 min-h-[380px]">
        <div ref={canvasHostRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F5F4EF]/95 px-6 text-center">
            <p className="font-mono-tabular text-xs text-[#6B6A65] mb-2">
              Loading 3D Geometry... {loadProgress > 0 ? `${loadProgress}%` : ''}
            </p>
            <div className="w-52 h-1.5 bg-[#E5E4DC] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1D4ED8] transition-all duration-150"
                style={{ width: `${Math.max(12, loadProgress)}%` }}
              />
            </div>
          </div>
        )}

        {loadError && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F5F4EF] px-6 text-center">
            <p className="font-editorial text-lg font-semibold text-[#141413] mb-1">
              3D Preview Unavailable
            </p>
            <p className="text-xs text-[#6B6A65] max-w-sm">{loadError}</p>
          </div>
        )}

        {!isLoading && !loadError && (
          <div className="pointer-events-none absolute left-3.5 bottom-3 px-2.5 py-1 bg-white/95 border border-[#E5E5E0] rounded text-[11px] font-mono-tabular text-[#575652]">
            Drag to orbit · Scroll to zoom · Right-drag to pan
          </div>
        )}
      </div>
    </div>
  );
}
