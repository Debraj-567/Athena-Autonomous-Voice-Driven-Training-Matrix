

import React from 'react';
import type { WorkoutState, Biometrics } from '../types.ts';
import { Icon } from './Icon.tsx';
import { Waveform } from './Waveform.tsx';
import { Sparkline } from './Sparkline.tsx';
import { ExerciseAnimation } from './ExerciseAnimation.tsx';

interface WorkoutPlayerProps {
  workoutState: WorkoutState;
  exerciseName: string;
  timeRemaining: number;
  totalTime: number;
  progress: number;
  biometrics: Biometrics;
  heartRateHistory: number[];
  paceHistory: number[];
  cadenceHistory: number[];
  caption: string;
  isRunning: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  onPlayPause: () => void;
  analyserNode?: AnalyserNode;
  currentExerciseIndex: number;
  totalExercisesInBlock: number;
  isConfirmingSave: boolean;
  onConfirmSave: () => void;
  onDiscard: () => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const stateColors: Record<WorkoutState, string> = {
  idle: 'stroke-gray-500',
  warmup: 'stroke-sky-400',
  work: 'stroke-red-500',
  rest: 'stroke-emerald-400',
  cooldown: 'stroke-indigo-400',
  finished: 'stroke-yellow-400',
};

const stateBgColors: Record<WorkoutState, string> = {
    idle: 'bg-gray-500',
    warmup: 'bg-sky-400',
    work: 'bg-red-500',
    rest: 'bg-emerald-400',
    cooldown: 'bg-indigo-400',
    finished: 'bg-yellow-400',
  };

const stateTextColors: Record<WorkoutState, string> = {
  idle: 'text-gray-400',
  warmup: 'text-sky-400',
  work: 'text-red-500',
  rest: 'text-emerald-400',
  cooldown: 'text-indigo-400',
  finished: 'text-yellow-400',
};

const ProgressRing: React.FC<{ progress: number; state: WorkoutState }> = ({ progress, state }) => {
  const radius = 130;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <svg height={radius * 2} width={radius * 2} className="-rotate-90">
      <circle
        className="stroke-gray-800"
        strokeWidth={stroke}
        fill="transparent"
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        className={`${stateColors[state]} transition-all duration-500 ease-in-out`}
        strokeWidth={stroke}
        strokeDasharray={`${circumference} ${circumference}`}
        style={{ strokeDashoffset }}
        strokeLinecap="round"
        fill="transparent"
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
    </svg>
  );
};

const ExerciseProgressDots: React.FC<{
    count: number;
    current: number;
    state: WorkoutState;
  }> = ({ count, current, state }) => {
    if (count <= 1 || state === 'rest' || state === 'idle' || state === 'finished') {
      return <div className="h-4"></div>; // Reserve space
    }
    return (
      <div className="flex justify-center items-center space-x-2 h-4 my-2">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              i <= current ? stateBgColors[state] : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

export const WorkoutPlayer: React.FC<WorkoutPlayerProps> = ({
  workoutState,
  exerciseName,
  timeRemaining,
  totalTime,
  progress,
  biometrics,
  heartRateHistory,
  paceHistory,
  cadenceHistory,
  caption,
  isRunning,
  isLoading,
  isInitializing,
  onPlayPause,
  analyserNode,
  currentExerciseIndex,
  totalExercisesInBlock,
  isConfirmingSave,
  onConfirmSave,
  onDiscard,
}) => {
  const showSpinner = isLoading || isInitializing;
  
  return (
    <div className="flex flex-col items-center justify-center text-center w-full h-full">
      <div className={`relative flex items-center justify-center w-72 h-72 sm:w-80 sm:h-80 transition-opacity duration-300 ${showSpinner ? 'animate-pulse-subtle' : ''}`}>
        <ProgressRing progress={progress} state={workoutState} />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <h2 key={workoutState} className={`uppercase font-bold tracking-widest text-base ${stateTextColors[workoutState]} animate-fade-in-up`}>
              {workoutState}
            </h2>

            <div className="h-28 w-full flex items-center justify-center">
              <ExerciseAnimation
                exerciseName={exerciseName}
                workoutState={workoutState}
                stateColorClass={stateTextColors[workoutState]}
              />
            </div>
            
            <h1 key={exerciseName} className="text-2xl font-bold -mt-4 truncate max-w-full animate-fade-in-up" title={exerciseName}>
              {exerciseName}
            </h1>
            <ExerciseProgressDots count={totalExercisesInBlock} current={currentExerciseIndex} state={workoutState} />
            <p className="text-6xl font-mono font-light mt-1">
              {formatTime(timeRemaining)}
            </p>
            <div className="flex items-stretch justify-around text-gray-300 w-full mt-2 text-xs">
                <div className="flex items-center justify-center space-x-1 flex-1">
                    <Icon name="heart" className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span className="font-mono w-8 text-right">{biometrics.heartRate}</span>
                    <div className="w-10">
                        <Sparkline data={heartRateHistory} strokeColor="#ef4444" height={16} width={40} />
                    </div>
                </div>
                <div className="w-px bg-gray-700"></div> {/* Divider */}
                <div className="flex items-center justify-center space-x-1 flex-1">
                    <Icon name="zap" className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    <span className="font-mono w-8 text-right">{biometrics.pace > 0 ? biometrics.pace.toFixed(1) : '- -'}</span>
                    <div className="w-10">
                        <Sparkline data={paceHistory} strokeColor="#facc15" height={16} width={40} />
                    </div>
                </div>
                <div className="w-px bg-gray-700"></div> {/* Divider */}
                <div className="flex items-center justify-center space-x-1 flex-1">
                    <Icon name="cadence" className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span className="font-mono w-8 text-right">{biometrics.cadence > 0 ? biometrics.cadence : '- -'}</span>
                    <div className="w-10">
                        <Sparkline data={cadenceHistory} strokeColor="#22d3ee" height={16} width={40} />
                    </div>
                </div>
            </div>
        </div>
      </div>
      
      <div className="mt-8 flex flex-col items-center justify-center h-40 w-full">
        <div className="h-16 w-full max-w-xs">
          {analyserNode && isRunning && <Waveform analyserNode={analyserNode} />}
        </div>
        <p key={caption} className="text-gray-300 h-12 mt-4 px-4 text-lg animate-fade-in-up" aria-live="polite">
          {caption}
        </p>

        <div className="mt-6 h-20 flex items-center justify-center">
            {isConfirmingSave ? (
                <div className="flex space-x-6 animate-fade-in-up">
                    <button
                        onClick={onDiscard}
                        className="px-6 py-3 bg-red-600/20 text-red-300 font-bold rounded-full border-2 border-red-500/50 transition-all duration-300 hover:bg-red-500/40 hover:scale-105 active:scale-95"
                    >
                        Discard
                    </button>
                    <button
                        onClick={onConfirmSave}
                        className="px-8 py-4 bg-emerald-600/30 text-emerald-200 font-bold rounded-full border-2 border-emerald-500 transition-all duration-300 hover:bg-emerald-500/50 hover:scale-105 active:scale-95"
                    >
                        Save Session
                    </button>
                </div>
            ) : (
                <button
                    onClick={onPlayPause}
                    disabled={isLoading}
                    className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-300 ease-in-out hover:bg-white/20 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={isRunning ? 'Pause workout' : 'Play workout'}
                    >
                    {showSpinner ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    ) : isRunning ? (
                        <Icon name="pause" className="w-8 h-8"/>
                    ) : (
                        <Icon name="play" className="w-8 h-8 ml-1"/>
                    )}
                </button>
            )}
        </div>
      </div>

    </div>
  );
};