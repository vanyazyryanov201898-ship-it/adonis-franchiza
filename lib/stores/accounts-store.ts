const STORAGE_KEY = "adonis_accounts_v1";

export type Account = {
  id: string;
  platformId: string;
  name: string;
  handle: string;
  directionId: string | null; // null = общий для всех направлений
};

function genId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getAccounts(): Account[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveAccounts(accounts: Account[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

export function addAccount(data: Omit<Account, "id">): Account {
  const account: Account = { ...data, id: genId() };
  saveAccounts([...getAccounts(), account]);
  return account;
}

export function removeAccount(id: string): void {
  saveAccounts(getAccounts().filter((a) => a.id !== id));
}

export function getAccountsForDirection(directionId: string): Account[] {
  return getAccounts().filter(
    (a) => a.directionId === directionId || a.directionId === null
  );
}

export function getAccountsByPlatform(platformId: string): Account[] {
  return getAccounts().filter((a) => a.platformId === platformId);
}
