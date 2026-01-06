import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { 
  Order, OrderStatus, Product, PaymentRule, ShippingRule, 
  FixedCost, AdSpend, PnLStatement, ExpenseTransaction,
  PackagingMaterial, PackagingTemplate, SallaInvoice, OrderEconomics
} from './types';

interface OnboardingState {
  hasCompleted: boolean;
  currentStep: 'SYSTEM' | 'COSTS' | 'DECISION';
}

interface StoreContextType {
  orders: Order[];
  products: Product[];
  fixedCosts: FixedCost[];
  ads: AdSpend[];
  expenses: ExpenseTransaction[];
  paymentRules: PaymentRule[];
  shippingRules: ShippingRule[];
  
  // Computed Financials
  cashFlow: {
    totalSettled: number;
    totalPending: number;
    pendingBreakdown: { source: string, amount: number }[];
  };
  
  inventoryValuation: {
    totalValue: number;
    potentialRevenue: number;
    lowStockCount: number;
  };

  // Packaging & Invoices
  packagingMaterials: PackagingMaterial[];
  packagingTemplates: PackagingTemplate[];
  sallaInvoices: SallaInvoice[];
  
  // System State
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  isSallaConnected: boolean;
  lastSyncTime: string;
  connectSalla: () => void;
  disconnectSalla: () => void;
  syncSalla: () => void;

  // Onboarding
  onboarding: OnboardingState;
  markOnboardingStepComplete: (step: 'SYSTEM' | 'COSTS' | 'DECISION') => void;
  skipOnboarding: () => void;

  // Actions
  calculatePnL: (period: 'THIS_MONTH' | 'LAST_MONTH') => PnLStatement;
  calculateOrderEconomics: (orderId: string) => OrderEconomics | null;
  
