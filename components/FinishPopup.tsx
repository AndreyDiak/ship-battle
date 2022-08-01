import { collection, deleteDoc, doc, getDoc, getDocs, query } from 'firebase/firestore'
import { useRouter } from 'next/router'
import React from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '../firebase'
import { getEnemyEmail } from '../utils/getEnemyEmail'

type Props = {
  winner: string
  gameId: string
  myFieldId: string
  oppFieldId: string
}

function FinishPopup({ winner, gameId, myFieldId, oppFieldId } : Props) {
  const [user] = useAuthState(auth);
  const router = useRouter();
  
  

  const onClick = async () => {
    const gameSnap = await getDoc(doc(db, `games/${gameId}`));
    const gameData = gameSnap.data()
    const users = gameData?.users;

    const opp = getEnemyEmail(users, user?.email);
    router.push('/');
    // TODO добавить сбор статистики...
    await deleteDoc(doc(db, `fields/${myFieldId}`));
    await deleteDoc(doc(db, `fields/${oppFieldId}`));

    await deleteDoc(doc(db, `games/${gameId}`))
    
  }

  return (
    <div className="popup">
      <div className="bg-slate-200 px-4 py-2 text-center z-20 rounded-md">
        <h2 className="font-bold text-xl my-3">{user?.email === winner 
        ? (
          <p className="text-green-700 animate-bounce">Вы победили</p>
        ) : (
          <p className="text-red-700">Вы проиграли...</p>
        )}
        </h2>
        <div className="menuItem" onClick={onClick}>
          Подтвердить{`${user?.email === winner ? ')' : '('}`}
        </div>
      </div>
    </div>
  )
}

export default FinishPopup