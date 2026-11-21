import { INITIAL_PORTFOLIO_DATA } from '../data/initialPortfolio';
import {
  CommunityServiceItem,
  Model3DItem,
  ModelPhotoItem,
  PortfolioData,
  PortfolioProject,
  ProfileInfo,
  ProjectCategory,
  SketchItem,
  WorkExperience,
} from '../types/portfolio';

export type CategoryFilter = 'All' | ProjectCategory;

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export interface NewProjectInput {
  title: string;
  subtitle: string;
  category: ProjectCategory;
  year: string;
  studioOrContext: string;
  location: string;
  scale: string;
  toolsRaw: string;
  summary: string;
  description: string;
  highlightsRaw: string;
  imageUrl?: string;
  imageCaption?: string;
}

export interface NewExperienceInput {
  company: string;
  role: string;
  location: string;
  period: string;
  toolsRaw: string;
  highlightsRaw: string;
}

export interface NewSketchInput {
  title: string;
  subject: string;
  medium: string;
  year: string;
  imageUrl: string;
}

export interface NewCommunityInput {
  organization: string;
  role: string;
  location: string;
  period: string;
  detailsRaw: string;
}

export interface NewModelInput {
  title: string;
  subtitle: string;
  year: string;
  studioOrContext: string;
  scale: string;
  softwareRaw: string;
  description: string;
  modelUrl: string;
  format: 'glb' | 'obj';
}

export function normalizeToken(value: string): string {
  return value.trim().toLowerCase();
}

export function splitCommaList(raw: string): string[] {
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function splitLines(raw: string): string[] {
  return raw
    .split('\n')
    .map((line) => line.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);
}

export function doesSkillMatch(tools: string[], activeSkill: string | null): boolean {
  if (!activeSkill) return true;
  const target = normalizeToken(activeSkill);
  if (!target) return true;

  return tools.some((tool) => {
    const t = normalizeToken(tool);
    return t === target || t.includes(target) || target.includes(t);
  });
}

export function filterProjects(
  projects: PortfolioProject[],
  category: CategoryFilter,
  searchQuery: string,
  activeSkill: string | null = null
): PortfolioProject[] {
  const query = normalizeToken(searchQuery);

  return projects.filter((project) => {
    if (category !== 'All' && project.category !== category) {
      return false;
    }

    if (activeSkill && !doesSkillMatch(project.tools, activeSkill)) {
      return false;
    }

    if (!query) return true;

    const searchable = [
      project.title,
      project.subtitle,
      project.category,
      project.studioOrContext,
      project.location,
      project.summary,
      project.description,
      project.year,
      ...project.tools,
      ...project.highlights,
    ]
      .join(' ')
      .toLowerCase();

    return searchable.includes(query);
  });
}

export function getMatchingExperienceIds(
  experiences: WorkExperience[],
  activeSkill: string | null
): Set<string> {
  const matched = new Set<string>();
  if (!activeSkill) return matched;

  for (const exp of experiences) {
    if (doesSkillMatch(exp.tools, activeSkill)) {
      matched.add(exp.id);
    }
  }
  return matched;
}

export function validateProjectInput(input: NewProjectInput): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.title.trim()) {
    errors.title = 'Project title is required.';
  }
  if (!input.year.trim()) {
    errors.year = 'Year is required (e.g. 2026).';
  }
  if (!input.summary.trim()) {
    errors.summary = 'Provide a short one-sentence summary.';
  }
  if (splitCommaList(input.toolsRaw).length === 0) {
    errors.toolsRaw = 'Add at least one software or method (e.g. Rhino, Revit).';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateExperienceInput(input: NewExperienceInput): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.company.trim()) {
    errors.company = 'Practice or organization name is required.';
  }
  if (!input.role.trim()) {
    errors.role = 'Role title is required.';
  }
  if (!input.period.trim()) {
    errors.period = 'Time period is required (e.g. May 2026 – Aug 2026).';
  }
  if (splitLines(input.highlightsRaw).length === 0) {
    errors.highlightsRaw = 'Add at least one key responsibility or achievement.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateSketchInput(input: NewSketchInput): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.title.trim()) {
    errors.title = 'Drawing title is required.';
  }
  if (!input.medium.trim()) {
    errors.medium = 'Medium is required (e.g. Fineliner Ink on Paper).';
  }
  if (!input.imageUrl.trim()) {
    errors.imageUrl = 'Upload an image file or provide an image URL.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateCommunityInput(input: NewCommunityInput): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.organization.trim()) {
    errors.organization = 'Organization name is required.';
  }
  if (!input.role.trim()) {
    errors.role = 'Role is required.';
  }
  if (!input.period.trim()) {
    errors.period = 'Date or year is required.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateModelInput(input: NewModelInput): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.title.trim()) {
    errors.title = 'Model title is required.';
  }
  if (!input.year.trim()) {
    errors.year = 'Year is required (e.g. 2025).';
  }
  if (!input.modelUrl.trim()) {
    errors.modelUrl = 'Upload a .glb / .obj file or enter a model URL.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function addProjectToPortfolio(
  data: PortfolioData,
  input: NewProjectInput
): PortfolioData {
  const nextPlateNum = String(
    data.projects.reduce((sum, p) => sum + p.plates.length, 0) + 1
  ).padStart(2, '0');

  const newProject: PortfolioProject = {
    id: createId('proj'),
    title: input.title.trim(),
    subtitle: input.subtitle.trim() || `${input.category} Architectural Study`,
    category: input.category,
    year: input.year.trim(),
    studioOrContext: input.studioOrContext.trim() || input.category,
    location: input.location.trim() || 'Singapore',
    scale: input.scale.trim() || '1:100',
    tools: splitCommaList(input.toolsRaw),
    summary: input.summary.trim(),
    description: input.description.trim() || input.summary.trim(),
    highlights:
      splitLines(input.highlightsRaw).length > 0
        ? splitLines(input.highlightsRaw)
        : [input.summary.trim()],
    plates: input.imageUrl?.trim()
      ? [
          {
            id: createId('plate'),
            imageUrl: input.imageUrl.trim(),
            caption: input.imageCaption?.trim() || `${input.title.trim()} — Primary Plate`,
            plateNumber: `PL. ${nextPlateNum}`,
            scale: input.scale.trim() || undefined,
          },
        ]
      : [],
  };

  return {
    ...data,
    projects: [newProject, ...data.projects],
  };
}

