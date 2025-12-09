import { useState, useCallback } from 'react';
import { check, Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { useTranslation } from 'react-i18next';

export const useUpdater = () => {
  const { t } = useTranslation();
  const [isChecking, setIsChecking] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState<Update | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');

  const checkUpdate = useCallback(async () => {
    setIsChecking(true);
    setError(null);
    setStatus(t('toolbar.updateStatusChecking'));
    try {
      const update = await check();
      if (update) {
        setUpdateAvailable(update);
        setStatus(t('toolbar.updateStatusAvailable', { version: update.version }));
        return update;
      } else {
        setUpdateAvailable(null);
        setStatus(t('toolbar.updateStatusLatest'));
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || t('toolbar.updateStatusError', { error: 'Unknown' }));
      setStatus(t('toolbar.updateStatusError', { error: err.message || 'Unknown' }));
    } finally {
      setIsChecking(false);
    }
  }, [t]);

  const installUpdate = useCallback(async () => {
    if (!updateAvailable) return;
    setIsDownloading(true);
    setStatus(t('toolbar.updateStatusDownloading'));
    try {
      await updateAvailable.downloadAndInstall();
      setStatus(t('toolbar.updateStatusInstalled'));
      await relaunch();
    } catch (err: any) {
      console.error(err);
      setError(err.message || t('toolbar.updateStatusError', { error: 'Unknown' }));
      setStatus(t('toolbar.updateStatusError', { error: err.message || 'Unknown' }));
      setIsDownloading(false);
    }
  }, [updateAvailable, t]);

  return {
    isChecking,
    updateAvailable,
    isDownloading,
    error,
    status,
    checkUpdate,
    installUpdate,
  };
};
