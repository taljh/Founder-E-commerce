import React, { useMemo } from 'react';
import { useStore } from '../store';
import { ViewState } from '../types';
import { 
  BrainCircuit, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Target,
  ShieldAlert,
  Lock,
  ChevronDown,
  LineChart
} from 'lucide-react';
import { Card, Button } from '../components/ui';

interface CEOProps {
  onNavigate?: (view: ViewState) => void;
}

const CEO: React.FC<CEOProps> = ({ onNavigate }) => {
  const { calculatePnL, cashFlow, orders } = useStore();

  // --- THE DECISION ENGINE (V1 Rule-Based) ---
  const decision = useMemo(() => {
    // EMPTY STATE CHECK
    if (orders.length === 0) return null;

    const pnl = calculatePnL('THIS_MONTH');
    
    // RULE 1: CRITICAL LOSS / HIGH ADS (The "Bleeding" Scenario)
    if (pnl.marketingExpenses > (pnl.revenue * 0.4) || (pnl.marketingExpenses > pnl.netProfit && pnl.netProfit > 0)) {
       return {
          type: 'CRITICAL',
          title: 'الإعلانات تستهلك أرباحك هذا الأسبوع',
          signal: 'إنفاق إعلاني غير مستدام',
          explanation: `لقد صرفت ${pnl.marketingExpenses.toLocaleString()} ر.س على الإعلانات، بينما صافي الربح المتبقي هو ${pnl.netProfit.toLocaleString()} ر.س فقط.`,
          recommendation: 'أوقف الإعلانات على المنتجات غير المربحة فوراً وركّز الميزانية على المنتجات الرابحة فقط.',
          ctaLabel: 'إدارة التكاليف والإعلانات',
          ctaView: 'COSTS',
          reasons: [
             `الإعلانات تلتهم ${((pnl.marketingExpenses / pnl.revenue) * 100).toFixed(1)}% من إجمالي الإيرادات (المعدل الصحي 15-25%).`,
             'صافي الربح الحالي لا يغطي تكاليف النمو أو المخاطر.',
             'الاستمرار بهذا المعدل سيؤدي إلى تآكل رأس المال العامل.'
          ],
          confidence: 'مرتفع'
       };
    }

    // RULE 2: CASH TRAPPED (Liquidity Crisis)
    if (cashFlow.totalPending > cashFlow.totalSettled && cashFlow.totalPending > 1000) {
        return {
          type: 'WARNING',
          title: 'لديك سيولة عالية معلقة لدى شركات الشحن',
          signal: 'نقص في الكاش المحصل',
          explanation: `هناك ${cashFlow.totalPending.toLocaleString()} ر.س لم تصل حسابك البنكي بعد، رغم أن المبيعات جيدة.`,
          recommendation: 'تواصل مع مدير حسابك في شركة الشحن أو تابي/تمارا لطلب تحويل المبالغ المتأخرة.',
          ctaLabel: 'عرض تفاصيل السيولة',
          ctaView: 'FINANCE',
          reasons: [
             `المبالغ المعلقة تمثل ${(cashFlow.totalPending / (cashFlow.totalSettled + cashFlow.totalPending) * 100).toFixed(0)}% من سيولتك الحالية.`,
             'قد تواجه صعوبة في دفع رواتب أو إعادة شراء بضاعة إذا تأخر التحويل.'
          ],
          confidence: 'مرتفع'
       };
    }

    // RULE 3: HIGH RETURNS (Quality Issue)
    const totalOrders = orders.length;
    const returnedOrders = orders.filter(o => o.status === 'مرتجع').length;
    const returnRate = totalOrders > 0 ? (returnedOrders / totalOrders) * 100 : 0;

    if (returnRate > 15) {
        return {
            type: 'WARNING',
            title: 'معدل المرتجعات مرتفع جداً',
            signal: 'مشكلة في الجودة أو التوقعات',
            explanation: `نسبة استرجاع الطلبات بلغت ${returnRate.toFixed(1)}%، وهو مؤشر خطير على جودة المنتج أو وصفه.`,
            recommendation: 'راجع وصف المنتجات للتأكد من مطابقته للواقع، أو تواصل مع المورد.',
            ctaLabel: 'مراجعة المنتجات',
            ctaView: 'PRODUCTS',
            reasons: [
                'كل عملية إرجاع تكلفك رسوم شحن مزدوجة وخسارة تغليف.',
                'المرتجعات تحول الطلب الرابح إلى خسارة صافية.'
            ],
            confidence: 'متوسط'
        };
    }

    // DEFAULT: STABLE / GROWTH
    return {
        type: 'OPPORTUNITY',
        title: 'الأداء مستقر، ركّز على رفع قيمة السلة',
        signal: 'استقرار في الهوامش',
        explanation: 'هوامش الربح جيدة والمصاريف تحت السيطرة. هذا هو الوقت المناسب للنمو.',
        recommendation: 'حاول زيادة متوسط قيمة الطلب (AOV) عبر بيع منتجات مكملة (Cross-sell) للعملاء الحاليين.',
        ctaLabel: 'تحليل المنتجات',
        ctaView: 'PRODUCTS',
        reasons: [
            `صافي الربح صحي (${((pnl.netProfit / (pnl.revenue || 1)) * 100).toFixed(1)}%) ويسمح بالتجربة.`,
            'زيادة قيمة السلة هي أسرع طريقة لمضاعفة الربح دون زيادة الإعلانات.',
        ],
        confidence: 'متوسط'
    };

  }, [calculatePnL, cashFlow, orders]);

  // --- EMPTY STATE UI ---
  if (!decision) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
                  <BrainCircuit size={32} className="text-slate-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">لا توجد بيانات كافية للتحليل</h2>
              <p className="text-slate-500 max-w-md mb-8">
                  المدير التنفيذي يحتاج إلى بيانات حقيقية لتقديم قرارات دقيقة. ابدأ بربط المتجر أو تفعيل وضع التجربة.
              </p>
              <div className="flex gap-4">
                  <Button variant="outline" onClick={() => onNavigate?.('COSTS')}>ضبط التكاليف</Button>
                  <Button onClick={() => onNavigate?.('HOME')}>العودة للرئيسية</Button>
              </div>
          </div>
      );
  }

  // Visual Styles Mapping
  const getColors = (type: string) => {
      switch(type) {
          case 'CRITICAL': return { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-900', icon: 'text-rose-600', badge: 'bg-rose-100 text-rose-700', bar: 'bg-rose-500' };
          case 'WARNING': return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', icon: 'text-amber-600', badge: 'bg-amber-100 text-amber-700', bar: 'bg-amber-500' };
          default: return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900', icon: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500' };
      }
  };

  const colors = getColors(decision.type);

  return (
    <div className="animate-in fade-in duration-500 max-w-2xl mx-auto py-8 pb-32">
      
      {/* SECTION 1: EXECUTIVE GREETING */}
      <div className="mb-8 text-center md:text-right">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">صباح الخير، محمد 👋</h1>
          <p className="text-slate-500 text-lg font-medium">إليك أهم قرار لمتجرك اليوم، بناءً على تحليل البيانات.</p>
      </div>

      {/* SECTION 2: THE DECISION CARD (CORE) */}
      <Card className={`relative overflow-hidden border-2 ${colors.border} shadow-2xl bg-white`}>
          {/* Top colored accent bar */}
          <div className={`h-2 w-full ${colors.bar}`}></div>
          
          <div className="p-6 md:p-8">
              
              {/* Card Header */}
              <div className="flex items-center justify-between mb-6">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${colors.badge}`}>
                      {decision.type === 'CRITICAL' && <AlertTriangle size={14} />}
                      {decision.type === 'WARNING' && <ShieldAlert size={14} />}
                      {decision.type === 'OPPORTUNITY' && <Target size={14} />}
                      قرار اليوم
                  </div>
                  <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                      <Lock size={12} />
                      نظام توجيه تنفيذي
                  </span>
              </div>

              {/* Main Content */}
              <div className="space-y-8">
                  
                  {/* Title & Explanation */}
                  <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight mb-4">
                          {decision.title}
                      </h2>
                      <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                          <BrainCircuit size={24} className="text-slate-400 shrink-0 mt-1" />
                          <p className="text-slate-700 text-base leading-relaxed font-medium">
                              {decision.explanation}
                          </p>
                      </div>
                  </div>

                  {/* The Action Box */}
                  <div className={`p-6 rounded-xl border-l-4 ${colors.border} ${colors.bg}`}>
                      <h3 className={`text-xs font-bold ${colors.text} mb-2 uppercase tracking-wide opacity-80`}>
                          الإجراء الموصى به:
                      </h3>
                      <p className={`text-xl font-bold ${colors.text} leading-snug`}>
                          {decision.recommendation}
                      </p>
                  </div>

                  {/* Primary CTA */}
                  <Button 
                      size="lg" 
                      className="w-full h-14 text-lg font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/10 transition-all hover:scale-[1.01]"
                      onClick={() => onNavigate?.(decision.ctaView as ViewState)}
                  >
                      {decision.ctaLabel}
                      <ArrowRight size={20} className="mr-auto" />
                  </Button>
              </div>
          </div>
      </Card>

      {/* SECTION 3: WHY THIS DECISION */}
      <div className="mt-8 px-4">
          <button className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-4 hover:text-indigo-600 transition-colors">
              <ChevronDown size={16} />
              لماذا هذا القرار؟
          </button>
          
          <div className="space-y-4 border-r-2 border-slate-200 pr-5 mr-1.5">
              {decision.reasons.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-slate-600 group">
                      <div className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-indigo-500 transition-colors"></div>
                      <p className="text-sm leading-relaxed font-medium">{reason}</p>
                  </div>
              ))}
          </div>
      </div>

      {/* SECTION 4: CONFIDENCE INDICATOR */}
      <div className="mt-12 flex justify-center">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm text-xs font-bold text-slate-500 cursor-help hover:border-indigo-200 transition-colors" title="تم تحليل بيانات المالية والطلبات لآخر 30 يوم">
              <CheckCircle2 size={14} className={decision.confidence === 'مرتفع' ? 'text-emerald-500' : 'text-amber-500'} />
              <span>مستوى الثقة في التحليل:</span>
              <span className={decision.confidence === 'مرتفع' ? 'text-emerald-700' : 'text-amber-700'}>
                  {decision.confidence}
              </span>
          </div>
      </div>

    </div>
  );
};

export default CEO;