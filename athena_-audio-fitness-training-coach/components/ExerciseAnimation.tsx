import React from 'react';
import type { WorkoutState } from '../types.ts';

interface ExerciseAnimationProps {
  exerciseName: string;
  workoutState: WorkoutState;
  stateColorClass: string;
}

const getAnimationClass = (name: string): string => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('jumping jack')) return 'anim-jumping-jack';
  if (lowerName.includes('squat')) return 'anim-squat';
  if (lowerName.includes('push-up')) return 'anim-pushup';
  if (lowerName.includes('high knee')) return 'anim-high-knees';
  if (lowerName.includes('plank')) return 'anim-plank';
  if (lowerName.includes('lunge')) return 'anim-squat';
  if (lowerName.includes('mountain climber')) return 'anim-high-knees';
  if (lowerName.includes('arm circle')) return 'anim-arm-circles';
  if (lowerName.includes('quad stretch')) return 'anim-quad-stretch';
  if (lowerName.includes('hamstring stretch')) return 'anim-hamstring-stretch';
  if (lowerName.includes("child's pose")) return 'anim-child-pose';
  if (lowerName.includes('butt kick')) return 'anim-butt-kicks';
  if (lowerName.includes('fast feet')) return 'anim-fast-feet';
  if (lowerName.includes('burpee')) return 'anim-burpees';
  if (lowerName.includes('torso twist')) return 'anim-russian-twists';
  if (lowerName.includes('cat-cow')) return 'anim-cat-cow';
  if (lowerName.includes('crunch')) return 'anim-crunches';
  if (lowerName.includes('leg raise')) return 'anim-leg-raises';
  if (lowerName.includes('russian twist')) return 'anim-russian-twists';
  if (lowerName.includes('cobra stretch')) return 'anim-cobra-stretch';
  if (lowerName.includes('jog') || lowerName.includes('walk')) return 'anim-high-knees';
  if (lowerName.includes('downward dog')) return 'anim-downward-dog';
  if (lowerName.includes('warrior ii')) return 'anim-warrior-ii';

  // For exercises without a specific animation, show a generic 'idle' pose
  if (lowerName.includes('stretch') || lowerName.includes('pose') || lowerName.includes('roll') || lowerName.includes('shrug')) {
    return 'anim-idle-stretch'; // A generic stretch pose could be made
  }
  
  return 'anim-idle';
};

export const ExerciseAnimation: React.FC<ExerciseAnimationProps> = ({ exerciseName, workoutState, stateColorClass }) => {
  if (workoutState !== 'work' && workoutState !== 'warmup') {
    return <div className="h-full w-full"></div>; // Reserve space
  }

  const animationClass = getAnimationClass(exerciseName);
  const colorClass = stateColorClass.replace('text-', 'bg-').replace('stroke-','bg-');

  if (animationClass === 'anim-idle') {
      return (
        <div className="h-full w-full flex items-center justify-center text-center text-xs text-gray-500">
            {/* No visual available */}
        </div>
      )
  }

  return (
    <div className={`relative w-24 h-full flex items-center justify-center ${animationClass}`}>
      <div className={`stick-figure-container ${colorClass}`}>
        <div className={`head ${colorClass}`}></div>
        <div className={`torso ${colorClass}`}></div>
        <div className={`arm left ${colorClass}`}></div>
        <div className={`arm right ${colorClass}`}></div>
        <div className={`leg left ${colorClass}`}></div>
        <div className={`leg right ${colorClass}`}></div>
      </div>
    </div>
  );
};