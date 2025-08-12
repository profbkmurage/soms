import { auth, db } from '../firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Create a new company account
 * @param {string} email - Company login email
 * @param {string} password - Company password
 * @param {string} companyName - Name of the company
 */
export const createCompanyAccount = async (email, password, companyName) => {
  try {
    // 1️⃣ Create Auth account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // 2️⃣ Store role & details in Firestore
    await setDoc(doc(db, 'users', uid), {
      email,
      role: 'company',
      companyName,
      createdAt: serverTimestamp()
    });

    console.log(`✅ Company account created: ${companyName}`);
    return uid;
  } catch (error) {
    console.error('❌ Error creating company account:', error.message);
    throw error;
  }
};
