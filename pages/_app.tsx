import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
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
          friends: [],
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

  return <Component {...pageProps} />
}

export default MyApp
