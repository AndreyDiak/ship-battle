import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';

function getFriends(isAble: boolean) {
  const [user, loading] = useAuthState(auth);
  const [friends, setFriends] = useState([])
  
  useEffect(() => {
    const getFriends = async () => {
      if(isAble) {
        const friendsRef = collection(db, `friends/${user?.uid}/emails`);
        const frendsSnap = await getDocs(friendsRef);
        const emails = frendsSnap.docs.map(friend => friend.data().email);
        // @ts-ignore
        setFriends(() => emails);
      }
    }
    getFriends();
  },[])

  return friends
}

export default getFriends