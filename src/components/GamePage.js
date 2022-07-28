import { useState } from "react";
import { NavLink } from "react-router-dom";
import '../EditStyle.css';
import '../GameStyle.css';

export const GamePage = ({firstPlayerField, secondPlayerField, markupNumbers, markupLetters, setFirstPlayerField, setSecondPlayerField}) => {

  // очерёдность ходов . . .
  const [isFirstPlayerTurn, setIsFirstPlayerTurn] = useState(true)
  // ход или промежуточный экран . . .
  const [isTurn, setIsTurn] = useState(false)
  // поле для угадывания первого игрока . . .
  const [firstPlayerOpponentField, setFirstPlayerOpponentField] = useState(Array(100).fill({value: ''}))
  // поле для угадывания второго игрока . . .
  const [secondPlayerOpponentField, setSecondPlayerOpponentField] = useState(Array(100).fill({value: ''}))

  return (
    <>
      <div className='game'>
        <div className='gameHeader'>
          ИГРА НАЧАЛАСЬ!
          <NavLink to='/start-page'>
            <button>
              Вернуться в меню
            </button>
          </NavLink>
        </div>
        <div>
          {isTurn
            ? <RenderFields
                markupNumbers={markupNumbers}
                markupLetters={markupLetters}
                isFirstPlayerTurn={isFirstPlayerTurn}
                setIsFirstPlayerTurn={setIsFirstPlayerTurn}
                setIsTurn={setIsTurn}
                firstPlayerField={firstPlayerField}
                setFirstPlayerField={setFirstPlayerField}
                firstPlayerOppField={firstPlayerOpponentField}
                setFirstPlayerOppField={setFirstPlayerOpponentField}
                secondPlayerField={secondPlayerField}
                setSecondPlayerField={setSecondPlayerField}
                secondPlayerOppField={secondPlayerOpponentField}
                setSecondPlayerOppField={setSecondPlayerOpponentField}
              />
            : <RenderButton isFirst={isFirstPlayerTurn} setIsTurn={setIsTurn} />
          }
        </div>
      </div>
    </>
  )
}

