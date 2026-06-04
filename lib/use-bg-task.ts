"use client";

import { useEffect, useReducer, useCallback } from "react";
import { bgStore, type BgTask } from "./bg-store";

export function useBgTask<T = unknown>(key: string) {
  const [, tick] = useReducer((x: number) => x + 1, 0);

  useEffect(() => bgStore.subscribe(tick), []);

  const task = bgStore.get(key) as (BgTask & { result?: T }) | undefined;

  const run = useCallback(
    (label: string, fn: () => Promise<T>) => {
      bgStore.run<T>(key, label, fn);
    },
    [key]
  );

  const clear = useCallback(() => bgStore.clear(key), [key]);

  return {
    task,
    run,
    clear,
    status: task?.status,
    result: task?.result as T | undefined,
    error: task?.error,
    isRunning: task?.status === "running",
    isDone: task?.status === "done",
  };
}
