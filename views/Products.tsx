import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Product, OrderStatus } from '../types';
import { 
  Box, 
  Search, 
  ChevronLeft, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  Edit2,
  DollarSign,
  PackageCheck,
  PackageX,
  ArrowRight,
  Info,
  X,
  ScanBarcode,
  BarChart3
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent, Card, Button, Input, Badge } from '../components/ui';

// --- TYPES ---
type SortOption = 'PROFIT_DESC' | 'PROFIT_ASC' | 'REVENUE_DESC';
type ProductStatus = 'PROFITABLE' | 'BORDERLINE' | 'LOSS';

interface ProductMetrics {
  revenue: number;
  netProfit: number;
  ordersCount: number;
  avgSellingPrice: number;
  status: ProductStatus;
}

const Products: React.FC = () => {
  const { products, orders, calculateOrderEconomics, updateProductCost } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // --- ENGINE: PRODUCT PROFITABILITY CALCULATOR ---
  const metrics = useMemo(() => {
      const data: Record<string, ProductMetrics> = {};
      
      // Init
      products.forEach(p => {
          data[p.id] = { revenue: 0, netProfit: 0, ordersCount: 0, avgSellingPrice: 0, status: 'BORDERLINE' };
      });

      orders.forEach(order => {
          if (order.status !== OrderStatus.COMPLETED) return;
          const eco = calculateOrderEconomics(order.id);
          if (!eco) return;

          let orderTotalProductRevenue = 0;
          order.items.forEach(item => {
              const p = products.find(prod => prod.id === item.productId);
              if (p) orderTotalProductRevenue += (p.sellingPrice * item.quantity);
          });

          if (orderTotalProductRevenue === 0) return;

          order.items.forEach(item => {
              const p = products.find(prod => prod.id === item.productId);
              if (p) {
                  const itemRevenue = p.sellingPrice * item.quantity;
                  const ratio = itemRevenue / orderTotalProductRevenue;
                  
                  data[p.id].revenue += itemRevenue;
                  data[p.id].netProfit += (eco.netProfit * ratio);
                  data[p.id].ordersCount += 1;
              }
          });
      });

      Object.keys(data).forEach(pid => {
          const m = data[pid];
          if (m.netProfit > 0) m.status = 'PROFITABLE';
          else if (m.netProfit < 0) m.status = 'LOSS';
          else m.status = 'BORDERLINE';
          
          if (m.ordersCount > 0) {
             m.avgSellingPrice = m.revenue / m.ordersCount;
          }
      });

      return data;
  }, [products, orders, calculateOrderEconomics]);

  // --- FILTERING & SORTING ---
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
         const m = metrics[p.id];
         if (!m) return false;
         const matchesSearch = p.name.includes(searchTerm) || p.sku.includes(searchTerm);
         const matchesStatus = statusFilter === 'ALL' || 
             (statusFilter === 'PROFITABLE' && m.netProfit > 0) ||
             (statusFilter === 'LOSS' && m.netProfit < 0);
         return matchesSearch && matchesStatus;
      })
      .sort((a, b) => metrics[b.id].netProfit - metrics[a.id].netProfit);
  }, [products, metrics, searchTerm, statusFilter]);


  // --- MODAL DATA ---
  const activeProduct = selectedProduct ? products.find(p => p.id === selectedProduct) : null;
  const activeMetrics = activeProduct ? metrics[activeProduct.id] : null;

  return (
    <div className="animate-in fade-in duration-500 space-y-6 pb-32">
      
      {/* HEADER */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">المنتجات</h2>
        <p className="text-slate-500 text-sm font-medium">
           منظور الربحية لكل منتج. اكتشف المنتجات الرابحة والخاسرة.
        </p>
      </div>

      <Tabs defaultValue="LIST" className="w-full">
         <TabsList className="bg-white border p-1 h-auto rounded-xl mb-6 w-full md:w-auto inline-flex overflow-x-auto">
            <TabsTrigger value="LIST" className="py-2.5 px-6 rounded-lg font-bold min-w-[120px]">
               <Box size={16} className="ml-2" /> المنتجات
            </TabsTrigger>
            <TabsTrigger value="COSTS" className="py-2.5 px-6 rounded-lg font-bold min-w-[120px]">
               <DollarSign size={16} className="ml-2" /> تكلفة المنتج
            </TabsTrigger>
            <TabsTrigger value="ANALYSIS" className="py-2.5 px-6 rounded-lg font-bold min-w-[120px]">
               <BarChart3 size={16} className="ml-2" /> تحليل الربحية
            </TabsTrigger>
         </TabsList>

         {/* ======================= TAB 1: PRODUCT LIST ======================= */}
         <TabsContent value="LIST">
             
             {/* FILTERS */}
             <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                   <Search className="absolute right-3 top-3 text-slate-400" size={18} />
                   <Input 
                      placeholder="بحث باسم المنتج أو SKU..." 
                      className="pr-10 h-11 bg-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                   />
                </div>
                <div className="flex gap-2">
                    <select 
                       className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                       value={statusFilter}
                       onChange={(e) => setStatusFilter(e.target.value)}
                    >
                       <option value="ALL">كل الحالات</option>
                       <option value="PROFITABLE">الرابحة فقط</option>
                       <option value="LOSS">الخاسرة فقط</option>
                    </select>
                </div>
            </div>

            {/* TABLE */}
            <Card className="overflow-hidden border-slate-200 shadow-sm bg-white">
                <div className="overflow-x-auto">
                   <table className="w-full text-sm text-right">
                      <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 whitespace-nowrap">
                         <tr>
                            <th className="p-4 pr-6">المنتج</th>
                            <th className="p-4">المبيعات</th>
                            <th className="p-4">الإيراد</th>
                            <th className="p-4 pl-6">صافي الربح</th>
                            <th className="p-4">الحالة</th>
                            <th className="p-4 w-10"></th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {filteredProducts.length > 0 ? filteredProducts.map((p) => {
                            const m = metrics[p.id];
                            return (
                               <tr 
                                  key={p.id} 
                                  className="group hover:bg-slate-50 transition-colors cursor-pointer"
                                  onClick={() => setSelectedProduct(p.id)}
                               >
                                  <td className="p-4 pr-6">
                                      <div className="font-bold text-slate-900">{p.name}</div>
                                      <div className="text-[10px] text-slate-400 font-mono dir-ltr">{p.sku}</div>
                                  </td>
                                  <td className="p-4 text-slate-600 font-medium">
                                      {m.ordersCount} طلب
                                  </td>
                                  <td className="p-4 font-mono font-bold text-slate-900 dir-ltr">
                                     {m.revenue.toLocaleString()} ر.س
                                  </td>
                                  <td className="p-4 pl-6">
                                     <div className={`flex items-center gap-1 font-mono font-bold dir-ltr ${m.netProfit > 0 ? 'text-emerald-600' : m.netProfit < 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                                        {m.netProfit > 0 ? '+' : ''}{m.netProfit.toLocaleString(undefined, { maximumFractionDigits: 1 })} ر.س
                                     </div>
                                  </td>
                                  <td className="p-4">
                                     <StatusBadge status={m.status} />
                                  </td>
                                  <td className="p-4">
                                     <ChevronLeft size={16} className="text-slate-300 group-hover:text-slate-600" />
                                  </td>
                               </tr>
                            );
                         }) : (
                             <tr>
                                 <td colSpan={6} className="py-16 text-center text-slate-400">
                                     <Box size={40} className="mx-auto mb-2 opacity-20" />
                                     <p>لا توجد منتجات مسجلة.</p>
                                 </td>
                             </tr>
                         )}
                      </tbody>
                   </table>
                </div>
            </Card>
         </TabsContent>

         {/* ======================= TAB 2: PRODUCT COST (COGS) ======================= */}
         <TabsContent value="COSTS">
             <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 mb-6">
                 <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
                 <p className="text-xs text-amber-900 leading-relaxed">
                    تكلفة المنتج (COGS) هي الأساس لحساب الأرباح بدقة. تأكد من إدخال تكلفة الوحدة الواحدة شاملة الشحن من المورد والجمارك.
                 </p>
             </div>

             <div className="grid grid-cols-1 gap-3">
                 {products.map((p) => (
                    <div key={p.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                                <Box size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">{p.name}</h4>
                                <p className="text-xs text-slate-400 font-mono dir-ltr">{p.sku}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-left">
                                <p className="text-[10px] text-slate-400 mb-1">تكلفة الوحدة</p>
                                <p className="font-mono font-bold text-slate-900 dir-ltr text-lg">{p.cost} ر.س</p>
                            </div>
                            <Button 
                               variant="outline" 
                               size="sm" 
                               className="h-9 w-9 p-0 rounded-full border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200"
                               onClick={() => setEditingProduct(p.id)}
                            >
                                <Edit2 size={14} />
                            </Button>
                        </div>
                    </div>
                 ))}
                 {products.length === 0 && (
                     <div className="p-8 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                        <p>لا توجد منتجات لتعديل تكلفتها.</p>
                     </div>
                 )}
             </div>
         </TabsContent>

         {/* ======================= TAB 3: ANALYSIS ======================= */}
         <TabsContent value="ANALYSIS">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                     <Card className="p-6 bg-white border-slate-200">
                         <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                             <ScanBarcode size={18} /> اختر منتج للتحليل
                         </h3>
                         <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                             {products.map(p => (
                                 <button
                                    key={p.id}
                                    onClick={() => setSelectedProduct(p.id)}
                                    className={`w-full text-right p-3 rounded-lg border text-sm font-medium transition-all ${
                                        selectedProduct === p.id 
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                                        : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                                    }`}
                                 >
                                     {p.name}
                                 </button>
                             ))}
                             {products.length === 0 && <p className="text-sm text-slate-400 text-center py-4">لا توجد منتجات</p>}
                         </div>
                     </Card>
                 </div>

                 <div className="flex flex-col justify-center">
                     {activeProduct && activeMetrics ? (
                         <Card className="p-6 bg-slate-900 text-white border-0 shadow-xl relative overflow-hidden">
                             {/* ... Analysis Card Content ... */}
                             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                             
                             <div className="relative z-10">
                                 <div className="flex justify-between items-start mb-6">
                                     <div>
                                         <h4 className="text-xl font-bold">{activeProduct.name}</h4>
                                         <span className="text-xs text-slate-400 font-mono">{activeProduct.sku}</span>
                                     </div>
                                     <StatusBadge status={activeMetrics.status} isDark />
                                 </div>

                                 <div className="space-y-4 mb-6">
                                     <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                         <p className="text-sm font-bold text-slate-300 mb-2">💡 رؤية النظام:</p>
                                         <p className="text-sm leading-relaxed">
                                             {activeMetrics.netProfit > 0 
                                                ? `هذا المنتج يحقق أداءً ممتازاً. صافي الربح يمثل ${(activeMetrics.netProfit / activeMetrics.revenue * 100).toFixed(0)}% من الإيراد.`
                                                : `هذا المنتج يستنزف الموارد. التكاليف التشغيلية المرتبطة به أعلى من هامش الربح.`
                                             }
                                         </p>
                                     </div>
                                 </div>
                                 
                                 <div className="text-center pt-4 border-t border-white/10">
                                     <p className="text-xs text-slate-500 mb-1">نسخة تجريبية 0.5</p>
                                 </div>
                             </div>
                         </Card>
                     ) : (
                         <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 p-8 text-center">
                             <BarChart3 size={40} className="mb-4 opacity-20" />
                             <p>اختر منتجاً لعرض التحليل الذكي</p>
                         </div>
                     )}
                 </div>
             </div>
         </TabsContent>
      </Tabs>

      {/* --- PRODUCT DETAILS MODAL --- */}
      {activeProduct && activeMetrics && !editingProduct && selectedProduct && (
         <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedProduct(null)}></div>
            
            <div className="relative w-full max-w-lg bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto">
               <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 p-6 flex items-start justify-between z-10">
                  <div>
                     <h2 className="text-xl font-bold text-slate-900">{activeProduct.name}</h2>
                     <p className="text-sm text-slate-500 mt-1 font-mono dir-ltr">{activeProduct.sku}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedProduct(null)}>
                     <X size={20} className="text-slate-400 hover:text-slate-900" />
                  </Button>
               </div>

               <div className="p-6 space-y-8">
                  {/* SECTION A: SUMMARY */}
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                        <span className="text-xs font-bold text-slate-400 uppercase">إجمالي المبيعات</span>
                        <div className="text-xl font-mono font-bold text-slate-900 mt-1 dir-ltr">{activeMetrics.revenue.toLocaleString()}</div>
                        <span className="text-[10px] text-slate-400">ر.س</span>
                     </div>
                     <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                        <span className="text-xs font-bold text-slate-400 uppercase">صافي الربح</span>
                        <div className={`text-xl font-mono font-bold mt-1 dir-ltr ${activeMetrics.netProfit > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {activeMetrics.netProfit > 0 ? '+' : ''}{activeMetrics.netProfit.toLocaleString()}
                        </div>
                        <span className="text-[10px] text-slate-400">ر.س</span>
                     </div>
                  </div>

                  {/* SECTION B: BREAKDOWN */}
                  <div className="space-y-4">
                     <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <TrendingUp size={18} className="text-indigo-600" />
                        تفاصيل الوحدة الواحدة (تقريبي)
                     </h3>
                     <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 shadow-sm">
                        <div className="p-4 flex justify-between items-center bg-slate-50/50">
                           <span className="font-bold text-slate-700 text-sm">سعر البيع</span>
                           <span className="font-mono font-bold text-slate-900 dir-ltr">{activeProduct.sellingPrice} ر.س</span>
                        </div>
                         <div className="p-4 flex justify-between items-center">
                           <span className="text-sm text-slate-600">تكلفة المنتج (COGS)</span>
                           <span className="font-mono font-medium text-slate-900 dir-ltr">-{activeProduct.cost} ر.س</span>
                        </div>
                        <div className="p-4 flex justify-between items-center bg-indigo-50/30">
                           <span className="font-bold text-indigo-900 text-sm">هامش الربح الإجمالي</span>
                           <span className="font-mono font-bold text-indigo-700 dir-ltr">{(activeProduct.sellingPrice - activeProduct.cost).toFixed(2)} ر.س</span>
                        </div>
                     </div>
                  </div>
                  
                  {/* SECTION C: TRACEABILITY */}
                  <div className="flex gap-3">
                      <Button className="flex-1 bg-slate-900 text-white gap-2" onClick={() => setEditingProduct(activeProduct.id)}>
                          <Edit2 size={16} /> تعديل التكلفة
                      </Button>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* --- EDIT COST MODAL --- */}
      {editingProduct && (
         <EditCostModal 
            product={products.find(p => p.id === editingProduct)!} 
            onClose={() => setEditingProduct(null)}
            onSave={(cost) => {
                updateProductCost(editingProduct, cost);
                setEditingProduct(null);
            }}
         />
      )}

    </div>
  );
};

// --- SUB COMPONENTS ---

const StatusBadge: React.FC<{ status: ProductStatus, isDark?: boolean }> = ({ status, isDark }) => {
   const styles = {
      PROFITABLE: isDark ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-100',
      BORDERLINE: isDark ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-100',
      LOSS: isDark ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-rose-50 text-rose-700 border-rose-100',
   };
   
   const labels = {
       PROFITABLE: 'مربح',
       BORDERLINE: 'على الحافة',
       LOSS: 'خاسر'
   };
   
   return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${styles[status]}`}>
         {labels[status]}
      </span>
   );
};

const EditCostModal: React.FC<{ product: Product, onClose: () => void, onSave: (val: number) => void }> = ({ product, onClose, onSave }) => {
    const [cost, setCost] = useState(product.cost.toString());
    
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
         <Card className="w-full max-w-sm bg-white p-6 shadow-2xl border-0">
            <h3 className="text-lg font-bold text-slate-900 mb-1">تحديث تكلفة المنتج</h3>
            <p className="text-sm text-slate-500 mb-6">{product.name}</p>
            
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-slate-700 mb-1.5 block">تكلفة الوحدة الواحدة (ر.س)</label>
                    <Input 
                        type="number" 
                        value={cost} 
                        onChange={e => setCost(e.target.value)} 
                        className="bg-slate-50 font-mono font-bold text-lg h-12"
                        autoFocus
                    />
                    <p className="text-[10px] text-slate-400 mt-2">
                        يشمل: سعر الشراء من المورد + الشحن الدولي + الجمارك (للقطعة الواحدة).
                    </p>
                </div>
            </div>

            <div className="flex gap-3 mt-8">
               <Button variant="outline" className="flex-1" onClick={onClose}>إلغاء</Button>
               <Button className="flex-1 bg-slate-900 text-white hover:bg-slate-800" onClick={() => onSave(parseFloat(cost) || 0)}>حفظ</Button>
            </div>
         </Card>
      </div>
    );
};

export default Products;