export function deleteProjectFromPortfolio(
  data: PortfolioData,
  projectId: string
): PortfolioData {
  return {
    ...data,
    projects: data.projects.filter((project) => project.id !== projectId),
  };
}

export function addPlateToProject(
  data: PortfolioData,
  projectId: string,
  imageUrl: string,
  caption: string,
  scale?: string
): PortfolioData {
  const totalPlates = data.projects.reduce((sum, p) => sum + p.plates.length, 0);
  const plateNumber = `PL. ${String(totalPlates + 1).padStart(2, '0')}`;

  return {
    ...data,
    projects: data.projects.map((project) => {
      if (project.id !== projectId) return project;
      return {
        ...project,
        plates: [
          ...project.plates,
          {
            id: createId('plate'),
            imageUrl: imageUrl.trim(),
            caption: caption.trim() || `${project.title} — Plate ${project.plates.length + 1}`,
            plateNumber,
            scale: scale?.trim() || undefined,
          },
        ],
      };
    }),
  };
}

export function addExperienceToPortfolio(
  data: PortfolioData,
  input: NewExperienceInput
): PortfolioData {
  const newExp: WorkExperience = {
    id: createId('exp'),
    company: input.company.trim(),
    role: input.role.trim(),
    location: input.location.trim() || 'Singapore',
    period: input.period.trim(),
    tools: splitCommaList(input.toolsRaw),
    highlights: splitLines(input.highlightsRaw),
  };

  return {
    ...data,
    experiences: [newExp, ...data.experiences],
  };
}

export function deleteExperienceFromPortfolio(
  data: PortfolioData,
  experienceId: string
): PortfolioData {
  return {
    ...data,
    experiences: data.experiences.filter((item) => item.id !== experienceId),
  };
}

export function addSkillToGroup(
  data: PortfolioData,
  groupId: string,
  skillName: string
): PortfolioData {
  const cleaned = skillName.trim();
  if (!cleaned) return data;

  return {
    ...data,
    skillGroups: data.skillGroups.map((group) => {
      if (group.id !== groupId) return group;
      const exists = group.items.some(
        (existing) => normalizeToken(existing) === normalizeToken(cleaned)
      );
      if (exists) return group;
      return {
        ...group,
        items: [...group.items, cleaned],
      };
    }),
  };
}

export function removeSkillFromGroup(
  data: PortfolioData,
  groupId: string,
  skillName: string
): PortfolioData {
  return {
    ...data,
    skillGroups: data.skillGroups.map((group) => {
      if (group.id !== groupId) return group;
      return {
        ...group,
        items: group.items.filter((item) => item !== skillName),
      };
    }),
  };
}

export function addCommunityServiceToPortfolio(
  data: PortfolioData,
  input: NewCommunityInput
): PortfolioData {
  const newItem: CommunityServiceItem = {
    id: createId('cs'),
    organization: input.organization.trim(),
    role: input.role.trim(),
    location: input.location.trim() || 'Singapore',
    period: input.period.trim(),
    details:
      splitLines(input.detailsRaw).length > 0
        ? splitLines(input.detailsRaw)
        : [input.role.trim()],
  };

  return {
    ...data,
    communityService: [newItem, ...data.communityService],
  };
}

export function deleteCommunityServiceFromPortfolio(
  data: PortfolioData,
  itemId: string
): PortfolioData {
  return {
    ...data,
    communityService: data.communityService.filter((item) => item.id !== itemId),
  };
}

export function addSketchToPortfolio(
  data: PortfolioData,
  input: NewSketchInput
): PortfolioData {
  const nextNum = String(data.sketches.length + 1).padStart(2, '0');
  const newSketch: SketchItem = {
    id: createId('sk'),
    title: input.title.trim(),
    subject: input.subject.trim() || 'Architectural Study',
    medium: input.medium.trim(),
    year: input.year.trim() || String(new Date().getFullYear()),
    imageUrl: input.imageUrl.trim(),
    plateNumber: `SK. ${nextNum}`,
  };

  return {
    ...data,
    sketches: [newSketch, ...data.sketches],
  };
}

