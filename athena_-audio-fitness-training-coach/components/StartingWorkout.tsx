
import React from 'react';

interface StartingWorkoutProps {
  workoutName: string;
}

export const StartingWorkout: React.FC<StartingWorkoutProps> = ({ workoutName }) => {
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center animate-fade-in">
      <div className="relative flex items-center justify-center w-64 h-64">
        <div 
          className="absolute w-full h-full rounded-full border-2 border-purple-500" 
          style={{ animation: 'pulse-ring 2.5s cubic-bezier(0.2, 0.8, 0.2, 1) infinite' }}
        ></div>
        <div 
          className="absolute w-full h-full rounded-full border-2 border-purple-500" 
          style={{ animation: 'pulse-ring 2.5s cubic-bezier(0.2, 0.8, 0.2, 1) infinite', animationDelay: '0.5s' }}
        ></div>
         <div 
          className="absolute w-full h-full rounded-full border-2 border-purple-500" 
          style={{ animation: 'pulse-ring 2.5s cubic-bezier(0.2, 0.8, 0.2, 1) infinite', animationDelay: '1.0s' }}
        ></div>
      </div>
      <p 
        className="text-2xl font-bold mt-8 text-white tracking-widest uppercase animate-fade-in-up" 
        style={{ animationDelay: '0.2s' }}
      >
        Starting
      </p>
      <h1 
        className="text-4xl font-extrabold mt-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-fade-in-up" 
        style={{ animationDelay: '0.4s' }}
      >
        {workoutName}
      </h1>
    </div>
  );
};
