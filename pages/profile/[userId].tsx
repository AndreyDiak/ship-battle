import { collection, doc, getDoc, getDocs } from "firebase/firestore"
import { GetStaticPaths, GetStaticProps } from "next"
import Link from "next/link"
import { useRouter } from "next/router"
import { useAuthState } from "react-firebase-hooks/auth"
import Avatar from "../../components/Avatar"
import Header from "../../components/Header"
import { auth, db } from "../../firebase"
import getFriends from "../../utils/getFriends"

type Props = {
  data: any
}

function ProfilePage({data} : Props) {
  const router = useRouter();

  const [entireUser] = useAuthState(auth);
  
  const isMyProfile = entireUser?.uid === router.query.userId;

  const friends = getFriends(isMyProfile)
    
  console.log(friends)

  const user: User = JSON.parse(data)
  
  return (
    <div className="">
      <div className="">
        <Header title={`Профиль игрока`} />
        <div className="bg-slate-100">
          {isMyProfile && (
            <div className="text-gray-400">
              Редактировать профиль
            </div>
          )}
          <div className="">
            {user.displayName}
          </div>
          <div className="flex items-center space-x-2 px-2 py-1">
            <Avatar href={user?.photoURL} />
            <p className="text-lg font-semibold">{user.email}</p>
          </div>
          <div className="">
            Сыграно игр: Loading...
          </div>
          <div className="p-2">
            {isMyProfile && (
              (friends.length)  === 0 
                ? (
                  <div className="">
                    У тебя нет друзей
                  </div>
                ) 
                : (
                  <div>
                    <p className="font-bold text-lg">Твои друзья:</p>
                    {friends.map(email => (
                      <div className="border-b max-w-[240px] 
                      pt-2 pb-2 last:border-none text-center text-gray-500 italic
                      hover:text-gray-700 cursor-pointer hover:bg-white rounded-md mt-2 mb-2">
                        {email}
                      </div>
                    ))}
                  </div>
                )
                
            )}
          </div>
        </div>
          <p className="menuItem mx-auto mt-4">
            <Link href='/'>В меню</Link>
          </p>
      </div>
    </div>
  )
}

export default ProfilePage

export const getStaticPaths: GetStaticPaths = async () => {

  const usersRef = collection(db, 'users');
  const usersSnap = await getDocs(usersRef);
  
  return {
    paths: usersSnap.docs.map(user => ({
      params: {userId: user.id}
    })),
    fallback: false
  }
}

export const getStaticProps: GetStaticProps = async ({params}) => {

  console.log(params);

  const userRef = doc(db, 'users', `${params?.userId}`);
  const userSnap = await getDoc(userRef);

  return {
    props: {
      data: JSON.stringify(userSnap.data())
    }
  }
}