import React from 'react';

const Controls = ({
  userInput,
  setUserInput,
  onCheckTime,
  focusMode
}) => {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      onCheckTime();
    }
  };

  const getPlaceholder = () => {
    switch (focusMode) {
      case 'hours':
        return 'Enter hour (1-12)';
      case 'minutes':
        return 'Enter minute (0-59)';
      case 'both':
      default:
        return 'e.g., 4:50 or 450';
    }
  };
  
  return (
    React.createElement('div', { className: "space-y-4" },
      React.createElement('div', { className: "flex items-center justify-center space-x-2" },
        React.createElement('input', {
          type: "text",
          value: userInput,
          onChange: (e) => setUserInput(e.target.value),
          onKeyDown: handleKeyDown,
          placeholder: getPlaceholder(),
          className: "w-full text-center bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-lg font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none",
          'aria-label': "Time Input",
          autoFocus: true,
          inputMode: "numeric"
        })
      ),
      React.createElement('div', { className: "flex flex-col space-y-2" },
        React.createElement('button', {
          onClick: onCheckTime,
          className: "w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 transition-colors duration-200"
        }, "Check Time")
      )
    )
  );
};

export default Controls;