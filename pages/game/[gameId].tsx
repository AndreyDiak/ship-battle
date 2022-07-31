import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useContext, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollection, useDocument } from 'react-firebase-hooks/firestore'
import FinishPopup from '../../components/FinishPopup'
import Header from '../../components/Header'
import { auth, db } from '../../firebase'
import { getEnemyEmail } from '../../utils/getEnemyEmail'
import LoadingPage from '../loading'
import { MarkupsContext } from '../_app'

function GamePage({ game }: any) {
  // getting the user data...
  const [user] = useAuthState(auth);
  const router = useRouter();
  // getting game data...
  const [gameDataSnap] = useDocument(doc(db, `games/${router.query.gameId}`));
  // push game data
  // if (!gameDataSnap) {
  //   router.push('/')
  // }
  const gameData = gameDataSnap 
    ? {
      id: gameDataSnap.id,
      ...gameDataSnap.data()
    } 
    : JSON.parse(game);
  // update turns content...
  const isMyTurn = gameData.turn === user?.email
  
  if (!gameData) router.push('/');

  const [myFieldsSnap] = useCollection(
    query(
      collection(db, 'fields'),
      where('owner', '==', `${user?.email}`)
    )
  )

  const [oppFieldsSnap] = useCollection(
    query(
      collection(db, 'fields'),
      where('owner', '==', getEnemyEmail(gameData.users, user?.email as string))
    )
  )
  
  // загрузка данных о полях...
  if (!oppFieldsSnap?.docs.length || !myFieldsSnap?.docs.length) return <LoadingPage />
  // если оба игрока расставили поле то получаем данные о досках игроков...
  const myFieldsData = myFieldsSnap?.docs[0].data() as UserFields
  const oppFieldsData = oppFieldsSnap?.docs[0].data() as UserFields
  const myFieldId = myFieldsSnap.docs[0].id;
  const oppFieldId = oppFieldsSnap.docs[0].id;
  // считаем живые клетки...
  const myTotalHealth = myFieldsData.field.reduce((total, item) => total + item.health, 0);
  const oppTotalHealth = oppFieldsData.field.reduce((total, item) => total + item.health, 0);
  // если мы убили все корабли то заканичиваем игру...
  if (myTotalHealth === 0) {
    console.log('You lose..')
  }
  if (oppTotalHealth === 0) {
    console.log('You win!')
  }

  return (
    <div className='relative'>
      {(myTotalHealth === 0 || oppTotalHealth === 0) && (
        <FinishPopup 
          winner={
            myTotalHealth === 0 ? oppFieldsData.owner : user?.email as string
          } 
          gameId={router.query.gameId as string}
          myFieldId={myFieldId}
          oppFieldId={oppFieldId}
        />
      )}
      <Header title={isMyTurn ? 'Ваш ход' : 'Ход соперника...'} />
      <div className=''>
        {/* @ts-ignore */}
        ИГРА НАЧАЛАСЬ! Ваш соперник - {getEnemyEmail(gameData.users, user?.email)}
      </div>   
      <div>
        <RenderFields
          myFieldsData={myFieldsData}
          oppFieldsData={oppFieldsData}
          isMyTurn={isMyTurn}
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
  isMyTurn: boolean
}

const RenderFields = ({ myFieldsData, oppFieldsData, isMyTurn }: RenderFieldsProps) => {

  const markups = useContext(MarkupsContext);
  const router = useRouter();

  const handleClick = async (i: number) => {
    // копия поля противника . . .
    let oppFieldCopy = [...oppFieldsData.field];
    let shownOppFieldCopy = [...oppFieldsData.shownField];

    if (oppFieldCopy[i].value !== '') {
      // заполняем поле О при удачном ходе . . .
      shownOppFieldCopy[i] = {
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
                shownOppFieldCopy[i] = { value: 'x' }
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
    } else {
      // заполняем поле х при неудачном ходе . . .
      shownOppFieldCopy[i] = { value: 'x' }
      oppFieldCopy[i] = {
        ...oppFieldCopy[i],
        value: 'x'
      }
      await updateDoc(doc(db, `games/${router.query.gameId}`), {
        turn: oppFieldsData.owner
      })
    }
    const oppFieldRef = query(
      collection(db, 'fields'),
      where('owner', '==', oppFieldsData.owner)
    )
    const oppDataId = await (await getDocs(oppFieldRef)).docs[0].id
    await updateDoc(doc(db, `fields/${oppDataId}`), {
      field: oppFieldCopy,
      shownField: shownOppFieldCopy
    })
  }

  return (
    <>
      <div className="fields">
        <div className="field">
          {/* Рендрим свое поле... */}
          <div className="lettersLine">
            {markups.letters.map((letter, index) =>
              <div className="markupBlock" key={index}>
                {letter}
              </div>
            )}
          </div>
          <div className="numbersLine">
            {markups.numbers.map((number, index) =>
              <div className="markupBlock" key={index}>
                {number}
              </div>
            )}
          </div>
          <RenderMyField fieldData={myFieldsData} />
        </div>
        <div className="field">
          <div className="lettersLine">
            {markups.letters.map((letter, index) =>
              <div className="markupBlock" key={index}>
                {letter}
              </div>
            )}
          </div>
          <div className="numbersLine">
            {markups.numbers.map((number, index) =>
              <div className="markupBlock" key={index}>
                {number}
              </div>
            )}
          </div>
          {/* рендрим поле соперника . . . */}
          <RenderOppField
            fieldData={oppFieldsData}
            handleClick={handleClick}
            isMyTurn={isMyTurn}
          />
        </div>
      </div>
    </>
  )
}

type RenderMyFieldProps = {
  fieldData: UserFields
}

const RenderMyField = React.memo(({ fieldData }: RenderMyFieldProps) => {

  return <>
    {fieldData.field.map((field, index) =>
      <RenderFieldBlock
        key={index}
        value={field.value}
        ableToClick={false}
        isShipDefeated={field.shipHealth === 0 && field.maxHealth > 0}
      />
    )}
  </>
})

type RenderOppFieldProps = {
  fieldData: UserFields
  handleClick: (index: number) => void
  isMyTurn: boolean
}

const RenderOppField = React.memo(({ fieldData, handleClick, isMyTurn }: RenderOppFieldProps) => {
  const [ableToClick, setAbleToClick] = useState(true);

  return <>
    {
      fieldData.shownField.map((field, index) =>
        <RenderFieldBlock
          key={index}
          value={field.value}
          ableToClick={ableToClick && isMyTurn}
          isShipDefeated={
            fieldData.field[index].shipHealth === 0
            && fieldData.field[index].maxHealth > 0
          }
          click={async () => {
            setAbleToClick(false);
            handleClick(index)
            setAbleToClick(true)
          }}
        />
      )
    }
  </>
})

type RenderFieldBlock = {
  value: string
  click?: () => void
  ableToClick: boolean
  isShipDefeated: boolean
}

const RenderFieldBlock = React.memo(({ value, click, ableToClick, isShipDefeated }: RenderFieldBlock) => {

  return (
    <>
      <button
        className={`fieldBlock ${isShipDefeated ? 'bg-red-500' : ableToClick ? 'hover:bg-gray-200' : ''}`}
        onClick={click}
        disabled={!ableToClick}
      >
        {value}
      </button>
    </>
  )
}
)


