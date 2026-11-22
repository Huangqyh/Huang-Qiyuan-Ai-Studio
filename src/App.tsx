import { onAuthStateChanged, User } from 'firebase/auth';
import { Lock } from 'lucide-react';
import { MotionConfig } from 'motion/react';
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { CurriculumVitaeSection } from './components/CurriculumVitaeSection';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ModelsShowcaseSection } from './components/ModelsShowcaseSection';
import { SelectedWorksSection } from './components/SelectedWorksSection';
import { ShareShowcaseSection } from './components/ShareShowcaseSection';
import { SketchesGallery } from './components/SketchesGallery';

const OwnerStudioPage = lazy(() =>
  import('./components/OwnerStudioPage').then((m) => ({ default: m.OwnerStudioPage }))
);
const ProjectLightbox = lazy(() =>
  import('./components/ProjectLightbox').then((m) => ({ default: m.ProjectLightbox }))
);
import { INITIAL_PORTFOLIO_DATA } from './data/initialPortfolio';
import { auth, isAuthorizedOwner } from './firebase';
import {
  loadInitialLocale,
  Locale,
  LOCALE_STORAGE_KEY,
  localizePortfolioData,
  UI_TEXT,
} from './i18n/translations';
import {
  createProjectInFirestore,
  createSketchInFirestore,
  deleteProjectFromFirestore,
  deleteSketchFromFirestore,
  fetchPublicPortfolio,
  replaceEntirePortfolioInFirestore,
  saveConfigToFirestore,
  seedInitialPortfolioToFirestore,
  subscribePublicPortfolio,
} from './services/portfolioFirestore';
import { PortfolioData, PortfolioProject } from './types/portfolio';
import {
  addCommunityServiceToPortfolio,
  addExperienceToPortfolio,
  addModelToPortfolio,
  addPhotoToModel,
  addProjectToPortfolio,
  addSketchToPortfolio,
  addSkillToGroup,
  buildPublicVisitorUrl,
  CanvasSurface,
  CategoryFilter,
  deleteCommunityServiceFromPortfolio,
  deleteExperienceFromPortfolio,
  deleteModelFromPortfolio,
  deletePhotoFromModel,
  deleteProjectFromPortfolio,
  deleteSketchFromPortfolio,
  filterProjects,
  isOwnerStudioRoute,
  NewCommunityInput,
  NewExperienceInput,
  NewModelInput,
  NewProjectInput,
  NewSketchInput,
  parseImportedPortfolioJson,
  removeSkillFromGroup,
  updateProfileInfo,
} from './utils/portfolioLogic';
import {
  loadCanvasSurface,
  loadLocalModels,
  saveCanvasSurface,
  saveLocalModels,
} from './utils/storage';

function detectAdminRoute(): boolean {
  if (typeof window === 'undefined') return false;
  return isOwnerStudioRoute(
    window.location.pathname,
    window.location.hash,
    window.location.search
  );
}

