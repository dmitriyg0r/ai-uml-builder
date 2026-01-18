import { useCallback, useEffect, useRef, useState } from 'react';

export const useDebouncedValue = <T,>(value: T, delay = 300) => { // Reduced default delay for better UX
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const valueRef = useRef(value);

  // Update ref when value changes
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    if (debouncedValue === value) {
      setIsDebouncing(false);
      return;
    }

    setIsDebouncing(true);

    // Clear previous timeout to prevent race conditions
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
      setIsDebouncing(false);
      timeoutRef.current = null;
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [value, delay, debouncedValue]);

  const flush = useCallback(
    (nextValue?: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setDebouncedValue(nextValue ?? valueRef.current);
      setIsDebouncing(false);
    },
    []
  );

  return { debouncedValue, isDebouncing, flush };
};
