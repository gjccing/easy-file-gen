// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDYp0Kn5Ubpbgza05jJVx0-PS45MjzuXLc",
  authDomain: "easy-file-gen.firebaseapp.com",
  projectId: "easy-file-gen",
  storageBucket: "easy-file-gen.appspot.com",
  messagingSenderId: "570321173308",
  appId: "1:570321173308:web:d0bedf5ae7e2dac9727c39",
  measurementId: "G-2W6P4TLZ99",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
