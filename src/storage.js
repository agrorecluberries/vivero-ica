const PREFIX = "vivero:";
function get(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return Promise.resolve(null);
    return Promise.resolve({ key, value: raw, shared: false });
  } catch (e) { return Promise.reject(e); }
}
function set(key, value) {
  try {
    localStorage.setItem(PREFIX + key, value);
    return Promise.resolve({ key, value, shared: false });
  } catch (e) { return Promise.reject(e); }
}
export const storage = { get, set };
