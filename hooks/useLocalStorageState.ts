import { useEffect, useState } from 'react';

const safelyParse = <T,>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export const useLocalStorageState = <T,>(key: string, initialValue: T) => {
  const [state, setState] = useState<T>(() =>
    typeof window === 'undefined' ? initialValue : safelyParse(localStorage.getItem(key), initialValue)
  );

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState] as const;
};