export function deleteSketchFromPortfolio(
  data: PortfolioData,
  sketchId: string
): PortfolioData {
  return {
    ...data,
    sketches: data.sketches.filter((sketch) => sketch.id !== sketchId),
  };
}

export function addModelToPortfolio(
  data: PortfolioData,
  input: NewModelInput
): PortfolioData {
  const software = splitCommaList(input.softwareRaw);
  const newModel: Model3DItem = {
    id: createId('model'),
    title: input.title.trim(),
    subtitle: input.subtitle.trim() || 'Interactive Architectural 3D Model',
    year: input.year.trim(),
    studioOrContext: input.studioOrContext.trim() || 'Architectural Studio',
    scale: input.scale.trim() || 'Digital Model',
    software: software.length > 0 ? software : ['Rhino'],
    description: input.description.trim() || input.subtitle.trim() || 'Interactive 3D architectural study.',
    modelUrl: input.modelUrl.trim(),
    format: input.format,
    photos: [],
    isPublished: true,
  };

  return {
    ...data,
    models: [newModel, ...data.models],
  };
}

export function deleteModelFromPortfolio(
  data: PortfolioData,
  modelId: string
): PortfolioData {
  return {
    ...data,
    models: data.models.filter((model) => model.id !== modelId),
  };
}

export function addPhotoToModel(
  data: PortfolioData,
  modelId: string,
  imageUrl: string,
  caption: string
): PortfolioData {
  const cleanedUrl = imageUrl.trim();
  if (!cleanedUrl) return data;

  const newPhoto: ModelPhotoItem = {
    id: createId('mphoto'),
    imageUrl: cleanedUrl,
    caption: caption.trim() || 'Physical & studio study photograph',
  };

  return {
    ...data,
    models: data.models.map((model) =>
      model.id === modelId
        ? { ...model, photos: [...model.photos, newPhoto] }
        : model
    ),
  };
}

export function deletePhotoFromModel(
  data: PortfolioData,
  modelId: string,
  photoId: string
): PortfolioData {
  return {
    ...data,
    models: data.models.map((model) =>
      model.id === modelId
        ? { ...model, photos: model.photos.filter((photo) => photo.id !== photoId) }
        : model
    ),
  };
}

export function updateProfileInfo(
  data: PortfolioData,
  patch: Partial<ProfileInfo>
): PortfolioData {
  return {
    ...data,
    profile: {
      ...data.profile,
      ...patch,
    },
  };
}

export function buildShowcaseShareUrl(origin: string, pathname: string): string {
  const cleanOrigin = origin.replace(/\/$/, '');
  const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${cleanOrigin}${cleanPath}?view=showcase`;
}

export function buildPublicVisitorUrl(origin: string, pathname = '/'): string {
  const cleanOrigin = origin.replace(/\/$/, '');
  const normalizedPath = pathname.replace(/\/admin(\/.*)?$/, '') || '/';
  const cleanPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
  return `${cleanOrigin}${cleanPath}`;
}

export function isPublicShowcaseMode(search: string): boolean {
  const params = new URLSearchParams(search);
  return params.get('view') === 'showcase';
}

export function isOwnerStudioRoute(pathname: string, hash: string, search: string): boolean {
  const cleanPath = pathname.toLowerCase();
  const cleanHash = hash.toLowerCase();
  const params = new URLSearchParams(search);
  return (
    cleanPath === '/admin' ||
    cleanPath.startsWith('/admin/') ||
    cleanHash === '#/admin' ||
    cleanHash.startsWith('#/admin/') ||
    cleanHash === '#admin' ||
    params.get('studio') === 'admin'
  );
}

export type CanvasSurface = 'paper' | 'grid';

export function parseCanvasSurface(value: string | null | undefined): CanvasSurface {
  return value === 'grid' ? 'grid' : 'paper';
}

export function toggleCanvasSurface(current: CanvasSurface): CanvasSurface {
  return current === 'paper' ? 'grid' : 'paper';
}

export function parseImportedPortfolioJson(
  rawJson: string
): { ok: true; data: PortfolioData } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(rawJson);
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !parsed.profile ||
      !Array.isArray(parsed.projects) ||
      !Array.isArray(parsed.experiences) ||
      !Array.isArray(parsed.skillGroups)
    ) {
      return {
        ok: false,
        error: 'Invalid portfolio JSON structure. Expected profile, projects, experiences, and skillGroups.',
      };
    }
    const normalized: PortfolioData = {
      ...(parsed as PortfolioData),
      models: Array.isArray(parsed.models) ? parsed.models : INITIAL_PORTFOLIO_DATA.models,
    };
    return { ok: true, data: normalized };
  } catch {
    return {
      ok: false,
      error: 'Could not parse JSON file. Ensure the file is a valid exported portfolio backup.',
    };
  }
}
