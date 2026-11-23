import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Locale, UI_TEXT } from '../i18n/translations';
import { SketchItem } from '../types/portfolio';
import { ArchitecturalImage } from './ArchitecturalImage';
import {
  DraftingCornerMarks,
  InkDivider,
  InkUnderline,
  StaggerRevealItem,
} from './SketchMotion';

interface SketchesGalleryProps {
  sketches: SketchItem[];
  locale: Locale;
}

export function SketchesGallery({ sketches, locale }: SketchesGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const t = UI_TEXT[locale].sketches;

  const selectedSketch = selectedIndex !== null ? sketches[selectedIndex] : null;

  useEffect(() => {
    if (selectedIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedIndex(null);
        setZoomed(false);
      } else if (e.key === 'ArrowRight') {
        setSelectedIndex((prev) => (prev === null ? null : (prev + 1) % sketches.length));
        setZoomed(false);
      } else if (e.key === 'ArrowLeft') {
        setSelectedIndex((prev) =>
          prev === null ? null : (prev - 1 + sketches.length) % sketches.length
        );
        setZoomed(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedIndex, sketches.length]);

  return (
    <section id="sketches" className="section-optimize pt-14 pb-16 lg:pt-16 lg:pb-20 bg-transparent">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <p className="font-mono-tabular text-xs text-[#6B6A65] mb-2">{t.eyebrow}</p>
            <h2 className="font-editorial text-3xl sm:text-4xl font-semibold tracking-tight text-[#141413]">
              {t.heading}
            </h2>
            <InkUnderline />
            <p className="mt-3 text-sm text-[#575652] max-w-xl">{t.subtitle}</p>
          </div>
        </div>

        {/* Clean 4-column Architectural Print Folio Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sketches.map((sketch, index) => (
            <StaggerRevealItem key={sketch.id} index={index} className="flex">
              <figure className="group w-full flex flex-col bg-white border border-[#D6D4CC] rounded-[2px] overflow-hidden transition-all duration-220 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-[#9E3B2E]/60 hover:shadow-[0_12px_26px_-18px_rgba(20,20,19,0.28)] print-break-avoid">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedIndex(index);
                    setZoomed(false);
                  }}
                  aria-label={t.inspectAria(sketch.title)}
                  className="flex flex-col flex-1 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#9E3B2E]"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-white border-b border-[#D6D4CC] p-3">
                    <ArchitecturalImage
                      src={sketch.imageUrl}
                      alt={`${sketch.title} — ${sketch.medium}`}
                      title={sketch.title}
                      plateNumber={sketch.plateNumber}
                      variant="thumbnail"
                      fit="contain"
                      className="w-full h-full bg-white"
                      imgClassName="transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.045] group-focus-within:scale-[1.045]"
                    />
                    <DraftingCornerMarks tone="dark" />
                  </div>
                  <figcaption className="p-4">
                    <div className="flex items-center justify-between gap-2 font-mono-tabular text-[11px] uppercase tracking-wider text-[#6B6A65] mb-1">
                      <span>{sketch.plateNumber}</span>
                      <span>{sketch.year}</span>
                    </div>
                    <p className="font-editorial text-lg font-semibold text-[#141413] leading-snug group-hover:text-[#9E3B2E] transition-colors">
                      {sketch.title}
                    </p>
                    <p className="font-mono-tabular text-[11px] text-[#6B6A65] mt-1 truncate">
                      {sketch.medium}
                    </p>
                  </figcaption>
                </button>
              </figure>
            </StaggerRevealItem>
          ))}
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-5 sm:px-8 mt-16 lg:mt-20">
        <InkDivider />
      </div>

      {/* Sketch Lightbox */}
      {selectedSketch && selectedIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.dialogAria(selectedSketch.title)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#141413]/85 backdrop-blur-xs p-4 sm:p-8 no-print"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedIndex(null);
              setZoomed(false);
            }
          }}
        >
          <div className="w-full max-w-[960px] max-h-[90vh] bg-white border border-[#D6D4CC] rounded-[2px] overflow-hidden flex flex-col shadow-2xl">
            <div className="px-5 py-3.5 border-b border-[#D6D4CC] flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-mono-tabular text-xs text-[#6B6A65]">
                  {selectedSketch.plateNumber} · {selectedSketch.medium} · {selectedSketch.year}
                </p>
                <h3 className="font-editorial text-2xl font-semibold text-[#141413] truncate">
                  {selectedSketch.title}
                </h3>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setZoomed((prev) => !prev)}
                  aria-label={zoomed ? t.zoomOutAria : t.zoomInAria}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-[2px] text-[#141413] hover:bg-[#F3F2EE] transition-colors"
                >
                  {zoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedIndex((selectedIndex - 1 + sketches.length) % sketches.length);
                    setZoomed(false);
                  }}
                  aria-label={t.prevAria}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-[2px] text-[#141413] hover:bg-[#F3F2EE] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedIndex((selectedIndex + 1) % sketches.length);
                    setZoomed(false);
                  }}
                  aria-label={t.nextAria}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-[2px] text-[#141413] hover:bg-[#F3F2EE] transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedIndex(null);
                    setZoomed(false);
                  }}
                  aria-label={t.closeAria}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-[2px] text-[#575652] hover:text-[#141413] hover:bg-[#F3F2EE] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-[#F7F6F2] p-4 sm:p-6 flex">
              <div
                className="m-auto transition-all duration-200"
                style={{ width: zoomed ? '165%' : '100%', maxWidth: zoomed ? 'none' : '640px' }}
              >
                <ArchitecturalImage
                  src={selectedSketch.imageUrl}
                  alt={selectedSketch.title}
                  fit="contain"
                  className={`w-full bg-white rounded-[2px] p-3 border border-[#D6D4CC] ${
                    zoomed ? 'min-h-[70vh]' : 'h-[62vh]'
                  }`}
                />
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#D6D4CC] flex items-center justify-between text-xs text-[#6B6A65]">
              <span>{selectedSketch.subject}</span>
              <span className="font-mono-tabular">
                {selectedIndex + 1} / {sketches.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
