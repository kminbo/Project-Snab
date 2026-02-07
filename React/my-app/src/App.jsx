import Chatbot from './gemini/Chatbot.jsx'
import { useState } from 'react'
import './App.css'
import LandingPage from './components/LandingPage'
import ChatPage from './components/ChatPage'

function App() {

  const [currentPage, setCurrentPage] = useState('landing');

  const enterChat = () => {
    setCurrentPage('chat');
  };

  return (
    <div className="app-container">
      {currentPage === 'landing' ? (
        <LandingPage onEnter={enterChat} />
      ) : (
        <ChatPage />
      )}
    </div>
  )
}

export default App
