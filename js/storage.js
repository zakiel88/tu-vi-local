// storage.js — IndexedDB save/load list charts.
//
// Schema:
//   DB: tuvi-local
//   Store: charts
//     keyPath: id (auto increment)
//     fields: id, label, savedAt, chart (full JSON), input (denormalized for list view)

const DB_NAME = "tuvi-local";
const STORE = "charts";
const VERSION = 1;

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
        store.createIndex("savedAt", "savedAt");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx(mode) {
  return openDB().then(db => db.transaction(STORE, mode).objectStore(STORE));
}

/**
 * Save 1 chart vào IndexedDB.
 * @returns {Promise<number>} id mới
 */
export async function saveChart(chart, label) {
  const store = await tx("readwrite");
  const record = {
    label: label || chart.input.tenLabel || `${chart.lich.canChi.nam.can} ${chart.lich.canChi.nam.chi}`,
    savedAt: new Date().toISOString(),
    chart,
    input: { ...chart.input },
  };
  return new Promise((resolve, reject) => {
    const req = store.add(record);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * List tất cả charts đã lưu.
 * @returns {Promise<Array>}
 */
export async function listCharts() {
  const store = await tx("readonly");
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => {
      const records = req.result.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
      resolve(records);
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Load 1 chart theo id.
 */
export async function loadChart(id) {
  const store = await tx("readonly");
  return new Promise((resolve, reject) => {
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Xoá 1 chart.
 */
export async function deleteChart(id) {
  const store = await tx("readwrite");
  return new Promise((resolve, reject) => {
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Update label của chart đã lưu.
 */
export async function renameChart(id, newLabel) {
  const store = await tx("readwrite");
  return new Promise((resolve, reject) => {
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const rec = getReq.result;
      if (!rec) return reject(new Error("Chart không tồn tại"));
      rec.label = newLabel;
      const putReq = store.put(rec);
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}
