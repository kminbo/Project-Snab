import React from 'react';
import '../App.css';
import logo from '../assets/logo.jpg';
import stars from '../assets/stars.jpg';
import tree from '../assets/tree.png';

// Initial view shown to users when they first open the application
const LandingPage = ({ onEnter }) => {
  return (
    <div className="landing-page">
      {/* Visual background elements */}
      <img src={stars} alt="" className="landing-stars" />
      <img src={tree} alt="" className="landing-tree" />
      
      {/* Main logo and branding */}
      <img src={logo} alt="Thera" className="title-image" />
      <p className="tagline">Where conversation turns into comfort.</p>
      
      <div className="landing-right">
        {/* Button to transition from landing view to the chat interface */}
        <button className="enter-button" onClick={onEnter}>
          Let the magic begin
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
