import React from 'react';
import { useStore } from '../store';
import { ViewState } from '../types';
import { 
  ArrowRight,
  TrendingDown,
  AlertTriangle,
  RefreshCw,
  PackageSearch,
  Settings2,
  FileBarChart,
  Calendar,
  ChevronLeft,
  Store,
  Wallet
} from 'lucide-react';
import { Card, Button } from '../components/ui';

interface DashboardProps {
    onNavigate?: (view: ViewState) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { calculatePnL, cashFlow, orders, lastSyncTime, isSallaConnected } = useStore();
  
  const pnl = calculatePnL('THIS_MONTH'); 
  const currentOrdersCount = orders.filter(o => o.status !== 'مرتجع').length;
  const hasPendingMoney = cashFlow.totalPending > 0;
  const hasOrders = orders.length > 0;

  return (
    <div className="animate-in fade-in duration-700 space-y-8 pb-20">
      
      {/* --- SECTION 1: HEADER & WELCOME --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">أهلاً بك، محمد 👋</h1>
           <p className="text-slate-500 mt-1">نقطة اتخاذ القرار اليومية.</p>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-xl shadow-sm">
           <div className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold border ${isSallaConnected ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isSallaConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
              {isSallaConnected ? 'متصل بسلة' : 'غير متصل'}
           </div>
           {isSallaConnected && (
             <>
                <div className="h-4 w-px bg-slate-200 mx-1"></div>
                <span className="text-[10px] font-mono text-slate-400 dir-ltr">{lastSyncTime}</span>
             </>
           )}
           <div className="h-4 w-px bg-slate-200 mx-1"></div>
           <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold px-2">
              <Calendar size={14} className="text-slate-400" />
              هذا الشهر
           </div>
        </div>
      </div>

      {/* --- SECTION 2: CEO HERO CARD (Or Empty State) --- */}
      {hasOrders ? (
          <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-200 to-slate-200 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
              <Card className="relative border-0 ring-1 ring-slate-200 shadow-xl bg-white overflow-hidden">
                  <div className="absolute top-0 right-0 w-2 h-full bg-rose-500"></div>
                  <div className="p-8 flex flex-col md:flex-row gap-8 items-start justify-between">
                      <div className="space-y-4 max-w-2xl">
                          <div className="flex items-center gap-2 text-rose-600 font-bold uppercase tracking-wider text-xs">
                              <AlertTriangle size={16} />
                              قرار اليوم المقترح
                          </div>
                          
                          <div className="space-y-2">
                              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
                                  الإعلانات تستهلك أرباحك هذا الأسبوع
                              </h2>
                              <p className="text-base text-slate-600 leading-relaxed">
                                 لقد صرفت <span className="font-bold text-slate-900 bg-rose-50 px-1 rounded">2,300 ر.س</span> على الإعلانات، 
                                 بينما صافي الربح المتبقي لك هو <span className="font-bold text-rose-600">174 ر.س</span> فقط.
                              </p>
                          </div>

                          <div className="flex items-center gap-2 text-sm font-bold text-rose-800 bg-rose-50 p-3 rounded-lg border border-rose-100/50 w-fit">
                              💡 إجراء مقترح: أوقف الإعلانات على المنتجات منخفضة الهامش فوراً.
                          </div>
                      </div>

                      <div className="w-full md:w-auto self-end md:self-center">
                          <Button 
                             size="lg" 
                             className="w-full md:w-auto h-12 px-6 text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10 gap-2"
                             onClick={() => onNavigate?.('CEO')}
                          >
                              عرض التفاصيل
                              <ArrowRight size={16} />
                          </Button>
                      </div>
                  </div>
              </Card>
          </div>
      ) : (
          <Card className="p-8 flex flex-col items-center justify-center text-center border-dashed border-2 border-slate-200 bg-slate-50/50">
             <Store size={48} className="text-slate-300 mb-4" />
             <h3 className="text-lg font-bold text-slate-900">لا توجد طلبات بعد</h3>
             <p className="text-slate-500 max-w-sm mb-6 mt-1">
                 قم بربط متجرك في سلة أو تفعيل "وضع التجربة" من القائمة الجانبية لرؤية كيف يعمل النظام.
             </p>
             <Button variant="outline" onClick={() => onNavigate?.('COSTS')}>
                 إعداد التكاليف أولاً
             </Button>
          </Card>
      )}

      {/* --- SECTION 3: METRICS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard 
             label="عدد الطلبات" 
             value={currentOrdersCount} 
             unit="طلب" 
             footer="هذا الشهر" 
          />
          <MetricCard 
             label="الكاش المتوفر" 
             value={cashFlow.totalSettled.toLocaleString()} 
             unit="ر.س" 
             footer="محصّل فعلياً" 
             highlight 
          />
          <MetricCard 
             label="صافي الربح" 
             value={pnl.netProfit.toLocaleString()} 
             unit="ر.س" 
             footer="بعد الخصم" 
             trend={pnl.netProfit < 0 ? 'down' : 'up'} 
          />
      </div>

      {/* --- SECTION 4: ALERTS --- */}
      {hasPendingMoney && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white border border-amber-100 flex items-center justify-center text-amber-600 shadow-sm shrink-0">
                      <AlertTriangle size={20} />
                  </div>
                  <div>
                      <h3 className="font-bold text-amber-900 text-sm">مبالغ معلقة في الطريق</h3>
                      <p className="text-xs text-amber-800/70 mt-0.5">
                          لديك <span className="font-bold dir-ltr">{cashFlow.totalPending.toLocaleString()} ر.س</span> لم تصل حسابك البنكي بعد.
                      </p>
                  </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-amber-800 hover:bg-amber-100 hover:text-amber-900 text-xs font-bold"
                onClick={() => onNavigate?.('FINANCE')}
              >
                  التفاصيل <ChevronLeft size={14} />
              </Button>
          </div>
      )}

