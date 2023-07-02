import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAncE_YQsOPFzAp9Vy8A75AzWNKAwO0t4Y",
  authDomain: "instagram-storage-24dbc.firebaseapp.com",
  projectId: "instagram-storage-24dbc",
  storageBucket: "instagram-storage-24dbc.appspot.com",
  messagingSenderId: "494004439818",
  appId: "1:494004439818:web:08fd1550702cde705488f3",
};
const app = initializeApp(firebaseConfig);
const storage = getStorage();

export { app, storage };
