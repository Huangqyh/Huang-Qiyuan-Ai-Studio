export type ProjectCategory =
  | 'NUS Year 3'
  | 'NUS Year 2'
  | 'NUS Year 1'
  | 'Individual BIM'
  | 'Professional';

export interface ProjectPlate {
  id: string;
  imageUrl: string;
  caption: string;
  plateNumber: string;
  scale?: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  subtitle: string;
  category: ProjectCategory;
  year: string;
  studioOrContext: string;
  location: string;
  scale: string;
  tools: string[];
  summary: string;
  description: string;
  highlights: string[];
  featured?: boolean;
  isPublished?: boolean;
  plates: ProjectPlate[];
}

export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  location: string;
  period: string;
  tools: string[];
  highlights: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  period: string;
  gpa: string;
  honours: string;
  coursework: string[];
}

export interface SkillGroup {
  id: string;
  category: string;
  items: string[];
}

export interface CommunityServiceItem {
  id: string;
  organization: string;
  role: string;
  location: string;
  period: string;
  details: string[];
}

export interface AdditionalVenture {
  id: string;
  title: string;
  category: string;
  tools: string[];
  summary: string;
}

export interface SketchItem {
  id: string;
  title: string;
  subject: string;
  medium: string;
  year: string;
  imageUrl: string;
  plateNumber: string;
  isPublished?: boolean;
}

export interface ModelPhotoItem {
  id: string;
  imageUrl: string;
  caption: string;
}

export interface Model3DVariant {
  id: string;
  label: string;
  systemType: string;
  description: string;
  modelUrl: string;
  format: 'glb' | 'obj';
}

export interface Model3DItem {
  id: string;
  title: string;
  subtitle: string;
  year: string;
  studioOrContext: string;
  scale: string;
  software: string[];
  description: string;
  modelUrl: string;
  format: 'glb' | 'obj';
  photos: ModelPhotoItem[];
  variants?: Model3DVariant[];
  isPublished?: boolean;
}

export interface ProfileInfo {
  fullName: string;
  roleTitle: string;
  institutionLine: string;
  location: string;
  availability: string;
  statement: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  pdfUrl: string;
  heroPlateUrl: string;
  heroPlateCaption: string;
  gpaDisplay: string;
}

export interface PortfolioData {
  profile: ProfileInfo;
  projects: PortfolioProject[];
  experiences: WorkExperience[];
  education: EducationItem[];
  skillGroups: SkillGroup[];
  ventures: AdditionalVenture[];
  communityService: CommunityServiceItem[];
  sketches: SketchItem[];
  models: Model3DItem[];
}
