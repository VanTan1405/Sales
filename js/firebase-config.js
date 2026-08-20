/**
 * FIREBASE INITIALIZATION & REALTIME CONNECTION
 * Project ID: website-nail
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

// Initialize Firebase App
let app = null;
if (typeof firebase !== 'undefined') {
  if (!firebase.apps.length) {
    app = firebase.initializeApp(firebaseConfig);
  } else {
    app = firebase.app();
  }
}

// Global Firebase service instances
const fbAuth = typeof firebase !== 'undefined' && firebase.auth ? firebase.auth() : null;
const fbDb = typeof firebase !== 'undefined' && firebase.firestore ? firebase.firestore() : null;
const fbRtdb = typeof firebase !== 'undefined' && firebase.database ? firebase.database() : null;
const fbStorage = typeof firebase !== 'undefined' && firebase.storage ? firebase.storage() : null;

// Firebase Connection Status Tracker
const FirebaseStatus = {
  isConnected: false,
  message: "Đang kết nối Firebase...",
  details: {},

  checkConnection: async function(onStatusUpdate) {
    let connected = false;
    let msg = "";

    // 1. Kiểm tra Realtime Database (website-nail-default-rtdb)
    if (fbRtdb) {
      try {
        await fbRtdb.ref('connection_test').set({
          status: 'online',
          timestamp: Date.now(),
          client: 'THACO Auto Studio'
        });
        connected = true;
        this.details.rtdb = "CONNECTED";
        msg = "Đã kết nối Realtime Database (website-nail)";
      } catch (rtdbErr) {
        console.warn("RTDB notice:", rtdbErr.message);
        this.details.rtdbError = rtdbErr.message;
      }
    }

    // 2. Kiểm tra Cloud Firestore
    if (fbDb) {
      try {
        await fbDb.collection('connection_test').doc('ping').set({
          status: 'online',
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          project: firebaseConfig.projectId
        }, { merge: true });
        connected = true;
        this.details.firestore = "CONNECTED";
        msg = "Đã kết nối Cloud Firestore (" + firebaseConfig.projectId + ")";
      } catch (firestoreErr) {
        console.warn("Firestore notice:", firestoreErr.message);
        this.details.firestoreError = firestoreErr.message;
      }
    }

    this.isConnected = connected;
    this.message = connected ? msg : "Firebase đã nạp xong (Cần mở Rules trên Firebase Console nếu muốn ghi)";

    if (onStatusUpdate) {
      onStatusUpdate(this);
    }
    return this;
  }
};

// Khởi tạo danh mục xe và cài đặt lên Firebase
async function initFirebaseCollections() {
  if (fbDb && typeof THACO_CARS_DATA !== 'undefined') {
    try {
      const snap = await fbDb.collection('cars').limit(1).get();
      if (snap.empty) {
        const batch = fbDb.batch();
        for (const [id, car] of Object.entries(THACO_CARS_DATA.models)) {
          batch.set(fbDb.collection('cars').doc(id), car);
        }
        await batch.commit();
        console.log("Firebase: Đã đồng bộ danh mục xe lên Firestore");
      }
    } catch (e) {
      console.warn("Auto-sync note:", e.message);
    }
  }
}
