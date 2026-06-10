const dbName = "myFitnessApp";
const storeName = "userProfile";

// Open IndexedDB
export async function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: "id" });
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// Save User Profile Data
export async function saveUserProfile(profile) {
    const db = await openDatabase();
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    const userProfile = {
        id: "userProfile",
        ...profile,
    };

    const request = store.put(userProfile);
    request.onsuccess = () => console.log("Profile saved successfully!");
    request.onerror = () => console.error("Failed to save profile.");
}

// Get User Profile Data
export async function getUserProfile() {
    const db = await openDatabase();
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);

    const request = store.get("userProfile");
    return new Promise((resolve, reject) => {
        request.onsuccess = (event) => resolve(event.target.result || {});
        request.onerror = (event) => reject("Failed to fetch profile data.");
    });
}