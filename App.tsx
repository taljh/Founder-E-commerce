import React, { useState } from 'react';
import { ViewState } from './types';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import Finance from './views/Finance';
import Sales from './views/Sales';
import Products from './views/Products';
import Expenses from './views/Expenses';
import Reports from './views/Reports';
import CEO from './views/CEO';
import Onboarding from './views/Onboarding';
import { StoreProvider, useStore } from './store';

// Wrapper component to access Store Context
const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const { onboarding } = useStore();

  // GATE: Show Onboarding if not completed
  if (!onboarding.hasCompleted) {
      return <Onboarding />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'HOME':
        return <Dashboard onNavigate={setCurrentView} />;
      case 'ORDERS':
        return <Sales />; // "الطلبات"
      case 'FINANCE':
        return <Finance onNavigate={setCurrentView} />; // "المالية"
      case 'COSTS':
        return <Expenses />; // "التكاليف"
      case 'PRODUCTS':
        return <Products />; // "المنتجات"
      case 'REPORTS':
        return <Reports />; // "التقارير"
      case 'CEO':
        return <CEO onNavigate={setCurrentView} />; // "CEO المتجر"
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
};

export default App;