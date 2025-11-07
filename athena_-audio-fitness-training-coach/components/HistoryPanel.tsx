
import React from 'react';
import type { WorkoutRecord } from '../types.ts';
import { Icon } from './Icon.tsx';

interface HistoryPanelProps {
  history: WorkoutRecord[];
  isVisible: boolean;
  onClose: () => void;
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

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, isVisible, onClose }) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>
      
      {/* Panel */}
      <aside className={`fixed top-0 right-0 h-full w-full max-w-md bg-gray-900/80 backdrop-blur-lg shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
            <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
                <h2 className="text-xl font-bold">Workout History</h2>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white"
                    aria-label="Close history panel"
                >
                    <Icon name="x" className="w-6 h-6" />
                </button>
            </header>
            
            <div className="flex-grow overflow-y-auto p-4">
                {history.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>No workouts completed yet.</p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {history.map(record => (
                            <li key={record.id} className="bg-gray-800/50 p-4 rounded-lg">
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
      </aside>
    </>
  );
};