const RenderButton = (props) => {
  return (
    <div className='gameStart'>
      <div className='gameStartButton' >
        Ходит <b>{props.isFirst ? '1' : '2'}</b> игрок
      </div>
      <div className='gameStartHeader' >
        <button onClick={() => props.setIsTurn(true)}>
          Сделать ход
        </button>
      </div>
    </div>
  )
}
const RenderFields = (props) => {

  function handleClick(i, field, oppField , setField, setOppField, setAbleToClick) {

    // копия нашего поля для угадывания . . .
    let fieldCopy = [...field]
    // копия поля противника . . .
    let oppFieldCopy = [...oppField]

    if (fieldCopy[i].value === '') {
      if (oppFieldCopy[i].value !== '') {
        // заполняем поле О при удачном ходе . . .
        fieldCopy[i] = {
          value: 'O'
        };

        // находим id корабля . . .
        let shipId = oppFieldCopy[i].id[1];

        // обновляем клетку куда мы выстрелили . . .
        oppFieldCopy[i] = {
          ...oppFieldCopy[i],
          health: 0,
        }
        
        // уменьшаем количество жизней у всех клеток этого корабля . . .
        oppFieldCopy.forEach((field, index) => {

          if(field.id.some(id => id === shipId) && field.maxHealth > 0) {
            oppFieldCopy[index] = {
              ...field,
              shipHealth: field.shipHealth - 1,
            }

            // если корабля уничтожен, заполняем клетки вокруг него с помощью х . . .
            if (oppFieldCopy[index].shipHealth === 0) {
              // пробегаем по всему полю и находим нужные нам клетки . . .
              oppFieldCopy.forEach((field, i) => {
                // если клетка подходит под условие, то записываем в неё х . . .
                if (field.id.some(id => id === shipId) && !field.isFree && !field.isShip) {
                  fieldCopy[i] = {value: 'x'}
                  oppFieldCopy[i] = {
                    ...oppFieldCopy[i],
                    value: 'x'
                  }
                }
              })
            }
          }
        })
        // возможность снова кликать по полю . . .
        setAbleToClick(true)
      } else {
        // заполняем поле х при неудачном ходе . . .
        fieldCopy[i] = {value: 'x'}
        oppFieldCopy[i] = {
          ...oppFieldCopy[i],
          value: 'x'
        }
        // функция смены хода . . .
        setTimeout(() => {
          props.setIsFirstPlayerTurn(!props.isFirstPlayerTurn)
          props.setIsTurn(false)
        }, 1000)
      }
    } else {
      setAbleToClick(true)
      return null
    }

    // проверка на победу игрока . . .
    const healths = oppFieldCopy.reduce((acc,field) => acc + field.health, 0)
    
    if (healths === 0) {
      props.setIsTurn(false)
      // TODO проработать систему после победы одного из игроков, возможно перенести в отдельную функцию!!!
      alert(`Победил ${props.isFirstPlayerTurn ? '1' : '2'} игрок`)
    }

    // обновление полей . . .
    setField(fieldCopy)
    setOppField(oppFieldCopy)

  }

  return (
    <>
      <div className="fields">
        <div className="field fieldSelf">
          {/* узнаем чей ход, и рендрим поле игрока . . . */}
          <div className="letters">
            {props.markupLetters.map(letter => {
              return (
                <>
                  <div className="letter">
                    {letter}
                  </div>
                </>
              )
            })}
          </div>
          <div className="numbers">
            {props.markupNumbers.map(number => {
              return (
                <>
                  <div className="number">
                    {number}
                  </div>
                </>
              )
            })}
          </div>
          {props.isFirstPlayerTurn
            ? <RenderField field={props.firstPlayerField} handleClick={null}/>
            : <RenderField field={props.secondPlayerField} handleClick={null}/>
          }
        </div>
        <div className="field fieldOpponent">
          <div className="letters">
            {props.markupLetters.map(letter => {
              return (
                <>
                  <div className="letter">
                    {letter}
                  </div>
                </>
              )
            })}
          </div>
          <div className="numbers">
            {props.markupNumbers.map(number => {
              return (
                <>
                  <div className="number">
                    {number}
                  </div>
                </>
              )
            })}
          </div>
          {/* узнаем чей ход, и рендрим поле для угадывания кораблей соперника . . . */}
          {props.isFirstPlayerTurn
            ? <RenderField
                field={props.firstPlayerOppField}
                handleClick={handleClick}
                isFirstPlayerTurn={true}
                oppField={props.secondPlayerField}
                setield={props.setFirstPlayerOppField}
                setOppField={props.setSecondPlayerField}
              />
            : <RenderField
                field={props.secondPlayerOppField}
                handleClick={handleClick}
                isFirstPlayerTurn={false}
                oppField={props.firstPlayerField}
                setField={props.setSecondPlayerOppField}
                setOppField={props.setFirstPlayerField}
              />
          }
        </div>
      </div>
    </>
  )
}

const RenderField = (props) => {

  const [ableToClick, setAbleToClick] = useState(true)

  return (
    <>
      {props.field.map((field, index) => {
        // если корабль подбит, то закрашиваем клетки с ним . . .
        let isShipDefeated
        if (props.oppField) {
          isShipDefeated = 
          (props.oppField[index].shipHealth === 0) && 
          (props.oppField[index].maxHealth > 0)
        } else {
          isShipDefeated = field.shipHealth === 0 && field.maxHealth > 0
        }

        return (
          <RenderFieldBlock
              value={field.value}
              click={props.handleClick ? () => {
                setAbleToClick(false)
                props.handleClick(index, props.field , props.oppField, props.setField, props.setOppField, setAbleToClick)
              } : null}
              ableToClick={ableToClick}
              isShipDefeated={isShipDefeated}
            />
          )
        })}
    </>
  )
}

const RenderFieldBlock =  ({value, click, ableToClick, isShipDefeated}) => {
  // console.log(isShipDefeated)
  return (
    <>
      <button className='fieldBlock' onClick={click} disabled={!ableToClick} style={isShipDefeated ? {backgroundColor: 'red'} : {}}>
        {value}
      </button>
    </>
  )
}
