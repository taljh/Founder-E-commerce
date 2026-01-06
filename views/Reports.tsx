import React, { useMemo, useState } from 'react';
import { useStore } from '../store';
import { 
  FileBarChart, 
  ArrowRight, 
  ArrowUp, 
  ArrowDown, 
  PieChart, 
  Download, 
  Share2, 
  TrendingUp, 
  Filter, 
  Calendar,
  CreditCard,
  Truck,
  Minus
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent, Card, Button } from '../components/ui';

const Reports: React.FC = () => {
  const { calculatePnL, orders, calculateOrderEconomics } = useStore();
  
  // --- DATA PREPARATION ---
  
  // 1. Current Period Data (Real from Store)
  const currentPnL = calculatePnL('THIS_MONTH');
  const currentOrdersCount = orders.filter(o => o.status !== 'مرتجع').length;
  
  // 2. Previous Period Data (Simulated for V1 Demo Logic)
  // In a real app, this would query the DB for the previous month date range.
  // Here we simulate a "Growth" scenario to show the UI capabilities.
  const previousPnL = {
      revenue: currentPnL.revenue * 0.85, // We grew 15%
      netProfit: currentPnL.netProfit * 0.90, // Profit grew less (maybe higher costs)
      ordersCount: Math.floor(currentOrdersCount * 0.88)
  };

  // 3. Profitability By Category Logic (Experimental Tab)
  const categoryAnalysis = useMemo(() => {
      const byPayment: Record<string, { revenue: number, profit: number, count: number }> = {};
      const byShipping: Record<string, { revenue: number, profit: number, count: number }> = {};

      orders.forEach(order => {
          if (order.status === 'مرتجع') return;
          const eco = calculateOrderEconomics(order.id);
          if (!eco) return;

          // Aggregate Payment
          if (!byPayment[order.paymentMethod]) byPayment[order.paymentMethod] = { revenue: 0, profit: 0, count: 0 };
          byPayment[order.paymentMethod].revenue += eco.revenue;
          byPayment[order.paymentMethod].profit += eco.netProfit;
          byPayment[order.paymentMethod].count += 1;

          // Aggregate Shipping
          if (!byShipping[order.shippingCarrier]) byShipping[order.shippingCarrier] = { revenue: 0, profit: 0, count: 0 };
          byShipping[order.shippingCarrier].revenue += eco.revenue;
          byShipping[order.shippingCarrier].profit += eco.netProfit;
          byShipping[order.shippingCarrier].count += 1;
      });

      return { byPayment, byShipping };
  }, [orders, calculateOrderEconomics]);

  return (
    <div className="animate-in fade-in duration-500 space-y-6 pb-32">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
         <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">التقارير المتقدمة</h2>
            <p className="text-slate-500 text-sm font-medium">
               تحليل الأداء التاريخي واتجاهات النمو.
            </p>
         </div>
         <div className="flex gap-2">
             <Button variant="outline" size="sm" className="bg-white gap-2 text-slate-600" disabled>
                 <Download size={16} /> تصدير PDF
             </Button>
         </div>
      </div>

      <Tabs defaultValue="PERIOD" className="w-full">
          <TabsList className="bg-white border p-1 h-auto rounded-xl mb-6 w-full md:w-auto inline-flex overflow-x-auto">
            <TabsTrigger value="PERIOD" className="py-2.5 px-6 rounded-lg font-bold min-w-[120px]">
                <Calendar size={16} className="ml-2" /> مقارنة الفترات
            </TabsTrigger>
            <TabsTrigger value="EXPENSE_STRUCTURE" className="py-2.5 px-6 rounded-lg font-bold min-w-[120px]">
                <PieChart size={16} className="ml-2" /> هيكل المصاريف
            </TabsTrigger>
            <TabsTrigger value="PROFITABILITY" className="py-2.5 px-6 rounded-lg font-bold min-w-[120px]">
                <TrendingUp size={16} className="ml-2" /> ربحية التصنيفات
            </TabsTrigger>
          </TabsList>

          {/* ======================= TAB 1: PERIOD COMPARISON ======================= */}
          <TabsContent value="PERIOD" className="space-y-6">
             
             {/* Date Filter */}
             <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between">
                 <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-500">
                         <Filter size={20} />
                     </div>
                     <div>
                         <p className="text-sm font-bold text-slate-900">نطاق المقارنة</p>
                         <p className="text-xs text-slate-500">مقارنة <span className="font-bold">هذا الشهر</span> مع <span className="font-bold">الشهر السابق</span></p>
                     </div>
                 </div>
                 <select className="bg-slate-50 border-none text-sm font-bold text-slate-700 rounded-lg px-4 py-2 focus:ring-0 cursor-pointer">
                     <option>شهري</option>
                     <option>أسبوعي</option>
                     <option>سنوي</option>
                 </select>
             </div>

             {/* Comparison Cards */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <ComparisonCard 
                    label="إجمالي الإيرادات" 
                    current={currentPnL.revenue} 
                    previous={previousPnL.revenue} 
                    unit="SAR"
                    isCurrency
                 />
                 <ComparisonCard 
                    label="صافي الربح" 
                    current={currentPnL.netProfit} 
                    previous={previousPnL.netProfit} 
                    unit="SAR"
                    isCurrency
                    inverse={currentPnL.netProfit < 0}
                 />
                 <ComparisonCard 
                    label="عدد الطلبات" 
                    current={currentOrdersCount} 
                    previous={previousPnL.ordersCount} 
                    unit="طلب"
                 />
             </div>

             {/* Insight Text */}
             <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex gap-3">
                 <div className="mt-1">
                    <TrendingUp size={20} className="text-indigo-600" />
                 </div>
                 <div className="space-y-1">
                     <p className="text-sm font-bold text-indigo-900">تحليل الأداء:</p>
                     <p className="text-sm text-indigo-800 leading-relaxed">
                         حققت نمواً في الإيرادات بنسبة <span className="font-bold font-mono dir-ltr">15%</span> مقارنة بالشهر السابق، 
                         لكن صافي الربح نما بنسبة أقل (<span className="font-bold font-mono dir-ltr">10%</span>) بسبب زيادة المصاريف التشغيلية. 
                         ينصح بمراجعة كفاءة الإعلانات.
                     </p>
                 </div>
             </div>
          </TabsContent>

          {/* ======================= TAB 2: COST STRUCTURE ======================= */}
          <TabsContent value="EXPENSE_STRUCTURE" className="space-y-6">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 
                 {/* Visual Chart */}
                 <div className="lg:col-span-2 space-y-4">
                    <Card className="bg-white border border-slate-200 p-6">
                        <h3 className="font-bold text-slate-900 mb-6">توزيع التكاليف (حسب الأهمية)</h3>
                        <div className="space-y-6">
                            {[
                                { label: 'تكلفة البضاعة (COGS)', amount: currentPnL.cogs, color: 'bg-blue-500' },
                                { label: 'الإعلانات والتسويق', amount: currentPnL.marketingExpenses, color: 'bg-rose-500' },
                                { label: 'الشحن والتوصيل', amount: currentPnL.shippingCost, color: 'bg-amber-500' },
                                { label: 'المصاريف التشغيلية', amount: currentPnL.operatingExpenses - currentPnL.shippingCost - currentPnL.paymentFees - currentPnL.packagingCost, color: 'bg-slate-500' },
                                { label: 'رسوم الدفع', amount: currentPnL.paymentFees, color: 'bg-indigo-500' },
                                { label: 'التغليف', amount: currentPnL.packagingCost, color: 'bg-emerald-500' },
                            ]
                            .sort((a, b) => b.amount - a.amount)
                            .map((item, idx) => {
                                const totalCost = currentPnL.revenue - currentPnL.netProfit; // Approx total cost base
                                const percent = totalCost > 0 ? (item.amount / totalCost) * 100 : 0;
                                return (
                                    <div key={idx} className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-slate-700">{item.label}</span>
                                            <div className="flex gap-2">
                                                <span className="font-bold text-slate-900 dir-ltr">{item.amount.toLocaleString()} SAR</span>
                                                <span className="text-slate-400 w-10 text-left dir-ltr">{percent.toFixed(1)}%</span>
                                            </div>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className={`h-full ${item.color} rounded-full`} style={{ width: `${percent}%` }}></div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </Card>
                 </div>

                 {/* Summary Card */}
                 <div className="space-y-4">
                     <Card className="bg-slate-900 text-white border-0 p-6 h-full flex flex-col justify-between">
                         <div>
                             <h3 className="font-bold text-lg mb-1">ملخص التكاليف</h3>
                             <p className="text-slate-400 text-sm">إجمالي ما تم صرفه هذا الشهر</p>
                         </div>
                         
                         <div className="space-y-4 my-6">
                             <div className="flex justify-between items-center py-2 border-b border-white/10">
                                 <span className="text-slate-300 text-sm">التكاليف المتغيرة</span>
                                 <span className="font-mono font-bold dir-ltr">
                                     {(currentPnL.cogs + currentPnL.shippingCost + currentPnL.paymentFees + currentPnL.packagingCost).toLocaleString()}
                                 </span>
                             </div>
                             <div className="flex justify-between items-center py-2 border-b border-white/10">
                                 <span className="text-slate-300 text-sm">التكاليف الثابتة</span>
                                 <span className="font-mono font-bold dir-ltr">
                                     {(currentPnL.fixedExpenses + currentPnL.operatingExpenses).toLocaleString()}
                                 </span>
                             </div>
                             <div className="flex justify-between items-center py-2 border-b border-white/10">
                                 <span className="text-slate-300 text-sm">التسويق</span>
                                 <span className="font-mono font-bold dir-ltr">
                                     {currentPnL.marketingExpenses.toLocaleString()}
                                 </span>
                             </div>
                         </div>

                         <div>
                             <div className="text-xs text-slate-400 mb-1 uppercase tracking-wider">الإجمالي</div>
                             <div className="text-3xl font-mono font-bold text-white dir-ltr">
                                 {(currentPnL.revenue - currentPnL.netProfit).toLocaleString()} SAR
                             </div>
                         </div>
                     </Card>
                 </div>
             </div>
          </TabsContent>

          {/* ======================= TAB 3: PROFITABILITY BY CATEGORY (EXPERIMENTAL) ======================= */}
          <TabsContent value="PROFITABILITY" className="space-y-6">
             <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center gap-2 mb-4">
                 <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold border border-indigo-200">تجريبي</span>
                 <p className="text-xs text-slate-500">يساعدك هذا التحليل على معرفة أي قنوات الدفع والشحن هي الأكثر ربحية لمتجرك.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 
                 {/* 1. By Payment Method */}
                 <Card className="bg-white border-slate-200 overflow-hidden">
                     <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                         <div className="flex items-center gap-2 font-bold text-slate-700">
                             <CreditCard size={18} /> ربحية طرق الدفع
                         </div>
                     </div>
                     <div className="divide-y divide-slate-100">
                         {Object.entries(categoryAnalysis.byPayment)
                            .sort(([, a], [, b]) => (b as any).profit - (a as any).profit)
                            .map(([method, rawData]) => {
                             const data = rawData as { revenue: number, profit: number, count: number };
                             return (
                             <div key={method} className="p-4 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                                 <div>
                                     <p className="font-bold text-slate-900 text-sm">{method}</p>
                                     <p className="text-xs text-slate-400 mt-0.5">{data.count} طلب</p>
                                 </div>
                                 <div className="text-right">
                                     <p className={`font-mono font-bold text-sm dir-ltr ${data.profit > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                         {data.profit.toLocaleString()} SAR
                                     </p>
                                     <p className="text-[10px] text-slate-400 mt-0.5">
                                         Avg: {(data.profit / data.count).toFixed(0)} SAR/Order
                                     </p>
                                 </div>
                             </div>
                         )})}
                     </div>
                 </Card>

                 {/* 2. By Shipping Carrier */}
                 <Card className="bg-white border-slate-200 overflow-hidden">
                     <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                         <div className="flex items-center gap-2 font-bold text-slate-700">
                             <Truck size={18} /> ربحية شركات الشحن
                         </div>
                     </div>
                     <div className="divide-y divide-slate-100">
                         {Object.entries(categoryAnalysis.byShipping)
                            .sort(([, a], [, b]) => (b as any).profit - (a as any).profit)
                            .map(([carrier, rawData]) => {
                             const data = rawData as { revenue: number, profit: number, count: number };
                             return (
                             <div key={carrier} className="p-4 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                                 <div>
                                     <p className="font-bold text-slate-900 text-sm">{carrier}</p>
                                     <p className="text-xs text-slate-400 mt-0.5">{data.count} طلب</p>
                                 </div>
                                 <div className="text-right">
                                     <p className={`font-mono font-bold text-sm dir-ltr ${data.profit > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                         {data.profit.toLocaleString()} SAR
                                     </p>
                                     <p className="text-[10px] text-slate-400 mt-0.5">
                                         Avg: {(data.profit / data.count).toFixed(0)} SAR/Order
                                     </p>
                                 </div>
                             </div>
                         )})}
                     </div>
                 </Card>
             </div>
          </TabsContent>
      </Tabs>
    </div>
  );
};

// --- SUB COMPONENT: COMPARISON CARD ---
const ComparisonCard: React.FC<{ 
    label: string, 
    current: number, 
    previous: number, 
    unit: string, 
    isCurrency?: boolean,
    inverse?: boolean // If true, lower is better (not used for profit/revenue usually)
}> = ({ label, current, previous, unit, isCurrency, inverse }) => {
    
    const diff = current - previous;
    const percent = previous !== 0 ? (diff / previous) * 100 : 0;
    const isPositive = diff >= 0;
    
    // Color Logic: usually Green is good for Profit/Revenue.
    // If inverse were used (e.g. for Expenses), Green would be negative diff.
    // Here we assume standard Metrics (Higher is Better).
    const trendColor = isPositive ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50';
    const trendIcon = isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />;

    return (
        <Card className="p-5 border-slate-200 shadow-sm bg-white">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
            
            <div className="flex items-baseline gap-2 dir-ltr mb-3">
                <span className={`text-2xl font-mono font-bold ${isPositive ? 'text-slate-900' : 'text-slate-900'}`}>
                    {current.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                </span>
                <span className="text-xs font-bold text-slate-400">{unit}</span>
            </div>

            <div className="flex items-center justify-between">
                <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${trendColor}`}>
                    {trendIcon}
                    <span className="dir-ltr">{Math.abs(percent).toFixed(1)}%</span>
                </div>
                <span className="text-[10px] text-slate-400 dir-ltr">
                    Prev: {previous.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
            </div>
        </Card>
    );
};

export default Reports;