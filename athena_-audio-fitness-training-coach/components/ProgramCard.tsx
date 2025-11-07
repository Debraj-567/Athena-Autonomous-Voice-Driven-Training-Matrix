
import React from 'react';
import type { Program } from '../types.ts';
import { Icon } from './Icon.tsx';

interface ProgramCardProps {
  program: Program;
  onSelect: () => void;
  delay: number;
}

export const ProgramCard: React.FC<ProgramCardProps> = ({ program, onSelect, delay }) => {
  return (
    <div
      className="bg-gray-900/50 backdrop-blur-sm rounded-xl transition-all duration-300 hover:bg-gray-800/70 hover:scale-[1.03] border border-white/10 flex flex-col"
      style={{ animation: `fadeInUp 0.5s ${delay}s ease-out forwards`, opacity: 0 }}
    >
      <div className="p-6 flex-grow">
        <h3 className="text-xl font-bold">{program.name}</h3>
        <p className="text-gray-400 mt-2 text-sm">{program.description}</p>
      </div>
      <div className="flex justify-between items-center mt-4 p-6 pt-4 border-t border-white/10">
        <span className="text-sm font-mono">{program.durationWeeks} Weeks</span>
        <button 
          onClick={onSelect}
          className="px-4 py-2 bg-purple-600/80 text-white font-bold text-sm rounded-full border-2 border-purple-500 transition-all duration-300 ease-in-out hover:bg-purple-500/90 hover:scale-105 active:scale-95"
        >
          Start Program
        </button>
      </div>
    </div>
  );
};
