import React from 'react';

const LoadState = ({ title, message }) => {
  return (
    <div className="container-empty">
      <h1>{title}</h1>
      <p>{message}</p>
    </div>
  );
};

export default LoadState;
