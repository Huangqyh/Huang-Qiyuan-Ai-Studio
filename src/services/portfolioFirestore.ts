import {
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  QueryDocumentSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
  Unsubscribe,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { INITIAL_PORTFOLIO_DATA } from '../data/initialPortfolio';
import { db, handleFirestoreError, OperationType, OWNER_EMAIL } from '../firebase';
import {
  PortfolioData,
  PortfolioProject,
  ProfileInfo,
  ProjectCategory,
  SketchItem,
} from '../types/portfolio';

const VALID_CATEGORIES: ProjectCategory[] = [
  'NUS Year 3',
  'NUS Year 2',
  'NUS Year 1',
  'Individual BIM',
  'Professional',
];

const ID_REGEX = /^[a-zA-Z0-9_-]+$/;

function clampStr(value: string | undefined | null, maxLen: number, fallback = ''): string {
  const str = typeof value === 'string' ? value.trim() : fallback;
  return str.length > maxLen ? str.slice(0, maxLen) : str;
}

function validateImageUrl(
  url: string | undefined | null,
  maxLen: number,
  fallback = ''
): string {
  const str = typeof url === 'string' ? url.trim() : fallback;
  if (!str) return fallback;
  if (/^data:/i.test(str) && str.length > maxLen) {
    throw new Error(
      'Uploaded image exceeds Firestore size limit. Please upload a smaller image or enable Firebase Storage.'
    );
  }
  return str.length > maxLen ? str.slice(0, maxLen) : str;
}

function sanitizeDocId(rawId: string, prefix: string): string {
  const cleaned = rawId.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128);
  if (cleaned && ID_REGEX.test(cleaned)) {
    return cleaned;
  }
  return `${prefix}-${Date.now().toString(36)}`;
}

function sanitizeProfile(profile: ProfileInfo): ProfileInfo {
  return {
    fullName: clampStr(profile.fullName, 120, 'Huang Qiyuan') || 'Huang Qiyuan',
    roleTitle: clampStr(profile.roleTitle, 200),
    institutionLine: clampStr(profile.institutionLine, 200),
    location: clampStr(profile.location, 120),
    availability: clampStr(profile.availability, 160),
    statement: clampStr(profile.statement, 1200),
    email: clampStr(profile.email, 160),
    phone: clampStr(profile.phone, 40),
    linkedinUrl: clampStr(profile.linkedinUrl, 300),
    pdfUrl: clampStr(profile.pdfUrl, 400),
    heroPlateUrl: validateImageUrl(profile.heroPlateUrl, 250000),
    heroPlateCaption: clampStr(profile.heroPlateCaption, 240),
    gpaDisplay: clampStr(profile.gpaDisplay, 40),
  };
}

