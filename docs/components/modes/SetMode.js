import React, { useState, useEffect, useCallback, useRef } from 'react';
import Clock from '../Clock.js';
import Feedback from '../Feedback.js';

const generateRandomTimeUtil = (focus) => {
    if (focus === 'hours') {
        return { hour: Math.floor(Math.random() * 12) + 1, minute: 0 };
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

    let nextTime;
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
        nextTime = focus === 'hours' ? { ...itemToReview.time, minute: 0 } : itemToReview.time;
      } else {
        const newHour = Math.floor(Math.random() * 12) + 1;
        nextTime = { hour: newHour, minute: itemToReview.time.minute };
      }
    } else {
      nextTime = generateRandomTimeUtil(focus);
    }
    
    return { 
        nextTime, 
        nextPool: poolAfterSelection.filter(item => item.dueIn > -5),
        reviewType
    };
};

const SetMode = ({ difficulty, practiceMode, focusMode }) => {
  const [targetTime, setTargetTime] = useState({ hour: 0, minute: 0 });
  const [userTime, setUserTime] = useState({ hour: 12, minute: 0 });
  const [rotation, setRotation] = useState(0);
  const [feedback, setFeedback] = useState({ message: 'Use the slider to set the time.', type: 'info' });
  const [reviewPool, setReviewPool] = useState([]);
  const [currentReviewType, setCurrentReviewType] = useState(null);
  
  const timeoutRef = useRef(null);
  const dragStartRef = useRef(null);

  const generateNewQuestion = useCallback(() => {
    setReviewPool(currentPool => {
      const { nextTime, nextPool, reviewType } = chooseNextQuestion(currentPool, practiceMode, focusMode);

      setTargetTime(nextTime);
      setCurrentReviewType(reviewType);
      setRotation(Math.random() * 360);
      setUserTime({ hour: 12, minute: 0 });
      setFeedback({ message: 'Use the slider to set the time.', type: 'info' });
      
      return nextPool;
    });
  }, [practiceMode, focusMode]);

  useEffect(() => {
    generateNewQuestion();
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) };
  }, [difficulty, practiceMode, focusMode, generateNewQuestion]);
  
  const handlePointerMove = useCallback((e) => {
    if (!dragStartRef.current) return;
    
    const deltaY = e.clientY - dragStartRef.current.y;
    const minuteChange = -deltaY / 2;
  
    let newTotalMinutes = dragStartRef.current.timeInMinutes + minuteChange;
    newTotalMinutes = (newTotalMinutes % 720 + 720) % 720;
  
    const newHour = Math.floor(newTotalMinutes / 60) || 12;
    const newMinute = Math.round(newTotalMinutes) % 60;
    
    setUserTime({ hour: newHour, minute: newMinute });
  }, []);

  const handlePointerUp = useCallback(() => {
    dragStartRef.current = null;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  }, [handlePointerMove]);

  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
  
    const totalMinutes = (userTime.hour % 12) * 60 + userTime.minute;
    dragStartRef.current = { y: e.clientY, timeInMinutes: totalMinutes };
    
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }, [userTime, handlePointerMove, handlePointerUp]);

  const handleCheckTime = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    let isCorrect = false;
    let currentFeedback;

    if (focusMode === 'hours') {
        isCorrect = userTime.hour === targetTime.hour;
        if (isCorrect) {
            currentFeedback = { message: currentReviewType ? "Correct! You've mastered this hour." : "Perfect! That's the right hour.", type: 'correct' };
        } else {
            const userTimeStr = `(You set for hour ${userTime.hour})`;
            currentFeedback = { message: currentReviewType ? `Still tricky. The correct hour was ${targetTime.hour}. ${userTimeStr}` : `Not quite. The correct hour was ${targetTime.hour}. ${userTimeStr}`, type: 'incorrect' };
        }
    } else { 
        const correctTotalMinutes = (targetTime.hour % 12) * 60 + targetTime.minute;
        const userTotalMinutes = (userTime.hour % 12) * 60 + userTime.minute;
        let diff = Math.abs(correctTotalMinutes - userTotalMinutes);
        diff = Math.min(diff, 720 - diff);
        
        let minuteDiff = Math.abs(targetTime.minute - userTime.minute);
        minuteDiff = Math.min(minuteDiff, 60 - minuteDiff);

        isCorrect = focusMode === 'minutes' ? minuteDiff === 0 : diff === 0;

        if (isCorrect) {
            if (currentReviewType === 'exact') {
                currentFeedback = { message: "Excellent! You got this time right after missing it before.", type: 'correct' };
            } else if (currentReviewType === 'minute') {
                currentFeedback = { message: `Well done! You've mastered the ${targetTime.minute} minute mark.`, type: 'correct' };
            } else {
                currentFeedback = { message: "Perfect! That's exactly right.", type: 'correct' };
            }
        } else if ( (focusMode === 'minutes' && minuteDiff <= 2) || (focusMode === 'both' && diff <= 2) ) {
            const relevantDiff = focusMode === 'minutes' ? minuteDiff : diff;
            currentFeedback = { message: `So close! You were only ${relevantDiff} minute${relevantDiff > 1 ? 's' : ''} off.`, type: 'close' };
        } else {
            const userTimeStr = `(You set ${userTime.hour}:${userTime.minute.toString().padStart(2, '0')})`;
            const relevantDiff = focusMode === 'minutes' ? minuteDiff : diff;
            let message = '';
            if (currentReviewType === 'exact') {
                message = `Still struggling with this exact time. You were ${relevantDiff} minutes off. ${userTimeStr}`;
            } else if (currentReviewType === 'minute') {
                message = `That minute value seems tricky. You were ${relevantDiff} minutes off this time. ${userTimeStr}`;
            } else {
                message = `Not quite. You were ${relevantDiff} minutes off. ${userTimeStr}`;
            }
            currentFeedback = { message, type: 'incorrect' };
        }
    }
    
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
    
    setFeedback(currentFeedback);

    timeoutRef.current = window.setTimeout(generateNewQuestion, 2500);
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
        React.createElement('p', { className: "text-gray-400" }, "Set the clock to:"),
        React.createElement('p', { className: "text-3xl font-bold text-white" }, formatTime(targetTime))
      ),
      React.createElement('div', { className: "flex items-center space-x-2" },
        React.createElement('div', { className: "w-full aspect-square rounded-full shadow-inner overflow-hidden" },
          React.createElement(Clock, {
            hour: userTime.hour,
            minute: userTime.minute,
            difficulty: difficulty,
            rotation: rotation,
            focusMode: focusMode
          })
        ),
        React.createElement('div', {
          onPointerDown: handlePointerDown,
          className: "w-10 h-64 bg-gray-700 rounded-full cursor-ns-resize flex flex-col items-center justify-between py-4 select-none",
          style: { touchAction: 'none' }
        },
          React.createElement('svg', { className: "w-4 h-4 text-gray-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 15l7-7 7 7" })),
          React.createElement('span', { className: "text-xs text-gray-500 font-bold transform rotate-90 whitespace-nowrap" }, "CROWN"),
          React.createElement('svg', { className: "w-4 h-4 text-gray-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" }))
        )
      ),
      React.createElement(Feedback, { message: feedback.message, type: feedback.type }),
      React.createElement('button', {
        onClick: handleCheckTime,
        className: "w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 transition-colors duration-200"
      }, "Set Time")
    )
  );
};

export default SetMode;