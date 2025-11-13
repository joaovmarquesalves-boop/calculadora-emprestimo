import { useSiteConfig } from '../context/SiteConfigContext';

const HowToApply = () => {
  const {
    config: { howToApply },
  } = useSiteConfig();

  return (
    <section className="bg-primary-50/80">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl space-y-4">
            <h2 className="text-3xl font-bold text-primary-900 md:text-4xl">{howToApply.title}</h2>
            <p className="text-base text-primary-800">{howToApply.description}</p>
          </div>
          {howToApply.ctaLabel && howToApply.ctaLink && (
            <a
              href={howToApply.ctaLink}
              className="inline-flex items-center gap-2 text-sm font-semibold text-secondary-600 transition hover:text-secondary-700"
            >
              {howToApply.ctaLabel}
            </a>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {howToApply.steps.map((step, index) => (
            <article
              key={step.title}
              className="relative flex h-full flex-col gap-4 rounded-3xl border border-primary-100 bg-white p-6 shadow-highlight"
            >
              <span className="absolute -top-4 left-6 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-700 text-lg font-bold text-white shadow-highlight">
                {index + 1}
              </span>
              <h3 className="pt-6 text-xl font-semibold text-primary-900">{step.title}</h3>
              <p className="text-sm text-primary-800">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowToApply;
