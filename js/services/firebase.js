/**
 * firebase.js - Firebase Configuration and Data Service
 * Handles Authentication and Firestore interactions
 */


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const auth = auth();
export const db = firestore();
export const storage = storage();

export const FirebaseService = {
  /**
   * Gets the currently logged-in user
   * @returns {Promise<User|null>}
   */
  getCurrentUser: () => {
    return new Promise((resolve) => {
      auth().onAuthStateChanged((user) => {
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
      const user = await this.getCurrentUser();
      
      // Security Check: Ensure the authenticated user matches the requested userId
      if (!user) {
        throw new Error("Unauthorized: User session does not match requested userId");
      }

      console.log(`Fetching sign ${fileId} for user ${user.uid}...`);
      const docRef = db.collection("signs").doc(fileId);
      const docSnap = await docRef.get();

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
