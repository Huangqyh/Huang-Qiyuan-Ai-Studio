import { Download, Plus, RotateCcw, Save, Trash2, Upload, X } from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { PortfolioData, ProfileInfo, ProjectCategory } from '../types/portfolio';
import {
  NewCommunityInput,
  NewExperienceInput,
  NewModelInput,
  NewProjectInput,
  NewSketchInput,
  validateCommunityInput,
  validateExperienceInput,
  validateModelInput,
  validateProjectInput,
  validateSketchInput,
} from '../utils/portfolioLogic';
import { uploadModelFile, uploadPortfolioImage } from '../services/portfolioStorage';

export type EditorTab = 'projects' | 'experience' | 'skills' | 'sketches' | 'models' | 'profile';

interface ContentManagerDrawerProps {
  initialTab?: EditorTab;
  data: PortfolioData;
  isSaving?: boolean;
  onAddProject: (input: NewProjectInput) => void | Promise<void>;
  onDeleteProject: (id: string) => void | Promise<void>;
  onAddExperience: (input: NewExperienceInput) => void | Promise<void>;
  onDeleteExperience: (id: string) => void | Promise<void>;
  onAddSkill: (groupId: string, skill: string) => void | Promise<void>;
  onRemoveSkill: (groupId: string, skill: string) => void | Promise<void>;
  onAddCommunity: (input: NewCommunityInput) => void | Promise<void>;
  onDeleteCommunity: (id: string) => void | Promise<void>;
  onAddSketch: (input: NewSketchInput) => void | Promise<void>;
  onDeleteSketch: (id: string) => void | Promise<void>;
  onAddModel: (input: NewModelInput) => void | Promise<void>;
  onDeleteModel: (id: string) => void | Promise<void>;
  onAddModelPhoto: (modelId: string, imageUrl: string, caption: string) => void | Promise<void>;
  onDeleteModelPhoto: (modelId: string, photoId: string) => void | Promise<void>;
  onUpdateProfile: (patch: Partial<PortfolioData['profile']>) => void | Promise<void>;
  onExportJson: () => void;
  onImportJson: (raw: string) => Promise<{ ok: boolean; message: string }>;
  onResetAll: () => void | Promise<void>;
}

const EMPTY_PROJECT: NewProjectInput = {
  title: '',
  subtitle: '',
  category: 'NUS Year 3',
  year: '2026',
  studioOrContext: '',
  location: 'Singapore',
  scale: '1:100',
  toolsRaw: '',
  summary: '',
  description: '',
  highlightsRaw: '',
  imageUrl: '',
  imageCaption: '',
};

const EMPTY_EXPERIENCE: NewExperienceInput = {
  company: '',
  role: '',
  location: 'Singapore',
  period: '',
  toolsRaw: '',
  highlightsRaw: '',
};

const EMPTY_SKETCH: NewSketchInput = {
  title: '',
  subject: '',
  medium: 'Fineliner Ink on Paper',
  year: '2026',
  imageUrl: '',
};

const EMPTY_COMMUNITY: NewCommunityInput = {
  organization: '',
  role: '',
  location: 'Singapore',
  period: '',
  detailsRaw: '',
};

const EMPTY_MODEL: NewModelInput = {
  title: '',
  subtitle: '',
  year: '2025',
  studioOrContext: '',
  scale: '1:200 Digital Model',
  softwareRaw: 'Rhino, WebGL / glTF',
  description: '',
  modelUrl: '',
  format: 'glb',
};

