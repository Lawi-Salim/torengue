import React from 'react';

const EmptyState = ({ title, message }) => {
  return (
    <div className="container-empty">
      <h1>{title}</h1>
      <p>{message}</p>
    </div>
  );
};

export default EmptyState;
