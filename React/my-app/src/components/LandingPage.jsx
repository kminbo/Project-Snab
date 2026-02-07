import React from 'react';
import '../App.css'; // Ensure we have access to global styles

const LandingPage = ({ onEnter }) => {
  return (
    <div className="landing-page">
      <div className="landing-content">
        <img 
          src="https://picsum.photos/800/400" 
          alt="Landscape" 
          className="landing-image" 
        />
        <button className="enter-button" onClick={onEnter}>
          Enter Chat
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
