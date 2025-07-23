import React from 'react';

const Spinner = ({ size, style, inline = false, text = 'Chargement de données...' }) => {
  if (inline) {
    const spinnerStyle = {
      width: size || 24,
      height: size || 24,
      ...style,
    };
    return <div className="spinner-loader" style={spinnerStyle}></div>;
  }

  return (
    <div className="container-empty">
      <div className="spinner-loader"></div>
      <p>{text}</p>
    </div>
  );
};

export default Spinner;