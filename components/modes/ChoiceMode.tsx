import React, { useState, useEffect, useCallback, useRef } from 'react';
import Clock from '../Clock.tsx';
import Feedback from '../Feedback.tsx';

const generateRandomTimeUtil = (focus) => {
    if (focus === 'hours') {
        return { hour: Math.floor(Math.random() * 12) + 1, minute: Math.floor(Math.random() * 60) };
    }
    if (focus === 'minutes') {
        return { hour: Math.floor(Math.random() * 12) + 1, minute: Math.floor(Math.random() * 59) + 1 };
    }
    return {
        hour: Math.floor(Math.random() * 12) + 1,
        minute: Math.floor(Math.random() * 60),
    };
};

const chooseNextQuestion = (pool, mode, focus) => {
    const relevantPool = pool.filter(item => {
        if (focus === 'hours') return item.type === 'exact';
        if (focus === 'minutes') return item.type === 'minute';
        return true;
    });

    const updatedPool = pool.map(item => ({ ...item, dueIn: item.dueIn - 1 }));
    const dueItems = relevantPool.filter(item => updatedPool.find(p => p === item && p.dueIn <= 0));
    
    let correctTime;
    let poolAfterSelection = updatedPool;
    let reviewType = null;

    if (mode === 'learning' && dueItems.length > 0) {
      const itemToReview = dueItems[0];
      const mainPoolIndex = updatedPool.findIndex(p => p.time === itemToReview.time && p.type === itemToReview.type);
      if (mainPoolIndex > -1) {
        poolAfterSelection.splice(mainPoolIndex, 1);
      }
      
      reviewType = itemToReview.type;
      
      if (itemToReview.type === 'exact') {
        correctTime = focus === 'hours' ? { ...itemToReview.time, minute: Math.floor(Math.random() * 60) } : itemToReview.time;
      } else {
        const newHour = Math.floor(Math.random() * 12) + 1;
        correctTime = { hour: newHour, minute: itemToReview.time.minute };
      }
    } else {
      correctTime = generateRandomTimeUtil(focus);
    }

    return {
        correctTime,
        nextPool: poolAfterSelection.filter(item => item.dueIn > -5),
        reviewType
    };
};

const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const ChoiceMode = ({ difficulty, practiceMode, focusMode }) => {
  const [targetTime, setTargetTime] = useState({ hour: 10, minute: 10 });
  const [options, setOptions] = useState([]);
  const [rotation, setRotation] = useState(0);
  const [feedback, setFeedback] = useState({ message: 'Select the clock that matches the time.', type: 'info' });
  const [reviewPool, setReviewPool] = useState([]);
  const [currentReviewType, setCurrentReviewType] = useState(null);
  const timeoutRef = useRef(null);

  const generateNewQuestion = useCallback(() => {
    setReviewPool(currentPool => {
        const { correctTime, nextPool, reviewType } = chooseNextQuestion(currentPool, practiceMode, focusMode);
        
        setTargetTime(correctTime);
        setCurrentReviewType(reviewType);
        setRotation(Math.random() * 360);

        const distractors = [];
        while (distractors.length < 5) {
            let newDistractor;
            if (focusMode === 'hours') {
                newDistractor = { hour: (correctTime.hour % 12) + (Math.floor(Math.random() * 11) + 1), minute: Math.floor(Math.random() * 60) };
            } else if (focusMode === 'minutes') {
                newDistractor = { hour: Math.floor(Math.random() * 12) + 1, minute: (correctTime.minute + Math.floor(Math.random() * 58) + 1) % 60 };
            } else { // both
                const distractorFn = Math.random();
                if (distractorFn < 0.3) { newDistractor = { hour: Math.round(correctTime.minute / 5) || 12, minute: (correctTime.hour % 12) * 5 };
                } else if (distractorFn < 0.6) { newDistractor = { ...correctTime, hour: (correctTime.hour % 12) + 1 };
                } else { newDistractor = generateRandomTimeUtil(focusMode); }
            }
            
            const isDuplicate = [correctTime, ...distractors].some(t => t.hour === newDistractor.hour && t.minute === newDistractor.minute);
            if (!isDuplicate) { distractors.push(newDistractor); }
        }
        setOptions(shuffle([correctTime, ...distractors]));
        setFeedback({ message: 'Select the clock that matches the time.', type: 'info' });

        return nextPool;
    });
  }, [practiceMode, focusMode]);

  useEffect(() => {
    generateNewQuestion();
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) };
  }, [difficulty, practiceMode, focusMode, generateNewQuestion]);

  const handleSelection = (selectedTime) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    let isCorrect = false;
    switch (focusMode) {
        case 'hours': isCorrect = selectedTime.hour === targetTime.hour; break;
        case 'minutes': isCorrect = selectedTime.minute === targetTime.minute; break;
        default: isCorrect = selectedTime.hour === targetTime.hour && selectedTime.minute === targetTime.minute; break;
    }
    
    let message = '';
    if (isCorrect) {
      if (currentReviewType === 'exact') {
        message = 'Correct! You remembered this one perfectly.';
      } else if (currentReviewType === 'minute') {
        message = 'Correct! You nailed that tricky minute value.';
      } else {
        message = 'Correct!';
      }
    } else {
        message = currentReviewType ? "Still not quite right. We'll try this again." : 'Not quite, try the next one!';
    }
    
    setFeedback({ message, type: isCorrect ? 'correct' : 'incorrect' });

    if (!isCorrect && practiceMode === 'learning') {
        const newReviewItems = [];
        if (focusMode !== 'minutes') {
            newReviewItems.push({ time: targetTime, type: 'exact', dueIn: Math.floor(Math.random() * 3) + 2 });
        }
        if (focusMode !== 'hours') {
            newReviewItems.push({ time: targetTime, type: 'minute', dueIn: Math.floor(Math.random() * 3) + 3 });
        }
        setReviewPool(prev => [...prev, ...newReviewItems]);
    }

    timeoutRef.current = window.setTimeout(generateNewQuestion, 1500);
  };
  
  const formatTime = (time) => {
    switch (focusMode) {
        case 'hours': return `${time.hour} o'clock`;
        case 'minutes': return `:${time.minute.toString().padStart(2, '0')}`;
        default: return `${time.hour}:${time.minute.toString().padStart(2, '0')}`;
    }
  };

  return (
    React.createElement('div', { className: "space-y-4" },
      React.createElement('div', { className: "text-center" },
        React.createElement('p', { className: "text-gray-400" }, "Select the clock showing:"),
        React.createElement('p', { className: "text-3xl font-bold text-white" }, formatTime(targetTime))
      ),
      React.createElement('div', { className: "grid grid-cols-3 gap-2" },
        ...options.map((time, index) => (
          React.createElement('div', { key: index, className: "w-full aspect-square bg-gray-700 p-1 rounded-full shadow-inner" },
            React.createElement(Clock, {
              hour: time.hour,
              minute: time.minute,
              difficulty: difficulty,
              onClick: () => handleSelection(time),
              rotation: rotation,
              focusMode: focusMode
            })
          )
        ))
      ),
      React.createElement(Feedback, { message: feedback.message, type: feedback.type })
    )
  );
};

export default ChoiceMode;