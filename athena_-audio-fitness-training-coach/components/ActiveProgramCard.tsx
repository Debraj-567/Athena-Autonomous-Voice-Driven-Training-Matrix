import React from 'react';
import type { Program, ActiveProgramState, ProgramDay } from '../types.ts';
import { Icon } from './Icon.tsx';

interface ActiveProgramCardProps {
  program: Program;
  activeState: ActiveProgramState;
  day: ProgramDay;
  onStart: () => void;
  isGenerating: boolean;
}

export const ActiveProgramCard: React.FC<ActiveProgramCardProps> = ({ program, activeState, day, onStart, isGenerating }) => {
  const totalWeeks = program.durationWeeks;
  // FIX: This comparison was causing an error because 'rest' was not a valid WorkoutGoal. The type has been updated in types.ts, so this line is now correct.
  const daysInWeek = program.weeks[0]?.days.filter(d => d.goal !== 'rest').length || 1;
  const totalDays = totalWeeks * daysInWeek;
  const completedDays = (activeState.currentWeek - 1) * daysInWeek + (activeState.currentDay - 1);
  const progress = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;
  const isRestDay = day.goal === 'rest';

  return (
    <div className="bg-gradient-to-br from-purple-900/50 via-gray-900/60 to-gray-900/60 backdrop-blur-sm rounded-xl border-2 border-purple-500/50 w-full animate-fade-in-up mb-10 shadow-2xl shadow-purple-900/50">
      <div className="p-6">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-purple-300 font-semibold uppercase tracking-wider text-sm">Active Program</p>
                <h2 className="text-2xl font-bold mt-1">{program.name}</h2>
            </div>
            <div className="text-right">
                <p className="font-mono text-gray-300">
                    Week {activeState.currentWeek} / Day {activeState.currentDay}
                </p>
                <div className="w-32 bg-gray-700 rounded-full h-2.5 mt-2">
                    <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
        </div>
        
        <div className="mt-6 p-6 bg-black/30 rounded-lg text-center">
            <p className="text-gray-400 text-base">Today's Focus</p>
            <h3 className="text-3xl font-bold mt-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500">
                {day.title}
            </h3>
            {isRestDay ? (
                <div className="mt-6 px-8 py-4">
                    <p className="text-lg text-gray-300 font-bold">Enjoy your rest day!</p>
                </div>
            ) : (
                <button 
                    onClick={onStart}
                    disabled={isGenerating}
                    className="mt-6 w-full max-w-xs mx-auto px-8 py-4 bg-purple-600/80 text-white font-bold text-lg rounded-full border-2 border-purple-500 transition-all duration-300 ease-in-out hover:bg-purple-500/90 hover:scale-105 hover:shadow-[0_0_20px_rgba(168,85,247,0.7)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isGenerating ? 'Generating Workout...' : "Start Today's Workout"}
                </button>
            )}
        </div>
      </div>
    </div>
  );
};
