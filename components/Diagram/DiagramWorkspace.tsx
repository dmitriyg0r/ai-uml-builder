import React, { useState, useRef, useEffect, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { LoadingSpinner } from '../LoadingSpinner';
import { 
  CopyIcon, DownloadIcon, TrashIcon, UserIcon, RefreshIcon, 
  SettingsIcon,
  SunIcon,
  MoonIcon
} from '../Icons';

// Lazy load MermaidRenderer
const MermaidRenderer = React.lazy(() => import('../MermaidRenderer'));

interface DiagramWorkspaceProps {
  isSidebarOpen: boolean;
  onOpenSidebar: () => void;
  renderedCode: string;
  isDebouncing: boolean;
  hasDiagram: boolean;
  canReset: boolean;
  onCopy: () => void;
  copyState: 'idle' | 'copied';
  onExport: (format: 'svg' | 'png') => void;
  onReset: () => void;
  user: any;
  onShowAuth: () => void;
  onSignOut: () => void;
  onError: (err: string | null) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  updater: {
    isChecking: boolean;
    updateAvailable: boolean;
    isDownloading: boolean;
    status: string | null;
    checkUpdate: () => void;
    installUpdate: () => void;
  };
}

export const DiagramWorkspace: React.FC<DiagramWorkspaceProps> = ({
  isSidebarOpen,
  onOpenSidebar,
  renderedCode,
  isDebouncing,
  hasDiagram,
  canReset,
  onCopy,
  copyState,
  onExport,
  onReset,
  user,
  onShowAuth,
  onSignOut,
  onError,
  theme,
  onToggleTheme,
  updater,
}) => {
  const { t, i18n } = useTranslation();
  
  // Local UI state
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [exportMenuPos, setExportMenuPos] = useState({ top: 0, left: 0, width: 192 });
  const isDarkTheme = theme === 'dark';

  const exportTriggerRef = useRef<HTMLDivElement>(null);
  const exportButtonRef = useRef<HTMLButtonElement>(null);
  const exportMenuPortalRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const languages = React.useMemo(
    () => [
      { code: 'en', label: t('languages.en') },
      { code: 'ru', label: t('languages.ru') },
    ],
    [t]
  );

  const handleLanguageChange = (lng: string) => {
    if (i18n.language === lng) return;
    i18n.changeLanguage(lng);
  };

  const toggleExportMenu = () => {
    if (!hasDiagram) return;
    if (!showExportMenu) {
      const rect = exportButtonRef.current?.getBoundingClientRect();
      const menuWidth = 192;
      const gap = 8;
      setExportMenuPos({
        top: (rect?.bottom || 0) + gap,
        left: (rect ? rect.right - menuWidth : 0),
        width: menuWidth,
      });
    }
    setShowExportMenu((prev) => !prev);
  };

  // Click outside handlers
  useEffect(() => {
    if (!showExportMenu) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const insideTrigger = exportTriggerRef.current?.contains(target);
      const insideMenu = exportMenuPortalRef.current?.contains(target);
      if (!insideTrigger && !insideMenu) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [showExportMenu]);

  useEffect(() => {
    if (!isProfileMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const insideButton = profileButtonRef.current?.contains(target);
      const insideMenu = profileMenuRef.current?.contains(target);
      if (!insideButton && !insideMenu) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [isProfileMenuOpen]);

  useEffect(() => {
    if (!isProfileMenuOpen) setIsSettingsOpen(false);
  }, [isProfileMenuOpen]);

  const isUpdaterBusy = updater.isChecking || updater.isDownloading;

  return (
    <div className="flex-1 bg-slate-50 relative flex flex-col h-full overflow-visible">
      {/* Toolbar */}
      <div className="h-16 border-b border-slate-200 bg-white/60 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10 overflow-visible">
        <div className="flex items-center space-x-4">
          {!isSidebarOpen && (
            <button
              onClick={onOpenSidebar}
              className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-blue-300 hover:text-blue-600 transition-colors"
              title={t('toolbar.showPanel')}
            >
              {t('toolbar.openPanel')}
            </button>
          )}
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">{t('toolbar.canvas')}</span>
          {isDebouncing && (
            <div className="flex items-center gap-2 text-xs text-blue-500 animate-pulse">
              <RefreshIcon />
              <span>{t('toolbar.syncing')}</span>
            </div>
          )}
          {!isDebouncing && hasDiagram && (
            <div className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full">
              {t('toolbar.autoUpdate')}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 relative" ref={exportTriggerRef}>
          <button
            onClick={onCopy}
            disabled={!hasDiagram}
            className="px-3 py-2 text-slate-600 hover:text-blue-600 bg-white border border-slate-200 rounded-lg hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
            title={t('toolbar.copyTitle')}
          >
            <CopyIcon />
            <span className="text-sm font-medium">
              {copyState === 'copied' ? t('toolbar.copied') : t('toolbar.copy')}
            </span>
          </button>

          <div className="flex items-center space-x-2 relative">
            <button
              ref={exportButtonRef}
              onClick={toggleExportMenu}
              disabled={!hasDiagram}
              className="px-3 py-2 text-slate-600 hover:text-blue-600 bg-white border border-slate-200 rounded-lg hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
              title={t('toolbar.exportTitle')}
            >
              <DownloadIcon />
              <span className="text-sm font-medium">{t('toolbar.export')}</span>
            </button>

            {showExportMenu &&
              createPortal(
                <div
                  ref={exportMenuPortalRef}
                  className="fixed bg-white rounded-lg shadow-xl border border-slate-100 z-[9999] py-1"
                  style={{
                    top: `${exportMenuPos.top}px`,
                    left: `${exportMenuPos.left}px`,
                    width: `${exportMenuPos.width}px`,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => { onExport('svg'); setShowExportMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-3 group"
                  >
                    <div className="w-8 h-6 flex items-center justify-center bg-slate-100 rounded text-[10px] font-mono text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 border border-slate-200">SVG</div>
                    <span>{t('toolbar.exportVector')}</span>
                  </button>
                  <button
                    onClick={() => { onExport('png'); setShowExportMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-3 group"
                  >
                    <div className="w-8 h-6 flex items-center justify-center bg-slate-100 rounded text-[10px] font-mono text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 border border-slate-200">PNG</div>
                    <span>{t('toolbar.exportImage')}</span>
                  </button>
                </div>,
                document.body
              )
            }
          </div>

          <button
            onClick={onReset}
            disabled={!canReset}
            className="px-3 py-2 text-slate-600 hover:text-red-600 bg-white border border-slate-200 rounded-lg hover:border-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
            title={t('toolbar.resetTitle')}
            aria-label={t('toolbar.resetTitle')}
          >
            <TrashIcon />
            <span className="text-sm font-medium">{t('toolbar.reset')}</span>
          </button>

          {/* Profile Button */}
          <div className="relative">
            {user ? (
              <button
                ref={profileButtonRef}
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center gap-2 shadow-sm"
                title={t('toolbar.profile')}
              >
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  <UserIcon />
                </div>
                <span className="font-medium">{user.email?.split('@')[0]}</span>
              </button>
            ) : (
              <button
                onClick={onShowAuth}
                className="px-3 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                title={t('toolbar.signIn')}
              >
                <UserIcon />
                <span className="text-sm font-medium">{t('toolbar.signIn')}</span>
              </button>
            )}

            {/* Profile Menu */}
            {user && isProfileMenuOpen && createPortal(
              <div
                ref={profileMenuRef}
                className="fixed bg-white rounded-lg shadow-xl border border-slate-200 z-[9999] min-w-[240px]"
                style={{
                  top: `${profileButtonRef.current?.getBoundingClientRect().bottom! + 8}px`,
                  right: `${window.innerWidth - profileButtonRef.current?.getBoundingClientRect().right!}px`,
                }}
              >
                {/* User Info */}
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-lg">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-800 truncate">{user.email?.split('@')[0]}</div>
                      <div className="text-xs text-slate-500 truncate">{user.email}</div>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button
                    onClick={() => setIsSettingsOpen((prev) => !prev)}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                  >
                    <SettingsIcon />
                    <span className="flex-1">{t('toolbar.settings')}</span>
                  </button>
                  {isSettingsOpen && (
                    <div className="px-4 pb-3 space-y-2">
                      <div className="text-xs text-slate-400">{t('settings.language')}</div>
                      <div className="flex flex-wrap gap-2">
                        {languages.map((lang) => {
                          const isActive = i18n.language.startsWith(lang.code);
                          return (
                            <button
                              key={lang.code}
                              onClick={() => handleLanguageChange(lang.code)}
                              className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${isActive
                                ? 'bg-blue-50 border-blue-200 text-blue-700'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-700'
                                }`}
                              aria-pressed={isActive}
                            >
                              {lang.label}
                            </button>
                          );
                        })}
                      </div>
                      <div className="text-[11px] text-slate-400">{t('settings.languageHint')}</div>
                      <div className="pt-2 space-y-2">
                        <div className="text-xs text-slate-400">{t('settings.theme')}</div>
                        <button
                          onClick={onToggleTheme}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-700 transition-colors bg-white"
                        >
                          <span className="w-6 h-6 flex items-center justify-center rounded-md bg-slate-100 text-slate-600">
                            {isDarkTheme ? <MoonIcon /> : <SunIcon />}
                          </span>
                          <span className="flex-1 text-left">
                            {isDarkTheme ? t('settings.themeDark') : t('settings.themeLight')}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="py-1 border-t border-slate-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (updater.updateAvailable) {
                        updater.installUpdate();
                      } else {
                        updater.checkUpdate();
                      }
                    }}
                    disabled={updater.isChecking || updater.isDownloading}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                  >
                    <div className={`w-5 h-5 flex items-center justify-center ${isUpdaterBusy ? 'text-blue-600' : ''}`}>
                      <RefreshIcon className={isUpdaterBusy ? 'animate-spin' : ''} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="truncate">{updater.updateAvailable ? t('toolbar.installUpdate') : t('toolbar.checkUpdates')}</div>
                      {updater.status && <div className="text-[10px] text-slate-400 truncate">{updater.status}</div>}
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onSignOut();
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-red-600 flex items-center gap-3 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                    <span>{t('toolbar.signOut')}</span>
                  </button>
                </div>
              </div>,
              document.body
            )}
          </div>
        </div>
      </div>

      {/* Diagram Container */}
      <div className="flex-1 overflow-hidden p-0 flex items-center justify-center relative" id="diagram-container">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
          style={{
            backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        ></div>

        <div className="w-full h-full relative z-10">
          <Suspense fallback={<div className="flex items-center justify-center h-full"><LoadingSpinner /></div>}>
            <MermaidRenderer
              code={renderedCode}
              onError={onError}
              theme={theme}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
};
