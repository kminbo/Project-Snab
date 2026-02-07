import React from 'react';
import '../App.css';
import background from '../assets/THERA.jpg';

const LandingPage = ({ onEnter }) => {
  return (
    <div
      className="landing-page"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="landing-content">
        <button className="enter-button" onClick={onEnter}>
          Let the magic begin
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
