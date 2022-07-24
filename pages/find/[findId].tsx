import * as EmailValidator from "email-validator";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { GetServerSideProps } from "next";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import Header from "../../components/Header";
import Popup from "../../components/Popup";
import { auth, db } from "../../firebase";
import getFriends from "../../hooks/getFriends";
import LoadingPage from "../loading";
import {useCollection} from "react-firebase-hooks/firestore";
import { useRouter } from "next/router";

type Props = {
  isGameFound: boolean
}

const TIME_TO_DENY = 20000;

function FindPage() {

  const [user, loading] = useAuthState(auth);
  const [opponent, setOpponent] = useState('');
  const [isWaitingForOpp, setIsWaitingForOpp] = useState(false);
  const router = useRouter();
  const friends = getFriends(true);
  // checks if we invited to the game...
  const findRef = query(
    collection( db, 'games' ),
    where('users', 'array-contains', user?.email)
  );

  const [findSnap] = useCollection(findRef);
  const game = findSnap?.docs[0]?.data();

  let isGameFound = false;
  let isGameApproved = game?.approved;

  if (game?.approved === false && game?.owner !== user?.email) {
    isGameFound = true;
  }
  // checks if we invited to the game...
  
  if(!user) return <LoadingPage />
  
  const createGame = async (opp: string) => {
    if (!EmailValidator.validate(opp) || opp === user.email) return null

    try {
      const candidateRef = query(
        collection(db, 'users'),
        where(
          "email" , "==", opp
        )
      )
      const candidateSnap = await getDocs(candidateRef);
      if (candidateSnap.docs.length === 0) return null;
      
      const gameRef = await addDoc(
        collection(db, 'games'), {
          users: [user.email, opp],
          owner: user.email,
          approved: false,
          startTime: serverTimestamp()
      })
      // создаем сеанс с игрой...
      setIsWaitingForOpp(true);
      const timeout = setTimeout(async () => {
        const q = doc(db, `games/${gameRef.id}`);
        const ref = await getDoc(q);
        const isApproved = ref.data()?.approved;
        console.log('checking!')
        if (!isApproved) {
          await deleteDoc(doc(db,`games/${gameRef?.id}`));
        } else {
          router.push(`/game/${gameRef?.id}`);
        }
        setIsWaitingForOpp(false);
        clearTimeout(timeout);
        // если пользователь не успел подтвердить игру, то удаляем сеанс
      }, TIME_TO_DENY)

    } catch (err) {
      console.log(err);
    }
  }

  const submitGame = async () => {
    const findRef = query(
      collection( db, 'games' ),
      where('users', 'array-contains', user.email)
    )
    const gameSnap = await getDocs(findRef);
    const gameId = gameSnap.docs[0].id;
    await updateDoc(doc(db, `games/${gameId}`), {
      approved: true
    })
    router.push(`/game/${gameId}`);
  }

  const rejectGame = async () => {
    
    const findRef = query(
      collection( db, 'games' ),
      where('users', 'array-contains', user.email)
    )
    const gameSnap = await getDocs(findRef);
    const gameId = gameSnap.docs[0].id;
    await deleteDoc(doc(db, `games/${gameId}`));
   
  }

  return (
    <div className="">
      <Header title="Найти игру" />
      {isGameFound && (
        <Popup submitGame={submitGame} rejectGame={rejectGame} type='submit' />
      )}
      {isWaitingForOpp && (
        <Popup rejectGame={rejectGame} type='waiting' />
      )}
      <div className="p-2 bg-whitesmoke flex flex-col items-center justify-center
      lg:flex-row space-x-2">
        <div className="text-center">
          <h2 className="font-bold mt-3 mb-3 text-xl">Игра с друзьями</h2>
          {friends.length > 0 
          ? (
            <div className="flex-col space-y-2">{friends.map(email => (
              <div className="flex-col items-center space-y-2 bg-blue-100
              px-3 py-1 rounded-md max-w-[450px]">
                <p className="">
                  {email}
                </p>
                <div className="menuItem" onClick={() => createGame(email)}>
                  Играть
                </div>
              </div>
            ))}
              </div>
          ) : (
            <div className="">
              У вас нет друзей()
            </div>
          )}
        </div>
        <div className="text-center">
          <h2 className="font-bold mt-3 mb-3 text-xl">Поиск игры</h2>
            <input 
              type="text" 
              className="bg-blue-200 px-3 py-1 rounded-full 
              text-black border border-blue-500 outline:none 
              active:outline-none active:border-none focus:outline-none"
              placeholder="Enter email..."
              onChange={(e) => setOpponent(e.target.value)}
              value={opponent}
            />
            <button 
              className="" 
              onClick={() => createGame(opponent)}
            >
              Начать
            </button>
        </div>
      </div>
    </div>
  )
}

export default FindPage

// export const getServerSideProps: GetServerSideProps = async ({params}) => {

//   const userRef = doc(db, 'users', `${params?.findId}`)
//   const userSnap = await getDoc(userRef);
//   const userEmail = userSnap.data().email;
  
//   const findRef = query(
//     collection( db, 'games' ),
//     where('users', 'array-contains', userEmail)
//   )
  
//   const gameSnap = await getDocs(findRef)
//   const game = gameSnap.docs[0]?.data()
  
//   let isGameFound = false;

//   if (game?.approved === false && game?.owner !== userEmail) {
//     isGameFound = true;
//   }

//   return {
//     props: {
//       isGameFound
//     }
//   }
// }