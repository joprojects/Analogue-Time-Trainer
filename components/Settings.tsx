import React from 'react';

// FIX: Props interface updated to remove mobile-specific optional props.
interface SettingsProps {
  difficulty: number;
  setDifficulty: React.Dispatch<React.SetStateAction<number>>;
  gameMode: string;
  setGameMode: React.Dispatch<React.SetStateAction<string>>;
  practiceMode: string;
  setPracticeMode: React.Dispatch<React.SetStateAction<string>>;
  focusMode: string;
  setFocusMode: React.Dispatch<React.SetStateAction<string>>;
}

const Settings = ({ 
  difficulty, setDifficulty, 
  gameMode, setGameMode, 
  practiceMode, setPracticeMode, 
  focusMode, setFocusMode
}: SettingsProps) => {
  const levels = [1, 2, 3, 4, 5, 6];
  const modes = [
    { id: 'read', label: 'Read' },
    { id: 'choice', label: 'Match' },
    { id: 'set', label: 'Set' },
  ];
  const practiceModes = [
    { id: 'learning', label: 'Learning' },
    { id: 'random', label: 'Random' },
  ];
  const focusModes = [
    { id: 'both', label: 'Both' },
    { id: 'hours', label: 'Hours' },
    { id: 'minutes', label: 'Minutes' },
  ];

  const renderButton = (items, selectedItem, setItem) => {
    return items.map(item => 
        React.createElement('button', {
            key: item.id,
            onClick: () => setItem(item.id),
            className: `w-full text-center font-semibold text-sm px-3 py-2 rounded-md transition-colors duration-200 ${
                selectedItem === item.id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'
            }`
        }, item.label)
    );
  };

  // The component now only returns the settings content directly.
  return (
    React.createElement('div', { className: "space-y-4" },
      React.createElement('div', null,
        React.createElement('label', { className: "text-sm font-medium text-gray-400 block mb-2" }, "Practice Mode"),
        React.createElement('div', { className: "flex bg-gray-700 rounded-lg p-1" },
          ...renderButton(practiceModes, practiceMode, setPracticeMode)
        )
      ),
      React.createElement('div', null,
        React.createElement('label', { className: "text-sm font-medium text-gray-400 block mb-2" }, "Game Mode"),
        React.createElement('div', { className: "flex bg-gray-700 rounded-lg p-1" },
          ...renderButton(modes, gameMode, setGameMode)
        )
      ),
      React.createElement('div', null,
        React.createElement('label', { className: "text-sm font-medium text-gray-400 block mb-2" }, "Focus"),
        React.createElement('div', { className: "flex bg-gray-700 rounded-lg p-1" },
          ...renderButton(focusModes, focusMode, setFocusMode)
        )
      ),
      React.createElement('div', null,
        React.createElement('label', { className: "text-sm font-medium text-gray-400 block mb-2" }, "Difficulty Level"),
        React.createElement('div', { className: "grid grid-cols-3 gap-2" },
          ...levels.map(level => (
            React.createElement('button', {
              key: level,
              onClick: () => setDifficulty(level),
              className: `text-center font-semibold text-sm px-3 py-2 rounded-md transition-colors duration-200 ${
                difficulty === level ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`
            }, level)
          ))
        )
      )
    )
  );
};

export default Settings;