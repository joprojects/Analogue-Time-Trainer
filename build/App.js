import React, { useState } from 'react';
import Settings from './components/Settings.js';
import ReadMode from './components/modes/ReadMode.js';
import ChoiceMode from './components/modes/ChoiceMode.js';
import SetMode from './components/modes/SetMode.js';

const App = () => {
  const [difficulty, setDifficulty] = useState(1);
  const [gameMode, setGameMode] = useState('read');
  const [practiceMode, setPracticeMode] = useState('learning');
  const [focusMode, setFocusMode] = useState('both');

  const renderGameMode = () => {
    const commonProps = { difficulty, practiceMode, focusMode };
    switch (gameMode) {
      case 'read':
        return React.createElement(ReadMode, commonProps);
      case 'choice':
        return React.createElement(ChoiceMode, commonProps);
      case 'set':
        return React.createElement(SetMode, commonProps);
      default:
        return React.createElement(ReadMode, commonProps);
    }
  };
  
  const settingsProps = { 
    difficulty, setDifficulty,
    gameMode, setGameMode,
    practiceMode, setPracticeMode,
    focusMode, setFocusMode,
  };

  return (
    React.createElement('div', { className: "min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4" },
      React.createElement('div', { className: "w-full max-w-md mx-auto space-y-8" },
        // Game Panel
        React.createElement('main', { className: "w-full bg-gray-800 rounded-2xl shadow-2xl p-6 space-y-6" },
          React.createElement('h1', { className: "text-2xl font-bold text-center text-gray-100" }, "Analogue Time Trainer"),
          renderGameMode()
        ),
        
        // Settings Panel
        React.createElement('aside', { className: "w-full bg-gray-800 rounded-2xl shadow-2xl p-6" },
          React.createElement('h2', { className: "text-xl font-bold mb-4 text-gray-200" }, "Settings"),
          React.createElement(Settings, settingsProps)
        )
      )
    )
  );
};

export default App;