  updateProductCost: (id: string, newCost: number) => void;
  updatePackagingMaterial: (id: string, costPerUnit: number) => void;
  updatePackagingTemplate: (materialId: string, quantity: number) => void;
  processSallaInvoice: (file: File) => void;
  toggleFixedCost: (id: number) => void;
  addAd: (ad: Omit<AdSpend, 'id' | 'timestamp'>) => void;
  addExpense: (expense: Omit<ExpenseTransaction, 'id' | 'timestamp'>) => void;
  updatePaymentRule: (method: string, percent: number, fixed: number) => void;
  updateShippingRule: (carrier: string, cost: number) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// --- DEMO DATA CONSTANTS ---
const DEMO_PRODUCTS: Product[] = [
  { id: '1', name: 'ساعة ذكية Ultra', sku: 'WT-001', cost: 120, sellingPrice: 299, quantity: 45, lowStockThreshold: 10, category: 'Electronics' },
  { id: '2', name: 'سماعة بلوتوث Pro', sku: 'AD-002', cost: 60, sellingPrice: 149, quantity: 120, lowStockThreshold: 20, category: 'Electronics' },
  { id: '3', name: 'بكج حماية ايفون', sku: 'AC-005', cost: 15, sellingPrice: 99, quantity: 8, lowStockThreshold: 15, category: 'Accessories' },
];

const DEMO_ORDERS: Order[] = [
  { id: '#10234', amount: 299, date: '2023-10-25', timestamp: Date.now(), status: OrderStatus.COMPLETED, customerName: 'أحمد محمد', paymentMethod: 'MADA', shippingCarrier: 'ARAMEX', items: [{ productId: '1', quantity: 1 }], isSettled: true },
  { id: '#10235', amount: 149, date: '2023-10-26', timestamp: Date.now() - 3600000, status: OrderStatus.COMPLETED, customerName: 'سارة خالد', paymentMethod: 'TABBY', shippingCarrier: 'SMSA', items: [{ productId: '2', quantity: 1 }], isSettled: false },
  { id: '#10236', amount: 99, date: '2023-10-26', timestamp: Date.now() - 7200000, status: OrderStatus.SHIPPED, customerName: 'فهد العتيبي', paymentMethod: 'COD', shippingCarrier: 'SPL', items: [{ productId: '3', quantity: 1 }], isSettled: false },
  { id: '#10237', amount: 598, date: '2023-10-24', timestamp: Date.now() - 86400000, status: OrderStatus.COMPLETED, customerName: 'خالد السالم', paymentMethod: 'VISA', shippingCarrier: 'ARAMEX', items: [{ productId: '1', quantity: 2 }], isSettled: true },
  { id: '#10238', amount: 149, date: '2023-10-24', timestamp: Date.now() - 90000000, status: OrderStatus.RETURNED, customerName: 'نورة علي', paymentMethod: 'MADA', shippingCarrier: 'SMSA', items: [{ productId: '2', quantity: 1 }], isSettled: true },
];

const DEMO_FIXED_COSTS: FixedCost[] = [
  { id: 1, name: 'رواتب موظفين', amount: 3500, period: 'MONTHLY', active: true, category: 'SALARIES', source: 'MANUAL' },
];

const DEMO_EXPENSES: ExpenseTransaction[] = [
    { id: '1', amount: 200, type: 'OPERATING', description: 'صيانة طابعة البولصيات', date: '2023-10-10', timestamp: Date.now() },
    { id: '2', amount: 400, type: 'FIXED', description: 'فاتورة كهرباء المستودع', date: '2023-10-05', timestamp: Date.now() }
];

const DEMO_ADS: AdSpend[] = [
  { id: 1, platform: 'SNAPCHAT', amount: 1800, date: '2023-10-01', timestamp: Date.now(), roas: 1.2, type: 'TOPUP' },
  { id: 2, platform: 'TIKTOK', amount: 500, date: '2023-10-15', timestamp: Date.now(), roas: 0.8, type: 'INVOICE' },
];

// --- INITIAL RULES (ALWAYS PRESENT) ---
const INITIAL_PAYMENT_RULES: PaymentRule[] = [
  { method: 'MADA', name: 'مدى', percentFee: 1.0, fixedFee: 1.0, settlementDays: 1 },
  { method: 'VISA', name: 'فيزا / ماستر', percentFee: 2.2, fixedFee: 1.0, settlementDays: 1 },
  { method: 'APPLE_PAY', name: 'Apple Pay', percentFee: 2.2, fixedFee: 1.0, settlementDays: 1 },
  { method: 'TABBY', name: 'تابي (Tabby)', percentFee: 7.0, fixedFee: 0, settlementDays: 7 },
  { method: 'TAMARA', name: 'تمارا (Tamara)', percentFee: 7.0, fixedFee: 0, settlementDays: 7 },
  { method: 'COD', name: 'دفع عند الاستلام', percentFee: 0, fixedFee: 15, settlementDays: 14 },
];

const INITIAL_SHIPPING_RULES: ShippingRule[] = [
  { carrier: 'ARAMEX', name: 'أرامكس (Aramex)', cost: 24.0 },
  { carrier: 'SMSA', name: 'سمسا (SMSA)', cost: 28.0 },
  { carrier: 'SPL', name: 'سبل (SPL)', cost: 18.0 },
  { carrier: 'DHL', name: 'DHL Express', cost: 45.0 },
];

const INITIAL_PACKAGING_MATS: PackagingMaterial[] = [
  { id: '1', name: 'كرتون شحن صغير', costPerUnit: 2.5 },
  { id: '2', name: 'كيس تغليف', costPerUnit: 0.5 },
  { id: '3', name: 'ستيكر شعار', costPerUnit: 0.75 },
];

const INITIAL_PACKAGING_TEMPLATES: PackagingTemplate[] = [
  { id: '1', name: 'تغليف قياسي', items: [{ materialId: '1', quantity: 1 }, { materialId: '3', quantity: 1 }] }
];


export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  
  // --- STATE ---
  // Default to FALSE for V1 Production (starts empty/fresh)
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([]);
  const [expenses, setExpenses] = useState<ExpenseTransaction[]>([]);
  const [ads, setAds] = useState<AdSpend[]>([]);

  const [paymentRules, setPaymentRules] = useState<PaymentRule[]>(INITIAL_PAYMENT_RULES);
  const [shippingRules, setShippingRules] = useState<ShippingRule[]>(INITIAL_SHIPPING_RULES);
  const [packagingMaterials, setPackagingMaterials] = useState<PackagingMaterial[]>(INITIAL_PACKAGING_MATS);
  const [packagingTemplates, setPackagingTemplates] = useState<PackagingTemplate[]>(INITIAL_PACKAGING_TEMPLATES);

  const [sallaInvoices, setSallaInvoices] = useState<SallaInvoice[]>([]);
  const [isSallaConnected, setIsSallaConnected] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('09:42 AM');

  // Onboarding State
  const [onboarding, setOnboarding] = useState<OnboardingState>({
    hasCompleted: false,
    currentStep: 'SYSTEM'
  });

