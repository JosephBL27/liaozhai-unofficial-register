import {
  useCallback,
  useMemo,
  useRef,
  useSyncExternalStore,
  type SetStateAction,
} from "react";

export const LOCAL_STORAGE_SYNC_EVENT = "liaozhai:local-storage";

interface LocalStorageSyncDetail {
  readonly key: string;
}

export interface UseLocalStorageOptions<T> {
  readonly serialize?: (value: T) => string;
  readonly deserialize?: (serialized: string) => T;
}

export type LocalStorageSetter<T> = (value: SetStateAction<T>) => void;

interface InitialSnapshot<T> {
  readonly key: string;
  readonly value: T;
  readonly serialized: string;
}

function defaultSerialize<T>(value: T): string {
  const serialized = JSON.stringify(value);
  if (serialized === undefined) {
    throw new TypeError("The local-storage value is not JSON serializable.");
  }
  return serialized;
}

function defaultDeserialize<T>(serialized: string): T {
  return JSON.parse(serialized) as T;
}

function browserStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * A JSON localStorage binding that is safe during SSR and synchronized across
 * tabs as well as between hook instances in the current document.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T),
  options: UseLocalStorageOptions<T> = {},
): readonly [T, LocalStorageSetter<T>] {
  const serialize = options.serialize ?? defaultSerialize<T>;
  const deserialize = options.deserialize ?? defaultDeserialize<T>;
  const initialSnapshot = useRef<InitialSnapshot<T> | null>(null);

  if (initialSnapshot.current === null || initialSnapshot.current.key !== key) {
    const value =
      typeof initialValue === "function"
        ? (initialValue as () => T)()
        : initialValue;
    initialSnapshot.current = {
      key,
      value,
      serialized: serialize(value),
    };
  }

  const initial = initialSnapshot.current;

  const getSnapshot = useCallback((): string => {
    const storage = browserStorage();
    if (!storage) return initial.serialized;

    try {
      return storage.getItem(key) ?? initial.serialized;
    } catch {
      return initial.serialized;
    }
  }, [initial.serialized, key]);

  const getServerSnapshot = useCallback(
    (): string => initial.serialized,
    [initial.serialized],
  );

  const subscribe = useCallback(
    (onStoreChange: () => void): (() => void) => {
      if (typeof window === "undefined") return () => undefined;

      const onStorage = (event: StorageEvent): void => {
        if (event.key === key || event.key === null) onStoreChange();
      };
      const onLocalStorageSync = (event: Event): void => {
        const detail = (event as CustomEvent<LocalStorageSyncDetail>).detail;
        if (!detail || detail.key === key) onStoreChange();
      };

      window.addEventListener("storage", onStorage);
      window.addEventListener(LOCAL_STORAGE_SYNC_EVENT, onLocalStorageSync);
      return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener(LOCAL_STORAGE_SYNC_EVENT, onLocalStorageSync);
      };
    },
    [key],
  );

  const serializedValue = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const value = useMemo((): T => {
    try {
      return deserialize(serializedValue);
    } catch {
      return initial.value;
    }
  }, [deserialize, initial.value, serializedValue]);

  const setValue = useCallback<LocalStorageSetter<T>>(
    (nextValue) => {
      const storage = browserStorage();
      if (!storage) return;

      let currentValue: T;
      try {
        currentValue = deserialize(storage.getItem(key) ?? initial.serialized);
      } catch {
        currentValue = initial.value;
      }

      const resolvedValue =
        typeof nextValue === "function"
          ? (nextValue as (previous: T) => T)(currentValue)
          : nextValue;

      try {
        storage.setItem(key, serialize(resolvedValue));
      } catch {
        return;
      }

      window.dispatchEvent(
        new CustomEvent<LocalStorageSyncDetail>(LOCAL_STORAGE_SYNC_EVENT, {
          detail: { key },
        }),
      );
    },
    [deserialize, initial.serialized, initial.value, key, serialize],
  );

  return [value, setValue] as const;
}

export default useLocalStorage;
