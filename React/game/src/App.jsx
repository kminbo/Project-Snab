import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import GameOne from './game-one'
import GameTwo from './game-two'
import GameThree from './game-three'
import GameFour from './game-four'
import GameFive from './game-five'

function App() {
  const [count, setCount] = useState(0)

  return <GameOne />;
}

export default App
