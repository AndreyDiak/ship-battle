import { signInWithPopup } from "firebase/auth";
import Head from "next/head";
import { auth, googleProvider } from "../firebase";

function LoginPage() {

  const signIn = async () => {
    const result = await signInWithPopup(auth, googleProvider);
  }

  return (
    <div className="grid place-items-center h-[100vh] bg-whitesmoke">
      <Head>
        <title>Login...</title>
      </Head>
      <button className="menuItem" onClick={signIn}>
        Sign in
      </button>
    </div>
  )
}

export default LoginPage