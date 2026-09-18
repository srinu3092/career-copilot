/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SideNavBar } from './components/Navigation/SideNavBar.tsx';
import { TopAppBar } from './components/Navigation/TopAppBar.tsx';
import { ResumeAnalyzerView } from './components/ResumeAnalyzer/ResumeAnalyzerView.tsx';
import { MockInterviewView } from './components/MockInterview/MockInterviewView.tsx';
import { MultiAgentChatView } from './components/MultiAgentChat/MultiAgentChatView.tsx';
import { DashboardView } from './components/Dashboard/DashboardView.tsx';
import { KnowledgeBaseView } from './components/KnowledgeBase/KnowledgeBaseView.tsx';
import { SettingsView } from './components/Settings/SettingsView.tsx';
import { ProUpgradeModal } from './components/Modals/ProUpgradeModal.tsx';
import { SupportModal } from './components/Modals/SupportModal.tsx';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('resume-analyzer');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [activeTargetRole, setActiveTargetRole] = useState('Senior Solutions Architect');

  const handleStartMockInterviewForRole = (role: string) => {
    setActiveTargetRole(role);
    setCurrentTab('mock-interview');
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] flex flex-col md:flex-row antialiased selection:bg-indigo-500 selection:text-white">
      {/* Side Navigation Bar */}
      <SideNavBar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isMobileOpen={isMobileNavOpen}
        setIsMobileOpen={setIsMobileNavOpen}
        onOpenUpgradeModal={() => setIsProModalOpen(true)}
        onOpenSupportModal={() => setIsSupportModalOpen(true)}
      />

      {/* Main Content Area (Offset by sidebar on desktop) */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Top App Bar */}
        <TopAppBar
          onOpenMobileMenu={() => setIsMobileNavOpen(true)}
          onOpenSettings={() => setCurrentTab('settings')}
          onOpenUpgradeModal={() => setIsProModalOpen(true)}
          activeRole={activeTargetRole}
        />

        {/* View Container */}
        <main className="flex-1 overflow-x-hidden">
          {currentTab === 'resume-analyzer' && (
            <ResumeAnalyzerView
              onStartMockInterviewForRole={handleStartMockInterviewForRole}
              onOpenUpgradeModal={() => setIsProModalOpen(true)}
            />
          )}

          {currentTab === 'mock-interview' && (
            <MockInterviewView
              initialRole={activeTargetRole}
              onOpenUpgradeModal={() => setIsProModalOpen(true)}
            />
          )}

          {currentTab === 'multi-agent-chat' && <MultiAgentChatView />}

          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigate={(tab) => setCurrentTab(tab)}
              onOpenUpgradeModal={() => setIsProModalOpen(true)}
            />
          )}

          {currentTab === 'knowledge-base' && <KnowledgeBaseView />}

          {currentTab === 'settings' && (
            <SettingsView onOpenUpgradeModal={() => setIsProModalOpen(true)} />
          )}
        </main>
      </div>

      {/* Pro Plan Upgrade Modal */}
      <ProUpgradeModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
      />

      {/* Support / FAQ Modal */}
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />
    </div>
  );
}
