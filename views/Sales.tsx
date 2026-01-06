import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Order, OrderStatus } from '../types';
import { 
  PackageSearch, 
  Search, 
  Filter, 
  ChevronLeft, 
  ArrowUpRight, 
  ArrowDownRight,
  Receipt, 
  Truck, 
  CreditCard, 
  Box, 
  Info,
  ExternalLink,
  Calculator,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent, Card, Button, Input, Badge } from '../components/ui';

// --- TYPES & HELPERS ---
type SortOption = 'DATE_DESC' | 'DATE_ASC' | 'PROFIT_DESC' | 'PROFIT_ASC';

const Sales: React.FC = () => {
  const { 
    orders, 
    calculateOrderEconomics, 
    calculatePnL,
    paymentRules,
    shippingRules,
    packagingMaterials
  } = useStore();

  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('DATE_DESC');

  // --- ENGINE: PER ORDER PROFIT CALCULATOR ---
  const periodStats = useMemo(() => {
     const pnl = calculatePnL('THIS_MONTH');
     const completedOrdersCount = orders.filter(o => o.status === OrderStatus.COMPLETED).length || 1;
     
     // Calculate the "Load" per order (Overhead + Ads)
     const indirectCostPerOrder = (pnl.marketingExpenses + pnl.operatingExpenses + pnl.fixedExpenses - pnl.shippingCost - pnl.paymentFees - pnl.packagingCost) / completedOrdersCount;
     
     return { indirectCostPerOrder, pnl };
  }, [orders, calculatePnL]);

  // --- FILTERING & SORTING ---
  const filteredOrders = useMemo(() => {
    return orders
      .filter(o => {
         const matchesSearch = o.id.includes(searchTerm) || o.customerName.includes(searchTerm);
         const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
         return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
         const ecoA = calculateOrderEconomics(a.id);
         const ecoB = calculateOrderEconomics(b.id);
         const netA = (ecoA?.netProfit || 0);
         const netB = (ecoB?.netProfit || 0);

         switch (sortBy) {
            case 'DATE_ASC': return new Date(a.date).getTime() - new Date(b.date).getTime();
            case 'PROFIT_DESC': return netB - netA;
            case 'PROFIT_ASC': return netA - netB;
            case 'DATE_DESC': default: return new Date(b.date).getTime() - new Date(a.date).getTime();
         }
      });
  }, [orders, searchTerm, statusFilter, sortBy, calculateOrderEconomics]);

  // --- MODAL DATA ---
  const activeOrder = selectedOrder ? orders.find(o => o.id === selectedOrder) : null;
  const activeOrderEco = activeOrder ? calculateOrderEconomics(activeOrder.id) : null;

  return (
    <div className="animate-in fade-in duration-500 space-y-6 pb-32">
      
      {/* HEADER */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">سجل الطلبات</h2>
        <p className="text-slate-500 text-sm font-medium">
          المصدر الحقيقي للبيانات. جميع التكاليف والأرباح محسوبة تلقائيًا بناءً على الإعدادات.
        </p>
      </div>

      <Tabs defaultValue="ORDERS" className="w-full">
         <TabsList className="bg-white border p-1 h-auto rounded-xl mb-6 w-full md:w-auto inline-flex overflow-x-auto">
            <TabsTrigger value="ORDERS" className="py-2.5 px-6 rounded-lg font-bold min-w-[120px]">
               <PackageSearch size={16} className="ml-2" /> الطلبات
            </TabsTrigger>
            <TabsTrigger value="RETURNS" className="py-2.5 px-6 rounded-lg font-bold min-w-[120px]">
               <RotateCcw size={16} className="ml-2" /> المرتجعات
            </TabsTrigger>
            <TabsTrigger value="SIMULATOR" className="py-2.5 px-6 rounded-lg font-bold min-w-[120px]">
               <Calculator size={16} className="ml-2" /> محاكاة (تجريبي)
            </TabsTrigger>
         </TabsList>

         {/* ======================= TAB 1: ORDERS LIST ======================= */}
         <TabsContent value="ORDERS">
            
            {/* FILTERS TOOLBAR */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                   <Search className="absolute right-3 top-3 text-slate-400" size={18} />
                   <Input 
                      placeholder="بحث برقم الطلب أو اسم العميل..." 
                      className="pr-10 h-11 bg-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                   />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    <select 
                       className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                       value={statusFilter}
                       onChange={(e) => setStatusFilter(e.target.value)}
                    >
                       <option value="ALL">كل الحالات</option>
                       <option value={OrderStatus.COMPLETED}>مكتمل</option>
                       <option value={OrderStatus.SHIPPED}>تم الشحن</option>
                       <option value={OrderStatus.PENDING}>قيد الانتظار</option>
                       <option value={OrderStatus.RETURNED}>مرتجع</option>
                    </select>

                    <select 
                       className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                       value={sortBy}
                       onChange={(e) => setSortBy(e.target.value as SortOption)}
                    >
                       <option value="DATE_DESC">الأحدث أولاً</option>
                       <option value="DATE_ASC">الأقدم أولاً</option>
                       <option value="PROFIT_DESC">الأعلى ربحاً</option>
                       <option value="PROFIT_ASC">الأقل ربحاً</option>
                    </select>
                </div>
            </div>

            {/* ORDERS TABLE */}
            <Card className="overflow-hidden border-slate-200 shadow-sm bg-white">
                <div className="overflow-x-auto">
                   <table className="w-full text-sm text-right">
                      <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 whitespace-nowrap">
                         <tr>
                            <th className="p-4 pr-6">رقم الطلب</th>
                            <th className="p-4">التاريخ</th>
                            <th className="p-4">الحالة</th>
                            <th className="p-4">العميل</th>
                            <th className="p-4">الدفع / الشحن</th>
                            <th className="p-4">الإيراد</th>
                            <th className="p-4 pl-6">صافي الربح المباشر</th>
                            <th className="p-4 w-10"></th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {filteredOrders.length > 0 ? filteredOrders.map((order) => {
                            const eco = calculateOrderEconomics(order.id);
                            const directProfit = eco ? eco.netProfit : 0;
                            return (
                               <tr 
                                  key={order.id} 
                                  className="group hover:bg-slate-50 transition-colors cursor-pointer"
                                  onClick={() => setSelectedOrder(order.id)}
                               >
                                  <td className="p-4 pr-6 font-bold text-slate-900 dir-ltr">{order.id}</td>
                                  <td className="p-4 text-slate-500 font-medium whitespace-nowrap">{order.date}</td>
                                  <td className="p-4">
                                     <StatusBadge status={order.status} />
                                  </td>
                                  <td className="p-4 font-medium text-slate-700">{order.customerName}</td>
                                  <td className="p-4">
                                     <div className="flex flex-col gap-1 text-xs text-slate-500">
                                        <div className="flex items-center gap-1"><CreditCard size={12}/> {order.paymentMethod}</div>
                                        <div className="flex items-center gap-1"><Truck size={12}/> {order.shippingCarrier}</div>
                                     </div>
                                  </td>
                                  <td className="p-4 font-mono font-bold text-slate-900 dir-ltr">
                                     {order.amount.toLocaleString()} ر.س
                                  </td>
                                  <td className="p-4 pl-6">
                                     <div className={`flex items-center gap-1 font-mono font-bold dir-ltr ${directProfit > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {directProfit > 0 ? '+' : ''}{directProfit.toLocaleString()} ر.س
                                     </div>
                                  </td>
                                  <td className="p-4">
                                     <ChevronLeft size={16} className="text-slate-300 group-hover:text-slate-600" />
                                  </td>
                               </tr>
                            );
                         }) : (
                             <tr>
                                 <td colSpan={8} className="py-16 text-center text-slate-400">
                                      <PackageSearch size={40} className="mx-auto mb-2 opacity-20" />
                                      <p>لا توجد طلبات. قم بتفعيل "وضع التجربة" لرؤية البيانات.</p>
                                 </td>
                             </tr>
                         )}
                      </tbody>
                   </table>
                </div>
            </Card>
         </TabsContent>

         {/* ======================= TAB 2: RETURNS ======================= */}
         <TabsContent value="RETURNS">
             <Card className="h-64 bg-slate-50 border-dashed border-2 border-slate-200 flex flex-col items-center justify-center text-slate-400">
                 <RotateCcw size={40} className="mb-4 opacity-20" />
                 <h3 className="font-bold text-slate-600 mb-1">إدارة المرتجعات (قريبًا)</h3>
                 <p className="text-sm">سيتم عرض تحليل الأثر المالي للمرتجعات هنا.</p>
             </Card>
         </TabsContent>

         {/* ======================= TAB 3: SIMULATOR ======================= */}
         <TabsContent value="SIMULATOR">
             <SimulatorTab orders={orders} paymentRules={paymentRules} shippingRules={shippingRules} />
         </TabsContent>

      </Tabs>


      {/* ======================= ORDER DETAILS MODAL ======================= */}
      {activeOrder && activeOrderEco && (
         <div className="fixed inset-0 z-50 flex justify-end">
            <div 
               className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm animate-in fade-in" 
               onClick={() => setSelectedOrder(null)}
            ></div>
            
            <div className="relative w-full max-w-lg bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto">
               <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 p-6 flex items-start justify-between z-10">
                  <div>
                     <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-slate-900 dir-ltr">{activeOrder.id}</h2>
                        <StatusBadge status={activeOrder.status} />
                     </div>
                     <p className="text-sm text-slate-500">{activeOrder.date} • {activeOrder.customerName}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)}>
                     <X size={20} className="text-slate-400 hover:text-slate-900" />
                  </Button>
               </div>

               <div className="p-6 space-y-8">
                  
                  {/* SECTION A: SUMMARY */}
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                        <span className="text-xs font-bold text-slate-400 uppercase">طريقة الدفع</span>
                        <div className="flex items-center gap-2 text-slate-900 font-bold">
                           <CreditCard size={16} /> {activeOrder.paymentMethod}
                        </div>
                     </div>
                     <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                        <span className="text-xs font-bold text-slate-400 uppercase">طريقة الشحن</span>
                        <div className="flex items-center gap-2 text-slate-900 font-bold">
                           <Truck size={16} /> {activeOrder.shippingCarrier}
                        </div>
                     </div>
                  </div>

                  {/* SECTION B: FINANCIAL BREAKDOWN (The Core) */}
                  <div className="space-y-4">
                     <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <Receipt size={18} className="text-indigo-600" />
                        تحليل ربحية الطلب
                     </h3>
                     
                     <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 shadow-sm">
                        
                        {/* Revenue */}
                        <div className="p-4 flex justify-between items-center bg-slate-50/50">
                           <span className="font-bold text-slate-700">قيمة الطلب (الإيراد)</span>
                           <span className="font-mono font-bold text-slate-900 text-lg dir-ltr">{activeOrderEco.revenue.toLocaleString()} ر.س</span>
                        </div>

                        {/* Direct Costs */}
                        <div className="p-4 space-y-3">
                           <CostRow label="تكلفة المنتجات (COGS)" amount={-activeOrderEco.cogs} />
                           <CostRow label="تكلفة الشحن (بوليصة)" amount={-activeOrderEco.shippingCost} />
                           <CostRow label="رسوم الدفع الإلكتروني" amount={-activeOrderEco.paymentFee} />
                           <CostRow label="تكلفة التغليف" amount={-activeOrderEco.packagingCost} />
                        </div>

                        {/* Unit Economics Profit */}
                        <div className="p-4 flex justify-between items-center bg-indigo-50/30 border-t border-indigo-100">
                           <div className="flex items-center gap-2">
                               <span className="font-bold text-indigo-900 text-sm">الربح المباشر (Contribution)</span>
                               <Info size={14} className="text-indigo-400" />
                           </div>
                           <span className={`font-mono font-bold dir-ltr ${activeOrderEco.netProfit > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {activeOrderEco.netProfit.toLocaleString()} ر.س
                           </span>
                        </div>

                        {/* Indirect Costs (Estimated) */}
                        <div className="p-4 space-y-3 bg-slate-50/30">
                           <div className="flex items-center gap-2 mb-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">تكاليف موزعة (تقديرية)</span>
                           </div>
                           <CostRow label="نصيب الطلب من الإعلانات & التشغيل" amount={-periodStats.indirectCostPerOrder} isEstimate />
                        </div>

                        {/* FINAL NET PROFIT */}
                        <div className="p-5 flex justify-between items-center bg-slate-900 text-white">
                           <span className="font-bold">صافي الربح النهائي (تقديري)</span>
                           <span className={`font-mono font-bold text-xl dir-ltr ${
                               (activeOrderEco.netProfit - periodStats.indirectCostPerOrder) > 0 ? 'text-emerald-400' : 'text-rose-400'
                           }`}>
                              {(activeOrderEco.netProfit - periodStats.indirectCostPerOrder).toLocaleString(undefined, { maximumFractionDigits: 1 })} ر.س
                           </span>
                        </div>
                     </div>
                  </div>

                  {/* SECTION C: TRACEABILITY */}
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3">
                     <CheckCircle2 size={18} className="text-blue-600 shrink-0 mt-0.5" />
                     <div className="space-y-1">
                        <p className="text-xs font-bold text-blue-900">حسابات تلقائية 100%</p>
                        <p className="text-xs text-blue-700 leading-relaxed">
                           تم احتساب جميع التكاليف أعلاه بناءً على القواعد المدخلة في قسم "التكاليف" وأسعار تكلفة المنتجات.
                        </p>
                     </div>
                  </div>

               </div>
            </div>
         </div>
      )}

    </div>
  );
};

// --- SUB COMPONENTS ---

const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
   const styles = {
      [OrderStatus.COMPLETED]: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      [OrderStatus.PENDING]: 'bg-amber-50 text-amber-700 border-amber-100',
      [OrderStatus.SHIPPED]: 'bg-blue-50 text-blue-700 border-blue-100',
      [OrderStatus.RETURNED]: 'bg-rose-50 text-rose-700 border-rose-100',
   };
   
   return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${styles[status]}`}>
         {status}
      </span>
   );
};

const CostRow: React.FC<{ label: string, amount: number, isEstimate?: boolean }> = ({ label, amount, isEstimate }) => (
   <div className="flex justify-between items-center text-sm">
      <span className={`text-slate-600 ${isEstimate ? 'italic opacity-80' : ''}`}>{label}</span>
      <span className="font-mono font-medium text-slate-900 dir-ltr">
         {amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س
      </span>
   </div>
);


// --- SIMULATOR TAB ---
const SimulatorTab: React.FC<{ orders: Order[], paymentRules: any[], shippingRules: any[] }> = ({ orders, paymentRules, shippingRules }) => {
    const { calculateOrderEconomics } = useStore();
    const [simOrder, setSimOrder] = useState<string>('');
    const [simPayment, setSimPayment] = useState<string>('');
    const [simShipping, setSimShipping] = useState<string>('');

    const baseOrder = orders.find(o => o.id === simOrder);
    const baseEco = baseOrder ? calculateOrderEconomics(baseOrder.id) : null;

    // Simulate Calculation
    const simulatedProfit = useMemo(() => {
        if (!baseOrder || !baseEco) return 0;
        
        let revenue = baseOrder.amount;
        let cogs = baseEco.cogs;
        let packaging = baseEco.packagingCost;
        
        // Sim Payment
        let payFee = baseEco.paymentFee;
        const pRule = paymentRules.find(r => r.method === simPayment);
        if (pRule) payFee = (revenue * (pRule.percentFee / 100)) + pRule.fixedFee;

        // Sim Shipping
        let shipCost = baseEco.shippingCost;
        const sRule = shippingRules.find(r => r.carrier === simShipping);
        if (sRule) shipCost = sRule.cost;

        return revenue - cogs - packaging - payFee - shipCost;
    }, [baseOrder, simPayment, simShipping, baseEco, paymentRules, shippingRules]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <Card className="p-6 bg-white border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Calculator size={18} /> اختر طلب للمحاكاة
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1 block">رقم الطلب</label>
                            <select 
                                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                onChange={(e) => {
                                    setSimOrder(e.target.value);
                                    const o = orders.find(x => x.id === e.target.value);
                                    if(o) {
                                        setSimPayment(o.paymentMethod);
                                        setSimShipping(o.shippingCarrier);
                                    }
                                }}
                            >
                                <option value="">اختر طلباً...</option>
                                {orders.map(o => <option key={o.id} value={o.id}>{o.id} - {o.customerName}</option>)}
                            </select>
                        </div>

                        {baseOrder && (
                            <>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">طريقة الدفع (تغيير افتراضي)</label>
                                    <select 
                                        className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={simPayment}
                                        onChange={(e) => setSimPayment(e.target.value)}
                                    >
                                        {paymentRules.map(r => <option key={r.method} value={r.method}>{r.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">شركة الشحن (تغيير افتراضي)</label>
                                    <select 
                                        className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={simShipping}
                                        onChange={(e) => setSimShipping(e.target.value)}
                                    >
                                        {shippingRules.map(r => <option key={r.carrier} value={r.carrier}>{r.name}</option>)}
                                    </select>
                                </div>
                            </>
                        )}
                    </div>
                </Card>
            </div>

            <div className="flex flex-col justify-center">
                {baseOrder && baseEco ? (
                    <Card className="p-8 bg-slate-900 text-white border-0 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <h4 className="text-slate-400 text-sm font-medium mb-2">صافي الربح المتوقع</h4>
                        
                        <div className="flex items-baseline gap-2 mb-6 dir-ltr">
                             <span className={`text-5xl font-mono font-bold tracking-tight ${simulatedProfit > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                 {simulatedProfit.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                             </span>
                             <span className="text-lg font-bold text-slate-500">ر.س</span>
                        </div>

                        <div className="space-y-2 pt-6 border-t border-white/10 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-400">الربح الحالي للطلب:</span>
                                <span className="font-mono font-bold">{baseEco.netProfit.toLocaleString()} ر.س</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">الفرق:</span>
                                <span className={`font-mono font-bold dir-ltr ${(simulatedProfit - baseEco.netProfit) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {(simulatedProfit - baseEco.netProfit) > 0 ? '+' : ''}
                                    {(simulatedProfit - baseEco.netProfit).toLocaleString(undefined, { maximumFractionDigits: 1 })} ر.س
                                </span>
                            </div>
                        </div>
                    </Card>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                        <p>اختر طلباً للبدء في المحاكاة</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sales;