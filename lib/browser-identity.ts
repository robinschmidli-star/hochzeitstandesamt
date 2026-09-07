export function browserId(key: "hs_session" | "hs_visitor", storage: Storage) {
  const current = storage.getItem(key);
  if (current) return current;
  const value = crypto.randomUUID();
  storage.setItem(key, value);
  return value;
}
