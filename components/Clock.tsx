import React, { useState, useEffect, useRef, useCallback } from 'react';

// FIX: Added interface for component props to define types for `difficulty` and `rotation`.
interface CaseAndDialProps {
  difficulty: number;
  rotation?: number;
}
const CaseAndDial = React.memo(({ difficulty, rotation = 0 }: CaseAndDialProps) => {
  let dialColor = '#F7FAFC';
  let markerColor = '#2D3748';

  if (difficulty === 4) {
    dialColor = '#E2E8F0';
    markerColor = '#A0AEC0';
  } else if (difficulty === 5 || difficulty === 6) {
    dialColor = '#4A5568';
    markerColor = '#A0AEC0';
  }
  
  const markerElements = [];
  let caseElements = null;
  let dialBackground = React.createElement('circle', { cx: "100", cy: "100", r: "90", fill: dialColor });

  switch (difficulty) {
    case 1:
      caseElements = React.createElement('circle', { cx: "100", cy: "100", r: "98", fill: "none", stroke: "#A0AEC0", strokeWidth: "4" });
      markerElements.push(
        React.createElement('g', { key: "l1-markers", textAnchor: "middle", fill: markerColor },
          React.createElement('circle', { cx: "100", cy: "100", r: "90", fill: "#EDF2F7" }),
          ...Array.from({ length: 60 }).map((_, i) => {
            const angle = i * 6 * Math.PI / 180;
            const isFiveMin = i % 5 === 0;
            const minute = i === 0 ? '00' : i;
            if (isFiveMin) {
              return (
                React.createElement('g', { key: `m-${i}`},
                  React.createElement('circle', { cx: 100 + 82 * Math.sin(angle), cy: 100 - 82 * Math.cos(angle), r: "7", fill: "#CBD5E0" }),
                  React.createElement('text', { x: 100 + 82 * Math.sin(angle), y: 100 - 82 * Math.cos(angle), dy: "0.35em", fontSize: "8", className: "font-bold", fill: "#4A5568" }, minute)
                )
              );
            }
            return React.createElement('circle', { key: `m-${i}`, cx: 100 + 82 * Math.sin(angle), cy: 100 - 82 * Math.cos(angle), r: "1.5", fill: "#A0AEC0" });
          }),
          React.createElement('circle', { cx: "100", cy: "100", r: "72", fill: dialColor, stroke: "#E2E8F0", strokeWidth: "1" }),
          ...Array.from({ length: 12 }).map((_, i) => {
            const hour = i === 0 ? 12 : i;
            const angle = i * 30 * Math.PI / 180;
            return React.createElement('text', { key: `h-${i}`, x: 100 + 58 * Math.sin(angle), y: 100 - 58 * Math.cos(angle), dy: "0.35em", className: "text-2xl font-semibold" }, hour);
          })
        )
      );
      break;
    case 2:
      caseElements = React.createElement('circle', { cx: "100", cy: "100", r: "98", fill: "none", stroke: markerColor, strokeWidth: "3" });
      markerElements.push(React.createElement('g', { key: "l2-markers", textAnchor: "middle", fill: markerColor },
        ...Array.from({ length: 12 }).map((_, i) => React.createElement('text', { key: `h-${i}`, x: 100 + 75 * Math.sin(i * 30 * Math.PI / 180), y: 100 - 75 * Math.cos(i * 30 * Math.PI / 180), dy: "0.35em", className: "text-2xl font-medium" }, i === 0 ? 12 : i)),
        ...Array.from({ length: 60 }).map((_, i) => {
          const angle = i * 6 * Math.PI / 180;
          const isFiveMin = i % 5 === 0;
          const isQuarterHour = i % 15 === 0;
          return React.createElement('line', { key: `m-${i}`, x1: 100 + 95 * Math.sin(angle), y1: 100 - 95 * Math.cos(angle), x2: 100 + (isQuarterHour ? 88 : 92) * Math.sin(angle), y2: 100 - (isQuarterHour ? 88 : 92) * Math.cos(angle), stroke: markerColor, strokeWidth: isFiveMin ? 2 : 1, strokeLinecap: "round" });
        })
      ));
      break;
    case 3:
      caseElements = React.createElement('circle', { cx: "100", cy: "100", r: "98", fill: "none", stroke: markerColor, strokeWidth: "3" });
      const markerPath = (i: number) => {
          const angle = i * 30 * Math.PI / 180;
          const r = 85; const x = 100 + r * Math.sin(angle); const y = 100 - r * Math.cos(angle);
          if (i === 0) return React.createElement('path', { d: `M ${x} ${y-7} L ${x-6} ${y+4} L ${x+6} ${y+4} Z` });
          if (i % 3 === 0) return React.createElement('rect', { x: x-10, y: y-3, width: "20", height: "6", rx: "2", transform: `rotate(${i*30} ${x} ${y})` });
          return React.createElement('circle', { cx: x, cy: y, r: "4" });
      };
      markerElements.push(React.createElement('g', { key: "l3-markers", fill: markerColor },
          ...Array.from({ length: 12 }).map((_, i) => React.createElement('g', { key: `h-${i}`}, markerPath(i))),
          ...Array.from({ length: 60 }).map((_, i) => {
              const angle = i * 6 * Math.PI / 180;
              const isFiveMin = i % 5 === 0;
              return React.createElement('line', { key: `m-${i}`, x1: 100 + 95 * Math.sin(angle), y1: 100 - 95 * Math.cos(angle), x2: 100 + (isFiveMin ? 90 : 92) * Math.sin(angle), y2: 100 - (isFiveMin ? 90 : 92) * Math.cos(angle), stroke: markerColor, strokeWidth: isFiveMin ? 1.5 : 1, strokeLinecap: "round" });
          })
      ));
      break;
    case 4:
      caseElements = React.createElement('circle', { cx: "100", cy: "100", r: "98", fill: "none", stroke: markerColor, strokeWidth: "3" });
      break;
    case 5:
      caseElements = React.createElement('circle', { cx: "100", cy: "100", r: "98", fill: "none", stroke: markerColor, strokeWidth: "3" });
      dialBackground = React.createElement('circle', { cx: "100", cy: "100", r: "95", fill: dialColor });
      break;
    case 6:
      caseElements = React.createElement('circle', { cx: "100", cy: "100", r: "98", fill: "none", stroke: markerColor, strokeWidth: "3" });
      dialBackground = React.createElement('circle', { cx: "100", cy: "100", r: "95", fill: dialColor });
      markerElements.push(React.createElement('text', { key: "l6-marker", x: "100", y: "22", dy: "0.35em", textAnchor: "middle", fill: markerColor, className: "text-xl font-semibold" }, "12"));
      break;
  }
  
  const caseGroup = React.createElement('g', null, caseElements, dialBackground, ...markerElements);
  if (difficulty === 6) {
      return React.createElement('g', { transform: `rotate(${rotation} 100 100)` }, caseGroup);
  }
  return caseGroup;
});

