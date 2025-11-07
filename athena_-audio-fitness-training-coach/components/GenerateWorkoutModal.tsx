import React, { useState } from 'react';
import type { WorkoutGoal, FitnessLevel } from '../types.ts';
import { Icon } from './Icon.tsx';

interface GenerateWorkoutModalProps {
  isVisible: boolean;
  onClose: () => void;
  onGenerate: (options: { goal: WorkoutGoal; duration: number; level: FitnessLevel }) => void;
}

const options = {
    goals: [
        { id: 'fat_burn', label: 'Fat Burn', icon: 'zap' },
        { id: 'strength', label: 'Strength', icon: 'cadence' },
        { id: 'endurance', label: 'Endurance', icon: 'heart' },
        { id: 'flexibility', label: 'Flexibility', icon: 'user' },
    ] as const,
    durations: [15, 30, 45],
    levels: ['beginner', 'intermediate', 'advanced'] as const,
};

type OptionButtonProps = {
    label: string;
    isSelected: boolean;
    onClick: () => void;
}

const OptionButton: React.FC<OptionButtonProps> = ({ label, isSelected, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-full border-2 transition-all duration-200 ${
            isSelected 
                ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]' 
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-purple-500'
        }`}
    >
        {label}
    </button>
)

export const GenerateWorkoutModal: React.FC<GenerateWorkoutModalProps> = ({ isVisible, onClose, onGenerate }) => {
  const [goal, setGoal] = useState<WorkoutGoal>('fat_burn');
  const [duration, setDuration] = useState<number>(30);
  const [level, setLevel] = useState<FitnessLevel>('intermediate');

  const handleGenerateClick = () => {
    onGenerate({ goal, duration, level });
  };
  
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center animate-fade-in" style={{ animationDuration: '300ms' }}>
      <div className="bg-gray-900/80 border border-white/10 rounded-2xl shadow-xl w-full max-w-md m-4 p-6 animate-fade-in-up" style={{ animationDuration: '400ms' }}>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Generate Dynamic Session</h2>
            <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white">
                <Icon name="x" className="w-6 h-6" />
            </button>
        </div>

        <div className="space-y-6">
            <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Primary Goal</label>
                <div className="flex flex-wrap gap-2">
                    {options.goals.map(g => <OptionButton key={g.id} label={g.label} isSelected={goal === g.id} onClick={() => setGoal(g.id)} />)}
                </div>
            </div>
             <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Duration (minutes)</label>
                <div className="flex flex-wrap gap-2">
                    {options.durations.map(d => <OptionButton key={d} label={`${d} min`} isSelected={duration === d} onClick={() => setDuration(d)} />)}
                </div>
            </div>
             <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Fitness Level</label>
                <div className="flex flex-wrap gap-2">
                    {options.levels.map(l => <OptionButton key={l} label={l.charAt(0).toUpperCase() + l.slice(1)} isSelected={level === l} onClick={() => setLevel(l)} />)}
                </div>
            </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10">
            <button
                onClick={handleGenerateClick}
                className="w-full px-8 py-4 bg-purple-600/80 text-white font-bold text-lg rounded-full border-2 border-purple-500 transition-all duration-300 ease-in-out hover:bg-purple-500/90 hover:scale-105 hover:shadow-[0_0_20px_rgba(168,85,247,0.7)] active:scale-95"
            >
                Generate Workout
            </button>
        </div>
      </div>
    </div>
  );
};
