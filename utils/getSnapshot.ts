import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "../firebase"

export const getGameSnapWithEmail = async (email: string) => {
  const ref = query(
    collection( db, 'games'), where('users', 'array-contains', email)
  )
  const snapshot = await getDocs(ref);

  return snapshot;
}