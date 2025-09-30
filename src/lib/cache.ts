import { GAME_HISTORY_CACHE_TIME } from "@/constants";
import { unstable_cache } from "next/cache";

const CACHE_DURATION = GAME_HISTORY_CACHE_TIME; // 60 seconds for game history

type AnyFunction<Args extends unknown[] = unknown[], Return = unknown> = (
  ...args: Args
) => Promise<Return>;

export function withCache<T extends AnyFunction>(
  fn: T,
  key: string | ((...args: Parameters<T>) => string)
): T {
  const wrappedFn = async (
    ...args: Parameters<T>
  ): Promise<Awaited<ReturnType<T>>> => {
    const cacheKey = typeof key === "function" ? key(...args) : key;
    const cachedFn = unstable_cache(
      async () => fn(...(args as Parameters<T>)),
      [cacheKey],
      { revalidate: CACHE_DURATION }
    );
    return cachedFn() as Awaited<ReturnType<T>>;
  };

  return wrappedFn as T;
}
