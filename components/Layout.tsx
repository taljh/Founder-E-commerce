import React, { useState } from 'react';
import { useStore } from '../store';
import { 
  LayoutDashboard, 
  Wallet, 
  PackageSearch, 
  Settings2,
  FileBarChart,
  LogOut,
  Menu,
  BellRing,
  Search,
  X,
  Box,
  BrainCircuit,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { ViewState } from '../types';
import { Button } from './ui';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDemoMode, toggleDemoMode } = useStore();

  // --- FINAL LOCKED SIDEBAR (DO NOT CHANGE) ---
  const sidebarItems = [
    { id: 'HOME', label: 'الرئيسية', icon: LayoutDashboard, desc: 'نظرة عامة' },
    { id: 'ORDERS', label: 'الطلبات', icon: PackageSearch, desc: 'إدارة المبيعات' },
    { id: 'FINANCE', label: 'المالية', icon: Wallet, desc: 'الأرباح والسيولة' },
    { id: 'COSTS', label: 'التكاليف', icon: Settings2, desc: 'ضبط الرسوم' },
    { id: 'PRODUCTS', label: 'المنتجات', icon: Box, desc: 'المخزون والتسعير' },
    { id: 'REPORTS', label: 'التقارير', icon: FileBarChart, desc: 'التحليل المتقدم' },
    { id: 'CEO', label: 'CEO المتجر', icon: BrainCircuit, isBeta: true, desc: 'الذكاء الاصطناعي' },
  ];

  const activeItem = sidebarItems.find(i => i.id === currentView);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-l border-slate-200 h-screen sticky top-0 z-50">
        
        {/* Brand Header */}
        <div className="h-24 flex items-center px-8 border-b border-transparent">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold ml-4 shadow-xl shadow-slate-200">
            F
          </div>
          <div className="flex flex-col">
            <h1 className="text-slate-900 font-bold tracking-tight text-xl leading-none">Founder</h1>
            <span className="text-[10px] text-slate-400 font-semibold tracking-[0.2em] uppercase mt-1.5">OS v1.0</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-8 px-4 space-y-1 overflow-y-auto no-scrollbar">
          {sidebarItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id as ViewState)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-slate-50 text-slate-900 shadow-sm ring-1 ring-slate-200' 
                    : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm'
                }`}
              >
                {/* Active Indicator */}
                {isActive && <div className="absolute right-0 top-3 bottom-3 w-1 bg-slate-900 rounded-l-full"></div>}
                
                <item.icon 
                  size={22} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className={isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'} 
                />
                
                {item.label}
                
                {item.isBeta && (
                  <span className="mr-auto text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold border border-indigo-100">
                    تجريبي
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer: Demo Toggle & Profile */}
        <div className="p-6 border-t border-slate-100 mt-auto space-y-4">
          
          {/* Demo Toggle */}
          <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold text-slate-500">وضع التجربة</span>
              <button onClick={toggleDemoMode} className={`transition-colors ${isDemoMode ? 'text-indigo-600' : 'text-slate-300'}`}>
                  {isDemoMode ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
              </button>
          </div>

          {/* Profile */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer hover:border-slate-300 transition-colors group">
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 shadow-sm">
              MH
            </div>
            <div className="flex-1 min-w-0 text-right">
              <p className="text-sm font-bold text-slate-900 truncate">متجر السعادة</p>
              <p className="text-[10px] text-slate-500 truncate group-hover:text-indigo-600 transition-colors">باقة النمو (Pro)</p>
            </div>
            <LogOut size={16} className="text-slate-400 hover:text-rose-500 transition-colors" />
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* Header (Desktop: Shows Title / Mobile: Shows Brand) */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-6 sticky top-0 z-40">
           
           {/* Mobile Brand */}
           <div className="flex items-center gap-3 lg:hidden">
              <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold">F</div>
           </div>

           {/* Desktop Title (Fills the Empty Space) */}
           <div className="hidden lg:flex flex-col justify-center h-full">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-none">{activeItem?.label}</h2>
              <span className="text-xs text-slate-400 mt-1 font-medium">{activeItem?.desc}</span>
           </div>

           {/* Actions */}
           <div className="flex items-center gap-3">
              {isDemoMode && (
                  <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                      نسخة تجريبية
                  </span>
              )}
              <Button size="icon" variant="ghost" className="text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full">
                 <Search size={20} />
              </Button>
              <Button size="icon" variant="ghost" className="relative text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full">
                 <BellRing size={20} />
                 <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              </Button>
           </div>
        </header>

        {/* Viewport */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-8 pb-32 lg:pb-12 scroll-smooth">
           <div className="max-w-6xl mx-auto">
             {children}
           </div>
        </main>
      </div>
      
      {/* --- MOBILE NAV (LOCKED) --- */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50 pb-safe shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)]">
         {[
           { id: 'HOME', icon: LayoutDashboard, label: 'الرئيسية' },
           { id: 'ORDERS', icon: PackageSearch, label: 'الطلبات' },
           { id: 'FINANCE', icon: Wallet, label: 'المالية' }
         ].map((item) => (
            <button 
              key={item.id}
              onClick={() => { onViewChange(item.id as ViewState); setMobileMenuOpen(false); }}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${currentView === item.id ? 'text-slate-900' : 'text-slate-400'}`}
            >
               <item.icon size={26} strokeWidth={currentView === item.id ? 2.5 : 2} />
               <span className="text-[10px] font-bold">{item.label}</span>
            </button>
         ))}

         <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${
              mobileMenuOpen ? 'text-slate-900' : 'text-slate-400'
            }`}
         >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            <span className="text-[10px] font-bold">{mobileMenuOpen ? 'إغلاق' : 'المزيد'}</span>
         </button>
      </nav>

      {/* --- MOBILE MENU OVERLAY --- */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setMobileMenuOpen(false)}>
           <div className="absolute bottom-[90px] left-4 right-4 bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300" onClick={e => e.stopPropagation()}>
              <div className="p-4 grid grid-cols-2 gap-3">
                 {[
                   { id: 'COSTS', icon: Settings2, label: 'التكاليف' },
                   { id: 'PRODUCTS', icon: Box, label: 'المنتجات' },
                   { id: 'REPORTS', icon: FileBarChart, label: 'التقارير' },
                   { id: 'CEO', icon: BrainCircuit, label: 'CEO المتجر', special: true },
                 ].map((item) => (
                   <button 
                      key={item.id}
                      onClick={() => { onViewChange(item.id as ViewState); setMobileMenuOpen(false); }} 
                      className={`flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all ${
                        item.special 
                        ? 'bg-slate-900 text-white border-slate-900' 
                        : 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100'
                      }`}
                   >
                      <item.icon size={28} className={item.special ? 'text-indigo-400' : 'text-slate-500'} />
                      <span className="text-xs font-bold">{item.label}</span>
                   </button>
                 ))}
                 
                 {/* Mobile Demo Toggle */}
                 <button 
                    onClick={toggleDemoMode}
                    className="col-span-2 flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl"
                 >
                     <span className="text-xs font-bold text-slate-500">وضع التجربة (Demo)</span>
                     <div className={`${isDemoMode ? 'text-indigo-600' : 'text-slate-300'}`}>
                         {isDemoMode ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                     </div>
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default Layout;