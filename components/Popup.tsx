import moment from 'moment'
import React, { useEffect, useState } from 'react'

type Props = {
  submitGame?: () => void
  rejectGame: () => void
  type: 'submit' | 'waiting'
}

function Popup({submitGame, rejectGame, type} : Props) {
 
  const [timer, setTimer] = useState(20);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(timer - 1);
    }, 1000)
    return () => clearInterval(interval);
  },[timer])


  return (
    <div className="popup">
      <div className="bg-slate-200 rounded-md px-4 py-3 text-center group z-20">
        <h2 className={`text-4xl font-bold animate-pulse
        ${timer > 10 
          ? 'text-green-600' 
            : timer > 5 
              ? 'text-yellow-600' 
                : 'text-red-600'}`
                }>
          {timer}
          </h2>
        {
          type === 'submit' ? (
            <>
              <h1 className="mt-2 mb-2 font-bold font-lg animate-bounce">Вас пригласили в игру!</h1>
              <div className="mt-2 menuItem uppercase font-bold bg-green-400 hover:bg-green-500" onClick={submitGame}>Подтвердить</div>
              <div className="mt-2 menuItem uppercase font-bold bg-red-400 hover:bg-red-500" onClick={rejectGame}>Отклонить</div>
            </>
          ) : (
            <>
              <h1 className="mt-2 mb-2 font-bold font-lg animate-bounce">Ожидание противника...</h1>
              <div className="mt-2 menuItem uppercase font-bold bg-red-400 hover:bg-red-500" onClick={rejectGame}>Отклонить</div>
            </>
          )
        }
      </div>
    </div>
  )
}

export default Popup