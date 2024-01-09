// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "",
  authDomain: "dineeasy-5410.firebaseapp.com",
  projectId: "dineeasy-5410",
  storageBucket: "dineeasy-5410.appspot.com",
  messagingSenderId: "967933655129",
  appId: "1:967933655129:web:b6e896a1f2a8d2905b1948",
  measurementId: "G-P2C0NTWY9P",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

export { auth };