  // --- DEMO TOGGLE LOGIC ---
  const toggleDemoMode = () => {
    const nextMode = !isDemoMode;
    setIsDemoMode(nextMode);

    if (nextMode) {
        // Load Demo Data
        setProducts(DEMO_PRODUCTS);
        setOrders(DEMO_ORDERS);
        setFixedCosts(DEMO_FIXED_COSTS);
        setExpenses(DEMO_EXPENSES);
        setAds(DEMO_ADS);
        setIsSallaConnected(true);
        // If Demo is ON, we assume onboarding is done or irrelevant for testing
        setOnboarding({ hasCompleted: true, currentStep: 'DECISION' });
    } else {
        // Clear Data (Empty State)
        setProducts([]);
        setOrders([]);
        setFixedCosts([]);
        setExpenses([]);
        setAds([]);
        setIsSallaConnected(false);
    }
  };

  // --- ONBOARDING ACTIONS ---
  const markOnboardingStepComplete = (step: 'SYSTEM' | 'COSTS' | 'DECISION') => {
      if (step === 'SYSTEM') {
          setOnboarding({ hasCompleted: false, currentStep: 'COSTS' });
      } else if (step === 'COSTS') {
          setOnboarding({ hasCompleted: false, currentStep: 'DECISION' });
      } else if (step === 'DECISION') {
          setOnboarding({ hasCompleted: true, currentStep: 'DECISION' });
      }
  };

  const skipOnboarding = () => {
      setOnboarding({ hasCompleted: true, currentStep: 'DECISION' });
  };

