import React from "react";
import '../EditStyle.css'
import {useState} from "react";
import {NavLink} from "react-router-dom";

export const EditField = React.memo(({field, setField, setReady, markupNumbers, markupLetters}) => {

  const [ships, setShips] = useState([
    {type: 'large',  left: 1,  length: 4},
    {type: 'big',    left: 2,  length: 3},
    {type: 'medium', left: 3,  length: 2},
    {type: 'small',  left: 4,  length: 1}
  ])
  const [id, setId] = useState(0)
  const [shipIsActive, setShipIsActive] = useState('large')
  const active = !((ships[0].left + ships[1].left + ships[2].left + ships[3].left) === 0) // считаем количество оставшихся кораблей . . .
  const [isVertical, setIsVertical] = useState(true)

  console.log(field)

  // функция обработчик события нажатия на поле . . .
  function handleClick(i) {
    // создаём копии массивов . . .
    let fieldCopy = [...field]
    let shipsCopy = [...ships]

    // выбор оси . . .
    let axis = isVertical ? 10 : 1

    let cells = []
    // проходимся по массиву кораблей . . .
    shipsCopy.map(ship => {
      if(ship.type === shipIsActive && ship.left > 0) {
        // проверка можно ли ставить корабль в эту точку . . .
        // добавление корабля на поле . . .
        for(let j = 0; j < ship.length; j++) {
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
      if( cell > 99 || (cell % 10 === 0 && index !== 0 && !isVertical) || !field[cell].isFree) {
        // если нельзя то зануляем массив с изменениями поля. . .
        fieldCopy = [...field]
        isAbleToTurn = false
      }
    })
    // если можно сделать ход, то убавляем количество кораблей данного типа . . .
    if (isAbleToTurn) {
      shipsCopy.map((ship,index) => {
        if(ship.type === shipIsActive) {
          ship.left -= 1
          if( ship.left === 0 && shipIsActive !== 'small') {
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
  function mouseOver(i) {
    // создаём копии массивов . . .
    let fieldCopy = [...field]
    let shipsCopy = [...ships]

    // выбор оси . . .
    let axis = isVertical ? 10 : 1

    // зануляем прошлую подсветку . . .
    fieldCopy.forEach(field => field.backlight = false)
    // создаём массив для индексов ячеек, которые надо закрасить . . .
    let cells = []

    // проходимся по массиву кораблей . . .
    shipsCopy.map((ship, index) => {
      if(ship.type === shipIsActive && ship.left > 0) {
        // подсветка поля . . .
        for(let j = 0; j < ship.length; j++) {
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
      if( cell > 99 || (cell % 10 === 0 && index !== 0 && !isVertical) || !fieldCopy[cell].isFree) {
        // если нельзя то зануляем массив с изменениями . . .
        fieldCopy = [...field]
      }
    })

    // обновляем поле . . .
    setField(fieldCopy)
  }
  // функция обаботчик для обновления состояния клеток, куда нельзя ходить . . .
  function fillField(cells, fieldCopy) {
    let axis = isVertical ? 10 : 1
    let axis1 = !isVertical ? 10 : 1
    // заполняем вспомогательные клетки чтобы нельзя было ставить туда корабли . . .
    for ( let i = 0; i < cells.length; i ++) {
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
      if (pos1) {fieldCopy[pos1] = {...fieldCopy[pos1], isFree: false, id: [...fieldCopy[pos1].id, id] }}
      if (pos2) {fieldCopy[pos2] = {...fieldCopy[pos2], isFree: false, id: [...fieldCopy[pos2].id, id] }}
      if (pos3) {fieldCopy[pos3] = {...fieldCopy[pos3], isFree: false, id: [...fieldCopy[pos3].id, id] }}
    }

    let pos4 = cells[0] - axis - axis1
    let pos5 = cells[0] - axis
    let pos6 = cells[0] - axis + axis1

    let pos7 = cells[cells.length - 1] + axis - axis1
    let pos8 = cells[cells.length - 1] + axis
    let pos9 = cells[cells.length - 1] + axis + axis1

    if (isVertical) {

      if (pos4 < 0 || (pos5 % 10 === 0 && pos4 % 10 === 9)) {
        pos4 = null
      }
      if (pos5 < 0 ) {
        pos5 = null
      }
      if (pos6 <= 0 || (pos5 % 10 === 9 && pos6 % 10 === 0)) {
        pos6 = null
      }

      if(pos7 > 99 || (pos8 % 10 === 0 && pos7 % 10 === 9)) {
        pos7 = null
      }
      if(pos8 > 99) {
        pos8 = null
      }
      if(pos9 > 99 || (pos8 % 10 === 9 && pos9 % 10 === 0)) {
        pos9 = null
      }
    } else {
      // дописать код на проверку клеток . . .
      if(cells[0] % 10 === 0) {
        pos4 = null
        pos5 = null
        pos6 = null
      }
      if(cells[cells.length - 1] % 10 === 9) {
        pos7 = null
        pos8 = null
        pos9 = null
      }
      if (pos4 < 0) {
        pos4 = null
      }
      if (pos6 > 99) {
        pos6 = null
      }
      if (pos7 < 0) {
        pos7 = null
      }
      if (pos9 > 99) {
        pos9 = null
      }
    }

    if (pos4 || pos4 === 0) {fieldCopy[pos4] = {...fieldCopy[pos4], isFree: false, id: [...fieldCopy[pos4].id, id] }}
    if (pos5 || pos5 === 0) {fieldCopy[pos5] = {...fieldCopy[pos5], isFree: false, id: [...fieldCopy[pos5].id, id] }}
    if (pos6) {fieldCopy[pos6] = {...fieldCopy[pos6], isFree: false, id: [...fieldCopy[pos6].id, id] }}
    if (pos7) {fieldCopy[pos7] = {...fieldCopy[pos7], isFree: false, id: [...fieldCopy[pos7].id, id] }}
    if (pos8) {fieldCopy[pos8] = {...fieldCopy[pos8], isFree: false, id: [...fieldCopy[pos8].id, id] }}
    if (pos9) {fieldCopy[pos9] = {...fieldCopy[pos9], isFree: false, id: [...fieldCopy[pos9].id, id] }}

    return fieldCopy
  }

  const ShipsRender = ({ships}) => {
    return (
      <>
        <div className='editPage__sidebarButton__ships'>
          {ships.map((ship, index) => <ShipsRenderBlock key={index} ship={ship} />)}
        </div>
      </>
    )
  }
  
  const ShipsRenderBlock = ({ship}) => {
    return (
      <>
        <div>
          <button
            className='editPage__sidebarButton__shipsButton'
            style={shipIsActive === ship.type ? {backgroundColor: "#61dafb"} : {}}
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

  return (
    <>
      <div className="editPage">
        <div className='editPage__field'>
          <div className="letters">
            {markupLetters.map(letter => {
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
            {markupNumbers.map(number => {
              return (
                <>
                  <div className="number">
                    {number}
                  </div>
                </>
              )
            })}
          </div>
          {field.map((f, i) => <FieldBlock field={f} key={i} index={i} click={() => handleClick(i)} active={active} mouseOver={() => mouseOver(i)} />)}
        </div>
        <div className="editPage__sidebar">
          <div className='editPage__sidebarShips'>
            <div className='editPage__sidebarShips__title'>
              Корабли
            </div>
            <div className='editPage__sidebarShips__subtitle'>
              Ваша задача расставить все эти корабли, чтобы они не касались друг друга
            </div>
            <div className='editPage__sidebarShips__blocks'>
              <span className='editPage__sidebarShips__block' >1 палубный(1кл) - <b>4шт.</b></span>
              <span className='editPage__sidebarShips__block' >2 палубный(2кл) - <b>3шт.</b></span>
              <span className='editPage__sidebarShips__block' >3 палубный(3кл) - <b>2шт.</b></span>
              <span className='editPage__sidebarShips__block' >4 палубный(4кл) - <b>1шт.</b></span>
            </div>
          </div>
          <div className="editPage__sidebarButton">
            {active
              ? <>
                  <div className='editPage__sidebarButton__left'>
                    <div className='editPage__sidebarButton__leftButtons'>
                      <button
                        className='editPage__sidebarButton__leftButton'
                        style={isVertical ? {backgroundColor: "#61dafb"} : {}}
                        onClick={() => setIsVertical(true)}
                      >
                        &darr;
                      </button>
                      <button
                        className='editPage__sidebarButton__leftButton'
                        style={!isVertical ? {backgroundColor: "#61dafb"} : {}}
                        onClick={() => setIsVertical(false)}
                      >
                        &rarr;
                      </button>
                    </div>
                    У вас осталось
                    <ShipsRender ships={ships} />
                  </div>
                </>
              : <NavLink to='/edit-page'>
                <button onClick={() => setReady(true)}>
                  Закончить расставновку
                </button>
              </NavLink>
            }
          </div>
        </div>
      </div>
    </>
  )
})

const FieldBlock = React.memo(({field, click, active, mouseOver}) => {
  console.log('bum')
  return (
    <>
      <button
        className='editPage__fieldBlock'
        onClick={click}
        disabled={!active}
        onMouseOver={mouseOver}
        style={field.backlight ? {backgroundColor: '#fcdbf4'} : {} && !field.isShip ? {backgroundColor: 'rgb(239,239,239)'} : {backgroundColor: 'rgb(200,200,200)'}}
      >
        {field.value}
      </button>
    </>
  )
}, )

