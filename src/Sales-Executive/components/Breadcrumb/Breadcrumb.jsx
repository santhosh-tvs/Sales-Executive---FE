import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Breadcrumb.css';

const Breadcrumb = ({ currentPage, parentPage = "Home", parentPath = "/sales-home" }) => {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate(parentPath);
  };

  return (
    <div className="breadcrumb-navigation">
      <span 
        className="breadcrumb-home" 
        onClick={handleHomeClick}
        role="button"
        tabIndex={0}
      >
        {parentPage}
      </span>
      <span className="breadcrumb-separator"> / </span>
      <span className="breadcrumb-current">{currentPage}</span>
    </div>
  );
};

export default Breadcrumb;