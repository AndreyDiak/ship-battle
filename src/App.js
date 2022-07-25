import React from "react";
import './App.css';
import {BrowserRouter, Redirect, Route, Switch} from "react-router-dom";
import {WelcomePage} from "./components/WelcomePage";
import {GamePage} from "./components/GamePage";
import {useState} from "react";
import {EditField} from "./components/EditField";
import {EditPage} from "./components/EditPage";

const App = React.memo(() => {
  // объект, который представляет собой клетку поля . . .
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
  // создаём поля для двух игроков . . .
  const [firstPlayerField, setFirstPlayerField] = useState(Array(100).fill(fieldBlock))
  const [secondPlayerField, setSecondPlayerField] = useState(Array(100).fill(fieldBlock))
  const [isFirstPlayerReady, setIsFirstPlayerReady] = useState(false)
  const [isSecondPlayerReady, setIsSecondPlayerReady] = useState(false)
  const isReady = isFirstPlayerReady && isSecondPlayerReady

  // разметка поля . . .
  const markupNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  const markupLetters = ['А','Б','В','Г','Д','Е','Ж','З','И','К']

  return (
    <>
      <BrowserRouter>
        <Switch>
          <Redirect exact from='/' to='start-page'/>
          {/* главная страница игры . . . */}
          <Route exact path='/start-page' render={() => <WelcomePage isReady={isReady}/> }/>
          {/* страница редактирования . . . */}
          {/* страница игры . . . */}
          <Route path='/game-page' render={() =>
            <GamePage
              firstPlayerField={firstPlayerField}
              setFirstPlayerField={setFirstPlayerField}
              secondPlayerField={secondPlayerField}
              setSecondPlayerField={setSecondPlayerField}
              markupNumbers={markupNumbers}
              markupLetters={markupLetters}
            />
          }/>
          <Route exact path='/edit-page' render={() => <EditPage isFirst={isFirstPlayerReady} isSecond={isSecondPlayerReady}/> }/>
          {/* страницы для расставления кораблей на поле . . . */}
          <Route path='/edit-page/first-edit' render={() =>
            <EditField
              markupNumbers={markupNumbers}
              markupLetters={markupLetters}
              field={firstPlayerField}
              setField={setFirstPlayerField}
              setReady={setIsFirstPlayerReady}
            />
          }/>
          <Route path='/edit-page/second-edit' render={() =>
            <EditField
              markupNumbers={markupNumbers}
              markupLetters={markupLetters}
              field={secondPlayerField}
              setField={setSecondPlayerField}
              setReady={setIsSecondPlayerReady}
            />
          }/>
        </Switch>
      </BrowserRouter>
    </>
  )
})

export default App;
