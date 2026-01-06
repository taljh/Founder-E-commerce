import React, { useState } from 'react';
import { useStore } from '../store';
import { 
  Store, 
  Link, 
  CheckCircle2, 
  RefreshCw, 
  X, 
  ShieldCheck, 
  ArrowRight,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { Button, Card, Progress } from './ui';

const SallaConnect: React.FC = () => {
  const { isSallaConnected, connectSalla, disconnectSalla, lastSyncTime, syncSalla } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    // Simulate API call delay
    setTimeout(() => {
      connectSalla();
      setIsConnecting(false);
      setIsOpen(false);
    }, 2000);
  };

  const handleSync = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSyncing(true);
    setTimeout(() => {
      syncSalla();
      setIsSyncing(false);
    }, 1500);
  };

  return (
    <>
      {/* SIDEBAR TRIGGER WIDGET */}
      <div 
        onClick={() => setIsOpen(true)}
        className={`mx-4 mb-4 rounded-xl p-4 cursor-pointer transition-all duration-300 border group ${
          isSallaConnected 
            ? 'bg-teal-50 border-teal-200 hover:border-teal-300' 
            : 'bg-slate-900 border-slate-800 text-white hover:bg-slate-800 shadow-lg'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
             isSallaConnected ? 'bg-teal-100 text-teal-600' : 'bg-white/10 text-white'
          }`}>
             {isSallaConnected ? <CheckCircle2 size={20} /> : <Store size={20} />}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-bold truncate ${isSallaConnected ? 'text-teal-900' : 'text-white'}`}>
              {isSallaConnected ? 'متجر الهدايا' : 'ربط متجر سلة'}
            </h4>
            <p className={`text-[10px] truncate mt-0.5 ${isSallaConnected ? 'text-teal-600' : 'text-slate-400'}`}>
              {isSallaConnected ? `آخر تحديث: ${lastSyncTime}` : 'مزامنة الطلبات تلقائياً'}
            </p>
          </div>
          {isSallaConnected && (
             <Button 
                size="icon" 
                variant="ghost" 
                className={`h-8 w-8 rounded-full hover:bg-teal-100 text-teal-600 ${isSyncing ? 'animate-spin' : ''}`}
                onClick={handleSync}
             >
                <RefreshCw size={14} />
             </Button>
          )}
          {!isSallaConnected && (
             <ArrowRight size={16} className="text-slate-500 group-hover:text-white transition-colors" />
          )}
        </div>
      </div>

      {/* CONNECTION MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-md bg-white shadow-2xl border-0 overflow-hidden relative">
            <Button 
                size="icon" 
                variant="ghost" 
                className="absolute left-4 top-4 text-slate-400 hover:text-slate-600"
                onClick={() => setIsOpen(false)}
            >
                <X size={20} />
            </Button>

            {!isSallaConnected ? (
              // DISCONNECTED STATE UI
              <div className="p-8">
                <div className="w-16 h-16 bg-[#B6E648]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#7EB800]">
                    <Store size={36} />
                </div>
                
                <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">ربط متجرك في سلة</h2>
                <p className="text-center text-muted-foreground text-sm mb-8 px-4">
                  اسمح لـ "مؤسس المتاجر" بالوصول إلى بيانات الطلبات والمنتجات لحساب أرباحك بدقة.
                </p>

                <div className="bg-slate-50 rounded-xl p-4 mb-8 space-y-3 border border-slate-100">
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                        <span>قراءة تفاصيل الطلبات والمبيعات</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                        <span>قراءة المنتجات والمخزون</span>
                    </div>
                     <div className="flex items-center gap-3 text-sm text-slate-700">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                        <span>قراءة بيانات العملاء (للتحليل فقط)</span>
                    </div>
                </div>

                <Button 
                    className="w-full h-12 text-base font-bold bg-[#7EB800] hover:bg-[#6da100] text-white shadow-lg shadow-[#7EB800]/20 gap-2"
                    onClick={handleConnect}
                    disabled={isConnecting}
                >
                    {isConnecting ? (
                        <>جاري الربط...</>
                    ) : (
                        <>
                           <Link size={18} />
                           موافقة وربط المتجر
                        </>
                    )}
                </Button>
                
                <p className="text-[10px] text-center text-slate-400 mt-4 flex items-center justify-center gap-1">
                    <ShieldCheck size={12} />
                    اتصال آمن ومشفر 100%
                </p>
              </div>
            ) : (
              // CONNECTED STATE UI
              <div className="p-8">
                 <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6 text-teal-600 ring-8 ring-teal-50/50">
                    <CheckCircle2 size={36} />
                </div>

                <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">المتجر متصل بنجاح</h2>
                <div className="flex justify-center mb-8">
                     <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-bold border border-teal-100">
                        salla.sa/gift-shop
                     </span>
                </div>

                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between text-sm mb-2 font-medium">
                            <span className="text-slate-600">حالة المزامنة</span>
                            <span className="text-teal-600">ممتازة</span>
                        </div>
                        <Progress value={100} className="h-2" indicatorColor="bg-teal-500" />
                        <p className="text-xs text-slate-400 mt-2 text-left dir-ltr">Last sync: {lastSyncTime}</p>
                    </div>

                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex gap-3 items-start">
                        <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800 leading-relaxed">
                            لضمان دقة الحسابات، تأكد من تحديث "قواعد التكاليف" إذا قمت بتغيير شركات الشحن في سلة.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button variant="outline" className="flex-1 border-destructive/20 text-destructive hover:bg-destructive/5 hover:text-destructive" onClick={disconnectSalla}>
                            <LogOut size={16} className="ml-2" />
                            إلغاء الربط
                        </Button>
                        <Button className="flex-1 bg-slate-900 text-white hover:bg-slate-800" onClick={() => setIsOpen(false)}>
                            تم
                        </Button>
                    </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  );
};

export default SallaConnect;