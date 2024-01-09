// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "",
  authDomain: "partnerapp-fa594.firebaseapp.com",
  projectId: "partnerapp-fa594",
  storageBucket: "partnerapp-fa594.appspot.com",
  messagingSenderId: "450743627834",
  appId: "1:450743627834:web:ee24cfff761b6e485d8503",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export { auth };
