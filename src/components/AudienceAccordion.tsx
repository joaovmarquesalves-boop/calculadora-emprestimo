import { useState } from 'react';
import { useSiteConfig } from '../context/SiteConfigContext';

const AudienceAccordion = () => {
  const {
    config: { audiences },
  } = useSiteConfig();

  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  if (!audiences?.items?.length) {
    return null;
  }

  const toggleItem = (index: number) => {
    setActiveIndex((current) => (current === index ? null : index));
  };

  return (
    <section className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700">
            Para quem é
          </span>
          <h2 className="mt-4 text-3xl font-semibold text-primary-900">{audiences.title}</h2>
          <p className="mt-2 text-base text-primary-800">{audiences.description}</p>
        </div>

        <div className="grid gap-4">
          {audiences.items.map((item, index) => {
            const isActive = activeIndex === index;
            return (
              <div
                key={item.title + index}
                className="overflow-hidden rounded-2xl border border-primary/20 bg-white/90 shadow-sm shadow-primary/10 backdrop-blur"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(index)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isActive}
                  aria-controls={`audience-panel-${index}`}
                >
                  <div>
                    <h3 className="text-lg font-semibold text-primary-900">{item.title}</h3>
                    <p className="mt-1 text-sm text-primary-700">{item.description}</p>
                  </div>
                  <span
                    className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/30 text-primary-700 transition-transform duration-200 ${
                      isActive ? 'rotate-180 bg-primary/10' : 'bg-white'
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-5 w-5"
                    >
                      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>

                {isActive ? (
                  <div
                    id={`audience-panel-${index}`}
                    className="grid overflow-hidden transition-all duration-200 ease-in-out"
                  >
                    <div className="min-h-0 border-t border-primary/10 bg-primary-50/60 px-6 py-5">
                      <ul className="flex flex-wrap gap-3 text-sm text-primary-800">
                        {item.highlights.map((highlight, highlightIndex) => (
                          <li
                            key={highlight + highlightIndex}
                            className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-primary-700 shadow-sm"
                          >
                            <span className="inline-flex h-2 w-2 rounded-full bg-secondary-500" />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AudienceAccordion;
