import React from 'react';

interface EntryScreenProps {
  onEnter: () => void;
}

export const EntryScreen: React.FC<EntryScreenProps> = ({ onEnter }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center animate-fade-in">
      <div className="relative inline-block" data-text="Athena">
        <h1 
          className="reflection-container text-6xl md:text-8xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 filter drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]"
          style={{ 
              animation: 'glow 4s ease-in-out infinite',
              backgroundSize: '200% 200%',
           }}
        >
          Athena
        </h1>
      </div>
       <div 
        className="h-1 w-48 mt-4 mx-auto bg-gradient-to-r from-transparent via-purple-500 to-transparent"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
        }}
      >
        <div 
          className="h-full w-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500"
          style={{
              backgroundSize: '400% 100%',
              animation: 'energy-flow 3s linear infinite',
          }}
        ></div>
      </div>
      <p className="text-gray-400 mt-4 text-lg tracking-widest animate-fade-in-up" style={{ animationDelay: '0.2s', textShadow: '0 0 10px rgba(192, 132, 252, 0.3)' }}>
          Your AI-Powered Audio Fitness Coach
      </p>
      <button
        onClick={onEnter}
        className="mt-12 px-8 py-4 bg-purple-600/50 backdrop-blur-sm text-white font-bold text-lg rounded-full border-2 border-purple-500 transition-all duration-300 ease-in-out hover:bg-purple-500/70 hover:scale-105 hover:shadow-[0_0_20px_rgba(168,85,247,0.7)] active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-purple-400 animate-fade-in-up"
        style={{ animationDelay: '0.5s' }}
      >
        Launch Athena
      </button>
    </div>
  );
};