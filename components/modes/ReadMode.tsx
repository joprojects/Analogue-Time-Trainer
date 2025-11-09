import React, { useState, useEffect, useCallback, useRef } from 'react';
import Clock from '../Clock.tsx';
import Controls from '../Controls.tsx';
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
        nextTime = focus === 'hours' ? { ...itemToReview.time, minute: Math.floor(Math.random() * 60) } : itemToReview.time;
      } else { // 'minute' type
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

const ReadMode = ({ difficulty, practiceMode, focusMode }) => {
  const [time, setTime] = useState({ hour: 0, minute: 0 });
  const [timeSetCount, setTimeSetCount] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState({ message: 'Read the clock and enter the time below.', type: 'info' });
  const [reviewPool, setReviewPool] = useState([]);
  const [currentReviewType, setCurrentReviewType] = useState(null);
  
  const timeoutRef = useRef(null);

  const generateNewQuestion = useCallback(() => {
    setReviewPool(currentPool => {
        const { nextTime, nextPool, reviewType } = chooseNextQuestion(currentPool, practiceMode, focusMode);
        
        setTime(nextTime);
        setCurrentReviewType(reviewType);
        setRotation(Math.random() * 360);
        setTimeSetCount(count => count + 1);

        return nextPool;
    });
  }, [practiceMode, focusMode]);

  useEffect(() => {
    generateNewQuestion();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [difficulty, practiceMode, focusMode, generateNewQuestion]);

  const handleCheckTime = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    let isCorrect = false;
    let currentFeedback;
    
    const cleanedInput = userInput.trim();

    if (focusMode === 'hours') {
        const h = parseInt(cleanedInput, 10);
        if (isNaN(h) || h < 1 || h > 12) {
            setFeedback({ message: 'Invalid hour. Use a number from 1-12.', type: 'incorrect' });
            return;
        }
        isCorrect = h === time.hour;
        if (isCorrect) {
            currentFeedback = { message: currentReviewType ? "Correct! You've mastered this hour." : "Perfect! That's the right hour.", type: 'correct' };
        } else {
            currentFeedback = { message: currentReviewType ? `Still tricky. The correct hour was ${time.hour}.` : `Not quite. The correct hour was ${time.hour}.`, type: 'incorrect' };
        }
    } else if (focusMode === 'minutes') {
        const m = parseInt(cleanedInput, 10);
        if (isNaN(m) || m < 0 || m > 59) {
            setFeedback({ message: 'Invalid minute. Use a number from 0-59.', type: 'incorrect' });
            return;
        }
        const diff = Math.abs(time.minute - m);
        isCorrect = diff === 0;

        if (isCorrect) {
            currentFeedback = { message: currentReviewType ? `Well done! You've mastered the ${time.minute} minute mark.` : "Perfect! That's exactly right.", type: 'correct' };
        } else if (diff <= 2) {
            currentFeedback = { message: `So close! You were only ${diff} minute${diff > 1 ? 's' : ''} off.`, type: 'close' };
        } else {
            currentFeedback = { message: `Not quite. You were ${diff} minutes off.`, type: 'incorrect' };
        }
    } else { // 'both'
        let h, m;
        if (cleanedInput.includes(':')) {
            const parts = cleanedInput.split(':');
            if (parts.length === 2) { [h, m] = parts.map(p => parseInt(p, 10)); }
        } else {
            const numericInput = cleanedInput.replace(/[^0-9]/g, '');
            if (numericInput.length === 3) { h = parseInt(numericInput.substring(0, 1), 10); m = parseInt(numericInput.substring(1), 10); } 
            else if (numericInput.length === 4) { h = parseInt(numericInput.substring(0, 2), 10); m = parseInt(numericInput.substring(2), 10); }
        }

        if (h === undefined || m === undefined || isNaN(h) || isNaN(m) || h < 1 || h > 12 || m < 0 || m > 59) {
            setFeedback({ message: 'Invalid format. Use H:MM or HHMM.', type: 'incorrect' });
            return;
        }

        const correctTotalMinutes = (time.hour % 12) * 60 + time.minute;
        const userTotalMinutes = (h % 12) * 60 + m;
        let diff = Math.abs(correctTotalMinutes - userTotalMinutes);
        diff = Math.min(diff, 720 - diff);
        isCorrect = diff === 0;

        if (isCorrect) {
            if (currentReviewType === 'exact') {
                currentFeedback = { message: "Excellent! You got this time right after missing it before.", type: 'correct' };
            } else if (currentReviewType === 'minute') {
                currentFeedback = { message: `Well done! You've mastered the ${time.minute} minute mark.`, type: 'correct' };
            } else {
                currentFeedback = { message: "Perfect! That's exactly right.", type: 'correct' };
            }
        } else if (diff <= 2) {
            currentFeedback = { message: `So close! You were only ${diff} minute${diff > 1 ? 's' : ''} off.`, type: 'close' };
        } else {
            let message = '';
            if (currentReviewType === 'exact') {
                message = `Still struggling with this exact time. You were ${diff} minutes off.`;
            } else if (currentReviewType === 'minute') {
                message = `That minute value seems tricky. You were ${diff} minutes off this time.`;
            } else {
                message = `Not quite. You were ${diff} minutes off.`;
            }
            currentFeedback = { message, type: 'incorrect' };
        }
    }

    if (!isCorrect && practiceMode === 'learning') {
      const newReviewItems = [];
      if (focusMode !== 'minutes') {
        newReviewItems.push({ time, type: 'exact', dueIn: Math.floor(Math.random() * 3) + 2 });
      }
      if (focusMode !== 'hours') {
        newReviewItems.push({ time, type: 'minute', dueIn: Math.floor(Math.random() * 3) + 3 });
      }
      setReviewPool(prev => [...prev, ...newReviewItems]);
    }
    
    setFeedback(currentFeedback);

    timeoutRef.current = window.setTimeout(() => {
      generateNewQuestion();
      setUserInput('');
      setFeedback({ message: 'Read the clock and enter the time below.', type: 'info' });
    }, 2500);
  };

  return (
    React.createElement(React.Fragment, null,
      React.createElement('div', { className: "w-full aspect-square rounded-full shadow-inner overflow-hidden" },
        React.createElement(Clock, {
          hour: time.hour,
          minute: time.minute,
          difficulty: difficulty,
          timeSetCount: timeSetCount,
          rotation: rotation,
          focusMode: focusMode
        })
      ),
      React.createElement(Feedback, { message: feedback.message, type: feedback.type }),
      React.createElement(Controls, {
        userInput: userInput,
        setUserInput: setUserInput,
        onCheckTime: handleCheckTime,
        focusMode: focusMode
      })
    )
  );
};

export default ReadMode;