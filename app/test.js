import { collection, getDocs } from "firebase/firestore";

const snapshot = await getDocs(collection(db, "engineer1"));
console.log("Connected to Firestore:", snapshot.size);
