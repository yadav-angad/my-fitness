// IndexedDB Wrapper for saving workouts
const dbName = "myFitnessApp";
const storeName = "completedWorkouts";

export async function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: "date" });
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

export async function saveWorkout(date, workouts) {
    const db = await openDatabase();
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    const workoutData = {
        date: date,
        workouts: workouts,
    };

    const request = store.put(workoutData);
    request.onsuccess = () => console.log("Workout saved successfully!");
    request.onerror = () => console.error("Failed to save workout.");
}

export async function getWorkouts(date) {
    const db = await openDatabase();
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);

    const request = store.get(date);
    return new Promise((resolve, reject) => {
        request.onsuccess = (event) => resolve(event.target.result?.workouts || []);
        request.onerror = (event) => reject("No data found for this day.");
    });
}