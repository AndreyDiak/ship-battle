import * as EmailValidator from "email-validator";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import Header from "../../components/Header";
import { auth, db } from "../../firebase";
import getFriends from "../../utils/getFriends";
import LoadingPage from "../loading";
function FindPage() {
  const [user, loading] = useAuthState(auth);
  const [opponent, setOpponent] = useState('')
  const friends = getFriends(true);
  
  if(!user) return <LoadingPage />
  
  const createGame = async (opp: string) => {
    
    if (!EmailValidator.validate(opp) || opp === user.email) return null

    const candidateRef = query(
      collection(db, 'users'),
      where(
        "email" , "==", opp
      )
    )
    const candidateSnap = await getDocs(candidateRef);
    if (candidateSnap.docs.length === 0) return null
    // пользователь существует...
    console.log('валидация пройдена')
    const gameRef = await addDoc(
        collection(db, 'games'), {
          users: [
            {
              email: user.email,
              approved: true
            }, {
              email: opp,
              approved: false
            }
          ],
    })
    // console.log(gameRef);
    
    const timeout = setTimeout(async () => {
      const q = doc(db, `games/${gameRef.id}`);
      const ref = await getDoc(q);
      const isApproved = ref.data()?.users.reduce((acc : boolean, item: any) => {
        if (!item.approved) {
          acc = false
        }
        return acc;
      }, true)
      
      // если пользователь не успел подтвердить игру, то она удаляется...
      if (!isApproved) {
        await deleteDoc(doc(db,`games/${gameRef?.id}`))
      }

    }, 5000)

    // создаем в бд игру
    // если оппонент не дал ответ в течении минуты то удаляем сеанс...
  }

  return (
    <div className="">
      <Header title="Найти игру" />

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