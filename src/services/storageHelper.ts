/**
 * Storage Helper for prototype data persistence.
 * Initializes from seed data if not present in localStorage.
 */
export function getInitialData<T>(key: string, seedData: T): T {
  try {
    const item = localStorage.getItem(`krishi_${key}`);
    if (item) {
      return JSON.parse(item) as T;
    }
    // initialize in storage
    localStorage.setItem(`krishi_${key}`, JSON.stringify(seedData));
    return seedData;
  } catch (err) {
    console.warn(`Error reading localStorage for krishi_${key}:`, err);
    return seedData;
  }
}

export function saveStorageData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`krishi_${key}`, JSON.stringify(data));
  } catch (err) {
    console.warn(`Error writing localStorage for krishi_${key}:`, err);
  }
}
