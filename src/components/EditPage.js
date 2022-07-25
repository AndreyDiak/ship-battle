import {NavLink, Redirect} from "react-router-dom";

export const EditPage = ({isFirst, isSecond}) => {
  return (
    <>
      {/* если оба игрока готовы, то выходим в главное меню . . .  */}
      {isFirst && isSecond ? <Redirect to='/' /> : ''}
      <div className='gameHeader'>
        ПОСТАВЬ СВОИ КОРАБЛИ!
        <NavLink to='/start-page'>
          <button>
            Вернуться в меню
          </button>
        </NavLink>
      </div>
      <div className='gameButtons' >
        <NavLink to='/edit-page/first-edit'>
          <button disabled={isFirst}>
            Поставить корабли 1-го игрока
          </button>
        </NavLink>
        <NavLink to='/edit-page/second-edit'>
          <button disabled={isSecond}>
            Поставить корабли 2-го игрока
          </button>
        </NavLink>
      </div>
    </>
  )
}