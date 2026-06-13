import React from 'react';
import { OpenFlowLogo } from '../icons/OpenFlowLogo';
import { BrandWordmark } from '../icons/BrandWordmark';
import { SaveStatusIndicator } from './SaveStatusIndicator';

interface BrandUIConfig {
  showBeta?: boolean;
}

interface TopNavBrandProps {
  appName: string;
  logoUrl: string | null;
  logoStyle: 'icon' | 'text' | 'both' | 'wide';
  ui: BrandUIConfig;
}

function shouldShowIconLogo(logoStyle: TopNavBrandProps['logoStyle']): boolean {
  return logoStyle === 'icon';
}

function shouldShowWordmark(logoStyle: TopNavBrandProps['logoStyle']): boolean {
  return logoStyle === 'text' || logoStyle === 'both';
}

export function TopNavBrand({
  logoUrl,
  logoStyle,
  ui,
}: TopNavBrandProps): React.ReactElement {
  const showPrivacyBadge = ui.showBeta !== false;
  const showIconLogo = shouldShowIconLogo(logoStyle);
  const showWordmark = shouldShowWordmark(logoStyle);

  return (
    <div className="flex min-w-0 items-center gap-2">
      {showIconLogo && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" />
          ) : (
            <OpenFlowLogo className="h-9 w-9" />
          )}
        </div>
      )}

      {logoStyle === 'wide' && (
        <div className="flex h-8 w-fit shrink-0 items-center justify-start overflow-hidden px-1 sm:max-w-[200px]">
          <div className="flex h-full items-center justify-start">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                className="h-[70%] w-auto max-w-full object-contain object-left"
              />
            ) : (
              <BrandWordmark className="h-[80%] w-auto max-w-full object-left" />
            )}
          </div>
        </div>
      )}

      {showWordmark && (
        <BrandWordmark className="h-7 w-auto max-w-[150px] shrink-0 sm:h-8 sm:max-w-[180px]" />
      )}

      <div className="ml-1 flex items-center">
        <SaveStatusIndicator showPrivacyMessage={showPrivacyBadge} />
      </div>
    </div>
  );
}
