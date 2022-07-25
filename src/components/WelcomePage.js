import {NavLink} from "react-router-dom";

export const WelcomePage = ({isReady}) => {
  return (
    <>
      <div className='welcome' >
        <div className='welcomeBlock' >
          МОРСКОЙ БОЙ
          <NavLink to='game-page'>
            <button disabled={!isReady}>
              Начать игру
            </button>
          </NavLink>
          <NavLink to='/edit-page'>
            <button disabled={isReady}>
              Сделать расстановку
            </button>
          </NavLink>
        </div>
      </div>
    </>
  )
}