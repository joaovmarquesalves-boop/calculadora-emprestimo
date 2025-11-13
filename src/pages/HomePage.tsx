import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Advantages from '../components/Advantages';
import HowToApply from '../components/HowToApply';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';
import LeadFormModal from '../components/LeadFormModal';
import { calculateMonthlyPayment } from '../utils/loan';
import { CalculatorMode, useSiteConfig } from '../context/SiteConfigContext';
import AudienceAccordion from '../components/AudienceAccordion';

type SimulationData = {
  amount: number;
  installments: number;
  monthlyPayment: number;
  mode: CalculatorMode;
};

const HomePage = () => {
  const {
    config: { calculator },
  } = useSiteConfig();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [simulation, setSimulation] = useState<SimulationData>(() => ({
    amount: calculator.defaultAmount,
    installments: calculator.defaultInstallments,
    monthlyPayment: calculateMonthlyPayment(
      calculator.defaultAmount,
      calculator.defaultInstallments,
      calculator.interestRate,
    ),
    mode: calculator.defaultMode,
  }));

  useEffect(() => {
    setSimulation({
      amount: calculator.defaultAmount,
      installments: calculator.defaultInstallments,
      monthlyPayment: calculateMonthlyPayment(
        calculator.defaultAmount,
        calculator.defaultInstallments,
        calculator.interestRate,
      ),
      mode: calculator.defaultMode,
    });
  }, [
    calculator.defaultAmount,
    calculator.defaultInstallments,
    calculator.defaultMode,
    calculator.interestRate,
  ]);

  const handleSimulate = (data: SimulationData) => {
    setSimulation(data);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-900 via-primary-800 to-primary-900 text-primary-50">
      <Header />
      <main>
        <Hero onSimulate={handleSimulate} />
        <AudienceAccordion />
        <Advantages />
        <HowToApply />
        <FAQ />
      </main>
      <Footer />
      <LeadFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        loanAmount={simulation.amount}
        installments={simulation.installments}
        monthlyPayment={simulation.monthlyPayment}
        mode={simulation.mode}
      />
    </div>
  );
};

export default HomePage;
