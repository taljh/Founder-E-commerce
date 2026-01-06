import React, { useState } from 'react';
import { useStore } from '../store';
import { 
  CreditCard, 
  Truck, 
  Package, 
  Megaphone, 
  Receipt,
  Plus,
  Info,
  Building2,
  Coins,
  Hammer,
  ArrowLeft,
  Wallet,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent, Card, Button, Input } from '../components/ui';

const Expenses: React.FC = () => {
  const { 
    paymentRules, updatePaymentRule,
    shippingRules, updateShippingRule,
    packagingMaterials, updatePackagingMaterial,
    packagingTemplates, updatePackagingTemplate,
    ads, addAd,
    expenses, addExpense,
    calculatePnL
  } = useStore();

  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  
  // Get financial context for the summary header
  const pnl = calculatePnL('THIS_MONTH');
  const totalVariableCosts = pnl.shippingCost + pnl.paymentFees + pnl.packagingCost;
  const totalFixedCosts = pnl.fixedExpenses + pnl.operatingExpenses - totalVariableCosts; // Approx logic for display

  return (
    <div className="animate-in fade-in duration-500 space-y-6 pb-32">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <h2 className="text-3xl font-bold text-slate-900 tracking-tight">إعدادات التكاليف</h2>
           <p className="text-slate-500 text-sm font-medium mt-1">
             أدخل تكاليفك مرة واحدة، وسيقوم النظام بحساب الربح والخسارة لكل طلب تلقائياً.
           </p>
        </div>
        
        {/* Quick Cost Summary Badge */}
        <div className="hidden md:flex items-center gap-4 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
            <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-400 font-bold uppercase">إجمالي المصاريف (هذا الشهر)</span>
                <span className="font-mono font-bold text-slate-900 dir-ltr">
                    {(pnl.operatingExpenses + pnl.marketingExpenses + pnl.fixedExpenses).toLocaleString()} SAR
                </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                <Wallet size={20} />
            </div>
        </div>
      </div>

      {/* --- MAIN TABS (THE 3 DIMENSIONS) --- */}
      <Tabs defaultValue="UNIT_ECONOMICS" className="w-full">
          
          <TabsList className="bg-white border p-1 h-auto rounded-xl mb-6 w-full flex flex-col md:flex-row gap-1">
              <TabsTrigger value="UNIT_ECONOMICS" className="py-3 px-4 rounded-lg font-bold gap-3 justify-start md:justify-center flex-1">
                 <div className="bg-blue-50 text-blue-600 p-1.5 rounded-md"><Coins size={18} /></div>
                 <div className="text-right md:text-center">
                    <span className="block text-slate-900">تكاليف الطلب</span>
                    <span className="block text-[10px] text-slate-400 font-normal">شحن، دفع، تغليف</span>
                 </div>
              </TabsTrigger>
              
              <TabsTrigger value="MARKETING" className="py-3 px-4 rounded-lg font-bold gap-3 justify-start md:justify-center flex-1">
                 <div className="bg-rose-50 text-rose-600 p-1.5 rounded-md"><Megaphone size={18} /></div>
                 <div className="text-right md:text-center">
                    <span className="block text-slate-900">التسويق</span>
                    <span className="block text-[10px] text-slate-400 font-normal">إعلانات المنصات</span>
                 </div>
              </TabsTrigger>
              
              <TabsTrigger value="OPERATING" className="py-3 px-4 rounded-lg font-bold gap-3 justify-start md:justify-center flex-1">
                 <div className="bg-slate-100 text-slate-600 p-1.5 rounded-md"><Building2 size={18} /></div>
                 <div className="text-right md:text-center">
                    <span className="block text-slate-900">مصاريف التشغيل</span>
                    <span className="block text-[10px] text-slate-400 font-normal">رواتب، فواتير، خدمات</span>
                 </div>
              </TabsTrigger>
          </TabsList>

          {/* =====================================================================================
              TAB 1: UNIT ECONOMICS (Rules Engine)
             ===================================================================================== */}
          <TabsContent value="UNIT_ECONOMICS" className="space-y-6">
              
              {/* Internal Tabs for Unit Economics */}
              <Tabs defaultValue="PAYMENT">
                  <div className="flex items-center justify-between mb-4">
                      <div className="bg-slate-100 p-1 rounded-lg inline-flex">
                          <TabsTrigger value="PAYMENT" className="text-xs font-bold px-4 py-1.5 h-8">رسوم الدفع</TabsTrigger>
                          <TabsTrigger value="SHIPPING" className="text-xs font-bold px-4 py-1.5 h-8">الشحن</TabsTrigger>
                          <TabsTrigger value="PACKAGING" className="text-xs font-bold px-4 py-1.5 h-8">التغليف</TabsTrigger>
                      </div>
                  </div>

                  {/* 1.1 PAYMENT FEES */}
                  <TabsContent value="PAYMENT" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex gap-3 mb-4">
                         <Info size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                         <p className="text-xs text-indigo-900 leading-relaxed">
                            يتم خصم هذه الرسوم تلقائياً من كل طلب. المعادلة: <span className="font-bold dir-ltr">(Amount × %) + Fixed</span>.
                         </p>
                      </div>
                      <Card className="overflow-hidden border-slate-200 shadow-sm bg-white">
                         <table className="w-full text-sm text-right">
                            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                               <tr>
                                  <th className="p-4">طريقة الدفع</th>
                                  <th className="p-4 w-32">النسبة %</th>
                                  <th className="p-4 w-32">ثابت (ر.س)</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                               {paymentRules.map((rule) => (
                                  <tr key={rule.method} className="group hover:bg-slate-50/50">
                                     <td className="p-4 font-bold text-slate-700 flex items-center gap-2">
                                        <CreditCard size={14} className="text-slate-400" />
                                        {rule.name}
                                     </td>
                                     <td className="p-4">
                                        <div className="relative">
                                           <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-center font-mono font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                                             value={rule.percentFee} onChange={(e) => updatePaymentRule(rule.method, parseFloat(e.target.value) || 0, rule.fixedFee)} />
                                           <span className="absolute left-2 top-1.5 text-slate-400 font-sans text-xs">%</span>
                                        </div>
                                     </td>
                                     <td className="p-4">
                                        <div className="relative">
                                           <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-center font-mono font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                                             value={rule.fixedFee} onChange={(e) => updatePaymentRule(rule.method, rule.percentFee, parseFloat(e.target.value) || 0)} />
                                           <span className="absolute left-2 top-1.5 text-slate-400 font-sans text-xs">SAR</span>
                                        </div>
                                     </td>
                                  </tr>
                               ))}
                            </tbody>
                         </table>
                      </Card>
                  </TabsContent>

                  {/* 1.2 SHIPPING COSTS */}
                  <TabsContent value="SHIPPING" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 mb-4">
                         <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
                         <p className="text-xs text-amber-900 leading-relaxed">
                            أدخل التكلفة الفعلية للبوليصة التي تدفعها لشركة الشحن (وليس ما يدفعه العميل).
                         </p>
                      </div>
                      <Card className="overflow-hidden border-slate-200 shadow-sm bg-white">
                         <table className="w-full text-sm text-right">
                            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                               <tr>
                                  <th className="p-4">شركة الشحن</th>
                                  <th className="p-4 w-40">التكلفة عليك (ر.س)</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                               {shippingRules.map((rule) => (
                                  <tr key={rule.carrier} className="group hover:bg-slate-50/50">
                                     <td className="p-4 font-bold text-slate-700 flex items-center gap-2">
                                        <Truck size={14} className="text-slate-400" />
                                        {rule.name}
                                     </td>
                                     <td className="p-4">
                                        <div className="relative">
                                           <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-center font-mono font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                                             value={rule.cost} onChange={(e) => updateShippingRule(rule.carrier, parseFloat(e.target.value) || 0)} />
                                           <span className="absolute left-2 top-1.5 text-slate-400 font-sans text-xs">SAR</span>
                                        </div>
                                     </td>
                                  </tr>
                               ))}
                            </tbody>
                         </table>
                      </Card>
                  </TabsContent>

                  {/* 1.3 PACKAGING COSTS */}
                  <TabsContent value="PACKAGING" className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {/* Materials List */}
                           <Card className="border-slate-200 shadow-sm bg-white p-4">
                               <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                                  <Package size={16} className="text-emerald-500" />
                                  أسعار مواد التغليف
                               </h3>
                               <div className="space-y-3">
                                  {packagingMaterials.map((mat) => (
                                     <div key={mat.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <span className="text-sm font-medium text-slate-700">{mat.name}</span>
                                        <div className="relative w-24">
                                           <input type="number" step="0.01" className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-center font-mono font-bold text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                                             value={mat.costPerUnit} onChange={(e) => updatePackagingMaterial(mat.id, parseFloat(e.target.value) || 0)} />
                                           <span className="absolute left-1 top-1.5 text-slate-300 text-[10px]">SAR</span>
                                        </div>
                                     </div>
                                  ))}
                               </div>
                           </Card>

                           {/* Default Template */}
                           <Card className="border-slate-200 shadow-sm bg-white p-4">
                               <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                                  <Hammer size={16} className="text-slate-500" />
                                  الاستهلاك الافتراضي (لكل طلب)
                               </h3>
                               <div className="space-y-3">
                                  {packagingMaterials.map((mat) => {
                                     const item = packagingTemplates[0].items.find(i => i.materialId === mat.id);
                                     const qty = item ? item.quantity : 0;
                                     return (
                                        <div key={mat.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100">
                                           <span className="text-sm text-slate-600">{mat.name}</span>
                                           <div className="flex items-center gap-2">
                                               <span className="text-[10px] text-slate-400">الكمية:</span>
                                               <input type="number" min="0" className="w-16 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-center font-mono font-bold text-sm focus:ring-1 focus:ring-slate-900 outline-none"
                                                 value={qty} onChange={(e) => updatePackagingTemplate(mat.id, parseInt(e.target.value) || 0)} />
                                           </div>
                                        </div>
                                     );
                                  })}
                               </div>
                               <div className="mt-4 pt-4 border-t border-slate-100">
                                   <div className="flex justify-between items-center text-xs text-slate-500">
                                      <span>تكلفة التغليف للطلب الواحد:</span>
                                      <span className="font-mono font-bold text-slate-900">
                                         {packagingMaterials.reduce((sum, mat) => {
                                             const item = packagingTemplates[0].items.find(i => i.materialId === mat.id);
                                             return sum + (mat.costPerUnit * (item?.quantity || 0));
                                         }, 0).toFixed(2)} SAR
                                      </span>
                                   </div>
                               </div>
                           </Card>
                       </div>
                  </TabsContent>
              </Tabs>
          </TabsContent>

          {/* =====================================================================================
              TAB 2: MARKETING (Ad Spend)
             ===================================================================================== */}
          <TabsContent value="MARKETING" className="space-y-4">
              <div className="flex justify-between items-center bg-rose-50 border border-rose-100 p-4 rounded-xl">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white text-rose-600 flex items-center justify-center shadow-sm">
                        <Megaphone size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-rose-900 text-sm">مصاريف الإعلانات</h3>
                        <p className="text-xs text-rose-700/80">توزع التكلفة على جميع الطلبات المكتملة في نفس الفترة.</p>
                    </div>
                 </div>
                 <Button onClick={() => setIsAdModalOpen(true)} className="bg-rose-600 hover:bg-rose-700 text-white gap-2 shadow-sm">
                    <Plus size={16} /> تسجيل حملة
                 </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {ads.map((ad) => (
                    <div key={ad.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center group hover:border-rose-200 transition-colors">
                       <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-rose-50 group-hover:text-rose-500 transition-colors">
                             {ad.platform === 'SNAPCHAT' ? '👻' : ad.platform === 'TIKTOK' ? '🎵' : ad.platform === 'INSTAGRAM' ? '📸' : 'G'}
                          </div>
                          <div>
                             <h4 className="font-bold text-slate-900 text-sm">{ad.platform}</h4>
                             <span className="text-[10px] text-slate-400">{ad.date} • {ad.type}</span>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="font-mono font-bold text-slate-900 dir-ltr text-lg">{ad.amount.toLocaleString()} <span className="text-xs text-slate-400">SAR</span></p>
                       </div>
                    </div>
                 ))}
                 
                 {ads.length === 0 && (
                    <div className="col-span-full py-16 text-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50">
                       <Megaphone size={32} className="mx-auto text-slate-300 mb-2" />
                       <p className="text-slate-400 font-medium text-sm">لم يتم تسجيل أي مصاريف إعلانية</p>
                    </div>
                 )}
              </div>
          </TabsContent>

          {/* =====================================================================================
              TAB 3: OPERATING (Overhead)
             ===================================================================================== */}
          <TabsContent value="OPERATING" className="space-y-4">
              <div className="flex justify-between items-center bg-slate-100 border border-slate-200 p-4 rounded-xl">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white text-slate-600 flex items-center justify-center shadow-sm">
                        <Receipt size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-sm">مصاريف التشغيل</h3>
                        <p className="text-xs text-slate-600">رواتب، إيجارات، فواتير، اشتراكات، صيانة.</p>
                    </div>
                 </div>
                 <Button onClick={() => setIsExpenseModalOpen(true)} className="bg-slate-900 text-white gap-2 shadow-sm">
                    <Plus size={16} /> إضافة مصروف
                 </Button>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                 {expenses.length > 0 ? (
                     <div className="divide-y divide-slate-100">
                        {expenses.map((exp) => (
                           <div key={exp.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                               <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${exp.type === 'FIXED' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                     {exp.type === 'FIXED' ? 'ثابت' : 'تشغيل'}
                                  </div>
                                  <div>
                                     <p className="text-sm font-bold text-slate-900">{exp.description}</p>
                                     <p className="text-xs text-slate-400 mt-0.5">{exp.date}</p>
                                  </div>
                               </div>
                               <p className="font-mono font-bold text-slate-900 dir-ltr">{exp.amount.toLocaleString()} SAR</p>
                           </div>
                        ))}
                     </div>
                 ) : (
                    <div className="py-16 text-center">
                       <Building2 size={32} className="mx-auto text-slate-300 mb-2" />
                       <p className="text-slate-400 font-medium text-sm">لا توجد مصاريف تشغيلية مسجلة</p>
                    </div>
                 )}
              </div>
          </TabsContent>

      </Tabs>

      {/* --- MODALS --- */}
      
      {/* ADD AD MODAL */}
      {isAdModalOpen && (
         <AddTransactionModal 
            title="تسجيل حملة إعلانية"
            onClose={() => setIsAdModalOpen(false)}
            onSubmit={(data) => {
               addAd({
                  platform: data.platform || 'SNAPCHAT',
                  amount: parseFloat(data.amount) || 0,
                  date: data.date,
                  type: 'TOPUP'
               });
               setIsAdModalOpen(false);
            }}
            fields={[
               { name: 'amount', label: 'المبلغ المصروف (ر.س)', type: 'number' },
               { name: 'platform', label: 'المنصة', type: 'select', options: ['SNAPCHAT', 'TIKTOK', 'INSTAGRAM', 'GOOGLE'] },
               { name: 'date', label: 'التاريخ', type: 'date' }
            ]}
         />
      )}

      {/* ADD EXPENSE MODAL */}
      {isExpenseModalOpen && (
         <AddTransactionModal 
            title="تسجيل مصروف جديد"
            onClose={() => setIsExpenseModalOpen(false)}
            onSubmit={(data) => {
               addExpense({
                  description: data.description,
                  amount: parseFloat(data.amount) || 0,
                  date: data.date,
                  type: data.type || 'OPERATING'
               });
               setIsExpenseModalOpen(false);
            }}
            fields={[
               { name: 'description', label: 'وصف المصروف', type: 'text', placeholder: 'مثال: راتب موظف، صيانة، اشتراك...' },
               { name: 'amount', label: 'المبلغ (ر.س)', type: 'number' },
               { name: 'type', label: 'التصنيف', type: 'select', options: ['OPERATING', 'FIXED', 'ASSET'], labels: {'OPERATING': 'مصروف تشغيلي (متغير)', 'FIXED': 'مصروف ثابت (دوري)', 'ASSET': 'شراء أصل / تجهيز'} },
               { name: 'date', label: 'التاريخ', type: 'date' }
            ]}
         />
      )}

    </div>
  );
};

// Simple Modal Component
const AddTransactionModal: React.FC<{ 
   title: string, 
   onClose: () => void, 
   onSubmit: (data: any) => void,
   fields: { name: string, label: string, type: string, placeholder?: string, options?: string[], labels?: Record<string, string> }[]
}> = ({ title, onClose, onSubmit, fields }) => {
   const [formData, setFormData] = useState<any>({});

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
         <Card className="w-full max-w-md bg-white p-6 shadow-2xl border-0">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-bold text-slate-900">{title}</h3>
               <Button variant="ghost" size="sm" onClick={onClose}><ArrowLeft size={18} /></Button>
            </div>
            
            <div className="space-y-4">
               {fields.map((field) => (
                  <div key={field.name} className="space-y-1.5">
                     <label className="text-sm font-bold text-slate-700">{field.label}</label>
                     {field.type === 'select' ? (
                        <select 
                           className="w-full h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                           onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                        >
                           {field.options?.map(opt => (
                              <option key={opt} value={opt}>{field.labels ? field.labels[opt] : opt}</option>
                           ))}
                        </select>
                     ) : (
                        <Input 
                           type={field.type} 
                           placeholder={field.placeholder}
                           className="bg-slate-50 h-11 font-medium"
                           onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                        />
                     )}
                  </div>
               ))}
            </div>
            
            <div className="flex gap-3 mt-8 pt-4 border-t border-slate-100">
               <Button variant="outline" className="flex-1 h-11" onClick={onClose}>إلغاء</Button>
               <Button className="flex-1 bg-slate-900 text-white hover:bg-slate-800 h-11 font-bold shadow-lg shadow-slate-900/10" onClick={() => onSubmit(formData)}>حفظ وتطبيق</Button>
            </div>
         </Card>
      </div>
   );
};

export default Expenses;