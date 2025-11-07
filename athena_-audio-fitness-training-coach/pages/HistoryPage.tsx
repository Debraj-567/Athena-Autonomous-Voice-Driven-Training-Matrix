

import React from 'react';
import type { WorkoutRecord } from '../types.ts';
import { Icon } from '../components/Icon.tsx';

interface VoiceProps {
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
}

interface HistoryPageProps extends VoiceProps {
  history: WorkoutRecord[];
  onBack: () => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

export const HistoryPage: React.FC<HistoryPageProps> = ({ history, onBack, isListening, startListening, stopListening }) => {
  return (
    <div className="flex flex-col h-screen w-full bg-gray-900/80 p-4">
        <header className="flex items-center justify-between pb-4 border-b border-gray-700 flex-shrink-0">
            <h2 className="text-xl font-bold">Workout History</h2>
            <div className="flex items-center space-x-4">
              <button
                  onClick={isListening ? stopListening : startListening}
                  className={`relative w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white ${isListening ? 'bg-purple-600' : 'bg-gray-700'}`}
                  aria-label={isListening ? 'Stop listening' : 'Start listening for voice commands'}
              >
                  {isListening && <div className="absolute inset-0 rounded-full border-2 border-purple-400" style={{ animation: 'pulse-ring 2s infinite' }}></div>}
                  <Icon name="microphone" className="w-6 h-6"/>
              </button>
              <button
                  onClick={onBack}
                  className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white active:scale-95 transition-transform"
                  aria-label="Back to home"
              >
                  <Icon name="x" className="w-6 h-6" />
              </button>
            </div>
        </header>
        
        <div className="flex-grow overflow-y-auto pt-4">
            {history.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                    <p>No workouts completed yet.</p>
                </div>
            ) : (
                <ul className="space-y-3">
                    {history.map((record, index) => (
                        <li 
                          key={record.id} 
                          className="bg-gray-800/50 p-4 rounded-lg animate-fade-in"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <p className="font-semibold text-white">{record.workoutName}</p>
                            <div className="flex justify-between items-baseline text-sm text-gray-400 mt-1">
                                <span>{formatDate(record.date)}</span>
                                <span className="font-mono">{formatTime(record.duration)}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    </div>
  );
};