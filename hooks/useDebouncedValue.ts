import { useCallback, useEffect, useRef, useState } from 'react';

export const useDebouncedValue = <T,>(value: T, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const timeoutRef = useRef<number>();

  useEffect(() => {
    if (debouncedValue === value) {
      setIsDebouncing(false);
      return;
    }

    setIsDebouncing(true);
    timeoutRef.current = window.setTimeout(() => {
      setDebouncedValue(value);
      setIsDebouncing(false);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, debouncedValue]);

  const flush = useCallback(
    (nextValue?: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setDebouncedValue(nextValue ?? value);
      setIsDebouncing(false);
    },
    [value]
  );

  return { debouncedValue, isDebouncing, flush };
};
