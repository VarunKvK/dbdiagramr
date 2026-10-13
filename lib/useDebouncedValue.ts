import { useEffect, useState } from "react";

/**
 * Debounce a fast-changing value (typing, pasting) so heavy synchronous
 * work (parse, format, diff) runs at most once per `delay` instead of on
 * every keystroke. Default 200ms keeps tools feeling live without jank
 * on large inputs.
 */
export function useDebouncedValue<T>(value: T, delay = 200): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