export function ContentManagerDrawer({
  initialTab = 'projects',
  data,
  isSaving = false,
  onAddProject,
  onDeleteProject,
  onAddExperience,
  onDeleteExperience,
  onAddSkill,
  onRemoveSkill,
  onAddCommunity,
  onDeleteCommunity,
  onAddSketch,
  onDeleteSketch,
  onAddModel,
  onDeleteModel,
  onAddModelPhoto,
  onDeleteModelPhoto,
  onUpdateProfile,
  onExportJson,
  onImportJson,
  onResetAll,
}: ContentManagerDrawerProps) {
  const [activeTab, setActiveTab] = useState<EditorTab>(initialTab);
  const [projectForm, setProjectForm] = useState<NewProjectInput>(EMPTY_PROJECT);
  const [projectErrors, setProjectErrors] = useState<Record<string, string>>({});

  const [expForm, setExpForm] = useState<NewExperienceInput>(EMPTY_EXPERIENCE);
  const [expErrors, setExpErrors] = useState<Record<string, string>>({});

  const [sketchForm, setSketchForm] = useState<NewSketchInput>(EMPTY_SKETCH);
  const [sketchErrors, setSketchErrors] = useState<Record<string, string>>({});

  const [communityForm, setCommunityForm] = useState<NewCommunityInput>(EMPTY_COMMUNITY);
  const [communityErrors, setCommunityErrors] = useState<Record<string, string>>({});

  const [modelForm, setModelForm] = useState<NewModelInput>(EMPTY_MODEL);
  const [modelErrors, setModelErrors] = useState<Record<string, string>>({});
  const [uploadingModel, setUploadingModel] = useState(false);
  const [photoCaptions, setPhotoCaptions] = useState<Record<string, string>>({});
  const [uploadingPhotoModelId, setUploadingPhotoModelId] = useState<string | null>(null);

  const [newSkillText, setNewSkillText] = useState<Record<string, string>>({});
  const [profileDraft, setProfileDraft] = useState<ProfileInfo>(data.profile);
  const [profileDirty, setProfileDirty] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setProfileDraft(data.profile);
    setProfileDirty(false);
  }, [data.profile]);

  const notify = (msg: string) => {
    setStatusMessage(msg);
  };

  const handleImportFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const result = await onImportJson(String(reader.result || ''));
      notify(result.message);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault();
    await onUpdateProfile(profileDraft);
    setProfileDirty(false);
    notify('Saved profile changes to cloud portfolio.');
  };

  const handleProjectImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await uploadPortfolioImage(file, 'projects');
      setProjectForm((prev) => ({ ...prev, imageUrl: result.url }));
      setProjectErrors((prev) => {
        const next = { ...prev };
        delete next.imageUrl;
        return next;
      });
      notify(
        result.source === 'storage'
          ? 'Drawing plate uploaded to Cloud Storage and ready to save.'
          : 'Drawing plate compressed and ready to save.'
      );
    } catch (err) {
      setProjectErrors((prev) => ({
        ...prev,
        imageUrl:
          err instanceof Error
            ? err.message
            : 'Unable to read image file. Try a PNG or JPG image.',
      }));
    }
  };

  const handleSketchImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await uploadPortfolioImage(file, 'sketches');
      setSketchForm((prev) => ({ ...prev, imageUrl: result.url }));
      setSketchErrors((prev) => {
        const next = { ...prev };
        delete next.imageUrl;
        return next;
      });
      notify(
        result.source === 'storage'
          ? 'Sketch image uploaded to Cloud Storage and ready to save.'
          : 'Sketch image compressed and ready to save.'
      );
    } catch (err) {
      setSketchErrors((prev) => ({
        ...prev,
        imageUrl:
          err instanceof Error
            ? err.message
            : 'Unable to read image file. Try a PNG or JPG image.',
      }));
    }
  };

  const handleProjectSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validation = validateProjectInput(projectForm);
    if (!validation.valid) {
      setProjectErrors(validation.errors);
      return;
    }
    setProjectErrors({});
    onAddProject(projectForm);
    notify(`Added "${projectForm.title.trim()}" to Selected Works.`);
    setProjectForm(EMPTY_PROJECT);
  };

  const handleExperienceSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validation = validateExperienceInput(expForm);
    if (!validation.valid) {
      setExpErrors(validation.errors);
      return;
    }
    setExpErrors({});
    onAddExperience(expForm);
    notify(`Added "${expForm.company.trim()}" to Work Experience.`);
    setExpForm(EMPTY_EXPERIENCE);
  };

  const handleSketchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validation = validateSketchInput(sketchForm);
    if (!validation.valid) {
      setSketchErrors(validation.errors);
      return;
    }
    setSketchErrors({});
    onAddSketch(sketchForm);
    notify(`Added "${sketchForm.title.trim()}" to Sketches.`);
    setSketchForm(EMPTY_SKETCH);
  };

  const handleCommunitySubmit = (e: FormEvent) => {
    e.preventDefault();
    const validation = validateCommunityInput(communityForm);
    if (!validation.valid) {
      setCommunityErrors(validation.errors);
      return;
    }
    setCommunityErrors({});
    onAddCommunity(communityForm);
    notify(`Added "${communityForm.organization.trim()}" to Community Service.`);
    setCommunityForm(EMPTY_COMMUNITY);
  };

  const handleModelFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingModel(true);
    try {
      const url = await uploadModelFile(file);
      const detectedFormat = file.name.toLowerCase().endsWith('.obj') ? 'obj' : 'glb';
      setModelForm((prev) => ({ ...prev, modelUrl: url, format: detectedFormat }));
      setModelErrors((prev) => {
        const next = { ...prev };
        delete next.modelUrl;
        return next;
      });
      notify('3D model file uploaded to Cloud Storage and ready to save.');
    } catch (err) {
      setModelErrors((prev) => ({
        ...prev,
        modelUrl:
          err instanceof Error
            ? err.message
            : 'Unable to upload 3D model. Try a .glb or .obj file.',
      }));
    } finally {
      setUploadingModel(false);
      e.target.value = '';
    }
  };

  const handleModelSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validation = validateModelInput(modelForm);
    if (!validation.valid) {
      setModelErrors(validation.errors);
      return;
    }
    setModelErrors({});
    onAddModel(modelForm);
    notify(`Added 3D model "${modelForm.title.trim()}" to Spatial Archive.`);
    setModelForm(EMPTY_MODEL);
  };

  const handleModelPhotoUpload = async (modelId: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhotoModelId(modelId);
    try {
      const result = await uploadPortfolioImage(file, 'models');
      const caption = (photoCaptions[modelId] || '').trim() || file.name.replace(/\.[^.]+$/, '');
      onAddModelPhoto(modelId, result.url, caption);
      setPhotoCaptions((prev) => ({ ...prev, [modelId]: '' }));
      notify(
        result.source === 'storage'
          ? 'Companion photo uploaded to Cloud Storage and attached.'
          : 'Companion photo compressed and attached.'
      );
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Could not attach companion photo.');
    } finally {
      setUploadingPhotoModelId(null);
      e.target.value = '';
    }
  };

  const tabs: { id: EditorTab; label: string }[] = [
    { id: 'projects', label: 'Projects' },
    { id: 'experience', label: 'Experience' },
    { id: 'skills', label: 'Skills & Service' },
    { id: 'sketches', label: 'Sketches' },
    { id: 'models', label: '3D Models' },
    { id: 'profile', label: 'Profile & Links' },
  ];

  return (
    <div
      aria-label="Portfolio and CV Content Manager"
      className="bg-white border border-[#E5E5E0] rounded-xl overflow-hidden shadow-xs"
    >
      {/* Workspace Header & Section Tabs */}
      <div className="px-6 py-4 bg-[#F7F6F2] border-b border-[#E5E5E0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-2xl font-semibold text-[#141413]">
            Content Management
          </h2>
          <p className="text-xs text-[#6B6A65]">
            Edits publish live to your public visitor webpage via Firestore.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Content manager sections"
          className="inline-flex items-center gap-1 p-1 bg-[#EFECE6] border border-[#E2E0D8] rounded-lg overflow-x-auto max-w-full"
        >
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => {
                  setActiveTab(tab.id);
                  setStatusMessage(null);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-white text-[#141413] shadow-xs'
                    : 'text-[#575652] hover:text-[#141413]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback Banner */}
      {statusMessage && (
        <div
          role="status"
          className="px-6 py-2.5 bg-[#F6ECEA] border-b border-[#D6B3AC] text-xs font-medium text-[#7F2D22] flex items-center justify-between gap-3"
        >
          <span>{statusMessage}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            aria-label="Dismiss notification"
            className="text-[#7F2D22] hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Workspace Body */}
      <div className="p-6 sm:p-8 space-y-8 bg-[#FAFAF8]">
          {/* TAB 1: PROJECTS */}
          {activeTab === 'projects' && (
            <>
              <form onSubmit={handleProjectSubmit} noValidate className="space-y-4">
                <h3 className="text-sm font-semibold text-[#141413]">Add New Project</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="proj-title"
                      className="block text-xs font-medium text-[#2C2C2A] mb-1"
                    >
                      Project Title *
                    </label>
                    <input
                      id="proj-title"
                      type="text"
                      value={projectForm.title}
                      onChange={(e) =>
                        setProjectForm((prev) => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="e.g. Jurong Lake Timber Pavilion"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#DFDED8] rounded-md focus:outline-none focus:border-[#9E3B2E]"
                    />
                    {projectErrors.title && (
                      <p role="alert" className="mt-1 text-xs text-[#B91C1C]">
                        {projectErrors.title}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="proj-category"
                      className="block text-xs font-medium text-[#2C2C2A] mb-1"
                    >
                      Category *
                    </label>
                    <select
                      id="proj-category"
                      value={projectForm.category}
                      onChange={(e) =>
                        setProjectForm((prev) => ({
                          ...prev,
                          category: e.target.value as ProjectCategory,
                        }))
                      }
                      className="w-full px-3 py-2 text-sm bg-white border border-[#DFDED8] rounded-md focus:outline-none focus:border-[#9E3B2E]"
                    >
                      <option value="NUS Year 3">NUS Year 3</option>
                      <option value="NUS Year 2">NUS Year 2</option>
                      <option value="NUS Year 1">NUS Year 1</option>
                      <option value="Individual BIM">Individual BIM</option>
                      <option value="Professional">Professional</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="proj-subtitle"
                    className="block text-xs font-medium text-[#2C2C2A] mb-1"
                  >
                    Subtitle / Architectural Focus
                  </label>
                  <input
                    id="proj-subtitle"
                    type="text"
                    value={projectForm.subtitle}
                    onChange={(e) =>
                      setProjectForm((prev) => ({ ...prev, subtitle: e.target.value }))
                    }
                    placeholder="e.g. Mass-Timber Waterfront Community Canopy"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DFDED8] rounded-md focus:outline-none focus:border-[#9E3B2E]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label
                      htmlFor="proj-year"
                      className="block text-xs font-medium text-[#2C2C2A] mb-1"
                    >
                      Year *
                    </label>
                    <input
                      id="proj-year"
                      type="text"
                      value={projectForm.year}
                      onChange={(e) =>
                        setProjectForm((prev) => ({ ...prev, year: e.target.value }))
                      }
                      placeholder="2026"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#DFDED8] rounded-md focus:outline-none focus:border-[#9E3B2E]"
                    />
                    {projectErrors.year && (
                      <p role="alert" className="mt-1 text-xs text-[#B91C1C]">
                        {projectErrors.year}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="proj-scale"
                      className="block text-xs font-medium text-[#2C2C2A] mb-1"
                    >
                      Scale
                    </label>
                    <input
                      id="proj-scale"
                      type="text"
                      value={projectForm.scale}
                      onChange={(e) =>
                        setProjectForm((prev) => ({ ...prev, scale: e.target.value }))
                      }
                      placeholder="1:50"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#DFDED8] rounded-md focus:outline-none focus:border-[#9E3B2E]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="proj-location"
                      className="block text-xs font-medium text-[#2C2C2A] mb-1"
                    >
                      Location
                    </label>
                    <input
                      id="proj-location"
                      type="text"
                      value={projectForm.location}
                      onChange={(e) =>
                        setProjectForm((prev) => ({ ...prev, location: e.target.value }))
                      }
                      placeholder="Singapore"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#DFDED8] rounded-md focus:outline-none focus:border-[#9E3B2E]"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="proj-tools"
                    className="block text-xs font-medium text-[#2C2C2A] mb-1"
                  >
                    Software &amp; Tools (comma separated) *
                  </label>
                  <input
                    id="proj-tools"
                    type="text"
                    value={projectForm.toolsRaw}
                    onChange={(e) =>
                      setProjectForm((prev) => ({ ...prev, toolsRaw: e.target.value }))
                    }
                    placeholder="Rhino, Revit, Enscape, Illustrator"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DFDED8] rounded-md focus:outline-none focus:border-[#9E3B2E]"
                  />
                  {projectErrors.toolsRaw && (
                    <p role="alert" className="mt-1 text-xs text-[#B91C1C]">
                      {projectErrors.toolsRaw}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="proj-summary"
                    className="block text-xs font-medium text-[#2C2C2A] mb-1"
                  >
                    One-Line Summary *
                  </label>
                  <textarea
                    id="proj-summary"
                    rows={2}
                    value={projectForm.summary}
                    onChange={(e) =>
                      setProjectForm((prev) => ({ ...prev, summary: e.target.value }))
                    }
                    placeholder="Concise thesis displayed on the portfolio card."
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DFDED8] rounded-md focus:outline-none focus:border-[#9E3B2E]"
                  />
                  {projectErrors.summary && (
                    <p role="alert" className="mt-1 text-xs text-[#B91C1C]">
                      {projectErrors.summary}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="proj-highlights"
                    className="block text-xs font-medium text-[#2C2C2A] mb-1"
                  >
                    Key Deliverables (one per line)
                  </label>
                  <textarea
                    id="proj-highlights"
                    rows={3}
                    value={projectForm.highlightsRaw}
                    onChange={(e) =>
                      setProjectForm((prev) => ({ ...prev, highlightsRaw: e.target.value }))
                    }
                    placeholder={'Developed 1:50 section perspective\nTested daylight performance in Climate Studio'}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DFDED8] rounded-md focus:outline-none focus:border-[#9E3B2E]"
                  />
                </div>

                <div className="p-4 bg-white border border-[#E5E5E0] rounded-lg space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-[#2C2C2A]">
                      Primary Drawing Plate / Render (optional)
                    </span>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#9E3B2E] bg-[#F6ECEA] hover:bg-[#EEDCD8] rounded-md cursor-pointer">
                      <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProjectImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    aria-label="Or paste plate image URL"
                    value={projectForm.imageUrl || ''}
                    onChange={(e) =>
                      setProjectForm((prev) => ({ ...prev, imageUrl: e.target.value }))
                    }
                    placeholder="Or paste an image URL..."
                    className="w-full px-3 py-1.5 text-xs bg-[#FAF9F6] border border-[#DFDED8] rounded-md focus:outline-none focus:border-[#9E3B2E]"
                  />
                  {projectErrors.imageUrl && (
                    <p role="alert" className="text-xs text-[#B91C1C]">
                      {projectErrors.imageUrl}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-[#9E3B2E] hover:bg-[#7F2D22] rounded-md transition-colors"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  Save Project to Portfolio
                </button>
              </form>

              {/* Existing Projects List */}
              <div className="pt-6 border-t border-[#E5E5E0]">
                <h3 className="text-sm font-semibold text-[#141413] mb-3">
                  Published Projects ({data.projects.length})
                </h3>
                <ul className="divide-y divide-[#ECEBE5] bg-white border border-[#E5E5E0] rounded-xl">
                  {data.projects.map((proj) => (
                    <li
                      key={proj.id}
                      className="px-4 py-3 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#141413] truncate">{proj.title}</p>
                        <p className="text-xs text-[#6B6A65] truncate">
                          {proj.category} · {proj.year} · {proj.plates.length} plates
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteProject(proj.id);
                          notify(`Removed "${proj.title}" from portfolio.`);
                        }}
                        aria-label={`Delete project ${proj.title}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-md text-[#6B6A65] hover:text-[#B91C1C] hover:bg-[#FEF2F2] transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* TAB 2: WORK EXPERIENCE */}
          {activeTab === 'experience' && (
            <>
              <form onSubmit={handleExperienceSubmit} noValidate className="space-y-4">
                <h3 className="text-sm font-semibold text-[#141413]">Add Work Experience</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="exp-company"
                      className="block text-xs font-medium text-[#2C2C2A] mb-1"
                    >
                      Architectural Firm / Company *
                    </label>
                    <input
                      id="exp-company"
                      type="text"
                      value={expForm.company}
                      onChange={(e) =>
                        setExpForm((prev) => ({ ...prev, company: e.target.value }))
                      }
                      placeholder="e.g. WOHA Architects"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#DFDED8] rounded-md focus:outline-none focus:border-[#9E3B2E]"
                    />
                    {expErrors.company && (
                      <p role="alert" className="mt-1 text-xs text-[#B91C1C]">
                        {expErrors.company}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="exp-role"
                      className="block text-xs font-medium text-[#2C2C2A] mb-1"
                    >
                      Role Title *
                    </label>
                    <input
                      id="exp-role"
                      type="text"
                      value={expForm.role}
                      onChange={(e) => setExpForm((prev) => ({ ...prev, role: e.target.value }))}
                      placeholder="Architectural Intern"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#DFDED8] rounded-md focus:outline-none focus:border-[#9E3B2E]"
                    />
                    {expErrors.role && (
                      <p role="alert" className="mt-1 text-xs text-[#B91C1C]">
                        {expErrors.role}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="exp-period"
                      className="block text-xs font-medium text-[#2C2C2A] mb-1"
                    >
                      Period *
                    </label>
                    <input
                      id="exp-period"
                      type="text"
                      value={expForm.period}
                      onChange={(e) =>
                        setExpForm((prev) => ({ ...prev, period: e.target.value }))
                      }
                      placeholder="May 2026 – Aug 2026"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#DFDED8] rounded-md focus:outline-none focus:border-[#9E3B2E]"
                    />
                    {expErrors.period && (
                      <p role="alert" className="mt-1 text-xs text-[#B91C1C]">
                        {expErrors.period}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="exp-location"
                      className="block text-xs font-medium text-[#2C2C2A] mb-1"
                    >
                      Location
                    </label>
                    <input
                      id="exp-location"
                      type="text"
                      value={expForm.location}
                      onChange={(e) =>
                        setExpForm((prev) => ({ ...prev, location: e.target.value }))
                      }
                      placeholder="Singapore"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#DFDED8] rounded-md focus:outline-none focus:border-[#9E3B2E]"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="exp-tools"
                    className="block text-xs font-medium text-[#2C2C2A] mb-1"
                  >
                    Tools Used (comma separated)
                  </label>
                  <input
                    id="exp-tools"
                    type="text"
                    value={expForm.toolsRaw}
                    onChange={(e) =>
                      setExpForm((prev) => ({ ...prev, toolsRaw: e.target.value }))
                    }
                    placeholder="Rhino, Revit, Enscape"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DFDED8] rounded-md focus:outline-none focus:border-[#9E3B2E]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="exp-highlights"
                    className="block text-xs font-medium text-[#2C2C2A] mb-1"
                  >
                    Key Achievements (one bullet per line) *
                  </label>
                  <textarea
                    id="exp-highlights"
                    rows={3}
                    value={expForm.highlightsRaw}
                    onChange={(e) =>
                      setExpForm((prev) => ({ ...prev, highlightsRaw: e.target.value }))
                    }
                    placeholder={'Prepared tender drawings in Revit\nCoordinated facade studies for client reviews'}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DFDED8] rounded-md focus:outline-none focus:border-[#9E3B2E]"
                  />
                  {expErrors.highlightsRaw && (
                    <p role="alert" className="mt-1 text-xs text-[#B91C1C]">
                      {expErrors.highlightsRaw}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-[#9E3B2E] hover:bg-[#7F2D22] rounded-md transition-colors"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  Save Experience
                </button>
              </form>

              <div className="pt-6 border-t border-[#E5E5E0]">
                <h3 className="text-sm font-semibold text-[#141413] mb-3">
                  Experience Timeline ({data.experiences.length})
                </h3>
                <ul className="divide-y divide-[#ECEBE5] bg-white border border-[#E5E5E0] rounded-xl">
                  {data.experiences.map((exp) => (
                    <li
                      key={exp.id}
                      className="px-4 py-3 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#141413] truncate">
                          {exp.company}
                        </p>
                        <p className="text-xs text-[#6B6A65] truncate">
                          {exp.role} · {exp.period}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteExperience(exp.id);
                          notify(`Removed "${exp.company}" from CV.`);
                        }}
                        aria-label={`Delete experience ${exp.company}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-md text-[#6B6A65] hover:text-[#B91C1C] hover:bg-[#FEF2F2] transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* TAB 3: SKILLS & COMMUNITY SERVICE */}
          {activeTab === 'skills' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-semibold text-[#141413] mb-4">
                  Software &amp; Technical Skills
                </h3>
                <div className="space-y-4">
                  {data.skillGroups.map((group) => (
                    <div
                      key={group.id}
                      className="p-4 bg-white border border-[#E5E5E0] rounded-xl space-y-3"
                    >
                      <p className="text-xs font-semibold text-[#141413]">{group.category}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {group.items.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-[#F3F2EE] text-[#141413] rounded-md"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => onRemoveSkill(group.id, skill)}
                              aria-label={`Remove skill ${skill}`}
                              className="text-[#6B6A65] hover:text-[#B91C1C]"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          aria-label={`Add new skill to ${group.category}`}
                          value={newSkillText[group.id] || ''}
                          onChange={(e) =>
                            setNewSkillText((prev) => ({ ...prev, [group.id]: e.target.value }))
                          }
                          placeholder={`Add to ${group.category}...`}
                          className="flex-1 px-3 py-1.5 text-xs bg-[#FAF9F6] border border-[#DFDED8] rounded-md focus:outline-none focus:border-[#9E3B2E]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const val = (newSkillText[group.id] || '').trim();
                            if (!val) return;
                            onAddSkill(group.id, val);
                            setNewSkillText((prev) => ({ ...prev, [group.id]: '' }));
                            notify(`Added "${val}" to ${group.category}.`);
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-[#141413] hover:bg-[#9E3B2E] rounded-md transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <form
                onSubmit={handleCommunitySubmit}
                noValidate
                className="pt-6 border-t border-[#E5E5E0] space-y-4"
              >
                <h3 className="text-sm font-semibold text-[#141413]">Add Community Service</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="cs-org"
                      className="block text-xs font-medium text-[#2C2C2A] mb-1"
                    >
                      Organization *
                    </label>
                    <input
                      id="cs-org"
                      type="text"
                      value={communityForm.organization}
                      onChange={(e) =>
                        setCommunityForm((prev) => ({ ...prev, organization: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-sm bg-white border border-[#DFDED8] rounded-md"
                    />
                    {communityErrors.organization && (
                      <p role="alert" className="mt-1 text-xs text-[#B91C1C]">
                        {communityErrors.organization}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="cs-period"
                      className="block text-xs font-medium text-[#2C2C2A] mb-1"
                    >
                      Date / Year *
                    </label>
                    <input
                      id="cs-period"
                      type="text"
                      value={communityForm.period}
                      onChange={(e) =>
                        setCommunityForm((prev) => ({ ...prev, period: e.target.value }))
                      }
                      placeholder="Oct 2026"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#DFDED8] rounded-md"
                    />
                    {communityErrors.period && (
                      <p role="alert" className="mt-1 text-xs text-[#B91C1C]">
                        {communityErrors.period}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="cs-role"
                    className="block text-xs font-medium text-[#2C2C2A] mb-1"
                  >
                    Role *
                  </label>
                  <input
                    id="cs-role"
                    type="text"
                    value={communityForm.role}
                    onChange={(e) =>
                      setCommunityForm((prev) => ({ ...prev, role: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DFDED8] rounded-md"
                  />
                  {communityErrors.role && (
                    <p role="alert" className="mt-1 text-xs text-[#B91C1C]">
                      {communityErrors.role}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="cs-details"
                    className="block text-xs font-medium text-[#2C2C2A] mb-1"
                  >
                    Impact Description
                  </label>
                  <textarea
                    id="cs-details"
                    rows={2}
                    value={communityForm.detailsRaw}
                    onChange={(e) =>
                      setCommunityForm((prev) => ({ ...prev, detailsRaw: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DFDED8] rounded-md"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#9E3B2E] hover:bg-[#7F2D22] rounded-md transition-colors"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  Add Service Entry
                </button>

                <ul className="divide-y divide-[#ECEBE5] bg-white border border-[#E5E5E0] rounded-xl mt-4">
                  {data.communityService.map((item) => (
                    <li
                      key={item.id}
                      className="px-4 py-2.5 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-[#141413] truncate">
                          {item.organization}
                        </p>
                        <p className="text-[11px] text-[#6B6A65] truncate">{item.period}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onDeleteCommunity(item.id)}
                        aria-label={`Delete community service ${item.organization}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-md text-[#6B6A65] hover:text-[#B91C1C] hover:bg-[#FEF2F2]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </form>
            </div>
          )}

          {/* TAB 4: SKETCHES */}
          {activeTab === 'sketches' && (
            <>
              <form onSubmit={handleSketchSubmit} noValidate className="space-y-4">
                <h3 className="text-sm font-semibold text-[#141413]">Add Hand-Drawn Sketch</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="sk-title"
                      className="block text-xs font-medium text-[#2C2C2A] mb-1"
                    >
                      Drawing Title *
                    </label>
                    <input
                      id="sk-title"
                      type="text"
                      value={sketchForm.title}
                      onChange={(e) =>
                        setSketchForm((prev) => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="e.g. Kyoto Wooden Machiya"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#DFDED8] rounded-md"
                    />
                    {sketchErrors.title && (
                      <p role="alert" className="mt-1 text-xs text-[#B91C1C]">
                        {sketchErrors.title}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="sk-medium"
                      className="block text-xs font-medium text-[#2C2C2A] mb-1"
                    >
                      Medium *
                    </label>
                    <input
                      id="sk-medium"
                      type="text"
                      value={sketchForm.medium}
                      onChange={(e) =>
                        setSketchForm((prev) => ({ ...prev, medium: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-sm bg-white border border-[#DFDED8] rounded-md"
                    />
                    {sketchErrors.medium && (
                      <p role="alert" className="mt-1 text-xs text-[#B91C1C]">
                        {sketchErrors.medium}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="sk-subject"
                      className="block text-xs font-medium text-[#2C2C2A] mb-1"
                    >
                      Subject / Study Note
                    </label>
                    <input
                      id="sk-subject"
                      type="text"
                      value={sketchForm.subject}
                      onChange={(e) =>
                        setSketchForm((prev) => ({ ...prev, subject: e.target.value }))
                      }
                      placeholder="Timber Facade Perspective"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#DFDED8] rounded-md"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="sk-year"
                      className="block text-xs font-medium text-[#2C2C2A] mb-1"
                    >
                      Year
                    </label>
                    <input
                      id="sk-year"
                      type="text"
                      value={sketchForm.year}
                      onChange={(e) =>
                        setSketchForm((prev) => ({ ...prev, year: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-sm bg-white border border-[#DFDED8] rounded-md"
                    />
                  </div>
                </div>

                <div className="p-4 bg-white border border-[#E5E5E0] rounded-lg space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-[#2C2C2A]">Sketch Image *</span>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#9E3B2E] bg-[#F6ECEA] hover:bg-[#EEDCD8] rounded-md cursor-pointer">
                      <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                      Upload Sketch
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSketchImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    aria-label="Sketch image URL"
                    value={sketchForm.imageUrl}
                    onChange={(e) =>
                      setSketchForm((prev) => ({ ...prev, imageUrl: e.target.value }))
                    }
                    placeholder="Or paste image URL..."
                    className="w-full px-3 py-1.5 text-xs bg-[#FAF9F6] border border-[#DFDED8] rounded-md"
                  />
                  {sketchErrors.imageUrl && (
                    <p role="alert" className="text-xs text-[#B91C1C]">
                      {sketchErrors.imageUrl}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-[#9E3B2E] hover:bg-[#7F2D22] rounded-md transition-colors"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  Save Sketch
                </button>
              </form>

              <div className="pt-6 border-t border-[#E5E5E0]">
                <h3 className="text-sm font-semibold text-[#141413] mb-3">
                  Published Sketches ({data.sketches.length})
                </h3>
                <ul className="divide-y divide-[#ECEBE5] bg-white border border-[#E5E5E0] rounded-xl">
                  {data.sketches.map((sk) => (
                    <li
                      key={sk.id}
                      className="px-4 py-2.5 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#141413] truncate">{sk.title}</p>
                        <p className="text-xs text-[#6B6A65] truncate">
                          {sk.plateNumber} · {sk.medium}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteSketch(sk.id);
                          notify(`Removed "${sk.title}" from sketches.`);
                        }}
                        aria-label={`Delete sketch ${sk.title}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-md text-[#6B6A65] hover:text-[#B91C1C] hover:bg-[#FEF2F2]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* TAB 5: 3D MODELS & COMPANION PHOTOS */}
          {activeTab === 'models' && (
            <>
              <form onSubmit={handleModelSubmit} noValidate className="space-y-4">
                <h3 className="text-sm font-semibold text-[#141413]">Add 3D Model Showcase</h3>
                <p className="text-xs text-[#6B6A65]">
                  Upload a web-optimized <code>.glb</code> or <code>.obj</code> model (or reference a
                  file in <code>/assets/models/</code>), then attach companion photographs below.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="model-title"
                      className="block text-xs font-medium text-[#2C2C2A] mb-1"
                    >
                      Model Title *
                    </label>
                    <input
                      id="model-title"
                      type="text"
                      value={modelForm.title}
                      onChange={(e) =>
                        setModelForm((prev) => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="e.g. Year 2 Sem 2 — Bamboo Canopy Model"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#DFDED8] rounded-md"
                    />
                    {modelErrors.title && (
                      <p role="alert" className="mt-1 text-xs text-[#B91C1C]">
                        {modelErrors.title}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="model-subtitle"
                      className="block text-xs font-medium text-[#2C2C2A] mb-1"
                    >
                      Subtitle / Focus
                    </label>
                    <input
                      id="model-subtitle"
                      type="text"
                      value={modelForm.subtitle}
                      onChange={(e) =>
                        setModelForm((prev) => ({ ...prev, subtitle: e.target.value }))
                      }
                      placeholder="Interactive Rhino 3D Export"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#DFDED8] rounded-md"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label
                      htmlFor="model-year"
                      className="block text-xs font-medium text-[#2C2C2A] mb-1"
                    >
                      Year *
                    </label>
                    <input
                      id="model-year"
                      type="text"
                      value={modelForm.year}
                      onChange={(e) =>
                        setModelForm((prev) => ({ ...prev, year: e.target.value }))
                      }
                      placeholder="2025"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#DFDED8] rounded-md"
                    />
                    {modelErrors.year && (
                      <p role="alert" className="mt-1 text-xs text-[#B91C1C]">
                        {modelErrors.year}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="model-studio"
                      className="block text-xs font-medium text-[#2C2C2A] mb-1"
                    >
                      Studio / Context
                    </label>
                    <input
                      id="model-studio"
                      type="text"
                      value={modelForm.studioOrContext}
                      onChange={(e) =>
                        setModelForm((prev) => ({ ...prev, studioOrContext: e.target.value }))
                      }
                      placeholder="NUS Design Studio"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#DFDED8] rounded-md"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="model-scale"
                      className="block text-xs font-medium text-[#2C2C2A] mb-1"
                    >
                      Scale
                    </label>
                    <input
                      id="model-scale"
                      type="text"
                      value={modelForm.scale}
                      onChange={(e) =>
                        setModelForm((prev) => ({ ...prev, scale: e.target.value }))
                      }
                      placeholder="1:200 Digital Model"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#DFDED8] rounded-md"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="model-format"
                      className="block text-xs font-medium text-[#2C2C2A] mb-1"
                    >
                      Format
                    </label>
                    <select
                      id="model-format"
                      value={modelForm.format}
                      onChange={(e) =>
                        setModelForm((prev) => ({
                          ...prev,
                          format: e.target.value as 'glb' | 'obj',
                        }))
                      }
                      className="w-full px-3 py-2 text-sm bg-white border border-[#DFDED8] rounded-md"
                    >
                      <option value="glb">GLB (Recommended)</option>
                      <option value="obj">OBJ</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="model-software"
                    className="block text-xs font-medium text-[#2C2C2A] mb-1"
                  >
                    Software (comma separated)
                  </label>
                  <input
                    id="model-software"
                    type="text"
                    value={modelForm.softwareRaw}
                    onChange={(e) =>
                      setModelForm((prev) => ({ ...prev, softwareRaw: e.target.value }))
                    }
                    placeholder="Rhino, Grasshopper, WebGL / glTF"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DFDED8] rounded-md"
                  />
                </div>

                <div>
                  <label
                    htmlFor="model-desc"
                    className="block text-xs font-medium text-[#2C2C2A] mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="model-desc"
                    rows={2}
                    value={modelForm.description}
                    onChange={(e) =>
                      setModelForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Spatial concept, modeling method, and structural study notes..."
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DFDED8] rounded-md"
                  />
                </div>

                <div className="p-4 bg-white border border-[#E5E5E0] rounded-lg space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-[#2C2C2A]">
                      3D Model Asset (.glb / .obj) *
                    </span>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#9E3B2E] bg-[#F6ECEA] hover:bg-[#EEDCD8] rounded-md cursor-pointer">
                      <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                      {uploadingModel ? 'Uploading...' : 'Upload .GLB / .OBJ'}
                      <input
                        type="file"
                        accept=".glb,.obj"
                        disabled={uploadingModel}
                        onChange={handleModelFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    aria-label="3D model URL or asset path"
                    value={modelForm.modelUrl}
                    onChange={(e) =>
                      setModelForm((prev) => ({ ...prev, modelUrl: e.target.value }))
                    }
                    placeholder="/assets/models/your-model.glb or Cloud Storage URL..."
                    className="w-full px-3 py-1.5 text-xs bg-[#FAF9F6] border border-[#DFDED8] rounded-md"
                  />
                  {modelErrors.modelUrl && (
                    <p role="alert" className="text-xs text-[#B91C1C]">
                      {modelErrors.modelUrl}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-[#9E3B2E] hover:bg-[#7F2D22] rounded-md transition-colors"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  Save 3D Model
                </button>
              </form>

              <div className="pt-6 border-t border-[#E5E5E0]">
                <h3 className="text-sm font-semibold text-[#141413] mb-3">
                  Published 3D Models ({data.models.length})
                </h3>
                <div className="space-y-4">
                  {data.models.map((model) => (
                    <div
                      key={model.id}
                      className="p-4 bg-white border border-[#E5E5E0] rounded-xl space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#141413] truncate">
                            {model.title}
                          </p>
                          <p className="text-xs text-[#6B6A65] truncate">
                            {model.studioOrContext} · {model.year} · {model.format.toUpperCase()} ·{' '}
                            {model.photos.length} companion{' '}
                            {model.photos.length === 1 ? 'photo' : 'photos'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteModel(model.id);
                            notify(`Removed "${model.title}" from 3D Models.`);
                          }}
                          aria-label={`Delete model ${model.title}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md text-[#6B6A65] hover:text-[#B91C1C] hover:bg-[#FEF2F2] shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Existing Companion Photos */}
                      {model.photos.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {model.photos.map((photo) => (
                            <div
                              key={photo.id}
                              className="relative group border border-[#E5E5E0] rounded-lg overflow-hidden bg-[#FAF9F6]"
                            >
                              <img
                                src={photo.imageUrl}
                                alt={photo.caption}
                                className="w-full h-24 object-cover"
                              />
                              <p className="px-2 py-1 text-[11px] text-[#575652] truncate">
                                {photo.caption}
                              </p>
                              <button
                                type="button"
                                onClick={() => onDeleteModelPhoto(model.id, photo.id)}
                                aria-label={`Delete photo ${photo.caption}`}
                                className="absolute top-1 right-1 inline-flex items-center justify-center w-6 h-6 rounded bg-white/90 text-[#575652] hover:text-[#B91C1C] shadow-xs"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Upload Companion Photo */}
                      <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-[#F0EFEA]">
                        <input
                          type="text"
                          aria-label={`Caption for new photo on ${model.title}`}
                          value={photoCaptions[model.id] || ''}
                          onChange={(e) =>
                            setPhotoCaptions((prev) => ({
                              ...prev,
                              [model.id]: e.target.value,
                            }))
                          }
                          placeholder="Companion photo caption (e.g. 1:100 basswood physical model)..."
                          className="flex-1 px-3 py-1.5 text-xs bg-[#FAF9F6] border border-[#DFDED8] rounded-md"
                        />
                        <label className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#9E3B2E] bg-[#F6ECEA] hover:bg-[#EEDCD8] rounded-md cursor-pointer whitespace-nowrap shrink-0">
                          <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                          {uploadingPhotoModelId === model.id ? 'Uploading...' : 'Add Photo'}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingPhotoModelId === model.id}
                            onChange={(e) => handleModelPhotoUpload(model.id, e)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* TAB 6: PROFILE, BACKUP & RESET */}
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <form onSubmit={handleProfileSave} className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-[#141413]">
                    Profile Headline &amp; Contact Information
                  </h3>
                  <button
                    type="submit"
                    disabled={!profileDirty || isSaving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#9E3B2E] hover:bg-[#7F2D22] disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" aria-hidden="true" />
                    {isSaving ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="prof-name"
                      className="block text-xs font-medium text-[#2C2C2A] mb-1"
                    >
                      Full Name
                    </label>
                    <input
                      id="prof-name"
                      type="text"
                      value={profileDraft.fullName}
                      onChange={(e) => {
                        setProfileDraft((prev) => ({ ...prev, fullName: e.target.value }));
                        setProfileDirty(true);
                      }}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#DFDED8] rounded-md"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="prof-role"
                      className="block text-xs font-medium text-[#2C2C2A] mb-1"
                    >
                      Role / Discipline Subtitle
                    </label>
                    <input
                      id="prof-role"
                      type="text"
                      value={profileDraft.roleTitle}
                      onChange={(e) => {
                        setProfileDraft((prev) => ({ ...prev, roleTitle: e.target.value }));
                        setProfileDirty(true);
                      }}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#DFDED8] rounded-md"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="prof-statement"
                      className="block text-xs font-medium text-[#2C2C2A] mb-1"
                    >
                      Architectural Statement
                    </label>
                    <textarea
                      id="prof-statement"
                      rows={3}
                      value={profileDraft.statement}
                      onChange={(e) => {
                        setProfileDraft((prev) => ({ ...prev, statement: e.target.value }));
                        setProfileDirty(true);
                      }}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#DFDED8] rounded-md"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="prof-email"
                        className="block text-xs font-medium text-[#2C2C2A] mb-1"
                      >
                        Email
                      </label>
                      <input
                        id="prof-email"
                        type="email"
                        value={profileDraft.email}
                        onChange={(e) => {
                          setProfileDraft((prev) => ({ ...prev, email: e.target.value }));
                          setProfileDirty(true);
                        }}
                        className="w-full px-3 py-2 text-sm bg-white border border-[#DFDED8] rounded-md"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="prof-phone"
                        className="block text-xs font-medium text-[#2C2C2A] mb-1"
                      >
                        Phone
                      </label>
                      <input
                        id="prof-phone"
                        type="text"
                        value={profileDraft.phone}
                        onChange={(e) => {
                          setProfileDraft((prev) => ({ ...prev, phone: e.target.value }));
                          setProfileDirty(true);
                        }}
                        className="w-full px-3 py-2 text-sm bg-white border border-[#DFDED8] rounded-md"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="prof-linkedin"
                        className="block text-xs font-medium text-[#2C2C2A] mb-1"
                      >
                        LinkedIn URL
                      </label>
                      <input
                        id="prof-linkedin"
                        type="url"
                        value={profileDraft.linkedinUrl}
                        onChange={(e) => {
                          setProfileDraft((prev) => ({ ...prev, linkedinUrl: e.target.value }));
                          setProfileDirty(true);
                        }}
                        className="w-full px-3 py-2 text-sm bg-white border border-[#DFDED8] rounded-md"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="prof-gpa"
                        className="block text-xs font-medium text-[#2C2C2A] mb-1"
                      >
                        GPA Display
                      </label>
                      <input
                        id="prof-gpa"
                        type="text"
                        value={profileDraft.gpaDisplay}
                        onChange={(e) => {
                          setProfileDraft((prev) => ({ ...prev, gpaDisplay: e.target.value }));
                          setProfileDirty(true);
                        }}
                        className="w-full px-3 py-2 text-sm bg-white border border-[#DFDED8] rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </form>

              <div className="pt-6 border-t border-[#E5E5E0]">
                <h4 className="text-xs font-semibold text-[#141413] mb-2">
                  JSON Backup &amp; Restore
                </h4>
                <p className="text-xs text-[#6B6A65] mb-3">
                  Export a full snapshot of your portfolio and CV, or import a saved JSON archive to
                  publish it to your live site.
                </p>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={onExportJson}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#141413] bg-white border border-[#DFDED8] hover:border-[#141413] rounded-md transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" aria-hidden="true" />
                    Export JSON Backup
                  </button>
                  <button
                    type="button"
                    onClick={() => importInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#141413] bg-white border border-[#DFDED8] hover:border-[#141413] rounded-md transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                    Import JSON Backup
                  </button>
                  <input
                    ref={importInputRef}
                    type="file"
                    accept="application/json"
                    onChange={handleImportFileChange}
                    className="hidden"
                    aria-label="Import portfolio JSON backup"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-[#E5E5E0]">
                <h4 className="text-xs font-semibold text-[#141413] mb-2">
                  Restore Original Portfolio Dataset
                </h4>
                <p className="text-xs text-[#6B6A65] mb-3">
                  Reset all custom additions and revert to the initial studio dataset extracted from
                  your uploaded CV &amp; Portfolio boards.
                </p>
                {!confirmReset ? (
                  <button
                    type="button"
                    onClick={() => setConfirmReset(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#B91C1C] bg-[#FEF2F2] hover:bg-[#FEE2E2] rounded-md transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                    Reset to Default Portfolio Data
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await onResetAll();
                        setConfirmReset(false);
                        notify('Portfolio restored to default dataset.');
                      }}
                      className="px-3.5 py-2 text-xs font-semibold text-white bg-[#B91C1C] hover:bg-[#991B1B] rounded-md"
                    >
                      Confirm Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="px-3.5 py-2 text-xs font-medium text-[#575652] bg-[#F3F2EE] rounded-md"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