function PortfolioApp() {
  const [data, setData] = useState<PortfolioData>(() => ({
    ...INITIAL_PORTFOLIO_DATA,
    models: loadLocalModels(INITIAL_PORTFOLIO_DATA.models),
  }));
  const [isSeededInCloud, setIsSeededInCloud] = useState(false);
  const [canvasSurface, setCanvasSurface] = useState<CanvasSurface>(() => loadCanvasSurface());
  const [locale, setLocale] = useState<Locale>(() => loadInitialLocale());
  const [isOwnerRoute, setIsOwnerRoute] = useState<boolean>(() => detectAdminRoute());

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const hasAutoSeededRef = useRef(false);

  // Listen to browser navigation between Public Visitor Webpage and Private Owner Studio
  useEffect(() => {
    const syncRoute = () => setIsOwnerRoute(detectAdminRoute());
    window.addEventListener('hashchange', syncRoute);
    window.addEventListener('popstate', syncRoute);
    return () => {
      window.removeEventListener('hashchange', syncRoute);
      window.removeEventListener('popstate', syncRoute);
    };
  }, []);

  // Track Firebase Auth session
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
    });
    return unsubAuth;
  }, []);

  // Load published portfolio once for visitors; subscribe live (with drafts) inside Owner Studio
  useEffect(() => {
    if (!authReady) return;

    if (!isOwnerRoute) {
      let cancelled = false;
      fetchPublicPortfolio()
        .then(({ data: remoteData, isSeeded }) => {
          if (cancelled) return;
          setData({
            ...remoteData,
            models: loadLocalModels(remoteData.models),
          });
          setIsSeededInCloud(isSeeded);
          setSyncError(null);
        })
        .catch((err) => {
          console.error('Portfolio fetch error:', err);
        });
      return () => {
        cancelled = true;
      };
    }

    const unsub = subscribePublicPortfolio(
      ({ data: remoteData, isSeeded }) => {
        setData({
          ...remoteData,
          models: loadLocalModels(remoteData.models),
        });
        setIsSeededInCloud(isSeeded);
        setSyncError(null);
      },
      (err) => {
        console.error('Portfolio subscription error:', err);
      },
      { includeDrafts: isAuthorizedOwner(user) }
    );
    return unsub;
  }, [authReady, isOwnerRoute, user]);

  // Seed Firestore automatically the first time the verified owner enters Owner Studio
  useEffect(() => {
    if (!authReady || !isOwnerRoute || isSeededInCloud || hasAutoSeededRef.current) return;
    if (!isAuthorizedOwner(user)) return;

    hasAutoSeededRef.current = true;
    setIsSaving(true);
    seedInitialPortfolioToFirestore(INITIAL_PORTFOLIO_DATA)
      .catch((err) => {
        console.error('Failed to seed initial portfolio:', err);
        setSyncError('Could not initialize cloud database. Please try again.');
        hasAutoSeededRef.current = false;
      })
      .finally(() => setIsSaving(false));
  }, [authReady, isOwnerRoute, isSeededInCloud, user]);

  useEffect(() => {
    saveCanvasSurface(canvasSurface);
  }, [canvasSurface]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
      } catch {
        // ignore storage errors
      }
      document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
      document.title = UI_TEXT[locale].pageTitle;
    }
  }, [locale]);

  const localizedData = useMemo(
    () => localizePortfolioData(data, locale),
    [data, locale]
  );

  const filteredProjects = useMemo(
    () => filterProjects(localizedData.projects, categoryFilter, searchQuery, activeSkill),
    [localizedData.projects, categoryFilter, searchQuery, activeSkill]
  );

  const activeSelectedProject = useMemo(
    () =>
      selectedProject
        ? localizedData.projects.find((p) => p.id === selectedProject.id) ?? selectedProject
        : null,
    [selectedProject, localizedData.projects]
  );

  const toggleLocale = () => setLocale((prev) => (prev === 'en' ? 'zh' : 'en'));

  const publicVisitorUrl = useMemo(() => {
    if (typeof window === 'undefined') return 'https://portfolio.example.com/';
    return buildPublicVisitorUrl(window.location.origin, window.location.pathname);
  }, []);

  const navigateToOwnerStudio = () => {
    window.location.hash = '#/admin';
    setIsOwnerRoute(true);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const navigateToVisitorSite = () => {
    const url = new URL(window.location.href);
    url.hash = '';
    url.searchParams.delete('studio');
    if (url.pathname.toLowerCase().startsWith('/admin')) {
      url.pathname = '/';
    }
    window.history.replaceState({}, '', url.toString());
    setIsOwnerRoute(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleCopyPublicLink = async () => {
    try {
      await navigator.clipboard.writeText(publicVisitorUrl);
    } catch {
      const input = document.getElementById('linkedin-showcase-url') as HTMLInputElement | null;
      if (input) {
        input.select();
        document.execCommand('copy');
      }
    }
    setCopiedLink(true);
    window.setTimeout(() => setCopiedLink(false), 2600);
  };

  const runOwnerMutation = async (action: () => Promise<void>) => {
    if (!isAuthorizedOwner(user)) {
      setSyncError('Owner authentication required to publish changes.');
      return;
    }
    setIsSaving(true);
    setSyncError(null);
    try {
      if (!isSeededInCloud) {
        await seedInitialPortfolioToFirestore(data);
        setIsSeededInCloud(true);
      }
      await action();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to save changes.';
      if (message.includes('Quota exceeded')) {
        setSyncError('Firestore daily quota reached. Quota resets tomorrow.');
      } else if (message.includes('Firestore size limit')) {
        setSyncError(message);
      } else {
        setSyncError('Could not save changes to cloud database. Please retry.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddProject = async (input: NewProjectInput) => {
    const next = addProjectToPortfolio(data, input);
    const created = next.projects[0];
    setData(next);
    await runOwnerMutation(async () => {
      await createProjectInFirestore(created, 0);
      // Re-index existing sort orders gently by shifting created to top (0) on next seed/replace if needed
    });
  };

  const handleDeleteProject = async (id: string) => {
    const next = deleteProjectFromPortfolio(data, id);
    setData(next);
    await runOwnerMutation(() => deleteProjectFromFirestore(id));
  };

  const handleAddExperience = async (input: NewExperienceInput) => {
    const next = addExperienceToPortfolio(data, input);
    setData(next);
    await runOwnerMutation(() => saveConfigToFirestore(next));
  };

  const handleDeleteExperience = async (id: string) => {
    const next = deleteExperienceFromPortfolio(data, id);
    setData(next);
    await runOwnerMutation(() => saveConfigToFirestore(next));
  };

  const handleAddSkill = async (groupId: string, skill: string) => {
    const next = addSkillToGroup(data, groupId, skill);
    setData(next);
    await runOwnerMutation(() => saveConfigToFirestore(next));
  };

  const handleRemoveSkill = async (groupId: string, skill: string) => {
    const next = removeSkillFromGroup(data, groupId, skill);
    setData(next);
    await runOwnerMutation(() => saveConfigToFirestore(next));
  };

  const handleAddCommunity = async (input: NewCommunityInput) => {
    const next = addCommunityServiceToPortfolio(data, input);
    setData(next);
    await runOwnerMutation(() => saveConfigToFirestore(next));
  };

  const handleDeleteCommunity = async (id: string) => {
    const next = deleteCommunityServiceFromPortfolio(data, id);
    setData(next);
    await runOwnerMutation(() => saveConfigToFirestore(next));
  };

  const handleAddSketch = async (input: NewSketchInput) => {
    const next = addSketchToPortfolio(data, input);
    const created = next.sketches[0];
    setData(next);
    await runOwnerMutation(() => createSketchInFirestore(created, 0));
  };

  const handleDeleteSketch = async (id: string) => {
    const next = deleteSketchFromPortfolio(data, id);
    setData(next);
    await runOwnerMutation(() => deleteSketchFromFirestore(id));
  };

  const handleAddModel = (input: NewModelInput) => {
    setData((prev) => {
      const next = addModelToPortfolio(prev, input);
      saveLocalModels(next.models);
      return next;
    });
  };

  const handleDeleteModel = (id: string) => {
    setData((prev) => {
      const next = deleteModelFromPortfolio(prev, id);
      saveLocalModels(next.models);
      return next;
    });
  };

  const handleAddModelPhoto = (modelId: string, imageUrl: string, caption: string) => {
    setData((prev) => {
      const next = addPhotoToModel(prev, modelId, imageUrl, caption);
      saveLocalModels(next.models);
      return next;
    });
  };

  const handleDeleteModelPhoto = (modelId: string, photoId: string) => {
    setData((prev) => {
      const next = deletePhotoFromModel(prev, modelId, photoId);
      saveLocalModels(next.models);
      return next;
    });
  };

  const handleUpdateProfile = async (patch: Partial<PortfolioData['profile']>) => {
    const next = updateProfileInfo(data, patch);
    setData(next);
    await runOwnerMutation(() => saveConfigToFirestore(next));
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.profile.fullName.toLowerCase().replace(/\s+/g, '_')}_portfolio.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = async (raw: string): Promise<{ ok: boolean; message: string }> => {
    const result = parseImportedPortfolioJson(raw);
    if (!result.ok) {
      return { ok: false, message: result.error };
    }
    const prevProjects = data.projects;
    const prevSketches = data.sketches;
    setData(result.data);
    saveLocalModels(result.data.models);
    await runOwnerMutation(() =>
      replaceEntirePortfolioInFirestore(result.data, prevProjects, prevSketches)
    );
    return {
      ok: true,
      message: `Published imported portfolio with ${result.data.projects.length} projects and ${result.data.experiences.length} experience entries.`,
    };
  };

  const handleResetAll = async () => {
    const prevProjects = data.projects;
    const prevSketches = data.sketches;
    setData(INITIAL_PORTFOLIO_DATA);
    saveLocalModels(INITIAL_PORTFOLIO_DATA.models);
    await runOwnerMutation(() =>
      replaceEntirePortfolioInFirestore(INITIAL_PORTFOLIO_DATA, prevProjects, prevSketches)
    );
  };

  // Dedicated Private Owner Studio Side (#/admin or /admin)
  if (isOwnerRoute) {
    return (
      <MotionConfig reducedMotion="user">
        <Suspense
          fallback={
            <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-6">
              <p className="font-mono-tabular text-xs text-[#6B6A65]">Loading Owner Studio...</p>
            </div>
          }
        >
          <OwnerStudioPage
            user={user}
            authReady={authReady}
            data={data}
            isSaving={isSaving}
            syncError={syncError}
            publicVisitorUrl={publicVisitorUrl}
            copiedLink={copiedLink}
            onCopyPublicLink={handleCopyPublicLink}
            onExitStudio={navigateToVisitorSite}
            onAddProject={handleAddProject}
            onDeleteProject={handleDeleteProject}
            onAddExperience={handleAddExperience}
            onDeleteExperience={handleDeleteExperience}
            onAddSkill={handleAddSkill}
            onRemoveSkill={handleRemoveSkill}
            onAddCommunity={handleAddCommunity}
            onDeleteCommunity={handleDeleteCommunity}
            onAddSketch={handleAddSketch}
            onDeleteSketch={handleDeleteSketch}
            onAddModel={handleAddModel}
            onDeleteModel={handleDeleteModel}
            onAddModelPhoto={handleAddModelPhoto}
            onDeleteModelPhoto={handleDeleteModelPhoto}
            onUpdateProfile={handleUpdateProfile}
            onExportJson={handleExportJson}
            onImportJson={handleImportJson}
            onResetAll={handleResetAll}
          />
        </Suspense>
      </MotionConfig>
    );
  }

  // Public Visitor Webpage (Clean Read-Only Exhibition & Interactive CV)
  const t = UI_TEXT[locale];

  return (
    <MotionConfig reducedMotion="user">
      <div
        data-surface={canvasSurface}
        className={`min-h-screen text-[#141413] flex flex-col transition-colors duration-200 ${
          canvasSurface === 'grid' ? 'surface-grid' : 'surface-paper'
        }`}
      >
        <Header
          brandName={localizedData.profile.fullName}
          locale={locale}
          onToggleLocale={toggleLocale}
        />

        <main className="flex-1">
          <HeroSection
            profile={localizedData.profile}
            locale={locale}
            projectCount={localizedData.projects.length}
            experienceCount={localizedData.experiences.length}
            sketchCount={localizedData.sketches.length}
            canvasSurface={canvasSurface}
            copiedLink={copiedLink}
            onChangeSurface={setCanvasSurface}
            onCopyShowcaseLink={handleCopyPublicLink}
            onOpenHeroPlate={() => {
              const firstFeatured = localizedData.projects[0];
              if (firstFeatured) setSelectedProject(firstFeatured);
            }}
          />

          <SelectedWorksSection
            projects={filteredProjects}
            totalCount={localizedData.projects.length}
            locale={locale}
            categoryFilter={categoryFilter}
            searchQuery={searchQuery}
            activeSkill={activeSkill}
            onCategoryChange={setCategoryFilter}
            onSearchChange={setSearchQuery}
            onClearSkillFilter={() => setActiveSkill(null)}
            onSelectProject={setSelectedProject}
          />

          <CurriculumVitaeSection
            experiences={localizedData.experiences}
            education={localizedData.education}
            skillGroups={localizedData.skillGroups}
            ventures={localizedData.ventures}
            communityService={localizedData.communityService}
            locale={locale}
            activeSkill={activeSkill}
            onToggleSkill={(skill) => setActiveSkill((prev) => (prev === skill ? null : skill))}
            onClearSkill={() => setActiveSkill(null)}
          />

          <SketchesGallery sketches={localizedData.sketches} locale={locale} />

          <ModelsShowcaseSection models={localizedData.models} locale={locale} />

          <ShareShowcaseSection
            profile={localizedData.profile}
            locale={locale}
            showcaseUrl={publicVisitorUrl}
            copiedLink={copiedLink}
            onCopyShowcaseLink={handleCopyPublicLink}
          />
        </main>

        <footer className="border-t border-[#E5E5E0] bg-[#FAFAF8] py-8 no-print">
          <div className="max-w-[1240px] mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B6A65]">
            <p>
              © {new Date().getFullYear()} {localizedData.profile.fullName} ·{' '}
              {t.footerBrandSuffix}
            </p>
            <div className="flex flex-wrap items-center gap-5">
              <a href="#works" className="hover:text-[#141413] transition-colors">
                {t.header.nav.works}
              </a>
              <a href="#cv" className="hover:text-[#141413] transition-colors">
                {t.header.footerCv}
              </a>
              <a href="#sketches" className="hover:text-[#141413] transition-colors">
                {t.header.nav.sketches}
              </a>
              <a href="#models" className="hover:text-[#141413] transition-colors">
                {t.header.nav.models}
              </a>
              <a
                href={localizedData.profile.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#141413] transition-colors"
              >
                LinkedIn
              </a>
              <span className="text-[#D4D3CC]" aria-hidden="true">
                ·
              </span>
              <button
                type="button"
                onClick={navigateToOwnerStudio}
                className="inline-flex items-center gap-1 text-[#8A8882] hover:text-[#141413] transition-colors"
              >
                <Lock className="w-3 h-3" aria-hidden="true" />
                {t.header.ownerStudio}
              </button>
            </div>
          </div>
        </footer>

        {activeSelectedProject && (
          <Suspense fallback={null}>
            <ProjectLightbox
              project={activeSelectedProject}
              locale={locale}
              onClose={() => setSelectedProject(null)}
            />
          </Suspense>
        )}
      </div>
    </MotionConfig>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <PortfolioApp />
    </ErrorBoundary>
  );
}
