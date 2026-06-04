// Module-level singleton — persists across React renders and client-side navigation.
// Fetch promises continue running even when the originating component unmounts.

export type TaskStatus = "running" | "done" | "error";

export type BgTask = {
  key: string;
  label: string;
  status: TaskStatus;
  result?: unknown;
  error?: string;
  startedAt: number;
  finishedAt?: number;
};

type Listener = () => void;

class BgStore {
  private tasks = new Map<string, BgTask>();
  private listeners = new Set<Listener>();

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  get(key: string): BgTask | undefined {
    return this.tasks.get(key);
  }

  getRunning(): BgTask[] {
    return Array.from(this.tasks.values()).filter((t) => t.status === "running");
  }

  getAll(): BgTask[] {
    return Array.from(this.tasks.values());
  }

  clear(key: string): void {
    this.tasks.delete(key);
    this.notify();
  }

  run<T>(key: string, label: string, fn: () => Promise<T>): void {
    const task: BgTask = { key, label, status: "running", startedAt: Date.now() };
    this.tasks.set(key, task);
    this.notify();

    fn()
      .then((result) => {
        this.tasks.set(key, { ...task, status: "done", result, finishedAt: Date.now() });
        this.notify();
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Ошибка";
        this.tasks.set(key, { ...task, status: "error", error: msg, finishedAt: Date.now() });
        this.notify();
      });
  }
}

export const bgStore = new BgStore();
