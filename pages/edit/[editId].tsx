import { addDoc, collection, doc, getDoc, query, where } from 'firebase/firestore';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection } from 'react-firebase-hooks/firestore';
import { auth, db } from '../../firebase';
import { getEnemyEmail } from '../../utils/getEnemyEmail';
import LoadingPage from '../loading';
import LoginPage from '../login';
import { MarkupsContext } from '../_app';



function EditPage() {

  const [user, loading] = useAuthState(auth);
  const [gameData, setGameData] = useState();
  const [enemyEmail, setEnemyEmail] = useState('');
  const fieldBlock = {
    value: '',
    // есть ли в клетке корабль . . .
    isShip: false,
    // значение для соседних с кораблём клеток . . .
    isFree: true,
    // подсветка клетки при проведении курсора . . .
    backlight: false,
    // здоровье клетки . . .
    health: 0,
    // здоровье корабля в данный момент . . .
    shipHealth: 0,
    // начальное здоровье корабля (зависит от размеров корабля (1-4) . . .
    maxHealth: 0,
    // уникальный id корабля (нужен для определение координат корабля при поподании в одну из его частей) . . .
    id: [null],
    // номер клетки . . .
    index: null
  }

  const [field, setField] = useState(Array(100).fill(fieldBlock));
  const [ships, setShips] = useState<Ship[]>([
    { type: 'large', left: 1, length: 4 },
    { type: 'big', left: 2, length: 3 },
    { type: 'medium', left: 3, length: 2 },
    { type: 'small', left: 4, length: 1 }
  ])
  const [id, setId] = useState(0)
  const [shipIsActive, setShipIsActive] = useState('large')
  const active = !(ships.reduce((acc, item) => acc + item.left, 0) === 0) // считаем количество оставшихся кораблей . . .
  const [isVertical, setIsVertical] = useState(true);
  const router = useRouter();
  const [myFieldsSnap] = useCollection(
    query(
      collection(db, 'fields'),
      where('owner', '==', user?.email)
    )
  ) // @ts-ignore
  if (myFieldsSnap?.docs.length > 0) {
    router.push(`/game/${router.query.editId}`)
  }
  // разметка поля . . .
  const markups = useContext(MarkupsContext);

  

  useEffect(() => {
    const getGameInfo = async () => {
      const infoRef = doc(db, `games/${router.query.editId}`)
      const infoSnap = await getDoc(infoRef);

      setGameData({ // @ts-ignore
        id: infoSnap.id,
        ...infoSnap.data()
      })
      if (!infoSnap.exists) {
        router.push('/')
      }
    }
    getGameInfo()
  }, [])

  useEffect(() => {
    if (gameData) {
      // @ts-ignore
      setEnemyEmail(getEnemyEmail(gameData.users, user?.email as string))
    }
  }, [gameData])

  // функция обработчик события нажатия на поле . . .
  function handleClick(i: number) {
    // создаём копии массивов . . .
    let fieldCopy = [...field]
    let shipsCopy = [...ships]

    // выбор оси . . .
    let axis = isVertical ? 10 : 1

    let cells = []
    // проходимся по массиву кораблей . . .
    shipsCopy.map(ship => {
      if (ship.type === shipIsActive && ship.left > 0) {
        // проверка можно ли ставить корабль в эту точку . . .
        // добавление корабля на поле . . .
        for (let j = 0; j < ship.length; j++) {
          // записываем номер ячейки . . .
          let k = i + j * axis
          // добавляем ячейку в массив . . .
          cells.push(k)
          // создаём новый объект для даной ячейки . . .
          fieldCopy[k] = {
            value: 'O',
            isFree: false,
            isShip: true,
            backlight: false,
            health: 1,
            maxHealth: ship.length,
            shipHealth: ship.length,
            id: [...fieldCopy[k].id, id],
            index: k
          }
        }
      }
    })
    // обновляем состояние клеток, куда нельзя ставить корабли . . .
    fieldCopy = fillField(cells, fieldCopy)

    let isAbleToTurn = true

    // проверка, входят ли все клетки в размеры поля . . .
    cells.forEach((cell, index) => {
      if (cell > 99 || (cell % 10 === 0 && index !== 0 && !isVertical) || !field[cell].isFree) {
        // если нельзя то зануляем массив с изменениями поля. . .
        fieldCopy = [...field]
        isAbleToTurn = false
      }
    })
    // если можно сделать ход, то убавляем количество кораблей данного типа . . .
    if (isAbleToTurn) {
      shipsCopy.map((ship, index) => {
        if (ship.type === shipIsActive) {
          ship.left -= 1
          if (ship.left === 0 && shipIsActive !== 'small') {
            // если количество кораблей данного типа === 0, берем следующий корабль . . .
            setShipIsActive(shipsCopy[index + 1].type)
          }
        }
      })
      setId(id + 1)
    }

    // обновляем поле . . .
    setField(fieldCopy)
    // обновляем корабли . . .
    setShips(shipsCopy)

  }
  // функция обработчик проведения над полем . . .
  function mouseOver(i: number) {
    // создаём копии массивов . . .
    let fieldCopy = [...field]
    let shipsCopy = [...ships]

    // выбор оси . . .
    let axis = isVertical ? 10 : 1

    // зануляем прошлую подсветку . . .
    fieldCopy.forEach(field => field.backlight = false)
    // создаём массив для индексов ячеек, которые надо закрасить . . .
    let cells: number[] = []

    // проходимся по массиву кораблей . . .
    shipsCopy.map((ship, index) => {
      if (ship.type === shipIsActive && ship.left > 0) {
        // подсветка поля . . .
        for (let j = 0; j < ship.length; j++) {
          // записываем номер ячейки . . .
          let k = i + j * axis
          // добавляем ячейку в массив . . .
          cells.push(k)
          // обновляем массив поля для подсветки . . .
          fieldCopy[k] = {
            ...fieldCopy[k],
            backlight: true
          }
        }
      }
    })

    // делаем проверку можно ли ставить корабль в эти ячейки . . .
    cells.forEach((cell, index) => {
      if (cell > 99 || (cell % 10 === 0 && index !== 0 && !isVertical) || !fieldCopy[cell].isFree) {
        // если нельзя то зануляем массив с изменениями . . .
        fieldCopy = [...field]
      }
    })

    // обновляем поле . . .
    setField(fieldCopy)
  }
  function fillField(cells: number[], fieldCopy: Field[]) {
    let axis = isVertical ? 10 : 1
    let axis1 = !isVertical ? 10 : 1
    // заполняем вспомогательные клетки чтобы нельзя было ставить туда корабли . . .
    for (let i = 0; i < cells.length; i++) {
      // может ли существовать данная клетка . . .
      let pos1 =
        ((cells[i] - axis1) % 10 === 9 && (cells[i] % 10 !== 9))
          || (cells[i] === 0)
          || (cells[i] - axis1 < 1)
          ? null : cells[i] - axis1

      let pos2 = cells[i]

      // может ли существовать данная клетка . . .
      let pos3 = (((cells[i] % 10 + axis1) === 10) && (cells[i] % 10 !== 0))
        || (cells[i] + axis1 > 99)
        ? null : cells[i] + axis1
      if (pos1) { fieldCopy[pos1] = { ...fieldCopy[pos1], isFree: false, id: [...fieldCopy[pos1].id, id] } }
      if (pos2) { fieldCopy[pos2] = { ...fieldCopy[pos2], isFree: false, id: [...fieldCopy[pos2].id, id] } }
      if (pos3) { fieldCopy[pos3] = { ...fieldCopy[pos3], isFree: false, id: [...fieldCopy[pos3].id, id] } }
    }

    let pos4: number | null = cells[0] - axis - axis1
    let pos5: number | null = cells[0] - axis
    let pos6: number | null = cells[0] - axis + axis1

    let pos7: number | null = cells[cells.length - 1] + axis - axis1
    let pos8: number | null = cells[cells.length - 1] + axis
    let pos9: number | null = cells[cells.length - 1] + axis + axis1

    if (isVertical) {

      if (pos4 < 0 || (pos5 % 10 === 0 && pos4 % 10 === 9)) {
        pos4 = null
      }
      if (pos5 < 0) {
        pos5 = null
      } // @ts-ignore
      if (pos6 <= 0 || (pos5 % 10 === 9 && pos6 % 10 === 0)) {
        pos6 = null
      }

      if (pos7 > 99 || (pos8 % 10 === 0 && pos7 % 10 === 9)) {
        pos7 = null
      }
      if (pos8 > 99) {
        pos8 = null
      } // @ts-ignore
      if (pos9 > 99 || (pos8 % 10 === 9 && pos9 % 10 === 0)) {
        pos9 = null
      }
    } else {
      // дописать код на проверку клеток . . .
      if (cells[0] % 10 === 0) {
        pos4 = null
        pos5 = null
        pos6 = null
      }
      if (cells[cells.length - 1] % 10 === 9) {
        pos7 = null
        pos8 = null
        pos9 = null
      } // @ts-ignore
      if (pos4 < 0) {
        pos4 = null
      } // @ts-ignore
      if (pos6 > 99) {
        pos6 = null
      } // @ts-ignore
      if (pos7 < 0) {
        pos7 = null
      } // @ts-ignore
      if (pos9 > 99) {
        pos9 = null
      }
    }

    if (pos4 || pos4 === 0) { fieldCopy[pos4] = { ...fieldCopy[pos4], isFree: false, id: [...fieldCopy[pos4].id, id] } }
    if (pos5 || pos5 === 0) { fieldCopy[pos5] = { ...fieldCopy[pos5], isFree: false, id: [...fieldCopy[pos5].id, id] } }
    if (pos6) { fieldCopy[pos6] = { ...fieldCopy[pos6], isFree: false, id: [...fieldCopy[pos6].id, id] } }
    if (pos7) { fieldCopy[pos7] = { ...fieldCopy[pos7], isFree: false, id: [...fieldCopy[pos7].id, id] } }
    if (pos8) { fieldCopy[pos8] = { ...fieldCopy[pos8], isFree: false, id: [...fieldCopy[pos8].id, id] } }
    if (pos9) { fieldCopy[pos9] = { ...fieldCopy[pos9], isFree: false, id: [...fieldCopy[pos9].id, id] } }

    return fieldCopy
  }

  const ShipsRender = ({ ships }: { ships: Ship[] }) => {
    return (
      <>
        <div className="mt-4 flex flex-col gap-3">
          {ships.map((ship, index) => <ShipsRenderBlock key={index} ship={ship} />)}
        </div>
      </>
    )
  }

  const ShipsRenderBlock = ({ ship }: { ship: Ship }) => {
    return (
      <>
        <div>
          <button
            className="px-1 py-2 mr-2 rounded-md text-sm lg:text-lg border-gray-600 border bg-slate-200"
            style={shipIsActive === ship.type ? { backgroundColor: "#61dafb" } : {}}
            onClick={() => setShipIsActive(ship.type)}
            disabled={!ship.left}
          >
            <b>{ship.type}</b>
          </button>
          : осталось -
          <b> {ship.left}</b>
        </div>
      </>
    )
  }

  const submitGame = async () => {
    
    await addDoc(collection(db, 'fields'), {
      owner: user?.email,
      field: field,
      shownField: Array(100).fill({value: ''})
    })
    router.push(`/game/${router.query.editId}`);
  }

  if (loading) return <LoadingPage />
  if (!user) return <LoginPage />

  return (
    <div className="">
      {!enemyEmail ? (
        <div className="">
          Loading game info...
        </div>
      ) : (
        <div className={`grid grid-cols-1 lg:grid-cols-3 h-[100vh] w-full place-items-center`}>
          <div className='field col-span-2'>
            <div className="lettersLine">
              {markups.letters.map(letter => {
                return (
                  <>
                    <div className="markupBlock">
                      {letter}
                    </div>
                  </>
                )
              })}
            </div>
            <div className="numbersLine">
              {markups.numbers.map(number => {
                return (
                  <>
                    <div className="markupBlock">
                      {number}
                    </div>
                  </>
                )
              })}
            </div>
            {field.map((f, i) =>
              <FieldBlock
                field={f}
                key={i}
                // index={i} 
                click={() => handleClick(i)}
                active={active}
                mouseOver={() => mouseOver(i)}
              />
            )}
            {!active && 
            <div className="mx-auto mt-10">
              <div className="menuItem" onClick={submitGame}>
                Подтвердить
              </div>
          </div>}
          </div>
          
              {active && <div className={`flex flex-col-reverse lg:flex-row space-x-10 p-10 ${!active && 'justify-center text'}`}>
                <div className='text-start hidden lg:inline'>
                    <div className="mb-2 text-xl font-bold">
                      Корабли
                    </div>
                    <div className="mb-4 fz-lg font-semibold">
                      Ваша задача расставить все эти корабли, чтобы они не касались друг друга
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-md lg:text-xl" >1 палубный(1кл) - <b>4шт.</b></span>
                      <span className="text-md lg:text-xl" >2 палубный(2кл) - <b>3шт.</b></span>
                      <span className="text-md lg:text-xl" >3 палубный(3кл) - <b>2шт.</b></span>
                      <span className="text-md lg:text-xl" >4 палубный(4кл) - <b>1шт.</b></span>
                    </div>
                  </div>
                  <div className="mt-5 ">
                    <div className="mb-5 flex gap-5">
                      <button
                        className="editButton"
                        style={isVertical ? { backgroundColor: "#61dafb" } : {}}
                        onClick={() => setIsVertical(true)}
                      >
                        &darr;
                      </button>
                      <button
                        className="editButton"
                        style={!isVertical ? { backgroundColor: "#61dafb" } : {}}
                        onClick={() => setIsVertical(false)}
                      >
                        &rarr;
                      </button>
                    </div>
                    У вас осталось
                    <ShipsRender ships={ships} />
                  </div>
              </div>
                  
            } 
          </div>
      )}
    </div>
  )
}

type FieldBlockProp = {
  field: Field
  click: () => void
  active: boolean
  mouseOver: () => void
}

const FieldBlock = React.memo(({ field, click, active, mouseOver }: FieldBlockProp) => {

  return (
    <>
      <button
        className={`w-[40px] h-[40px] 2xl:w-[70px] 2xl:h-[70px] 
        border ${field.backlight 
          ? 'bg-[#fcdbf4]' 
          : !field.isShip 
          ? 'bg-[rgb(239,239,239)]' 
          : 'bg-[rgb(200,200,200)]' }`}
        onClick={click}
        disabled={!active}
        onMouseOver={mouseOver}
      >
        {field.value}
      </button>
    </>
  )
})


export default EditPage