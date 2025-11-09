import React from 'react';

const Feedback = ({ message, type }) => {
  const baseClasses = 'text-center p-3 rounded-lg text-sm font-medium';
  const typeClasses = {
    correct: 'bg-green-500/20 text-green-300',
    close: 'bg-yellow-500/20 text-yellow-300',
    incorrect: 'bg-red-500/20 text-red-300',
    info: 'bg-gray-700/50 text-gray-300',
  };

  return (
    React.createElement('div', { className: `${baseClasses} ${typeClasses[type]}` },
      message
    )
  );
};

export default Feedback;
