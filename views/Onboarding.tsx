import React, { useState } from 'react';
import { useStore } from '../store';
import { 
  Store, 
  ArrowRight, 
  CheckCircle2, 
  Loader2, 
  Coins, 
  Truck, 
  Package, 
  CreditCard,
  Building2,
  X,
  Target,
  BrainCircuit,
  ArrowLeft
} from 'lucide-react';
import { Button, Card, Input } from '../components/ui';

const Onboarding: React.FC = () => {
  const { onboarding, markOnboardingStepComplete, skipOnboarding, connectSalla, updateProductCost, products, paymentRules, shippingRules, packagingMaterials } = useStore();
  
  // RENDER ROUTER
  if (onboarding.currentStep === 'SYSTEM') {
      return <SystemOnboarding onComplete={() => connectSalla()} />;
  }
  
  if (onboarding.currentStep === 'COSTS') {
      return <CostOnboarding onComplete={() => markOnboardingStepComplete('COSTS')} onSkip={skipOnboarding} />;
  }
  
  if (onboarding.currentStep === 'DECISION') {
      return <DecisionOnboarding onComplete={() => markOnboardingStepComplete('DECISION')} />;
  }

  return null;
};

// ==================================================================================
// 1) SYSTEM ONBOARDING (CONNECT STORE)
// ==================================================================================
const SystemOnboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [isConnecting, setIsConnecting] = useState(false);

    const handleConnect = () => {
        setIsConnecting(true);
        // Simulate connection delay then complete
        setTimeout(() => {
            onComplete();
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold shadow-xl mb-8">F</div>
            
            <div className="text-center space-y-4 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">خلّينا نربط متجرك ونبدأ.</h1>
                <p className="text-slate-500 text-lg">
                    الخطوة الأولى للسيطرة على أرباحك هي ربط مصدر البيانات.
                </p>
                
                <div className="pt-8">
                    {!isConnecting ? (
                        <Button 
                            size="lg" 
                            className="w-full h-14 text-lg font-bold bg-[#7EB800] hover:bg-[#6da100] text-white shadow-xl shadow-[#7EB800]/20 gap-3"
                            onClick={handleConnect}
                        >
                            <Store size={20} />
                            ربط متجر سلة
                        </Button>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 size={32} className="text-[#7EB800] animate-spin" />
                            <p className="text-sm font-bold text-slate-400">جاري تجهيز بيانات متجرك...</p>
                        </div>
                    )}
                </div>
                
                {!isConnecting && (
                    <p className="text-xs text-slate-400 pt-4">اتصال آمن 100% ومصرح به من سلة</p>
                )}
            </div>
        </div>
    );
};

// ==================================================================================
// 2) COST ONBOARDING (WIZARD)
// ==================================================================================
const CostOnboarding: React.FC<{ onComplete: () => void, onSkip: () => void }> = ({ onComplete, onSkip }) => {
    const [step, setStep] = useState(1);
    const totalSteps = 5;
    const { updatePaymentRule, updateShippingRule, updatePackagingMaterial } = useStore();

    const nextStep = () => {
        if (step < totalSteps) setStep(step + 1);
        else onComplete();
    };

    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row">
            {/* Sidebar / Progress */}
            <div className="w-full md:w-1/3 bg-slate-50 border-l border-slate-200 p-8 flex flex-col justify-between">
                <div>
                    <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold mb-8">F</div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">إعداد منطق الربح</h2>
                    <p className="text-slate-500 text-sm mb-8">
                        أجب على هذه الأسئلة لمرة واحدة، وسيقوم النظام بحساب ربح كل طلب تلقائياً.
                    </p>
                    
                    <div className="space-y-4">
                        {[
                            { id: 1, label: 'تكلفة المنتجات', icon: Package },
                            { id: 2, label: 'رسوم الدفع', icon: CreditCard },
                            { id: 3, label: 'تكاليف الشحن', icon: Truck },
                            { id: 4, label: 'التغليف', icon: Target },
                            { id: 5, label: 'مصاريف ثابتة', icon: Building2 },
                        ].map((s) => (
                            <div key={s.id} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${step === s.id ? 'bg-white shadow-sm ring-1 ring-slate-200' : 'text-slate-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === s.id ? 'bg-slate-900 text-white' : step > s.id ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                    {step > s.id ? <CheckCircle2 size={16} /> : s.id}
                                </div>
                                <span className={`text-sm font-bold ${step === s.id ? 'text-slate-900' : ''}`}>{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                <Button variant="ghost" className="text-slate-400 hover:text-slate-600 self-start" onClick={onSkip}>
                    تخطي الإعداد الآن
                </Button>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 md:p-16 flex flex-col justify-center max-w-3xl mx-auto w-full">
                <div className="animate-in fade-in slide-in-from-right duration-500" key={step}>
                    
                    {/* STEP 1: COGS */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4"><Package size={24} /></div>
                            <h3 className="text-2xl font-bold text-slate-900">كم تكلفة منتجاتك (COGS)؟</h3>
                            <p className="text-slate-500">
                                تشمل سعر الشراء من المورد + الشحن الدولي + الجمارك (للقطعة الواحدة).
                                <br/> <span className="text-xs bg-slate-100 px-1 rounded">سنعرض عينة لضبطها الآن.</span>
                            </p>
                            
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                                <div className="flex justify-between text-xs font-bold text-slate-400 px-2">
                                    <span>المنتج</span>
                                    <span>التكلفة (ر.س)</span>
                                </div>
                                {[1, 2].map(i => (
                                    <div key={i} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                        <span className="text-sm font-bold text-slate-700">منتج تجريبي {i}</span>
                                        <Input className="w-24 h-9 text-center font-mono font-bold" placeholder="0" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 2: PAYMENT */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4"><CreditCard size={24} /></div>
                            <h3 className="text-2xl font-bold text-slate-900">تأكيد رسوم الدفع الإلكتروني</h3>
                            <p className="text-slate-500">
                                هذه هي الرسوم الافتراضية في السعودية. هل هي صحيحة لمتجرك؟
                            </p>
                             <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                    <span className="text-xs font-bold text-slate-400 block mb-1">مدى</span>
                                    <span className="text-lg font-mono font-bold text-slate-900 dir-ltr">1.0% + 1 SAR</span>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                    <span className="text-xs font-bold text-slate-400 block mb-1">فيزا / ماستر</span>
                                    <span className="text-lg font-mono font-bold text-slate-900 dir-ltr">2.2% + 1 SAR</span>
                                </div>
                             </div>
                        </div>
                    )}

                    {/* STEP 3: SHIPPING */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-4"><Truck size={24} /></div>
                            <h3 className="text-2xl font-bold text-slate-900">كم تدفع لشركات الشحن؟</h3>
                            <p className="text-slate-500">
                                أدخل سعر البوليصة (شامل الضريبة) الذي تدفعه أنت، وليس السعر للعميل.
                            </p>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <span className="w-24 font-bold text-slate-700">أرامكس</span>
                                    <Input className="w-32 font-mono font-bold" defaultValue="24" />
                                    <span className="text-sm text-slate-400">ر.س</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="w-24 font-bold text-slate-700">سمسا</span>
                                    <Input className="w-32 font-mono font-bold" defaultValue="28" />
                                    <span className="text-sm text-slate-400">ر.س</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: PACKAGING */}
                    {step === 4 && (
                        <div className="space-y-6">
                            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-4"><Target size={24} /></div>
                            <h3 className="text-2xl font-bold text-slate-900">تكلفة التغليف التقريبية</h3>
                            <p className="text-slate-500">
                                كم يكلفك تغليف الطلب الواحد في المتوسط (كرتون + استيكر + تغليف)؟
                            </p>
                            <div className="flex items-center gap-3">
                                <Input className="w-40 h-14 text-2xl font-mono font-bold text-center" defaultValue="3.50" autoFocus />
                                <span className="text-xl font-bold text-slate-400">ر.س / طلب</span>
                            </div>
                        </div>
                    )}

                    {/* STEP 5: FIXED */}
                    {step === 5 && (
                        <div className="space-y-6">
                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 mb-4"><Building2 size={24} /></div>
                            <h3 className="text-2xl font-bold text-slate-900">هل لديك مصاريف ثابتة؟</h3>
                            <p className="text-slate-500">
                                مثل الرواتب، إيجار المستودع، أو اشتراكات البرامج الشهرية.
                            </p>
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center">
                                <p className="text-sm text-slate-400 mb-4">يمكنك تخطي هذه الخطوة وإضافتها لاحقاً</p>
                                <Button variant="outline" className="w-full bg-white">إضافة مصروف ثابت</Button>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 pt-8 mt-4 border-t border-slate-100">
                        {step > 1 && (
                            <Button variant="ghost" onClick={() => setStep(step - 1)}>
                                <ArrowRight className="ml-2" size={16} /> السابق
                            </Button>
                        )}
                        <Button className="flex-1 bg-slate-900 h-12 text-base font-bold shadow-lg shadow-slate-900/10" onClick={nextStep}>
                            {step === totalSteps ? 'إنهاء الإعداد' : 'حفظ واستمرار'}
                            {step !== totalSteps && <ArrowLeft className="mr-2" size={16} />}
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    );
};

// ==================================================================================
// 3) DECISION ONBOARDING (VALUE REVEAL)
// ==================================================================================
const DecisionOnboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

            <div className="relative z-10 w-full max-w-2xl animate-in fade-in zoom-in-95 duration-700">
                <div className="text-center mb-8">
                    <span className="inline-flex items-center gap-2 bg-white/10 text-white/80 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-white/10">
                        <BrainCircuit size={14} />
                        تم تحليل بياناتك بنجاح
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">أول قرار لمتجرك</h1>
                    <p className="text-slate-400 text-lg max-w-md mx-auto">
                        بناءً على الأرقام التي أدخلتها، هذا هو أهم شيء يجب أن تركز عليه اليوم.
                    </p>
                </div>

                {/* THE CARD */}
                <div className="bg-white rounded-2xl p-1 shadow-2xl">
                    <div className="bg-slate-50 rounded-xl p-8 border border-slate-100">
                         <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 shrink-0">
                                <Target size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">الإعلانات تستهلك 40% من الدخل</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    بناءً على التكاليف التي أدخلتها، حملاتك الإعلانية الحالية غير مربحة.
                                    صافي ربحك الحالي هو <span className="font-bold text-rose-600">-250 ر.س</span>.
                                </p>
                            </div>
                         </div>

                         <div className="bg-white border-r-4 border-r-slate-900 p-6 rounded-lg shadow-sm">
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">الإجراء المقترح</p>
                             <p className="text-lg font-bold text-slate-900">
                                 أوقف الحملات الإعلانية للمنتجات ذات الهامش المنخفض فوراً.
                             </p>
                         </div>

                         <div className="mt-8 pt-6 border-t border-slate-200 flex justify-center">
                             <Button 
                                size="lg" 
                                className="w-full md:w-auto h-14 px-8 text-lg font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xl"
                                onClick={onComplete}
                             >
                                خذني للمكان الصحيح
                                <ArrowLeft className="mr-2" size={20} />
                             </Button>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;