// FIX: Added interface for component props for type safety.
interface ClockHandsProps {
  hourRotation: number;
  minuteRotation: number;
  difficulty: number;
  animate: boolean;
  focusMode: 'both' | 'hours' | 'minutes';
}
const ClockHands = ({ hourRotation, minuteRotation, difficulty, animate, focusMode }: ClockHandsProps) => {
  let handColor = '#2D3748';
  let pinStrokeColor = '#F7FAFC';

  if (difficulty === 4 || difficulty === 5 || difficulty === 6) {
    handColor = '#A0AEC0';
    if (difficulty === 4) {
        pinStrokeColor = '#E2E8F0';
    } else { 
        pinStrokeColor = '#4A5568';
    }
  }

  const handTransitionStyle = animate ? { transition: 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)' } : {};
  const handStyles: { [key: number]: { hour: { w: number; l: number; }; minute: { w: number; l: number; }; } } = { 1: { hour: { w: 8, l: 45 }, minute: { w: 6, l: 68 } }, 2: { hour: { w: 6, l: 55 }, minute: { w: 4, l: 80 } }, 3: { hour: { w: 5, l: 50 }, minute: { w: 3, l: 80 } }, 4: { hour: { w: 2.5, l: 60 }, minute: { w: 1.5, l: 85 } }, 5: { hour: { w: 0, l: 0 }, minute: { w: 0, l: 0 } }, 6: { hour: { w: 0, l: 0 }, minute: { w: 0, l: 0 } },};
  
  if (difficulty === 5 || difficulty === 6) {
      return (
          React.createElement('g', { filter: "url(#hand-shadow)" },
              focusMode !== 'minutes' && React.createElement('g', { style: handTransitionStyle, transform: `rotate(${hourRotation} 100 100)` },
                  React.createElement('circle', { cx: "100", cy: 100 - 55, r: "6", fill: handColor })
              ),
              focusMode !== 'hours' && React.createElement('g', { style: handTransitionStyle, transform: `rotate(${minuteRotation} 100 100)` },
                  React.createElement('circle', { cx: "100", cy: 100 - 85, r: "4", fill: handColor })
              )
          )
      );
  }
  
  const { hour: hourStyle, minute: minuteStyle } = handStyles[difficulty];
  const centerPinRadius = Math.max(hourStyle.w / 2 + 1, 4);

  return (
    React.createElement('g', { filter: "url(#hand-shadow)" },
      focusMode !== 'minutes' && React.createElement('g', { style: handTransitionStyle, transform: `rotate(${hourRotation} 100 100)` }, 
        React.createElement('line', { x1: "100", y1: "100", x2: "100", y2: 100 - hourStyle.l, stroke: handColor, strokeWidth: hourStyle.w, strokeLinecap: "round" })
      ),
      focusMode !== 'hours' && React.createElement('g', { style: handTransitionStyle, transform: `rotate(${minuteRotation} 100 100)` }, 
        React.createElement('line', { x1: "100", y1: "100", x2: "100", y2: 100 - minuteStyle.l, stroke: handColor, strokeWidth: minuteStyle.w, strokeLinecap: "round" })
      ),
      React.createElement('circle', { cx: "100", cy: "100", r: centerPinRadius, fill: handColor, stroke: pinStrokeColor, strokeWidth: "1" })
    )
  )
};

