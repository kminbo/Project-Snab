import Chatbot from './gemini/Chatbot.jsx'
import { useState } from 'react'
import './App.css'
import LandingPage from './components/LandingPage'
import ChatPage from './components/ChatPage'

// Main App component that manages page routing
function App() {

  // State to track if the user is on the landing page or chat page
  const [currentPage, setCurrentPage] = useState('landing');

  // Function to switch to the chat interface
  const enterChat = () => {
    setCurrentPage('chat');
  };

  return (
    <div className="app-container">
      {/* Conditionally render LandingPage or ChatPage based on state */}
      {currentPage === 'landing' ? (
        <LandingPage onEnter={enterChat} />
      ) : (
        <ChatPage />
      )}
    </div>
  )
}

export default App
