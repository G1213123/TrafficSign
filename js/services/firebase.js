/**
 * firebase.js - Firebase Configuration and Data Service
 * Handles Authentication and Firestore interactions
 */

// Note: You will need to install firebase via npm or include the script in your HTML
// If using npm: import { initializeApp } from "firebase/app";
// For this implementation, we assume the Firebase SDK is available globally or via modules.

import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import {firebaseApp, auth, db} from './firebaseConfig.js';


export const FirebaseService = {
  /**
   * Gets the currently logged-in user
   * @returns {Promise<User|null>}
   */
  getCurrentUser: () => {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, (user) => {
        resolve(user);
      });
    });
  },

  /**
   * Fetches a sign document from Firestore
   * @param {string} userId - The ID of the user requesting the file
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
      const docRef = doc(db, "signs", fileId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
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