      {/* --- SECTION 5: QUICK ACTIONS --- */}
      <div>
         <h3 className="text-sm font-bold text-slate-900 mb-4">وصول سريع</h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <QuickActionCard 
                icon={PackageSearch} 
                title="مراجعة الطلبات" 
                desc="سجل المبيعات والتفاصيل" 
                onClick={() => onNavigate?.('ORDERS')}
             />
             <QuickActionCard 
                icon={Settings2} 
                title="تحديث التكاليف" 
                desc="ضبط رسوم الشحن والتغليف" 
                onClick={() => onNavigate?.('COSTS')}
             />
             <QuickActionCard 
                icon={FileBarChart} 
                title="عرض التقارير" 
                desc="تحليل الأداء المالي" 
                onClick={() => onNavigate?.('REPORTS')}
             />
         </div>
      </div>

    </div>
  );
};

// --- Sub Components ---

const MetricCard: React.FC<{ label: string, value: string | number, unit: string, footer: string, highlight?: boolean, trend?: 'up' | 'down' }> = ({ label, value, unit, footer, highlight, trend }) => (
    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col gap-4">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
        <div className="flex items-baseline gap-1 dir-ltr">
            <span className={`text-3xl font-mono font-bold tracking-tight ${trend === 'down' ? 'text-rose-600' : 'text-slate-900'}`}>
                {value}
            </span>
            <span className="text-xs text-slate-400 font-bold">{unit}</span>
        </div>
        <div className={`text-[10px] font-bold self-end px-2 py-1 rounded flex items-center gap-1 ${highlight ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-500'}`}>
            {trend === 'down' && <TrendingDown size={10} />}
            {footer}
        </div>
    </div>
);

const QuickActionCard: React.FC<{ icon: any, title: string, desc: string, onClick: () => void }> = ({ icon: Icon, title, desc, onClick }) => (
    <button 
        onClick={onClick}
        className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all text-right group"
    >
        <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">
            <Icon size={20} />
        </div>
        <div>
            <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-900 transition-colors">{title}</h4>
            <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
        </div>
        <ChevronLeft size={16} className="mr-auto text-slate-300 group-hover:text-indigo-400 transition-colors" />
    </button>
);

export default Dashboard;