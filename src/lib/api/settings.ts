import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "~/lib/firebase";

export const getSettings = async () => {
  await auth.authStateReady();
  const settingsDoc = await getDoc(
    doc(db, "settings", auth.currentUser?.uid ?? "")
  );
  return settingsDoc.data() as Model.Settings;
};

export const updateSettings = async (settings: Model.Settings) => {
  await auth.authStateReady();
  return setDoc(doc(db, "settings", auth.currentUser?.uid ?? ""), settings);
};
