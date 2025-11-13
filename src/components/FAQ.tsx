import { useState } from 'react';
import { FiMinus, FiPlus } from 'react-icons/fi';
import { useSiteConfig } from '../context/SiteConfigContext';

const FAQ = () => {
  const {
    config: { faq },
  } = useSiteConfig();

  const [activeIndex, setActiveIndex] = useState(0);

  const handleToggle = (index: number) => {
    setActiveIndex((current) => (current === index ? -1 : index));
  };

  return (
    <section className="bg-primary-50/90">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-primary-900 md:text-4xl">{faq.title}</h2>
          <p className="mt-4 text-base text-primary-800">{faq.description}</p>
        </div>
        <div className="divide-y divide-primary-100 overflow-hidden rounded-3xl border border-primary-100 bg-white">
          {faq.items.map((item, index) => {
            const isActive = index === activeIndex;
            return (
              <div key={item.question}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-primary-900"
                  onClick={() => handleToggle(index)}
                  aria-expanded={isActive}
                >
                  <span className="text-base font-semibold md:text-lg">{item.question}</span>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full border text-primary-700 ${
                    isActive ? 'border-primary-400 bg-primary-100' : 'border-primary-200'
                  }`}>
                    {isActive ? <FiMinus /> : <FiPlus />}
                  </span>
                </button>
                {isActive && (
                  <div className="px-6 pb-6 text-sm text-primary-800 md:text-base">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
