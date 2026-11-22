import { Check, Copy, ExternalLink, Printer } from 'lucide-react';
import { Locale, UI_TEXT } from '../i18n/translations';
import { ProfileInfo } from '../types/portfolio';
import { InkUnderline } from './SketchMotion';

interface ShareShowcaseSectionProps {
  profile: ProfileInfo;
  locale: Locale;
  showcaseUrl: string;
  copiedLink: boolean;
  onCopyShowcaseLink: () => void;
}

export function ShareShowcaseSection({
  profile,
  locale,
  showcaseUrl,
  copiedLink,
  onCopyShowcaseLink,
}: ShareShowcaseSectionProps) {
  const t = UI_TEXT[locale].share;

  return (
    <section id="share" className="section-optimize py-16 lg:py-20 bg-[#F3F2EE]/75 no-print">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Direct Contact & LinkedIn Card */}
          <div className="lg:col-span-6">
            <p className="font-mono-tabular text-xs text-[#6B6A65] mb-2">{t.eyebrow}</p>
            <h2 className="font-editorial text-3xl sm:text-4xl font-semibold tracking-tight text-[#141413]">
              {t.heading}
            </h2>
            <InkUnderline className="mb-4" />
            <p className="text-sm text-[#575652] leading-relaxed max-w-lg mb-6">
              {t.description}
            </p>

            <div className="space-y-2.5 text-sm text-[#2C2C2A]">
              <p>
                <span className="text-[#6B6A65]">{t.emailLabel} </span>
                <a
                  href={`mailto:${profile.email}`}
                  className="font-medium hover:text-[#1D4ED8] underline underline-offset-4 decoration-[#CFCFC7]"
                >
                  {profile.email}
                </a>
              </p>
              <p>
                <span className="text-[#6B6A65]">{t.phoneLabel} </span>
                <span className="font-mono-tabular font-medium">{profile.phone}</span>
              </p>
              <p>
                <span className="text-[#6B6A65]">LinkedIn: </span>
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-[#1D4ED8] hover:underline underline-offset-4"
                >
                  {profile.linkedinUrl.replace(/^https?:\/\//, '')}
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              </p>
            </div>
          </div>

          {/* Right Column: Clean Visitor Share & Print Card */}
          <div className="lg:col-span-6 bg-white border border-[#E5E5E0] rounded-xl p-6 sm:p-7 space-y-6">
            <div>
              <label
                htmlFor="linkedin-showcase-url"
                className="block text-xs font-semibold text-[#141413] mb-2"
              >
                {t.shareLinkLabel}
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="linkedin-showcase-url"
                  type="text"
                  readOnly
                  value={showcaseUrl}
                  className="flex-1 px-3 py-2 text-xs font-mono-tabular bg-[#F7F6F2] border border-[#DFDED8] rounded-md text-[#2C2C2A] focus:outline-none focus:border-[#1D4ED8]"
                />
                <button
                  type="button"
                  onClick={onCopyShowcaseLink}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-md transition-colors whitespace-nowrap shrink-0"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      {t.copied}
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                      {t.copyLink}
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-[#F0EFEA] flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#141413] bg-[#F3F2EE] hover:bg-[#E7E5DE] rounded-md transition-colors whitespace-nowrap"
              >
                <Printer className="w-3.5 h-3.5" aria-hidden="true" />
                {t.printCvSummary}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
