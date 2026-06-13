import React from 'react';
import { Book, Home, LayoutTemplate, Plug, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BrandWordmark } from '../icons/BrandWordmark';
import { SidebarFooter } from './SidebarFooter';
import { GithubCard } from './GithubCard';
import { SidebarItem } from '../ui/SidebarItem';

type HomeSidebarTab = 'home' | 'templates' | 'settings' | 'mcp';

interface NavigationItem {
  icon: React.ReactNode;
  label: string;
  tab?: HomeSidebarTab;
  testId: string;
  to?: string;
}

interface HomeSidebarProps {
  activeTab: HomeSidebarTab;
  onTabChange: (tab: HomeSidebarTab) => void;
}

export function HomeSidebar({
  activeTab,
  onTabChange,
}: HomeSidebarProps): React.ReactElement {
  const { t } = useTranslation();
  const navigationItems: NavigationItem[] = [
    {
      icon: <Home className="w-4 h-4" />,
      label: t('nav.home', 'Home'),
      tab: 'home',
      testId: 'sidebar-home',
    },
    {
      icon: <LayoutTemplate className="w-4 h-4" />,
      label: t('nav.templates', 'Templates'),
      tab: 'templates',
      testId: 'sidebar-templates',
    },
    {
      icon: <Plug className="w-4 h-4" />,
      label: t('nav.mcp', 'MCP'),
      tab: 'mcp',
      testId: 'sidebar-mcp',
    },
    {
      icon: <Settings className="w-4 h-4" />,
      label: t('nav.settings', 'Settings'),
      tab: 'settings',
      testId: 'sidebar-settings',
    },
    {
      icon: <Book className="w-4 h-4" />,
      label: t('nav.documentation', 'Documentation'),
      testId: 'sidebar-docs',
      to: 'https://docs.aispaceflow.com',
    },
  ];

  return (
    <aside className="sticky top-0 z-20 flex w-full flex-col border-b border-[var(--color-brand-border)] bg-[var(--brand-sidebar)] md:fixed md:inset-y-0 md:left-0 md:w-64 md:border-b-0 md:border-r">
      <div className="flex h-20 items-center justify-center border-b border-[var(--color-brand-border)] px-4">
        <BrandWordmark className="h-16 w-auto max-w-full" />
      </div>

      <div className="flex gap-2 overflow-x-auto p-3 md:block md:flex-1 md:space-y-5 md:overflow-y-auto">
        <div className="flex gap-2 md:block md:space-y-1">
          {navigationItems.map((item) => (
            <SidebarItem
              key={item.testId}
              icon={item.icon}
              isActive={item.tab ? activeTab === item.tab : false}
              onClick={item.tab ? () => onTabChange(item.tab) : undefined}
              to={item.to}
              testId={item.testId}
              className="min-w-fit md:min-w-0"
            >
              {item.label}
            </SidebarItem>
          ))}
        </div>
      </div>

      <div className="hidden md:mt-auto md:block">
        <GithubCard />
        <SidebarFooter />
      </div>
    </aside>
  );
}
