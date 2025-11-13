import { useSiteConfig } from '../context/SiteConfigContext';

const Footer = () => {
  const {
    config: { footer, header },
  } = useSiteConfig();

  return (
    <footer className="border-t border-primary-800 bg-primary-900 text-primary-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-1 flex-col gap-8 md:flex-row md:gap-16">
          <div className="space-y-2 text-sm">
            <p className="text-base font-semibold text-secondary-300">{footer.title}</p>
            <p>{footer.registration}</p>
            <p>{footer.address}</p>
          </div>
          <div className="space-y-2 text-sm">
            <p>{footer.schedule}</p>
            <p>{footer.contact}</p>
            <p className="text-xs text-primary-200">
              © {new Date().getFullYear()} {header.companyName}. Todos os direitos reservados.
            </p>
          </div>
        </div>
        {footer.footerLogoUrl && (
          <div className="flex-shrink-0">
            <img
              src={footer.footerLogoUrl}
              alt={`Logo de ${header.companyName} no rodapé`}
              className="h-16 w-auto"
            />
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
