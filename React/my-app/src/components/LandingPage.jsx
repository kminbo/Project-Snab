import React from 'react';
import '../App.css';
import logo from '../assets/logo.jpg';
import stars from '../assets/stars.jpg';
import tree from '../assets/tree.png';

const LandingPage = ({ onEnter }) => {
  return (
    <div className="landing-page">
      <img src={stars} alt="" className="landing-stars" />
      <img src={tree} alt="" className="landing-tree" />
      <img src={logo} alt="Thera" className="title-image" />
      <p className="tagline">Where conversation turns into comfort.</p>
      <div className="landing-right">
        <button className="enter-button" onClick={onEnter}>
          Let the magic begin
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