function sanitizeProjectPayload(
  project: PortfolioProject,
  sortOrder: number,
  existingCreatedAt?: Timestamp
) {
  const safeId = sanitizeDocId(project.id, 'proj');
  const safeCategory: ProjectCategory = VALID_CATEGORIES.includes(project.category)
    ? project.category
    : 'NUS Year 3';

  const safeTools = project.tools
    .map((t) => clampStr(t, 80))
    .filter(Boolean)
    .slice(0, 20);
  if (safeTools.length === 0) safeTools.push('Rhino');

  const safeHighlights = project.highlights
    .map((h) => clampStr(h, 600))
    .filter(Boolean)
    .slice(0, 20);
  if (safeHighlights.length === 0) {
    safeHighlights.push(
      clampStr(project.summary, 600, 'Architectural studio study') || 'Architectural studio study'
    );
  }

  const safePlates = project.plates.slice(0, 30).map((pl, idx) => ({
    id: sanitizeDocId(pl.id || `${safeId}-p${idx + 1}`, 'pl'),
    imageUrl:
      validateImageUrl(pl.imageUrl, 450000, '/assets/portfolio/page-01.jpg') ||
      '/assets/portfolio/page-01.jpg',
    caption: clampStr(pl.caption, 400, 'Architectural drawing plate') || 'Architectural drawing plate',
    plateNumber: clampStr(pl.plateNumber, 32, `PL. ${String(idx + 1).padStart(2, '0')}`),
    ...(pl.scale ? { scale: clampStr(pl.scale, 80) } : {}),
  }));
  if (safePlates.length === 0) {
    safePlates.push({
      id: `${safeId}-p1`,
      imageUrl: '/assets/portfolio/page-01.jpg',
      caption: 'Architectural drawing plate',
      plateNumber: 'PL. 01',
    });
  }

  return {
    id: safeId,
    title: clampStr(project.title, 200, 'Untitled Project') || 'Untitled Project',
    subtitle: clampStr(project.subtitle, 300),
    category: safeCategory,
    year: clampStr(project.year, 32, '2026') || '2026',
    studioOrContext: clampStr(project.studioOrContext, 200),
    location: clampStr(project.location, 160),
    scale: clampStr(project.scale, 100),
    tools: safeTools,
    summary: clampStr(project.summary, 1000, 'Architectural study') || 'Architectural study',
    description: clampStr(project.description, 5000),
    highlights: safeHighlights,
    featured: Boolean(project.featured),
    plates: safePlates,
    sortOrder: Math.max(0, Math.min(10000, Math.round(sortOrder))),
    isPublished: typeof project.isPublished === 'boolean' ? project.isPublished : true,
    createdAt: existingCreatedAt ?? serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

function sanitizeSketchPayload(
  sketch: SketchItem,
  sortOrder: number,
  existingCreatedAt?: Timestamp
) {
  const safeId = sanitizeDocId(sketch.id, 'sk');
  return {
    id: safeId,
    title: clampStr(sketch.title, 200, 'Untitled Study') || 'Untitled Study',
    subject: clampStr(sketch.subject, 200),
    medium: clampStr(sketch.medium, 160, 'Pen on Paper') || 'Pen on Paper',
    year: clampStr(sketch.year, 32, '2026') || '2026',
    imageUrl:
      validateImageUrl(sketch.imageUrl, 450000, '/assets/portfolio/page-01.jpg') ||
      '/assets/portfolio/page-01.jpg',
    plateNumber: clampStr(sketch.plateNumber, 32, 'SK. 01') || 'SK. 01',
    sortOrder: Math.max(0, Math.min(10000, Math.round(sortOrder))),
    isPublished: typeof sketch.isPublished === 'boolean' ? sketch.isPublished : true,
    createdAt: existingCreatedAt ?? serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

function sanitizeConfigPayload(data: PortfolioData, existingCreatedAt?: Timestamp) {
  return {
    schemaVersion: 1,
    isPublished: true,
    ownerEmail: OWNER_EMAIL,
    profile: sanitizeProfile(data.profile),
    experiences: data.experiences.slice(0, 40),
    education: data.education.slice(0, 20),
    skillGroups: data.skillGroups.slice(0, 25),
    ventures: data.ventures.slice(0, 25),
    communityService: data.communityService.slice(0, 30),
    createdAt: existingCreatedAt ?? serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

function mapProjectDoc(
  docSnap: QueryDocumentSnapshot<DocumentData>
): PortfolioProject & { sortOrder: number } {
  const d = docSnap.data();
  return {
    id: String(d.id ?? docSnap.id),
    title: String(d.title ?? ''),
    subtitle: String(d.subtitle ?? ''),
    category: d.category as ProjectCategory,
    year: String(d.year ?? ''),
    studioOrContext: String(d.studioOrContext ?? ''),
    location: String(d.location ?? ''),
    scale: String(d.scale ?? ''),
    tools: Array.isArray(d.tools) ? d.tools : [],
    summary: String(d.summary ?? ''),
    description: String(d.description ?? ''),
    highlights: Array.isArray(d.highlights) ? d.highlights : [],
    featured: Boolean(d.featured),
    isPublished: d.isPublished !== false,
    plates: Array.isArray(d.plates) ? d.plates : [],
    sortOrder: typeof d.sortOrder === 'number' ? d.sortOrder : 999,
  };
}

function mapSketchDoc(
  docSnap: QueryDocumentSnapshot<DocumentData>
): SketchItem & { sortOrder: number } {
  const d = docSnap.data();
  return {
    id: String(d.id ?? docSnap.id),
    title: String(d.title ?? ''),
    subject: String(d.subject ?? ''),
    medium: String(d.medium ?? ''),
    year: String(d.year ?? ''),
    imageUrl: String(d.imageUrl ?? ''),
    plateNumber: String(d.plateNumber ?? ''),
    isPublished: d.isPublished !== false,
    sortOrder: typeof d.sortOrder === 'number' ? d.sortOrder : 999,
  };
}

function extractConfigData(d: DocumentData): Partial<PortfolioData> {
  return {
    profile: d.profile as ProfileInfo,
    experiences: d.experiences,
    education: d.education,
    skillGroups: d.skillGroups,
    ventures: d.ventures,
    communityService: d.communityService,
  };
}

function buildPortfolioPayload(
  configData: Partial<PortfolioData> | null,
  remoteProjects: (PortfolioProject & { sortOrder?: number })[],
  remoteSketches: (SketchItem & { sortOrder?: number })[]
): PortfolioSubscriptionPayload {
  if (!configData) {
    return { data: INITIAL_PORTFOLIO_DATA, isSeeded: false };
  }

  const sortedProjects: PortfolioProject[] = [...remoteProjects]
    .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999))
    .map(({ sortOrder: _order, ...rest }) => rest as PortfolioProject);

  const sortedSketches: SketchItem[] = [...remoteSketches]
    .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999))
    .map(({ sortOrder: _order, ...rest }) => rest as SketchItem);

  return {
    data: {
      profile: configData.profile ?? INITIAL_PORTFOLIO_DATA.profile,
      experiences: configData.experiences ?? INITIAL_PORTFOLIO_DATA.experiences,
      education: configData.education ?? INITIAL_PORTFOLIO_DATA.education,
      skillGroups: configData.skillGroups ?? INITIAL_PORTFOLIO_DATA.skillGroups,
      ventures: configData.ventures ?? INITIAL_PORTFOLIO_DATA.ventures,
      communityService: configData.communityService ?? INITIAL_PORTFOLIO_DATA.communityService,
      projects: sortedProjects,
      sketches: sortedSketches,
      models: INITIAL_PORTFOLIO_DATA.models,
    },
    isSeeded: true,
  };
}

export interface PortfolioSubscriptionPayload {
  data: PortfolioData;
  isSeeded: boolean;
}

export interface SubscribePortfolioOptions {
  includeDrafts?: boolean;
}

/**
 * Fetches published portfolio data once for public visitors without keeping persistent listeners open.
 * Falls back cleanly to INITIAL_PORTFOLIO_DATA until the owner seeds/publishes Firestore.
 */
export async function fetchPublicPortfolio(): Promise<PortfolioSubscriptionPayload> {
  const configRef = doc(db, 'site_config', 'portfolio');
  const projectsQuery = query(collection(db, 'projects'), where('isPublished', '==', true));
  const sketchesQuery = query(collection(db, 'sketches'), where('isPublished', '==', true));

  const [configSnap, projectsSnap, sketchesSnap] = await Promise.all([
    getDoc(configRef).catch((error) =>
      handleFirestoreError(error, OperationType.GET, 'site_config/portfolio')
    ),
    getDocs(projectsQuery).catch((error) =>
      handleFirestoreError(error, OperationType.LIST, 'projects')
    ),
    getDocs(sketchesQuery).catch((error) =>
      handleFirestoreError(error, OperationType.LIST, 'sketches')
    ),
  ]);

  if (!configSnap.exists()) {
    return { data: INITIAL_PORTFOLIO_DATA, isSeeded: false };
  }

  return buildPortfolioPayload(
    extractConfigData(configSnap.data()),
    projectsSnap.docs.map(mapProjectDoc),
    sketchesSnap.docs.map(mapSketchDoc)
  );
}

/**
 * Subscribes to live Firestore portfolio data (used in Owner Studio for real-time sync and drafts).
 * Falls back cleanly to INITIAL_PORTFOLIO_DATA until the owner seeds/publishes Firestore.
 */
export function subscribePublicPortfolio(
  onUpdate: (payload: PortfolioSubscriptionPayload) => void,
  onError?: (err: Error) => void,
  options?: SubscribePortfolioOptions
): Unsubscribe {
  let configDocExists = false;
  let configData: Partial<PortfolioData> | null = null;
  let remoteProjects: (PortfolioProject & { sortOrder?: number })[] = [];
  let remoteSketches: (SketchItem & { sortOrder?: number })[] = [];

  let configReady = false;
  let projectsReady = false;
  let sketchesReady = false;

  const emit = () => {
    if (!configReady || !projectsReady || !sketchesReady) return;
    if (!configDocExists || !configData) {
      onUpdate({ data: INITIAL_PORTFOLIO_DATA, isSeeded: false });
      return;
    }
    onUpdate(buildPortfolioPayload(configData, remoteProjects, remoteSketches));
  };

  const configPath = 'site_config/portfolio';
  const unsubConfig = onSnapshot(
    doc(db, 'site_config', 'portfolio'),
    (snap) => {
      configReady = true;
      if (snap.exists()) {
        configDocExists = true;
        configData = extractConfigData(snap.data());
      } else {
        configDocExists = false;
        configData = null;
      }
      emit();
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, configPath);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    }
  );

  const projectsQuery = options?.includeDrafts
    ? collection(db, 'projects')
    : query(collection(db, 'projects'), where('isPublished', '==', true));
  const unsubProjects = onSnapshot(
    projectsQuery,
    (snapshot) => {
      projectsReady = true;
      remoteProjects = snapshot.docs.map(mapProjectDoc);
      emit();
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'projects');
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    }
  );

  const sketchesQuery = options?.includeDrafts
    ? collection(db, 'sketches')
    : query(collection(db, 'sketches'), where('isPublished', '==', true));
  const unsubSketches = onSnapshot(
    sketchesQuery,
    (snapshot) => {
      sketchesReady = true;
      remoteSketches = snapshot.docs.map(mapSketchDoc);
      emit();
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'sketches');
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    }
  );

  return () => {
    unsubConfig();
    unsubProjects();
    unsubSketches();
  };
}

