import React, { useState } from 'react';
import { useStore } from '../store';
import { ViewState } from '../types';
import { 
  Info,
  Banknote,
  Receipt,
  Truck,
  CreditCard,
  Megaphone,
  Building2,
  Package,
  ArrowRight,
  AlertTriangle,
  HelpCircle,
  TrendingDown,
  TrendingUp,
  ChevronDown
} from 'lucide-react';
import { Card, Button } from '../components/ui';

interface FinanceProps {
  onNavigate?: (view: ViewState) => void;
}

const Finance: React.FC<FinanceProps> = ({ onNavigate }) => {
  const { calculatePnL, cashFlow } = useStore();
  const [showPercentages, setShowPercentages] = useState(false);
  
  // 1. GET REAL DATA FROM STORE
  const pnl = calculatePnL('THIS_MONTH');
  
  // 2. CALCULATE TOTAL EXPENSES
  const totalExpenses = pnl.cogs + pnl.operatingExpenses + pnl.marketingExpenses + pnl.fixedExpenses;

  // 3. PREPARE COST STRUCTURE (SORTED)
  const costs = [
    { id: 'COGS', label: 'تكلفة البضاعة (COGS)', amount: pnl.cogs, icon: Package, color: 'text-blue-600 bg-blue-50' },
    { id: 'ADS', label: 'الإعلانات', amount: pnl.marketingExpenses, icon: Megaphone, color: 'text-rose-600 bg-rose-50' },
    { id: 'SHIPPING', label: 'الشحن', amount: pnl.shippingCost, icon: Truck, color: 'text-amber-600 bg-amber-50' },
    { id: 'PAYMENT', label: 'بوابات الدفع', amount: pnl.paymentFees, icon: CreditCard, color: 'text-indigo-600 bg-indigo-50' },
    { id: 'PACKING', label: 'التغليف', amount: pnl.packagingCost, icon: Package, color: 'text-emerald-600 bg-emerald-50' },
    { id: 'FIXED', label: 'مصاريف ثابتة', amount: pnl.fixedExpenses, icon: Building2, color: 'text-slate-600 bg-slate-50' },
  ].sort((a, b) => b.amount - a.amount);

  // 4. IDENTIFY PRIMARY IMPACT
  const maxCost = costs[0];
  const isLoss = pnl.netProfit < 0;

  return (
    <div className="animate-in fade-in duration-500 space-y-8 pb-32">
      
      {/* --- SECTION 0: PAGE HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 tracking-tight">المالية</h1>
           <p className="text-slate-500 mt-1 font-medium">نتائج متجرك بعد جميع التكاليف</p>
        </div>
        
        {/* Time Filter */}
        <div className="flex bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
           <button className="px-4 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 rounded-lg">اليوم</button>
           <button className="px-4 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 rounded-lg">هذا الأسبوع</button>
           <button className="px-4 py-1.5 text-xs font-bold bg-slate-900 text-white rounded-lg shadow-sm">هذا الشهر</button>
        </div>
      </div>

      {/* --- SECTION 0.5: ACCOUNTING SCOPE BANNER --- */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-3 flex gap-3 items-start">
         <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
         <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
            تشمل هذه الأرقام الطلبات <span className="font-bold text-slate-700">المكتملة فقط</span>، 
            بعد خصم الشحن، التغليف، رسوم الدفع، الإعلانات، والمصاريف الثابتة المدخلة في النظام.
         </p>
      </div>

      {/* --- SECTION 1: EXECUTIVE SUMMARY --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* NET PROFIT */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between h-36 relative overflow-hidden group">
              <div className={`absolute top-0 right-0 w-1.5 h-full ${isLoss ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
              <span className="text-sm font-bold text-slate-500">صافي الربح</span>
              <div className="flex items-baseline gap-2 dir-ltr">
                 <span className={`text-3xl font-mono font-bold tracking-tight ${isLoss ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {pnl.netProfit.toLocaleString()}
                 </span>
                 <span className="text-sm font-bold text-slate-400">ر.س</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 w-fit px-2 py-1 rounded">
                 {isLoss ? <TrendingDown size={12} className="text-rose-500" /> : <TrendingUp size={12} className="text-emerald-500" />}
                 بعد جميع التكاليف
              </div>
          </div>

          {/* REVENUE */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between h-36">
              <span className="text-sm font-bold text-slate-500">الإيرادات</span>
              <div className="flex items-baseline gap-2 dir-ltr">
                  <span className="text-3xl font-mono font-bold text-slate-900">
                    {pnl.revenue.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-slate-400">ر.س</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">قيمة الطلبات المكتملة</span>
          </div>

          {/* TOTAL EXPENSES */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between h-36">
              <span className="text-sm font-bold text-slate-500">إجمالي التكاليف</span>
              <div className="flex items-baseline gap-2 dir-ltr">
                  <span className="text-3xl font-mono font-bold text-slate-700">
                    {totalExpenses.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-slate-400">ر.س</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">مجموع المصاريف</span>
          </div>
      </div>

      {/* --- SECTION 2: PROFIT vs CASH (THE CORE CONCEPT) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* CARD A: PROFITABILITY (Accounting Reality) */}
          <Card className="border-0 shadow-sm ring-1 ring-slate-200 bg-white">
             <div className="p-5 border-b border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
                   <Receipt size={20} />
                </div>
                <div>
                   <h3 className="font-bold text-slate-900 text-base">الربحية (P&L)</h3>
                   <p className="text-xs text-slate-500">هل متجرك مربح فعليًا بعد جميع التكاليف؟</p>
                </div>
             </div>
             <div className="p-6 flex flex-col items-center justify-center text-center gap-2 min-h-[160px]">
                <span className="text-sm text-slate-500 font-medium">صافي الربح</span>
                <span className={`text-4xl font-mono font-bold dir-ltr tracking-tight ${isLoss ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {pnl.netProfit.toLocaleString()} <span className="text-lg opacity-60">ر.س</span>
                </span>
                
                <div className={`mt-3 text-xs font-bold px-3 py-1.5 rounded-full border ${isLoss ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                    {isLoss ? '⚠️ التكاليف أعلى من الإيرادات' : '✅ إيراداتك تغطي تكاليفك'}
                </div>
             </div>
          </Card>

          {/* CARD B: CASH FLOW (Bank Reality) */}
          <Card className="border-0 shadow-sm ring-1 ring-slate-200 bg-white">
             <div className="p-5 border-b border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
                   <Banknote size={20} />
                </div>
                <div>
                   <h3 className="font-bold text-slate-900 text-base">السيولة (Cash Flow)</h3>
                   <p className="text-xs text-slate-500">المبالغ التي تم تحصيلها فعليًا أو ما زالت معلّقة</p>
                </div>
             </div>
             <div className="p-6 grid grid-cols-2 gap-4 h-full min-h-[160px]">
                 {/* Collected */}
                 <div className="bg-emerald-50/50 rounded-xl p-4 flex flex-col justify-between border border-emerald-100/50">
                    <span className="text-xs font-bold text-emerald-800">محصّل (في البنك)</span>
                    <span className="text-xl font-mono font-bold text-emerald-700 dir-ltr mt-auto">
                        {cashFlow.totalSettled.toLocaleString()} <span className="text-xs">ر.س</span>
                    </span>
                 </div>
                 
                 {/* Pending */}
                 <div className="bg-amber-50/50 rounded-xl p-4 flex flex-col justify-between border border-amber-100/50">
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-amber-800">معلّق (في الطريق)</span>
                        <Info size={12} className="text-amber-400" />
                    </div>
                    
                    {/* Mini Breakdown of Pending */}
                    <div className="space-y-1 my-2 overflow-y-auto max-h-[40px] no-scrollbar">
                        {cashFlow.pendingBreakdown.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="flex justify-between text-[10px] text-amber-900/60">
                                <span className="truncate max-w-[70px]">{item.source}</span>
                                <span className="font-mono">{item.amount}</span>
                            </div>
                        ))}
                    </div>
                    
                    <span className="text-xl font-mono font-bold text-amber-700 dir-ltr border-t border-amber-200 pt-1 mt-auto">
                        {cashFlow.totalPending.toLocaleString()} <span className="text-xs">ر.س</span>
                    </span>
                 </div>
             </div>
          </Card>
      </div>

      {/* --- SECTION 3: COST STRUCTURE --- */}
      <div>
         <div className="flex justify-between items-end mb-4 px-1">
            <h3 className="text-base font-bold text-slate-900">هيكل التكاليف (أين تذهب أموالك؟)</h3>
            <Button 
               variant="ghost" 
               size="sm" 
               className="text-xs text-slate-500 h-8 hover:bg-slate-100 hover:text-slate-700"
               onClick={() => setShowPercentages(!showPercentages)}
            >
               {showPercentages ? 'إخفاء النسب' : 'عرض النسب'}
            </Button>
         </div>

         <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
            <div className="divide-y divide-slate-100">
                {costs.map((cost) => {
                   const percent = totalExpenses > 0 ? (cost.amount / totalExpenses) * 100 : 0;
                   return (
                      <div key={cost.id} className="p-4 hover:bg-slate-50 transition-colors group">
                          <div className="flex justify-between items-center mb-2">
                             <div className="flex items-center gap-3">
                                 <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cost.color}`}>
                                    <cost.icon size={16} />
                                 </div>
                                 <span className="font-bold text-slate-700 text-sm">{cost.label}</span>
                             </div>
                             <div className="flex items-center gap-3">
                                 {showPercentages && (
                                     <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded animate-in fade-in">
                                         {percent.toFixed(1)}%
                                     </span>
                                 )}
                                 <span className="font-mono font-bold text-slate-900 dir-ltr">
                                     {cost.amount.toLocaleString()} ر.س
                                 </span>
                             </div>
                          </div>
                          {/* Progress Bar */}
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${cost.id === maxCost.id && isLoss ? 'bg-rose-500' : 'bg-slate-800'} opacity-90 transition-all duration-500`}
                                style={{ width: `${percent}%` }}
                              ></div>
                          </div>
                      </div>
                   );
                })}
                {totalExpenses === 0 && (
                    <div className="p-8 text-center text-slate-400">
                        <p>لا توجد مصاريف مسجلة بعد.</p>
                    </div>
                )}
            </div>
         </Card>
      </div>

      {/* --- SECTION 4: PRIMARY IMPACT CAUSE --- */}
      {isLoss && maxCost && (
        <Card className="bg-rose-50 border border-rose-100 shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1 h-full bg-rose-400"></div>
            
            <div className="flex gap-5 items-start relative z-10">
                <div className="w-12 h-12 rounded-xl bg-white border border-rose-200 flex items-center justify-center text-rose-500 shadow-sm shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-rose-900 text-base">أكبر سبب أثّر على الربح: {maxCost.label}</h3>
                  <p className="text-sm text-rose-800/80 leading-relaxed max-w-lg">
                      {maxCost.label} هي أعلى بند تكلفة حاليًا.
                      تم صرف <span className="font-bold font-mono dir-ltr inline-block text-rose-900">{maxCost.amount.toLocaleString()} ر.س</span> مقابل 
                      إيرادات <span className="font-bold font-mono dir-ltr inline-block text-rose-900">{pnl.revenue.toLocaleString()} ر.س</span>.
                  </p>
                </div>
            </div>

            <Button 
              className="w-full md:w-auto bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 hover:border-rose-300 shadow-sm whitespace-nowrap z-10 font-bold"
              onClick={() => onNavigate?.('COSTS')}
            >
              الانتقال إلى التكاليف
              <ArrowRight size={16} className="mr-2" />
            </Button>
        </Card>
      )}

      {/* --- SECTION 5: DATA CONFIDENCE INDICATOR --- */}
      <div className="flex justify-center pb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full border border-slate-200 text-xs font-medium text-slate-500 cursor-help transition-colors hover:bg-slate-200" title="لم يتم إدخال فواتير سلة الشهرية بعد">
              <HelpCircle size={14} />
              دقة الأرقام: <span className="font-bold text-slate-700">متوسطة</span>
          </div>
      </div>

      {/* --- SECTION 6: NEXT BEST ACTION (Floating) --- */}
      {maxCost && isLoss && (
          <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-auto md:w-auto md:min-w-[400px] md:transform md:-translate-x-1/2 md:left-1/2 z-30">
              <Button 
                size="lg" 
                className="w-full bg-slate-900 text-white shadow-2xl shadow-slate-900/40 hover:bg-slate-800 rounded-2xl h-14 font-bold text-base flex justify-between items-center px-6 animate-in slide-in-from-bottom-10 fade-in duration-700 delay-300"
                onClick={() => onNavigate?.('COSTS')}
              >
                 <span>الإجراء المقترح: راجع تكاليف {maxCost.label}</span>
                 <div className="bg-white/10 p-1.5 rounded-lg">
                    <ArrowRight size={18} />
                 </div>
              </Button>
          </div>
      )}

    </div>
  );
};

export default Finance;