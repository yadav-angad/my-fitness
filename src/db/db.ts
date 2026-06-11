import moment from "moment";
import { Expense } from "../global";

let db: IDBDatabase;
let version = 1;

export interface User {
  id: string;
  name: string;
  email?: string;
  dob?: string; // ISO date string yyyy-mm-dd
  gender?: 'male' | 'female' | 'other' | string;
  heightCm?: number;
  weightKg?: number;
}

export enum Stores {
  Users = 'users',
  Expenses = 'expenses',
}

export const initDB = (): Promise<boolean | IDBDatabase> => {
  return new Promise((resolve) => {
    // Open DB and ensure both stores exist. If a store is missing, perform a version upgrade to create it.
    const req = indexedDB.open('myDB');

    req.onsuccess = () => {
      db = req.result;
      version = db.version;

      // If both stores exist, resolve
      if (db.objectStoreNames.contains(Stores.Expenses) && db.objectStoreNames.contains(Stores.Users)) {
        resolve(db);
        return;
      }

      // Need to upgrade DB to create missing stores
      db.close();
      const newVersion = version + 1;
      const upgradeReq = indexedDB.open('myDB', newVersion);

      upgradeReq.onupgradeneeded = () => {
        const udb = upgradeReq.result;
        if (!udb.objectStoreNames.contains(Stores.Expenses)) {
          udb.createObjectStore(Stores.Expenses);
        }
        if (!udb.objectStoreNames.contains(Stores.Users)) {
          udb.createObjectStore(Stores.Users, { keyPath: 'id' });
        }
      };

      upgradeReq.onsuccess = () => {
        db = upgradeReq.result;
        version = db.version;
        resolve(db);
      };

      upgradeReq.onerror = () => {
        resolve(false);
      };
    };

    req.onerror = () => {
      resolve(false);
    };
  });
};

export const addData = async<T>(storeName: string, data: T): Promise<T | string | null> => {
  // Generic adder: for Expenses we append to the date-keyed array; for Users we expect data to have `id` and store directly.
  return new Promise(async (resolve) => {
    const req = indexedDB.open('myDB', version);

    req.onsuccess = async () => {
      db = req.result;

      // ensure store exists (create via version upgrade if needed)
      const ok = await ensureStoreExists(storeName as Stores);
      if (!ok) {
        resolve('Store not available');
        return;
      }

      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName as string);

      if (storeName === Stores.Expenses) {
        const key = moment().format('MM-DD-YYYY').toString();
        const existing = (await getData(Stores.Expenses, key).then(res => res as T[]) ) || [] as T[];
        const updatedData = [...existing, data];
        const putReq = store.put(updatedData, key);
        putReq.onsuccess = () => resolve(data);
        putReq.onerror = () => resolve(putReq.error?.message || 'Unknown error');
      } else if (storeName === Stores.Users) {
        // data must include id
        // @ts-ignore
        const putReq = store.put(data);
        putReq.onsuccess = () => resolve(data);
        putReq.onerror = () => resolve(putReq.error?.message || 'Unknown error');
      } else {
        // default: put without key
        const putReq = store.put(data);
        putReq.onsuccess = () => resolve(data);
        putReq.onerror = () => resolve(putReq.error?.message || 'Unknown error');
      }
    };

    req.onerror = () => {
      const error = req.error?.message;
      if (error) resolve(error);
      else resolve('Unknown error');
    };
  });
};

const ensureStoreExists = (storeName: Stores): Promise<boolean> => {
  return new Promise((resolve) => {
    const checkReq = indexedDB.open('myDB');
    checkReq.onsuccess = () => {
      const idb = checkReq.result;
      if (idb.objectStoreNames.contains(storeName)) {
        resolve(true);
        return;
      }
      // need to upgrade
      const newVersion = idb.version + 1;
      idb.close();
      const upgradeReq = indexedDB.open('myDB', newVersion);
      upgradeReq.onupgradeneeded = () => {
        const udb = upgradeReq.result;
        if (!udb.objectStoreNames.contains(storeName)) {
          if (storeName === Stores.Users) {
            udb.createObjectStore(Stores.Users, { keyPath: 'id' });
          } else {
            udb.createObjectStore(storeName);
          }
        }
      };
      upgradeReq.onsuccess = () => {
        upgradeReq.result.close();
        resolve(true);
      };
      upgradeReq.onerror = () => resolve(false);
    };
    checkReq.onerror = () => resolve(false);
  });
};