/**
 * Seeds the complete initial portfolio into Firestore atomically (owner-only).
 */
export async function seedInitialPortfolioToFirestore(data: PortfolioData): Promise<void> {
  const path = 'site_config/portfolio';
  try {
    const existingSnap = await getDoc(doc(db, 'site_config', 'portfolio'));
    if (existingSnap.exists()) return;

    const batch = writeBatch(db);
    batch.set(doc(db, 'site_config', 'portfolio'), sanitizeConfigPayload(data));

    data.projects.forEach((project, idx) => {
      const payload = sanitizeProjectPayload(project, idx * 10);
      batch.set(doc(db, 'projects', payload.id), payload);
    });

    data.sketches.forEach((sketch, idx) => {
      const payload = sanitizeSketchPayload(sketch, idx * 10);
      batch.set(doc(db, 'sketches', payload.id), payload);
    });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveConfigToFirestore(data: PortfolioData): Promise<void> {
  const path = 'site_config/portfolio';
  try {
    const ref = doc(db, 'site_config', 'portfolio');
    const existingSnap = await getDoc(ref);
    if (!existingSnap.exists()) {
      await seedInitialPortfolioToFirestore(data);
      return;
    }
    const existingCreatedAt = existingSnap.data()?.createdAt as Timestamp | undefined;
    const payload = sanitizeConfigPayload(data, existingCreatedAt);
    await updateDoc(ref, {
      schemaVersion: payload.schemaVersion,
      isPublished: payload.isPublished,
      ownerEmail: payload.ownerEmail,
      profile: payload.profile,
      experiences: payload.experiences,
      education: payload.education,
      skillGroups: payload.skillGroups,
      ventures: payload.ventures,
      communityService: payload.communityService,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function createProjectInFirestore(
  project: PortfolioProject,
  sortOrder: number
): Promise<void> {
  const payload = sanitizeProjectPayload(project, sortOrder);
  const path = `projects/${payload.id}`;
  try {
    await setDoc(doc(db, 'projects', payload.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateProjectInFirestore(
  project: PortfolioProject,
  sortOrder: number
): Promise<void> {
  const payload = sanitizeProjectPayload(project, sortOrder);
  const { id: _id, createdAt: _createdAt, ...mutableFields } = payload;
  const path = `projects/${payload.id}`;
  try {
    await updateDoc(doc(db, 'projects', payload.id), mutableFields);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteProjectFromFirestore(projectId: string): Promise<void> {
  const path = `projects/${projectId}`;
  try {
    await deleteDoc(doc(db, 'projects', projectId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function createSketchInFirestore(
  sketch: SketchItem,
  sortOrder: number
): Promise<void> {
  const payload = sanitizeSketchPayload(sketch, sortOrder);
  const path = `sketches/${payload.id}`;
  try {
    await setDoc(doc(db, 'sketches', payload.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateSketchInFirestore(
  sketch: SketchItem,
  sortOrder: number
): Promise<void> {
  const payload = sanitizeSketchPayload(sketch, sortOrder);
  const { id: _id, createdAt: _createdAt, ...mutableFields } = payload;
  const path = `sketches/${payload.id}`;
  try {
    await updateDoc(doc(db, 'sketches', payload.id), mutableFields);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteSketchFromFirestore(sketchId: string): Promise<void> {
  const path = `sketches/${sketchId}`;
  try {
    await deleteDoc(doc(db, 'sketches', sketchId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function replaceEntirePortfolioInFirestore(
  nextData: PortfolioData,
  prevProjects: PortfolioProject[],
  prevSketches: SketchItem[]
): Promise<void> {
  const path = 'site_config/portfolio';
  const preparedProjects = nextData.projects.map((proj, idx) =>
    sanitizeProjectPayload(proj, idx * 10)
  );
  const preparedSketches = nextData.sketches.map((sk, idx) =>
    sanitizeSketchPayload(sk, idx * 10)
  );

  try {
    const configRef = doc(db, 'site_config', 'portfolio');
    const [existingConfig, existingProjectsSnap, existingSketchesSnap] = await Promise.all([
      getDoc(configRef),
      getDocs(collection(db, 'projects')),
      getDocs(collection(db, 'sketches')),
    ]);

    const batch = writeBatch(db);
    const existingCreatedAt = existingConfig.exists()
      ? (existingConfig.data()?.createdAt as Timestamp | undefined)
      : undefined;

    if (existingConfig.exists()) {
      const cfg = sanitizeConfigPayload(nextData, existingCreatedAt);
      batch.update(configRef, {
        schemaVersion: cfg.schemaVersion,
        isPublished: cfg.isPublished,
        ownerEmail: cfg.ownerEmail,
        profile: cfg.profile,
        experiences: cfg.experiences,
        education: cfg.education,
        skillGroups: cfg.skillGroups,
        ventures: cfg.ventures,
        communityService: cfg.communityService,
        updatedAt: serverTimestamp(),
      });
    } else {
      batch.set(configRef, sanitizeConfigPayload(nextData));
    }

    const existingProjectIds = new Set(existingProjectsSnap.docs.map((d) => d.id));
    const nextProjectIds = new Set(preparedProjects.map((p) => p.id));
    const staleProjectIds = new Set([
      ...existingProjectIds,
      ...prevProjects.map((p) => p.id),
    ]);
    for (const staleId of staleProjectIds) {
      if (!nextProjectIds.has(staleId)) {
        batch.delete(doc(db, 'projects', staleId));
      }
    }
    for (const payload of preparedProjects) {
      if (existingProjectIds.has(payload.id)) {
        const { id: _id, createdAt: _createdAt, ...mutableFields } = payload;
        batch.update(doc(db, 'projects', payload.id), mutableFields);
      } else {
        batch.set(doc(db, 'projects', payload.id), payload);
      }
    }

    const existingSketchIds = new Set(existingSketchesSnap.docs.map((d) => d.id));
    const nextSketchIds = new Set(preparedSketches.map((s) => s.id));
    const staleSketchIds = new Set([
      ...existingSketchIds,
      ...prevSketches.map((s) => s.id),
    ]);
    for (const staleId of staleSketchIds) {
      if (!nextSketchIds.has(staleId)) {
        batch.delete(doc(db, 'sketches', staleId));
      }
    }
    for (const payload of preparedSketches) {
      if (existingSketchIds.has(payload.id)) {
        const { id: _id, createdAt: _createdAt, ...mutableFields } = payload;
        batch.update(doc(db, 'sketches', payload.id), mutableFields);
      } else {
        batch.set(doc(db, 'sketches', payload.id), payload);
      }
    }

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
