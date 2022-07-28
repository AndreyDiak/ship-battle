import { collection, collectionGroup, doc, getDoc, query, where } from 'firebase/firestore'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useContext, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollection } from 'react-firebase-hooks/firestore'
import { auth, db } from '../../firebase'
import { getEnemyEmail } from '../../utils/getEnemyEmail'
import { MarkupsContext } from '../_app'

type RenderField = {
  myField?: ShownField[]
  oppField?: ShownField[]
  handleClick?: (...args: any[]) => void
}

type RenderFields = {
  myField: ShownField[]
  oppField: ShownField[]
  user?: User
}

type ShownField = {
  value: string
}

type RenderFieldBlock = {
  value: string
  click?: () => void
  ableToClick: boolean
  isShipDefeated: boolean
}

type GamePage = {
  game: Game
}

function GamePage({ game }: any) {
  // getting the user data...
  const [user] = useAuthState(auth);
  // getting game data...
  const [gameData, setGameData] = useState(JSON.parse(game));
  const [isMyTurn, setIsMyTurn] = useState(gameData.turn === user?.email);
  const router = useRouter()
  if (!gameData) router.push('/');

  const [myFieldSnap] = useCollection(
    query(
      collection( db, 'fields' ),
      where('owner', '==', user?.email)
    )
  )

  const [oppFieldSnap] = useCollection(
    query(
      collection( db ,'fields'),
      where('owner', '==', getEnemyEmail(gameData.users, user?.email))
    )
  )
  const myField : Field[] = myFieldSnap?.docs[0].data().field;
  const oppField : Field[] = oppFieldSnap?.docs[0].data().field;

  console.log(myField)
  console.log(oppField);

  return (
    <div className='game'>
      <div className='gameHeader'>
        ИГРА НАЧАЛАСЬ! Ваш соперник - {getEnemyEmail(gameData.users, user?.email)}
        <br />
        {isMyTurn ? 'Ваш ход' : 'Ход соперника...'}
      </div>
      <div>
        <RenderFields
          myField={myShownField}
          oppField={oppShownField}
        />

      </div>
    </div>
  )
}

export default GamePage

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const gameId = params?.gameId;

  const ref = doc(db, `games/${gameId}`);
  const snapshot = await getDoc(ref);
  const data = {
    id: snapshot.id,
    ...snapshot.data()
  }

  return {
    props: {
      game: JSON.stringify(data)
    }
  }
}

const RenderFields = ({ myField, oppField }: RenderFields) => {

  const markups = useContext(MarkupsContext);
  
  function handleClick(i: number) {

    // копия нашего поля для угадывания . . .
    let fieldCopy = [...myField]
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

          if (field.id.some(id => id === shipId) && field.maxHealth > 0) {
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
                  fieldCopy[i] = { value: 'x' }
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
        fieldCopy[i] = { value: 'x' }
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
    const healths = oppFieldCopy.reduce((acc, field) => acc + field.health, 0)

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
          {/* Рендрим свое поле... */}
          <div className="letters">
            {markups.letters.map(letter => {
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
            {markups.numbers.map(number => {
              return (
                <>
                  <div className="number">
                    {number}
                  </div>
                </>
              )
            })}
          </div>
          <RenderField myField={myField} />
        </div>
        <div className="field fieldOpponent">
          <div className="letters">
            {markups.letters.map(letter => {
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
            {markups.letters.map(number => {
              return (
                <>
                  <div className="number">
                    {number}
                  </div>
                </>
              )
            })}
          </div>
          {/* рендрим поле соперника . . . */}
          <RenderField
            oppField={oppField}
            handleClick={handleClick}
          />

        </div>
      </div>
    </>
  )
}


const RenderField = ({ myField, oppField, handleClick }: RenderField) => {

  const [ableToClick, setAbleToClick] = useState(true)

  return (
    <>
    {myField 
      ? (
        myField.map((field, index) => 
          <RenderFieldBlock 
            value={field.value}
            ableToClick={false}
            isShipDefeated={field.shipHealth === 0 && field.maxHealth > 0}        
          />
        )
      ) 
      : (
        oppField?.map((field, index) => 
          <RenderFieldBlock 
            value={field.value}
            ableToClick={ableToClick}
            isShipDefeated={field.shipHealth === 0 && field.maxHealth > 0}
            click={() => {
              setAbleToClick(false);
              // @ts-ignore
              handleClick(index)
            }}
          />
        )
      )
    }
    </>
  )

}

const RenderFieldBlock = ({ value, click, ableToClick, isShipDefeated }: RenderFieldBlock) => {

  return (
    <>
      <button className='fieldBlock' onClick={click} disabled={!ableToClick} style={isShipDefeated ? { backgroundColor: 'red' } : {}}>
        {value}
      </button>
    </>
  )
}



