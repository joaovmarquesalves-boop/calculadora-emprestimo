import Header from '../components/Header';
import Footer from '../components/Footer';
import { useSiteConfig } from '../context/SiteConfigContext';
import { Navigate } from 'react-router-dom';

const CompanyPage = () => {
  const {
    config: { company },
  } = useSiteConfig();

  if (!company.enabled) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-900 via-primary-800 to-primary-900 text-primary-50">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <section className="mb-16 space-y-6 text-center">
          <span className="inline-flex items-center justify-center rounded-full bg-primary-800/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-secondary-200">
            Nossa empresa
          </span>
          <h1 className="text-3xl font-bold md:text-5xl">{company.heroTitle}</h1>
          <p className="mx-auto max-w-3xl text-lg text-primary-100">{company.heroSubtitle}</p>
        </section>

        <section className="grid gap-10 md:grid-cols-2">
          <article className="space-y-4 rounded-3xl border border-primary-700 bg-primary-800/60 p-6">
            <h2 className="text-2xl font-semibold">Nossa missão</h2>
            <p className="text-sm leading-relaxed text-primary-100">{company.mission}</p>
          </article>
          <article className="space-y-4 rounded-3xl border border-primary-700 bg-primary-800/60 p-6">
            <h2 className="text-2xl font-semibold">Nossa visão</h2>
            <p className="text-sm leading-relaxed text-primary-100">{company.vision}</p>
          </article>
        </section>

        <section className="mt-12 grid gap-6 rounded-3xl border border-primary-700 bg-primary-900/60 p-6 md:grid-cols-[1.2fr_1fr]">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Nossa história</h2>
            <p className="text-sm leading-relaxed text-primary-100">{company.history}</p>
          </div>
          <div className="rounded-2xl border border-primary-500 bg-primary-800/50 p-5">
            <h3 className="text-lg font-semibold text-secondary-200">Nossos valores</h3>
            <ul className="mt-4 space-y-3 text-sm text-primary-50">
              {company.values.map((value) => (
                <li key={value} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-secondary-400" />
                  <span>{value}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-secondary-500/40 bg-secondary-500/15 p-6 text-primary-900">
          <h2 className="text-2xl font-semibold">Compromisso com o cliente</h2>
          <p className="mt-3 text-sm leading-relaxed text-primary-800">
            Trabalhamos para que cada servidor tenha clareza e tranquilidade em toda a jornada do crédito consignado. Nossa equipe
            está pronta para atender de forma humana, consultiva e transparente.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CompanyPage;
