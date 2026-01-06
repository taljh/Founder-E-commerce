import React, { useState } from 'react';
import { useStore } from '../store';
import { 
  TrendingUp, 
  ArrowRight,
  X,
  ArrowUpRight,
  RefreshCcw,
  Lightbulb
} from 'lucide-react';
import { Card, Button } from './ui';

// --- TYPES ---
type InsightLevel = 'RISK' | 'OPPORTUNITY' | 'STABLE';

interface SimulationData {
  title: string;
  description: string;
  currentProfit: number;
  projectedProfit: number;
  actionLabel: string;
}

interface CEODecision {
  level: InsightLevel;
  title: string;
  reason: string;
  action: string;
  simulation: SimulationData;
}

const StoreCEO: React.FC = () => {
  const { orders, calculateOrderEconomics, ads } = useStore();
  const [showSimulation, setShowSimulation] = useState(false);

  // --- LAYER 1: DATA GATHERING & ANALYSIS ---
  const analyzeStore = (): CEODecision => {
    let totalRevenue = 0;
    let totalProfit = 0;
    let totalShippingCost = 0;
    
    let completedOrders = 0;
    let returnedOrders = 0;

    orders.forEach(o => {
      if (o.status === 'مكتمل') {
        completedOrders++;
        const eco = calculateOrderEconomics(o.id);
        if (eco) {
          totalRevenue += eco.revenue;
          totalProfit += eco.netProfit;
          totalShippingCost += eco.shippingCost;
        }
      } else if (o.status === 'مرتجع') {
        returnedOrders++;
      }
    });

    const totalOrders = completedOrders + returnedOrders;
    const returnRate = totalOrders > 0 ? (returnedOrders / totalOrders) * 100 : 0;
    const totalAds = ads.reduce((sum, ad) => sum + ad.amount, 0);
    const netMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const shippingRatio = totalRevenue > 0 ? (totalShippingCost / totalRevenue) * 100 : 0;

    // --- LAYER 2: INTELLIGENT REASONING ---
    
    // 1. RISK: Return Rate > 15%
    if (returnRate > 15) {
      const avgProfit = completedOrders > 0 ? totalProfit / completedOrders : 0;
      const potentialGain = (returnedOrders * 0.5) * avgProfit;
      
      return {
        level: 'RISK',
        title: 'المرتجعات تستنزف الأرباح',
        reason: `نسبة الاسترجاع ${returnRate.toFixed(1)}% وهي أعلى من المعدل الطبيعي.`,
        action: 'يجب مراجعة جودة المنتج أو وصفه في الموقع.',
        simulation: {
            title: 'تأثير تقليل المرتجعات',
            description: 'لو انخفض معدل الاسترجاع للنصف، ستستعيد هذه الأرباح.',
            currentProfit: totalProfit,
            projectedProfit: totalProfit + potentialGain,
            actionLabel: 'مراجعة المنتجات'
        }
      };
    }

    // 2. RISK: Low Margin
    if (totalRevenue > 0 && netMargin < 10) {
       const projectedProfit = totalRevenue * 0.20;
      return {
        level: 'RISK',
        title: 'هامش الربح منخفض',
        reason: `الهامش الحالي ${netMargin.toFixed(1)}% لا يغطي تكاليف النمو والمخاطر.`,
        action: 'يجب خفض تكلفة الإعلانات أو رفع متوسط السلة.',
        simulation: {
            title: 'تصحيح مسار الربحية',
            description: 'الوصول لهامش 20% سيغير وضعك المالي تماماً.',
            currentProfit: totalProfit,
            projectedProfit: projectedProfit,
            actionLabel: 'تحليل التكاليف'
        }
      };
    }

    // 3. RISK: Ad Spend High
    if (totalAds > totalProfit && totalProfit > 0) {
      const savedAds = totalAds * 0.30;
      const profitLossFromVolume = totalProfit * 0.10;
      const projectedProfit = totalProfit + savedAds - profitLossFromVolume;

      return {
        level: 'RISK',
        title: 'تكلفة الإعلانات مرتفعة',
        reason: 'مصاريف التسويق تجاوزت صافي الربح، وهذا غير مستدام.',
        action: 'أوقف الحملات الضعيفة وركز الميزانية على الأفضل.',
        simulation: {
            title: 'تحسين كفاءة الإعلانات',
            description: 'خفض الميزانية بـ 30% مع التركيز قد يرفع صافي الربح.',
            currentProfit: totalProfit,
            projectedProfit: projectedProfit,
            actionLabel: 'إدارة الإعلانات'
        }
      };
    }

    // 4. RISK: Shipping Costs
    if (shippingRatio > 20) {
      const savings = completedOrders * 5;
      return {
        level: 'RISK',
        title: 'تكاليف الشحن مرتفعة',
        reason: `الشحن يلتهم ${shippingRatio.toFixed(1)}% من الإيرادات.`,
        action: 'تفاوض مع شركات الشحن أو عدل سياسة الشحن المجاني.',
        simulation: {
            title: 'توفير تكاليف الشحن',
            description: 'توفير 5 ريال في كل شحنة سيؤثر مباشرة في الربح.',
            currentProfit: totalProfit,
            projectedProfit: totalProfit + savings,
            actionLabel: 'إعدادات الشحن'
        }
      };
    }

    // 5. OPPORTUNITY: High Margin
    if (netMargin > 30 && totalRevenue < 10000) {
      return {
        level: 'OPPORTUNITY',
        title: 'المتجر جاهز للتوسع',
        reason: 'هامش الربح ممتاز ويتحمل زيادة في الصرف الإعلاني.',
        action: 'ارفع الميزانية التسويقية لجلب مبيعات أكثر.',
        simulation: {
            title: 'توقع النمو',
            description: 'مضاعفة المبيعات مع الحفاظ على الهامش.',
            currentProfit: totalProfit,
            projectedProfit: totalProfit * 2,
            actionLabel: 'زيادة الميزانية'
        }
      };
    }

    // 6. STABLE
    return {
      level: 'STABLE',
      title: 'الأداء مستقر اليوم',
      reason: 'المؤشرات المالية والتشغيلية في النطاق الصحي.',
      action: 'راقب المخزون وحافظ على مستوى الخدمة.',
      simulation: {
        title: 'النمو التراكمي',
        description: 'الاستمرار بهذا المعدل سيحقق نمواً جيداً.',
        currentProfit: totalProfit,
        projectedProfit: totalProfit * 1.1,
        actionLabel: 'تم'
      }
    };
  };

  const decision = analyzeStore();

  const getBorderColor = (level: InsightLevel) => {
    switch (level) {
      case 'RISK': return 'border-l-4 border-l-rose-500';
      case 'OPPORTUNITY': return 'border-l-4 border-l-indigo-500';
      case 'STABLE': return 'border-l-4 border-l-emerald-500';
    }
  };

  return (
    <div className="relative">
      <Card className={`border-0 shadow-md bg-slate-900 text-white overflow-hidden ${getBorderColor(decision.level)}`}>
        {/* Background Texture */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-10 -mt-20 pointer-events-none"></div>

        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center relative z-10">
          
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
               <Lightbulb size={14} className={decision.level === 'RISK' ? 'text-rose-400' : decision.level === 'OPPORTUNITY' ? 'text-indigo-400' : 'text-emerald-400'} />
               قرار CEO المقترح
            </div>
            
            <h3 className="text-2xl font-bold tracking-tight">{decision.title}</h3>
            
            <div className="flex flex-col gap-1 text-sm text-slate-300">
               <p><span className="opacity-50">السبب:</span> {decision.reason}</p>
               <p className="font-bold text-white"><span className="opacity-50 font-normal">الإجراء:</span> {decision.action}</p>
            </div>
          </div>

          <div className="w-full md:w-auto mt-2 md:mt-0">
             <Button 
                variant="outline"
                className="w-full md:w-auto border-slate-700 hover:bg-slate-800 text-white hover:text-white bg-transparent gap-2 h-10"
                onClick={() => setShowSimulation(true)}
             >
                <RefreshCcw size={16} />
                محاكاة التأثير
             </Button>
          </div>
        </div>

        {/* --- SIMULATION DRAWER (Cleaned Up) --- */}
        {showSimulation && (
           <div className="absolute inset-0 bg-white z-20 flex flex-col items-center justify-center p-6 text-center animate-in fade-in slide-in-from-bottom-2 duration-300 text-slate-900">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-4 right-4 text-slate-400"
                onClick={() => setShowSimulation(false)}
              >
                  <X />
              </Button>
              
              <div className="max-w-lg w-full">
                  <h4 className="text-lg font-bold mb-1">{decision.simulation.title}</h4>
                  <p className="text-slate-500 text-sm mb-6 px-4">
                      {decision.simulation.description}
                  </p>

                  <div className="flex items-center justify-center gap-4 mb-8">
                      {/* Current */}
                      <div className="text-center">
                          <p className="text-xs text-slate-400 mb-1">الوضع الحالي</p>
                          <p className="text-xl font-bold text-slate-700 dir-ltr">
                              {Math.round(decision.simulation.currentProfit).toLocaleString()}
                          </p>
                      </div>
                      
                      <ArrowRight className="text-slate-300" />

                      {/* Projected */}
                      <div className="text-center">
                          <p className="text-xs text-emerald-600 mb-1 font-bold">بعد التحسين</p>
                          <p className="text-2xl font-bold text-emerald-600 dir-ltr">
                              {Math.round(decision.simulation.projectedProfit).toLocaleString()}
                          </p>
                      </div>
                  </div>

                  <div className="flex gap-3 justify-center">
                      <Button onClick={() => setShowSimulation(false)} className="h-10 px-8 bg-slate-900 text-white hover:bg-slate-800">
                          {decision.simulation.actionLabel}
                          <ArrowUpRight size={16} className="mr-2" />
                      </Button>
                  </div>
              </div>
           </div>
        )}
      </Card>
    </div>
  );
};

export default StoreCEO;