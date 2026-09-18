import React, { useState } from 'react';

interface TopAppBarProps {
  onOpenMobileMenu: () => void;
  onOpenSettings: () => void;
  onOpenUpgradeModal: () => void;
  onSearchQuery?: (q: string) => void;
  activeRole: string;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  onOpenMobileMenu,
  onOpenSettings,
  onOpenUpgradeModal,
  onSearchQuery,
  activeRole,
}) => {
  const [search, setSearch] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'ATS Scan Completed',
      desc: 'Overall match score 84/100 for Senior Solutions Architect role.',
      time: '10m ago',
      unread: true,
    },
    {
      id: '2',
      title: 'Mock Interview Feedback Ready',
      desc: 'STAR communication score scored 85% with Google Behavioral questions.',
      time: '1h ago',
      unread: true,
    },
    {
      id: '3',
      title: 'Salary Benchmark Updated',
      desc: 'L5 Solutions Architect salary range in Bay Area: $240k - $310k.',
      time: '1d ago',
      unread: false,
    },
  ]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    if (onSearchQuery) onSearchQuery(val);
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-white/85 backdrop-blur-xl border-b border-[#c7c4d8]/25 px-4 md:px-8 flex items-center justify-between shadow-xs">
      {/* Mobile Toggle + Brand */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 -ml-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
            CC
          </div>
          <span className="font-geist text-base font-bold text-[#131b2e]">Career Copilot</span>
        </div>
      </div>

      {/* Desktop Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search ATS keywords, interview questions, or tips..."
            className="w-full pl-10 pr-4 py-2 bg-[#f2f3ff] border border-transparent focus:border-indigo-300 focus:bg-white rounded-full text-xs font-normal text-[#131b2e] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Agent Active Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-50/80 border border-cyan-400/30 text-cyan-800 text-xs font-medium">
          <div className="relative flex items-center justify-center w-3 h-3">
            <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-40 pulse-ring"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </div>
          <span className="font-geist text-[11px]">AI Copilot Ready</span>
        </div>

        {/* Notification Button */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-[#eaedff]/60 rounded-full transition-colors cursor-pointer"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-3 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-geist text-sm font-semibold text-slate-900">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button
                  onClick={() =>
                    setNotifications(notifications.map((n) => ({ ...n, unread: false })))
                  }
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Mark all read
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 hover:bg-slate-50 transition-colors ${
                      n.unread ? 'bg-indigo-50/40' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-geist text-xs font-semibold text-slate-800">
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-[#eaedff]/60 rounded-full transition-colors cursor-pointer"
          title="Settings"
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
        </button>

        {/* User Profile Avatar with dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 pl-1 focus:outline-none group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-indigo-200 group-hover:border-indigo-400 transition-colors shadow-xs">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKBFS28sEBqnTNvJl5LuIOndyyGL7F-Q1OCmuGBF18rQXUnR9MTOJiGfgBFVRw-Wd-xhVUEJc42az_Vzpw6-ZpDv3tJaEFAWu5ypTjERJ9OG7nSMbcrxB1whAec_VoagxSjizBj_Qp-zgyc86nOfS7lMxz-WnkrjdpNs9t5jWd36dZi1WJcNMLRCeoloupkW37V8g3Td9XIKPlIGpBzM7-voPPCl-cBs3WGS8uqtD2AGfaDT6Uldyzag"
                alt="User profile"
                className="w-full h-full object-cover"
              />
            </div>
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="font-geist text-xs font-semibold text-slate-900">Alex Morgan</p>
                <p className="text-[11px] text-slate-500 truncate">alex.morgan@example.com</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-medium border border-indigo-100">
                  <span className="material-symbols-outlined text-[12px]">verified</span>
                  <span>Target: {activeRole}</span>
                </div>
              </div>

              <div className="py-1 text-xs text-slate-700">
                <button
                  onClick={() => {
                    onOpenSettings();
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px] text-slate-400">tune</span>
                  <span>Target Role Preferences</span>
                </button>
                <button
                  onClick={() => {
                    onOpenUpgradeModal();
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-indigo-600 font-medium flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">stars</span>
                  <span>Upgrade to Pro Plan</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
