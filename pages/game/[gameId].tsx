import { collection, collectionGroup, doc, getDoc, query, where } from 'firebase/firestore'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useContext, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollection } from 'react-firebase-hooks/firestore'
import { auth, db } from '../../firebase'
import { getEnemyEmail } from '../../utils/getEnemyEmail'
import LoadingPage from '../loading'
import { MarkupsContext } from '../_app'

function GamePage({ game }: any) {
  console.log(game);
  // getting the user data...
  const [user] = useAuthState(auth);
  // getting game data...
  const [gameData, setGameData] = useState(JSON.parse(game));
  const [isMyTurn, setIsMyTurn] = useState(gameData.turn === user?.email);
  const router = useRouter();

  if (!gameData) router.push('/');

  console.log(user?.email);

  const [myFieldsSnap] = useCollection(
    query(
      collection(db, 'fields'),
      where('owner', '==', user?.email)
    )
  )
  console.log(myFieldsSnap);
  const [oppFieldsSnap] = useCollection(
    query(
      collection(db, 'fields'),
      where('owner', '==', getEnemyEmail(gameData.users, user?.email as string))
    )
  )
  if (oppFieldsSnap?.docs.length === 0) return <LoadingPage />
  // если оба игрока расставили поле то получаем данные о досках игроков...

  const myFieldsData = myFieldsSnap?.docs[0].data() as UserFields
  const oppFieldsData = oppFieldsSnap?.docs[0].data() as UserFields
  
  return (
    <div className='game'>
      <div className='gameHeader'>
        {/* @ts-ignore */}
        ИГРА НАЧАЛАСЬ! Ваш соперник - {getEnemyEmail(gameData.users, user?.email)}
        <br />
        {isMyTurn ? 'Ваш ход' : 'Ход соперника...'}
      </div>
      <div>
        <RenderFields
          myFieldsData={myFieldsData}
          oppFieldsData={oppFieldsData}
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
      game: JSON.stringify(data),

    }
  }
}

type RenderFieldsProps = {
  myFieldsData: UserFields
  oppFieldsData: UserFields
}

const RenderFields = ({ myFieldsData, oppFieldsData }: RenderFieldsProps) => {

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

  console.log(myFieldsData)
  console.log(oppFieldsData)

  return (
    <>
      <div className="fields">
        <div className="field fieldSelf">
          {/* Рендрим свое поле... */}
          <div className="letters">
            {markups.letters.map(letter =>
              <div className="letter">
                {letter}
              </div>
            )}
          </div>
          <div className="numbers">
            {markups.numbers.map(number =>
              <div className="number">
                {number}
              </div>
            )}
          </div>
          <RenderMyField fieldData={myFieldsData} />
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
          <RenderOppField
            fieldData={oppFieldsData}
            handleClick={handleClick}
          />
        </div>
      </div>
    </>
  )
}

type RenderMyFieldProps = {
  fieldData: UserFields
}

const RenderMyField = ({ fieldData }: RenderMyFieldProps) => {

  return <div>
    {fieldData.field.map(field =>
      <RenderFieldBlock
        value={field.value}
        ableToClick={false}
        isShipDefeated={field.shipHealth === 0 && field.maxHealth > 0}
      />
    )}
  </div>
}

type RenderOppFieldProps = {
  fieldData: UserFields
  handleClick: (index: number) => void
}

const RenderOppField = ({ fieldData, handleClick }: RenderOppFieldProps) => {
  const [ableToClick, setAbleToClick] = useState(true);

  return <div>
    {
      fieldData.shownField.map((field, index) =>
        <RenderFieldBlock
          value={field.value}
          ableToClick={ableToClick}
          isShipDefeated={
            fieldData.field[index].shipHealth === 0
            && fieldData.field[index].maxHealth > 0
          }
          click={() => {
            setAbleToClick(false);
            handleClick(index)
          }}
        />
      )
    }
  </div>
}

type RenderFieldBlock = {
  value: string
  click?: () => void
  ableToClick: boolean
  isShipDefeated: boolean
}

const RenderFieldBlock = ({ value, click, ableToClick, isShipDefeated }: RenderFieldBlock) => {

  return (
    <>
      <button
        className={`w-[70px] h-[70px] border border-[#99999] ${isShipDefeated && 'bg-red-500'}`}
        onClick={click}
        disabled={!ableToClick}
      >
        {value}
      </button>
    </>
  )
}



