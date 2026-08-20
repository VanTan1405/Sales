/**
 * FIREBASE INITIALIZATION & CONFIGURATION
 */

const firebaseConfig = {
  apiKey: "AIzaSyDahzCqkvOT1QT_1Nn7aTn2yHCMYsh7pV0",
  authDomain: "website-nail.firebaseapp.com",
  databaseURL: "https://website-nail-default-rtdb.firebaseio.com",
  projectId: "website-nail",
  storageBucket: "website-nail.firebasestorage.app",
  messagingSenderId: "75672971138",
  appId: "1:75672971138:web:8ff555d2b59c2785d0919b",
  measurementId: "G-QHYWL9HGTX"
};

// Initialize Firebase
if (typeof firebase !== 'undefined') {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
}

// Global Firebase service instances
const fbAuth = typeof firebase !== 'undefined' ? firebase.auth() : null;
const fbDb = typeof firebase !== 'undefined' ? firebase.firestore() : null;
const fbStorage = typeof firebase !== 'undefined' ? firebase.storage() : null;

// Initialize collections and default data if empty
async function initFirebaseCollections() {
  if (!fbDb) return;

  try {
    // Check if cars collection has data, if not initialize with default THACO cars
    const carsSnapshot = await fbDb.collection('cars').limit(1).get();
    if (carsSnapshot.empty && typeof THACO_CARS_DATA !== 'undefined') {
      const batch = fbDb.batch();
      for (const [id, car] of Object.entries(THACO_CARS_DATA.models)) {
        const carRef = fbDb.collection('cars').doc(id);
        batch.set(carRef, car);
      }
      await batch.commit();
      console.log('Firebase: Initialized default THACO cars data');
    }

    // Check system settings
    const settingsDoc = await fbDb.collection('system_settings').doc('showroom').get();
    if (!settingsDoc.exists && typeof THACO_CARS_DATA !== 'undefined') {
      await fbDb.collection('system_settings').doc('showroom').set({
        ...THACO_CARS_DATA.showroom,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
  } catch (err) {
    console.warn('Firebase init warning:', err.message);
  }
}
