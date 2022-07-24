import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import Popup from '../components/Popup';
import { auth, db } from "../firebase";
import '../styles/globals.css';
import LoadingPage from './loading';
import LoginPage from './login';

function MyApp({ Component, pageProps }: AppProps) {
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    const addUser = async () => {
      if (user) {
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          displayName: user.displayName,
          lastSeen: serverTimestamp(),
          photoURL: user.photoURL,
        })
        console.log('User created!')
      }
    }

    addUser();
  }, []);



  if (loading) return <LoadingPage />
  if (!user) return <LoginPage />

  return (
    <div className="relative">
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp
