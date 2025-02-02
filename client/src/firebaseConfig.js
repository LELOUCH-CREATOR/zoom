import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; 

const firebaseConfig = {
  apiKey: "AIzaSyA_l2NL0a9dm_btSij_h4Fq7-8zFwprNeA",
  authDomain: "zoom-clone-3a0e7.firebaseapp.com",
  projectId: "zoom-clone-3a0e7",
  storageBucket: "zoom-clone-3a0e7.appspot.com",
  messagingSenderId: "342151554701",
  appId: "1:342151554701:web:320a08293b447842e624c4"
};

const app = initializeApp(firebaseConfig);


const auth = getAuth(app);
const db = getFirestore(app); 


export { auth, db };
