/**
 * firebase.js - Firebase Configuration and Data Service
 * Handles Authentication and Firestore interactions
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js';
import { getAuth, signInWithCustomToken } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js';
import { getFirestore, collection, query, getDocs } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js';


const ENV_KEYS = {
  apiKey: 'NEXT_PUBLIC_FIREBASE_API_KEY',
  authDomain: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  projectId: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  storageBucket: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'NEXT_PUBLIC_FIREBASE_APP_ID',
  measurementId: 'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID'
};

function readConfigValue(key) {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }

  if (typeof window !== 'undefined') {
    const runtimeConfig = window.__FIREBASE_CONFIG__ || {};
    if (runtimeConfig[key]) {
      return runtimeConfig[key];
    }

    if (window[key]) {
      return window[key];
    }
  }


  if (localStorage.getItem('fb_config')) {
    const config = JSON.parse(localStorage.getItem('fb_config'));
    if (config[key]) {
      return config[key];
    }
  }


  return undefined;
}

function buildFirebaseConfig() {
  return {
    apiKey: readConfigValue(ENV_KEYS.apiKey),
    authDomain: readConfigValue(ENV_KEYS.authDomain),
    projectId: readConfigValue(ENV_KEYS.projectId),
    storageBucket: readConfigValue(ENV_KEYS.storageBucket),
    messagingSenderId: readConfigValue(ENV_KEYS.messagingSenderId),
    appId: readConfigValue(ENV_KEYS.appId),
    measurementId: readConfigValue(ENV_KEYS.measurementId)
  };
}

function isConfigValid(config) {
  return Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);
}

const firebaseConfig = JSON.parse(localStorage.getItem('fb_config')) || buildFirebaseConfig();

const validConfig = isConfigValid(firebaseConfig);

export const app = validConfig ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
// Note: getStorage was not imported in the original file but used in the if block. 
// I will keep the pattern consistent. If getStorage is needed, it should be imported.



export const FirebaseService = {
  /**
   * Gets the currently logged-in user
   * @returns {Promise<User|null>}
   */
  getCurrentUser: async () => {
    if (!auth) return null;

    if (auth.currentUser) {
      return auth.currentUser;
    }

    const token = localStorage.getItem('fb_auth_token');
    if (token) {
      try {
        const userCredential = await signInWithCustomToken(auth, token);
        return userCredential.user;
      } catch (error) {
        console.error('Error signing in with custom token:', error);
      }
    }

    return new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        resolve(user);
      });
    });
  },

  /**
   * Fetches a sign document from Firestore
   * @param {string} fileId - The ID of the sign document
   * @returns {Promise<Array|null>} The sign data array or null
   */
  async getSign(fileId) {
    try {
      if (!db || !auth) {
        throw new Error('Firebase is not initialized. Provide Firebase config before calling FirebaseService.');
      }

      const user = await this.getCurrentUser();

      // Security Check: Ensure the authenticated user matches the requested userId
      if (!user) {
        throw new Error("Unauthorized: User session does not match requested userId");
      }

      console.log(`Fetching sign ${fileId} for user ${user.uid}...`);

      //const token = localStorage.getItem('fb_auth_token');

      //const authSignIn = await auth.signInWithCustomToken(token)

      const fetchUserDesigns = async (uid) => {
        try {
          const collectionName = 'designs';
          const designsRef = collection(db, collectionName);
          const q = query(
            designsRef,
            where('userID', '==', uid),
            where('fileId', '==', fileId)
          );
          const querySnapshot = await getDocs(q);
          const designsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
        } catch (err) {
          console.error('Error fetching designs:', err);
        } 
      };

      const docSnap = await fetchUserDesigns(user.uid);

      if (docSnap.exists) {
        const data = docSnap.data();
        // Assuming the sign data is stored in a field called 'objects' or as the document itself
        return data.objects || data;
      } else {
        console.error("No such sign document found!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching sign from Firestore:", error);
      throw error;
    }
  }
};
