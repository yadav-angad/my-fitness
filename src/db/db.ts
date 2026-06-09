import moment from "moment";
import { Expense } from "../global";

let request: IDBOpenDBRequest;
let db: IDBDatabase;
let version = 1;

export interface User {
  id: string;
  name: string;
  email: string;
}

export enum Stores {
  Users = 'users',
  Expenses = 'expenses',
}

export const initDB = (): Promise<boolean | IDBDatabase> => {
  return new Promise((resolve) => {
    request = indexedDB.open('myDB');

    // if the data object store doesn't exist, create it
    request.onupgradeneeded = () => {
      db = request?.result;

      if (!db.objectStoreNames.contains(Stores.Expenses)) {
        console.log('Creating expenses store');
        // db.createObjectStore(Stores.Expenses, { keyPath: 'id' });
        db.createObjectStore(Stores.Expenses);
      }
      // if (!db.objectStoreNames.contains(Stores.Users)) {
      //   console.log('Creating users store');
      //   db.createObjectStore(Stores.Users, { keyPath: 'id' });
      // }
      // no need to resolve here
    };

    request.onsuccess = (e) => {
      db = request?.result;
      // get current version and store it
      version = db.version;
      resolve(request?.result);
    };

    request.onerror = (e) => {
      resolve(false);
    };
  });
};

export const addData = async<T>(storeName: string, data: T): Promise<T | string | null> => {
  const key = moment().format('MM-DD-YYYY').toString();
  const existing = await getData(Stores.Expenses, key).then(res => res as T[]) || [] as T[];
  return new Promise(async (resolve) => {
    request = indexedDB.open('myDB', version);

    request.onsuccess = () => {
      db = request?.result;
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);

      const updatedData = [...existing, data];
      store.put(
        updatedData,
        key // ← key
      );
      resolve(data);
    };

    request.onerror = () => {
      const error = request.error?.message
      if (error) {
        resolve(error);
      } else {
        resolve('Unknown error');
      }
    };
  });
};

export const deleteData = (storeName: string, key: any): Promise<boolean> => {
  return new Promise((resolve) => {
    request = indexedDB.open('myDB', version);

    request.onsuccess = () => {
      console.log('request.onsuccess - deleteData', key);
      db = request?.result;
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
    request = indexedDB.open('myDB', version);

    request.onsuccess = () => {
      console.log('request.onsuccess - updateData', key);
      db = request?.result;
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const res = store.get(key);
      res.onsuccess = () => {
        const newData = { ...res?.result, ...data };
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
    request = indexedDB.open('myDB', version);

    request.onsuccess = () => {
      console.log('request.onsuccess - updateData', key);
      db = request?.result;
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const res = store.get(key);
      res.onsuccess = () => {
        resolve(res?.result);
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