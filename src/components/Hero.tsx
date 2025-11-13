import LoanCalculator from './LoanCalculator';
import { useSiteConfig } from '../context/SiteConfigContext';
import { CalculatorMode } from '../context/SiteConfigContext';

type HeroProps = {
  onSimulate: (args: {
    amount: number;
    installments: number;
    monthlyPayment: number;
    mode: CalculatorMode;
  }) => void;
};

const Hero = ({ onSimulate }: HeroProps) => {
  const {
    config: { hero },
  } = useSiteConfig();

  return (
    <section className="relative overflow-hidden bg-primary-50/80">
      {/* Subtle radial highlight using the primary color palette */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(62,107,200,0.16),_transparent_55%)]" />
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-16 pt-20 md:flex-row md:items-center md:gap-16">
        <div className="flex-1 space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-2 text-sm font-semibold text-primary-900 shadow-highlight">
            {hero.badgeText}
          </span>
          <h1 className="text-3xl font-bold leading-tight text-primary-900 md:text-5xl">{hero.title}</h1>
          <p className="max-w-xl text-lg text-primary-800 md:text-xl">{hero.description}</p>
          <ul className="flex flex-col gap-3 text-sm text-primary-800 md:flex-row md:flex-wrap md:text-base">
            {hero.bullets.map((bullet) => (
              <li key={bullet} className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-secondary-500" /> {bullet}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1">
          <LoanCalculator onSimulate={onSimulate} />
        </div>
      </div>
    </section>
  );
};

export default Hero;
