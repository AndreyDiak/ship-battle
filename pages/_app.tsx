import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import type { AppProps } from 'next/app';
import React, { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import Popup from '../components/Popup';
import { auth, db } from "../firebase";
import '../styles/globals.css';
import LoadingPage from './loading';
import LoginPage from './login';

const markups = {
  numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  letters: ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'К']
}

export const MarkupsContext = React.createContext(markups);

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
          wins: 0,
          loses: 0
        })
      }
    }

    addUser();
  }, []);



  if (loading) return <LoadingPage />
  if (!user) return <LoginPage />

  return (
    <div className="relative">
      <MarkupsContext.Provider value={markups}>
        <Component {...pageProps} />
      </MarkupsContext.Provider>
    </div>
  )
}

export default MyApp
