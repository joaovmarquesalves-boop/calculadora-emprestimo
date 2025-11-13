import { FiClock, FiShield, FiSmartphone, FiTrendingUp } from 'react-icons/fi';
import { useSiteConfig } from '../context/SiteConfigContext';

const iconMap = {
  shield: FiShield,
  clock: FiClock,
  smartphone: FiSmartphone,
  trending: FiTrendingUp,
} as const;

const Advantages = () => {
  const {
    config: { advantages },
  } = useSiteConfig();

  return (
    <section className="border-y border-primary-800 bg-primary-900 text-primary-50">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary-300">
            {advantages.label}
          </span>
          <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">{advantages.title}</h2>
          <p className="mt-4 text-base text-primary-100">{advantages.description}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {advantages.items.map(({ icon, title, description }) => {
            const Icon = iconMap[icon] ?? FiShield;
            return (
              <article
                key={title}
                className="group flex h-full flex-col gap-4 rounded-3xl border border-primary-100 bg-primary-50/95 p-6 text-primary-900 shadow-[0_20px_40px_-24px_rgba(62,107,200,0.35)] transition hover:border-primary-400 hover:shadow-highlight"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-700 transition group-hover:bg-primary-600 group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="text-xl font-semibold text-primary-900">{title}</h3>
                <p className="text-sm text-primary-800">{description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Advantages;
