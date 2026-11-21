import { signInWithPopup, signOut, User } from 'firebase/auth';
import {
  ArrowLeft,
  Check,
  Cloud,
  Copy,
  ExternalLink,
  Lock,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import { useState } from 'react';
import { auth, googleProvider, isAuthorizedOwner, OWNER_EMAIL } from '../firebase';
import { PortfolioData } from '../types/portfolio';
import {
  NewCommunityInput,
  NewExperienceInput,
  NewModelInput,
  NewProjectInput,
  NewSketchInput,
} from '../utils/portfolioLogic';
import { ContentManagerDrawer } from './ContentManagerDrawer';

interface OwnerStudioPageProps {
  user: User | null;
  authReady: boolean;
  data: PortfolioData;
  isSaving: boolean;
  syncError: string | null;
  publicVisitorUrl: string;
  copiedLink: boolean;
  onCopyPublicLink: () => void;
  onExitStudio: () => void;
  onAddProject: (input: NewProjectInput) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
  onAddExperience: (input: NewExperienceInput) => Promise<void>;
  onDeleteExperience: (id: string) => Promise<void>;
  onAddSkill: (groupId: string, skill: string) => Promise<void>;
  onRemoveSkill: (groupId: string, skill: string) => Promise<void>;
  onAddCommunity: (input: NewCommunityInput) => Promise<void>;
  onDeleteCommunity: (id: string) => Promise<void>;
  onAddSketch: (input: NewSketchInput) => Promise<void>;
  onDeleteSketch: (id: string) => Promise<void>;
  onAddModel: (input: NewModelInput) => Promise<void> | void;
  onDeleteModel: (id: string) => Promise<void> | void;
  onAddModelPhoto: (modelId: string, imageUrl: string, caption: string) => Promise<void> | void;
  onDeleteModelPhoto: (modelId: string, photoId: string) => Promise<void> | void;
  onUpdateProfile: (patch: Partial<PortfolioData['profile']>) => Promise<void>;
  onExportJson: () => void;
  onImportJson: (raw: string) => Promise<{ ok: boolean; message: string }>;
  onResetAll: () => Promise<void>;
}

export function OwnerStudioPage({
  user,
  authReady,
  data,
  isSaving,
  syncError,
  publicVisitorUrl,
  copiedLink,
  onCopyPublicLink,
  onExitStudio,
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
}: OwnerStudioPageProps) {
  const [authError, setAuthError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const authorized = isAuthorizedOwner(user);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign-in was cancelled or blocked.';
      if (!msg.includes('popup-closed-by-user')) {
        setAuthError('Google sign-in could not be completed. Please allow popups and try again.');
      }
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    setAuthError(null);
    await signOut(auth);
  };

  // State 1: Resolving authentication session
  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] text-[#141413] flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <p className="font-mono-tabular text-xs text-[#6B6A65]">Owner Studio</p>
          <p className="text-sm text-[#575652]">Verifying session...</p>
        </div>
      </div>
    );
  }

  // State 2: Unauthenticated Visitor — Owner Sign-In Gate
  if (!user) {
    return (
      <div className="min-h-screen surface-paper text-[#141413] flex flex-col">
        <header className="border-b border-[#E5E5E0] bg-[#FAFAF8]/95">
          <div className="max-w-[1040px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
            <span className="font-editorial text-xl font-semibold text-[#141413]">
              {data.profile.fullName} · Owner Studio
            </span>
            <button
              type="button"
              onClick={onExitStudio}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#575652] hover:text-[#141413] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              Back to Visitor Webpage
            </button>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white border border-[#E5E5E0] rounded-xl p-7 sm:p-8 space-y-6 shadow-xs">
            <div className="space-y-2">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#F3F2EE] text-[#141413] mb-1">
                <Lock className="w-4 h-4" aria-hidden="true" />
              </div>
              <p className="font-mono-tabular text-xs text-[#6B6A65]">Private Workspace</p>
              <h1 className="font-editorial text-3xl font-semibold tracking-tight text-[#141413]">
                Owner Studio Sign In
              </h1>
              <p className="text-sm text-[#575652] leading-relaxed">
                This management portal is restricted to the portfolio owner. Sign in with your
                authorized Google account to add projects, update CV records, or edit sketches.
              </p>
            </div>

            {authError && (
              <p
                role="alert"
                className="text-xs text-[#B91C1C] bg-[#FEF2F2] border border-[#FECACA] rounded-md px-3 py-2"
              >
                {authError}
              </p>
            )}

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={signingIn}
                className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-white bg-[#141413] hover:bg-[#1D4ED8] disabled:opacity-60 rounded-md transition-colors"
              >
                {signingIn ? 'Opening Google Sign-In...' : 'Sign in with Google'}
              </button>

              <button
                type="button"
                onClick={onExitStudio}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-[#575652] hover:text-[#141413] bg-[#F3F2EE] hover:bg-[#E7E5DE] rounded-md transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                Return to Public Portfolio
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // State 3: Signed in with an unauthorized Google account
  if (!authorized) {
    return (
      <div className="min-h-screen surface-paper text-[#141413] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-[#E5E5E0] rounded-xl p-7 sm:p-8 space-y-5 shadow-xs">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#FEF2F2] text-[#B91C1C]">
            <ShieldAlert className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="space-y-1.5">
            <p className="font-mono-tabular text-xs text-[#B91C1C]">Access Restricted</p>
            <h1 className="font-editorial text-2xl font-semibold text-[#141413]">
              Owner Account Required
            </h1>
            <p className="text-sm text-[#575652] leading-relaxed">
              You are currently signed in as{' '}
              <span className="font-medium text-[#141413]">{user.email}</span>. Content editing is
              restricted exclusively to the verified portfolio owner.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#141413] hover:bg-[#1D4ED8] rounded-md transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              Switch Account
            </button>
            <button
              type="button"
              onClick={onExitStudio}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#141413] bg-[#F3F2EE] hover:bg-[#E7E5DE] rounded-md transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              View Public Portfolio
            </button>
          </div>
        </div>
      </div>
    );
  }

  // State 4: Verified Owner Studio Workspace
  return (
    <div className="min-h-screen surface-paper text-[#141413] flex flex-col">
      {/* Studio Top Bar */}
      <header className="sticky top-0 z-40 bg-[#FAFAF8]/95 backdrop-blur-sm border-b border-[#E5E5E0]">
        <div className="max-w-[1160px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-editorial text-xl font-semibold tracking-tight text-[#141413] whitespace-nowrap">
              Owner Studio
            </span>
            <span className="hidden sm:inline text-[#C5C4BC]" aria-hidden="true">
              /
            </span>
            <span className="hidden sm:inline text-xs font-mono-tabular text-[#6B6A65] truncate">
              {OWNER_EMAIL}
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs font-mono-tabular text-[#575652] mr-1">
              <Cloud className="w-3.5 h-3.5 text-[#1D4ED8]" aria-hidden="true" />
              {isSaving ? 'Saving to Cloud...' : 'Cloud Synced'}
            </span>

            <button
              type="button"
              onClick={onExitStudio}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#141413] bg-[#F3F2EE] hover:bg-[#E7E5DE] rounded-md transition-colors whitespace-nowrap"
            >
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              View Visitor Webpage
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#141413] hover:bg-[#B91C1C] rounded-md transition-colors whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1160px] w-full mx-auto px-5 sm:px-8 py-8 space-y-6">
        {/* Visitor Share Strip & Live Counts */}
        <div className="bg-white border border-[#E5E5E0] rounded-xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <p className="font-mono-tabular text-2xl font-semibold text-[#141413]">
                {String(data.projects.length).padStart(2, '0')}
              </p>
              <p className="text-xs text-[#6B6A65]">Published Projects</p>
            </div>
            <div>
              <p className="font-mono-tabular text-2xl font-semibold text-[#141413]">
                {String(data.experiences.length).padStart(2, '0')}
              </p>
              <p className="text-xs text-[#6B6A65]">CV Experiences</p>
            </div>
            <div>
              <p className="font-mono-tabular text-2xl font-semibold text-[#141413]">
                {String(data.sketches.length).padStart(2, '0')}
              </p>
              <p className="text-xs text-[#6B6A65]">Sketch Plates</p>
            </div>
            <div>
              <p className="font-mono-tabular text-2xl font-semibold text-[#141413]">
                {String(data.models.length).padStart(2, '0')}
              </p>
              <p className="text-xs text-[#6B6A65]">3D Models</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:min-w-[420px]">
            <label htmlFor="studio-public-url" className="sr-only">
              Public visitor webpage URL
            </label>
            <input
              id="studio-public-url"
              type="text"
              readOnly
              value={publicVisitorUrl}
              className="flex-1 px-3 py-2 text-xs font-mono-tabular bg-[#F7F6F2] border border-[#DFDED8] rounded-md text-[#2C2C2A]"
            />
            <button
              type="button"
              onClick={onCopyPublicLink}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  Copy Visitor URL
                </>
              )}
            </button>
          </div>
        </div>

        {syncError && (
          <div
            role="alert"
            className="px-4 py-3 text-xs text-[#B91C1C] bg-[#FEF2F2] border border-[#FECACA] rounded-lg"
          >
            {syncError}
          </div>
        )}

        {/* Embedded Full-Page Content Manager */}
        <ContentManagerDrawer
          data={data}
          isSaving={isSaving}
          onAddProject={onAddProject}
          onDeleteProject={onDeleteProject}
          onAddExperience={onAddExperience}
          onDeleteExperience={onDeleteExperience}
          onAddSkill={onAddSkill}
          onRemoveSkill={onRemoveSkill}
          onAddCommunity={onAddCommunity}
          onDeleteCommunity={onDeleteCommunity}
          onAddSketch={onAddSketch}
          onDeleteSketch={onDeleteSketch}
          onAddModel={onAddModel}
          onDeleteModel={onDeleteModel}
          onAddModelPhoto={onAddModelPhoto}
          onDeleteModelPhoto={onDeleteModelPhoto}
          onUpdateProfile={onUpdateProfile}
          onExportJson={onExportJson}
          onImportJson={onImportJson}
          onResetAll={onResetAll}
        />
      </main>
    </div>
  );
}
