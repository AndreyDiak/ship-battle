import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../firebase';
import { getEnemyEmail } from '../../utils/getEnemyEmail';
import LoadingPage from '../loading';
import LoginPage from '../login';

function GamePage() {

  const [user, loading] = useAuthState(auth);
  const [gameData, setGameData] = useState();
  const [enemyEmail, setEnemyEmail] = useState('')
  const router = useRouter();
  
  useEffect(() => {
    const getGameInfo = async () => {
      const infoRef = doc(db, `games/${router.query.gameId}`)
      const infoSnap = await getDoc(infoRef);
      setGameData({
        id: infoSnap.id,
        ...infoSnap.data()
      })
    }
    getGameInfo()
  }, [])

  useEffect(() => {
    if (gameData) {
      setEnemyEmail(getEnemyEmail(gameData.users, user?.email as string))
    }
  }, [gameData])

  if ( loading ) return <LoadingPage />
  if ( !user ) return <LoginPage />

  return (
    <div>
      {!enemyEmail ? (
        <div className="">
          Loading game info...
          
        </div>
      ) : (
        <div className="">
          Your opponent : {enemyEmail}
        </div>
      )}
    </div>
  )
}

export default GamePage