// FIX: Added interface for Clock props, making `onClick` optional to support components that don't need it.
interface ClockProps {
  hour: number;
  minute: number;
  difficulty: number;
  focusMode?: 'both' | 'hours' | 'minutes';
  timeSetCount?: number;
  onClick?: (event: React.MouseEvent) => void;
  rotation?: number;
}
const Clock = ({ hour, minute, difficulty, focusMode = 'both', timeSetCount = 0, onClick, rotation = 0 }: ClockProps) => {
  const [hourRotation, setHourRotation] = useState(0);
  const [minuteRotation, setMinuteRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const isInitialMount = useRef(true);
  const prevTimeSetCount = useRef(timeSetCount);
  
  const calculateRotations = useCallback((h: number, m: number) => {
    return {
      hour: (h % 12 + m / 60) * 30,
      minute: m * 6,
    };
  }, []);

  useEffect(() => {
    const { hour: newHourAngle, minute: newMinuteAngle } = calculateRotations(hour, minute);
    
    const shouldAnimate = !isInitialMount.current && timeSetCount !== prevTimeSetCount.current;
    
    if (shouldAnimate) {
      setIsAnimating(true);
      
      const newHourRot = (prevRotation: number) => {
        const currentCycle = Math.floor(prevRotation / 360);
        return (currentCycle + 1) * 360 + newHourAngle;
      };
      
      const newMinuteRot = (prevRotation: number) => {
        const currentCycle = Math.floor(prevRotation / 360);
        return (currentCycle + 1) * 360 + newMinuteAngle;
      };
      setHourRotation(newHourRot);
      setMinuteRotation(newMinuteRot);
      
      const timer = setTimeout(() => setIsAnimating(false), 1500);
      return () => clearTimeout(timer);
    } else {
      setHourRotation(newHourAngle);
      setMinuteRotation(newMinuteAngle);
    }

    if (isInitialMount.current) {
        isInitialMount.current = false;
    }
    prevTimeSetCount.current = timeSetCount;

  }, [hour, minute, timeSetCount, calculateRotations]);
  
  return (
    React.createElement('svg', { 
      viewBox: "0 0 200 200", 
      className: `w-full h-full ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`, 
      onClick: onClick, 
      style: { touchAction: 'auto' }, 
      shapeRendering: "geometricPrecision" 
    },
      React.createElement('defs', null,
        React.createElement('filter', { id: "hand-shadow", x: "-50%", y: "-50%", width: "200%", height: "200%" },
          React.createElement('feDropShadow', { dx: "0.5", dy: "1.5", stdDeviation: "1.5", floodColor: "#000000", floodOpacity: "0.2" })
        )
      ),
      React.createElement(CaseAndDial, { difficulty: difficulty, rotation: rotation }),
      React.createElement(ClockHands, { hourRotation: hourRotation, minuteRotation: minuteRotation, difficulty: difficulty, animate: isAnimating, focusMode: focusMode })
    )
  );
};

export default Clock;