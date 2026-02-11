import React from 'react';
import trashIcon from '../../../assets/Icons/Trash can.png';
import './Trash.css';

const Trash = ({ onClick, size = 'medium' }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      console.log('Delete action triggered');
    }
  };

  return (
    <button 
      className={`trash-icon-btn ${size}`}
      onClick={handleClick}
      title="Delete"
    >
      <img 
        src={trashIcon} 
        alt="Delete" 
        className="trash-icon"
      />
    </button>
  );
};

export default Trash;