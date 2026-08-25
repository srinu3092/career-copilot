import React from 'react';

interface SideNavBarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onOpenUpgradeModal: () => void;
  onOpenSupportModal: () => void;
}

export const SideNavBar: React.FC<SideNavBarProps> = ({
  currentTab,
  setCurrentTab,
  isMobileOpen,
  setIsMobileOpen,
  onOpenUpgradeModal,
  onOpenSupportModal,
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
    },
    {
      id: 'multi-agent-chat',
      label: 'Multi-Agent Chat',
      icon: 'smart_toy',
    },
    {
      id: 'resume-analyzer',
      label: 'Resume Analyzer',
      icon: 'analytics',
    },
    {
      id: 'knowledge-base',
      label: 'Knowledge Base',
      icon: 'database',
    },
    {
      id: 'mock-interview',
      label: 'Mock Interview',
      icon: 'record_voice_over',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'settings',
    },
  ];

  const handleNavClick = (id: string) => {
    setCurrentTab(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <nav
        className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-[#c7c4d8]/25 shadow-sm py-6 flex flex-col z-50 transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="px-6 mb-7 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <span className="material-symbols-outlined fill text-2xl">robot_2</span>
            </div>
            <div>
              <h1 className="font-geist text-[19px] font-bold text-[#131b2e] tracking-tight leading-tight">
                Career Copilot
              </h1>
              <p className="font-geist text-[11px] font-medium text-[#464555] tracking-wide">
                AI Career Strategist
              </p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1 text-slate-400 hover:text-slate-700"
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Quick New Analysis Action button */}
        <div className="px-4 mb-4">
          <button
            onClick={() => handleNavClick('resume-analyzer')}
            className="w-full py-2.5 px-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium text-xs rounded-lg border border-indigo-200/60 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>New Resume Scan</span>
          </button>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full mx-0 px-3.5 py-2.5 flex items-center gap-3 rounded-xl transition-all duration-150 ease-in-out text-sm font-medium text-left ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-200/50'
                    : 'text-[#464555] hover:text-[#131b2e] hover:bg-[#eaedff]/60'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    isActive ? 'fill text-white' : 'text-[#464555]'
                  }`}
                >
                  {item.icon}
                </span>
                <span className="font-geist">{item.label}</span>

                {item.id === 'resume-analyzer' && !isActive && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                )}
                {item.id === 'mock-interview' && !isActive && (
                  <span className="ml-auto text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">
                    LIVE
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Upgrade to Pro CTA */}
        <div className="px-4 mt-auto mb-4">
          <button
            onClick={onOpenUpgradeModal}
            className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-[#06B6D4] text-white font-geist text-sm py-2.5 px-4 rounded-xl shadow-sm hover:shadow-md hover:opacity-95 transition-all font-semibold flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:rotate-12 transition-transform">
              auto_awesome
            </span>
            <span>Upgrade to Pro</span>
          </button>
        </div>

        {/* Bottom utility links */}
        <div className="px-2 pt-3 border-t border-[#c7c4d8]/20 space-y-0.5">
          <button
            onClick={onOpenSupportModal}
            className="w-full text-[#464555] hover:text-[#131b2e] px-3.5 py-2 flex items-center gap-3 rounded-lg hover:bg-[#eaedff]/50 transition-colors text-xs font-medium"
          >
            <span className="material-symbols-outlined text-[18px]">contact_support</span>
            <span className="font-geist">Support & FAQ</span>
          </button>
          <button
            onClick={() => {
              if (window.confirm('Reset local mock data and session history?')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="w-full text-[#464555] hover:text-red-600 px-3.5 py-2 flex items-center gap-3 rounded-lg hover:bg-red-50 transition-colors text-xs font-medium"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span className="font-geist">Reset / Sign Out</span>
          </button>
        </div>
      </nav>
    </>
  );
};