  // --- ACTIONS ---
  const updateProductCost = (id: string, newCost: number) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, cost: newCost } : p));
  };

  const updatePackagingMaterial = (id: string, costPerUnit: number) => {
    setPackagingMaterials(prev => prev.map(m => m.id === id ? { ...m, costPerUnit } : m));
  };

  const updatePackagingTemplate = (materialId: string, quantity: number) => {
    setPackagingTemplates(prev => {
        const temp = [...prev];
        const items = temp[0].items.map(item => item.materialId === materialId ? { ...item, quantity } : item);
        temp[0].items = items;
        return temp;
    });
  };

  const processSallaInvoice = (file: File) => {
    // Mock
  };

  const toggleFixedCost = (id: number) => {
    setFixedCosts(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const addAd = (ad: Omit<AdSpend, 'id' | 'timestamp'>) => {
    setAds(prev => [...prev, { ...ad, id: Date.now(), timestamp: Date.now() }]);
  };

  const addExpense = (expense: Omit<ExpenseTransaction, 'id' | 'timestamp'>) => {
    setExpenses(prev => [...prev, { ...expense, id: Date.now().toString(), timestamp: Date.now() }]);
  };

  const updatePaymentRule = (method: string, percent: number, fixed: number) => {
    setPaymentRules(prev => prev.map(r => r.method === method ? { ...r, percentFee: percent, fixedFee: fixed } : r));
  };

  const updateShippingRule = (carrier: string, cost: number) => {
    setShippingRules(prev => prev.map(r => r.carrier === carrier ? { ...r, cost } : r));
  };

  const connectSalla = () => {
    setIsSallaConnected(true);
    setLastSyncTime(new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'}));
    
    // Simulate Fetching Data for Onboarding Flow
    setTimeout(() => {
        setProducts(DEMO_PRODUCTS);
        setOrders(DEMO_ORDERS); // We populate orders so 'Decision' step has data
    }, 500);

    if (onboarding.currentStep === 'SYSTEM') {
        markOnboardingStepComplete('SYSTEM');
    }
  };
  
  const disconnectSalla = () => setIsSallaConnected(false);
  
  const syncSalla = () => {
    setLastSyncTime(new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'}));
  };

  // --- ENGINE 1: CASH FLOW ANALYZER ---
  const cashFlow = useMemo(() => {
    let totalSettled = 0;
    let totalPending = 0;
    const pendingMap = new Map<string, number>();

    orders.forEach(order => {
        if (order.status === OrderStatus.RETURNED) return;

        if (order.isSettled) {
            totalSettled += order.amount;
        } else {
            totalPending += order.amount;
            const source = order.paymentMethod === 'COD' ? `شركات الشحن (${order.shippingCarrier})` : order.paymentMethod;
            pendingMap.set(source, (pendingMap.get(source) || 0) + order.amount);
        }
    });

    return {
        totalSettled,
        totalPending,
        pendingBreakdown: Array.from(pendingMap.entries()).map(([source, amount]) => ({ source, amount }))
    };
  }, [orders]);

  // --- ENGINE 2: INVENTORY VALUATION ---
  const inventoryValuation = useMemo(() => {
      let totalValue = 0;
      let potentialRevenue = 0;
      let lowStockCount = 0;

      products.forEach(p => {
          totalValue += p.cost * p.quantity;
          potentialRevenue += p.sellingPrice * p.quantity;
          if (p.quantity <= p.lowStockThreshold) lowStockCount++;
      });

      return { totalValue, potentialRevenue, lowStockCount };
  }, [products]);

  // --- ENGINE 3: UNIT ECONOMICS (The Core Logic) ---
  const calculateOrderEconomics = (orderId: string): OrderEconomics | null => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return null;

    // 1. Revenue
    const revenue = order.amount;

    // 2. COGS
    let cogs = 0;
    order.items.forEach(item => {
      const p = products.find(prod => prod.id === item.productId);
      if (p) cogs += p.cost * item.quantity;
    });

    // 3. Payment Fee
    let paymentFee = 0;
    const payRule = paymentRules.find(r => r.method === order.paymentMethod);
    if (payRule) {
      paymentFee = (revenue * (payRule.percentFee / 100)) + payRule.fixedFee;
    }

    // 4. Shipping Cost
    let shippingCost = 0;
    const shipRule = shippingRules.find(r => r.carrier === order.shippingCarrier);
    if (shipRule) {
      shippingCost = shipRule.cost;
    }

    // 5. Packaging Cost
    let packagingCost = 0;
    const packagingDetails: string[] = [];
    const defaultTemplate = packagingTemplates[0]; 
    if (defaultTemplate) {
        defaultTemplate.items.forEach(item => {
            const mat = packagingMaterials.find(m => m.id === item.materialId);
            if (mat) {
                const cost = mat.costPerUnit * item.quantity;
                packagingCost += cost;
                packagingDetails.push(`${mat.name} (${item.quantity}x)`);
            }
        });
    }

    // Net Profit
    const netProfit = revenue - cogs - paymentFee - shippingCost - packagingCost;

    return {
      revenue,
      cogs,
      paymentFee,
      shippingCost,
      packagingCost,
      packagingDetails,
      netProfit
    };
  };

  // --- ENGINE 4: P&L GENERATOR ---
  const calculatePnL = (period: 'THIS_MONTH' | 'LAST_MONTH'): PnLStatement => {
      let revenue = 0;
      let cogs = 0;
      let shippingCost = 0;
      let paymentFees = 0;
      let packagingCost = 0;

      orders.forEach(order => {
          if (order.status === OrderStatus.RETURNED) return;
          
          const eco = calculateOrderEconomics(order.id);
          if (eco) {
              revenue += eco.revenue;
              cogs += eco.cogs;
              
              // Breakdown aggregation
              shippingCost += eco.shippingCost;
              paymentFees += eco.paymentFee;
              packagingCost += eco.packagingCost;
          }
      });

      // Calculate Manual Expenses from the Ledger
      const manualOperating = expenses
        .filter(e => e.type === 'OPERATING')
        .reduce((sum, e) => sum + e.amount, 0);

      const manualFixed = expenses
        .filter(e => e.type === 'FIXED')
        .reduce((sum, e) => sum + e.amount, 0);

      // Total Operating = (Variable per order) + (Manual Operating)
      const operatingExpenses = shippingCost + paymentFees + packagingCost + manualOperating;
      
      const marketingExpenses = ads.reduce((sum, a) => sum + a.amount, 0);
      
      const recurringFixed = fixedCosts.filter(c => c.active).reduce((sum, c) => sum + c.amount, 0);
      const fixedExpensesTotal = recurringFixed + manualFixed;

      const grossProfit = revenue - cogs;
      const netProfit = grossProfit - operatingExpenses - marketingExpenses - fixedExpensesTotal;

      return {
          revenue,
          cogs,
          grossProfit,
          
          operatingExpenses,
          shippingCost,
          paymentFees,
          packagingCost,

          marketingExpenses,
          fixedExpenses: fixedExpensesTotal,
          netProfit,
          period: period === 'THIS_MONTH' ? 'أكتوبر 2023' : 'سبتمبر 2023'
      };
  };

  return (
    <StoreContext.Provider value={{
      orders,
      products,
      fixedCosts,
      ads,
      expenses,
      paymentRules,
      shippingRules,
      cashFlow,
      inventoryValuation,
      
      packagingMaterials,
      packagingTemplates,
      sallaInvoices,
      
      isDemoMode,
      toggleDemoMode,
      isSallaConnected,
      lastSyncTime,
      connectSalla,
      disconnectSalla,
      syncSalla,

      onboarding,
      markOnboardingStepComplete,
      skipOnboarding,

      calculatePnL,
      calculateOrderEconomics,
      updateProductCost,
      updatePackagingMaterial,
      updatePackagingTemplate,
      processSallaInvoice,
      toggleFixedCost,
      addAd,
      addExpense,
      updatePaymentRule,
      updateShippingRule
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