export const addUser = async (user: User): Promise<User | string | null> => {
  return addData<User>(Stores.Users, user);
};

export const getUser = async (id: string): Promise<User | null> => {
  return getData<User>(Stores.Users, id);
};

export const updateUser = async (id: string, data: Partial<User>): Promise<User | null> => {
  return updateData<User>(Stores.Users, id, data as User) as Promise<User | null>;
};

export const deleteUser = async (id: string): Promise<boolean> => {
  return deleteData(Stores.Users, id);
};

export const deleteData = (storeName: string, key: any): Promise<boolean> => {
  return new Promise((resolve) => {
    const req = indexedDB.open('myDB', version);

    req.onsuccess = async () => {
      console.log('request.onsuccess - deleteData', key);
      db = req.result;

      const ok = await ensureStoreExists(storeName as Stores);
      if (!ok) { resolve(false); return; }

      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.get(key).onsuccess = (event) => {
        console.log('Record to be deleted:', event);
      }
      const res = store.delete(key);
      res.onsuccess = () => {
        resolve(true);
      };
      res.onerror = () => {
        resolve(false);
      }
    };
  });
};

export const updateData = <T>(storeName: string, key: any, data: T): Promise<T | string | null> => {
  return new Promise((resolve) => {
    const req = indexedDB.open('myDB', version);

    req.onsuccess = async () => {
      console.log('request.onsuccess - updateData', key);
      db = req.result;

      const ok = await ensureStoreExists(storeName as Stores);
      if (!ok) { resolve(null); return; }

      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const res = store.get(key);
      res.onsuccess = () => {
        const newData = { ...res.result, ...data };
        store.put(newData);
        resolve(newData);
      };
      res.onerror = () => {
        resolve(null);
      }
    };
  });
};

export const getData = <T>(storeName: string, key: any): Promise<T | null> => {
  return new Promise((resolve) => {
    const req = indexedDB.open('myDB', version);

    req.onsuccess = async () => {
      console.log('request.onsuccess - getData', key);
      db = req.result;

      const ok = await ensureStoreExists(storeName as Stores);
      if (!ok) { resolve(null); return; }

      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const res = store.get(key);
      res.onsuccess = () => {
        resolve(res.result);
      };
      res.onerror = () => {
        resolve(null);
      }
    };
  });
};

export const getStoreData = <T>(
  storeName: Stores
): Promise<{ key: string; value: Expense[] }[]> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('myDB');

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
        const db = request?.result;

        // ensure store exists before trying to open cursor
        if (!db.objectStoreNames.contains(storeName)) {
          // create store via upgrade
          db.close();
          const upgradeReq = indexedDB.open('myDB', db.version + 1);
          upgradeReq.onupgradeneeded = () => {
            const udb = upgradeReq.result;
            if (!udb.objectStoreNames.contains(storeName)) {
              if (storeName === Stores.Users) udb.createObjectStore(Stores.Users, { keyPath: 'id' });
              else udb.createObjectStore(storeName);
            }
          };
          upgradeReq.onsuccess = () => {
            const ndb = upgradeReq.result;
            const tx = ndb.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);

            const result: { key: IDBValidKey; value: T }[] = [];

            store.openCursor().onsuccess = (e) => {
              const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;

              if (cursor) {
                result.push({
                  key: cursor.key,
                  value: cursor.value as T,
                });
                cursor.continue();
              }
            };

            tx.oncomplete = () => { ndb.close(); resolve(result); };
            tx.onerror = () => { ndb.close(); reject(tx.error); };
          };
          upgradeReq.onerror = () => reject(upgradeReq.error);
          return;
        }

        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);

      const result: { key: IDBValidKey; value: T }[] = [];

      store.openCursor().onsuccess = (e) => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;

        if (cursor) {
          result.push({
            key: cursor.key,
            value: cursor.value as T,
          });
          cursor.continue();
        }
      };

      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error);
    };
  });
};


export { };