import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAMTZYtxn8mWGO3hVN00eas4TxBg18b0LM",
    authDomain: "stockcheckerapp.firebaseapp.com",
    projectId: "stockcheckerapp",
    storageBucket: "stockcheckerapp.firebasestorage.app",
    messagingSenderId: "771806329195",
    appId: "1:771806329195:web:98c22527794de00b55742e"
  };
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);