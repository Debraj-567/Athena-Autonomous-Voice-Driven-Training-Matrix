
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { WorkoutSession, UserMood, WorkoutGoal, FitnessLevel, ProgramContext } from '../types.ts';
import { GoogleGenAI } from '@google/genai';
import { Icon } from '../components/Icon.tsx';
import { ConstellationBackground } from '../components/ConstellationBackground.tsx';
import { StartingWorkout } from '../components/StartingWorkout.tsx';
import { generateSpeech, decodeAudioData, generateWorkout } from '../services/geminiService.ts';
import { AudioService } from '../services/audioService.ts';
import { GenerateWorkoutModal } from '../components/GenerateWorkoutModal.tsx';
import { useProgramTracker } from '../hooks/useProgramTracker.ts';
import { PROGRAMS } from '../data/programs.ts';
import { ProgramCard } from '../components/ProgramCard.tsx';
import { ActiveProgramCard } from '../components/ActiveProgramCard.tsx';

interface VoiceProps {
  isListening: boolean;
  voiceFeedback: string;
  startListening: () => void;
  stopListening: () => void;
}

interface HomePageProps extends VoiceProps {
  workouts: WorkoutSession[];
  onSelectWorkout: (workout: WorkoutSession, programContext?: ProgramContext) => void;
  onShowHistory: () => void;
  audioService: AudioService | null;
  ai: GoogleGenAI | null;
  userMood: UserMood;
  programTracker: ReturnType<typeof useProgramTracker>;
}

const formatDuration = (workout: WorkoutSession) => {
    const totalSeconds = workout.blocks.reduce((total, block) => {
        const blockTime = block.exercises.reduce((blockTotal, ex) => blockTotal + ex.duration, 0);
        return total + blockTime * block.rounds;
    }, 0);
    return `${Math.ceil(totalSeconds / 60)} min`;
};

const intensityColors = {
    low: 'text-sky-400',
    medium: 'text-yellow-400',
    high: 'text-red-500',
};

const ProfileDropdown: React.FC<{ onShowHistory: () => void; onClose: () => void }> = ({ onShowHistory, onClose }) => (
    <div className="absolute top-14 right-0 w-48 bg-gray-900/80 backdrop-blur-md rounded-lg shadow-xl border border-white/10 origin-top-right animate-fade-in"
         style={{ animationDuration: '150ms' }}>
        <ul className="p-2 text-white">
            <li className="px-3 py-2 rounded-md hover:bg-white/10 cursor-pointer text-sm">Profile</li>
            <li className="px-3 py-2 rounded-md hover:bg-white/10 cursor-pointer text-sm">Settings</li>
            <li onClick={() => { onShowHistory(); onClose(); }} className="px-3 py-2 rounded-md hover:bg-white/10 cursor-pointer text-sm">History</li>
            <li className="px-3 py-2 rounded-md hover:bg-white/10 cursor-pointer text-sm text-red-400">Logout</li>
        </ul>
    </div>
);

const WorkoutCard: React.FC<{ workout: WorkoutSession; onSelect: () => void; delay: number, isGenerating?: boolean }> = ({ workout, onSelect, delay, isGenerating }) => (
    <li
        className={`bg-gray-900/50 backdrop-blur-sm rounded-xl transition-all duration-300 hover:bg-gray-800/70 hover:scale-[1.03] cursor-pointer border border-white/10 ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={{ animation: `fadeInUp 0.5s ${delay}s ease-out forwards`, opacity: 0 }}
        onClick={!isGenerating ? onSelect : undefined}
    >
        <div className="p-6">
            <h3 className="text-xl font-bold">{workout.name}</h3>
            <p className="text-gray-400 mt-2 text-sm h-10">{workout.description}</p>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
                <span className={`text-sm font-semibold uppercase tracking-wider ${intensityColors[workout.intensity]}`}>{workout.intensity}</span>
                <span className="text-sm font-mono">{formatDuration(workout)}</span>
            </div>
        </div>
    </li>
);

const Clock: React.FC = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    return (
        <span className="font-mono text-sm text-gray-400">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
    );
};


export const HomePage: React.FC<HomePageProps> = ({ 
    workouts, 
    onSelectWorkout, 
    onShowHistory, 
    audioService, 
    ai,
    userMood,
    isListening, 
    voiceFeedback, 
    startListening, 
    stopListening,
    programTracker,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [startingWorkout, setStartingWorkout] = useState<WorkoutSession | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string|null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { activeProgram, startProgram, getCurrentProgramDay } = programTracker;

  const handleStartWorkoutRequest = useCallback(async (workout: WorkoutSession, programContext?: ProgramContext) => {
    if (!ai || !audioService) {
        onSelectWorkout(workout, programContext);
        return;
    }
    setStartingWorkout(workout);
    try {
        const audioData = await generateSpeech(`Starting ${workout.name}`, 'commanding', ai);
        if (audioData) {
            const audioBuffer = await decodeAudioData(audioData, audioService.getOutputContext());
            audioService.playAudioBuffer(audioBuffer);
        }
    } catch (error) {
        console.error("Failed to generate start confirmation:", error);
    }
    setTimeout(() => {
        onSelectWorkout(workout, programContext);
        setStartingWorkout(null);
    }, 3000);
  }, [ai, audioService, onSelectWorkout]);

  const handleGenerateWorkout = useCallback(async (options: { goal: WorkoutGoal; duration: number; level: FitnessLevel; programContext?: Omit<ProgramContext, 'goal' | 'title'> & { programName: string } }) => {
    if (!ai) {
        setGenerationError("AI service is not available.");
        return;
    }
    setIsGenerating(true);
    setGenerationError(null);
    setShowGenerateModal(false);

    const generated = await generateWorkout(ai, options.goal, options.duration, options.level, userMood, options.programContext);
    
    setIsGenerating(false);

    if (generated) {
        const programContext = options.programContext ? { ...options.programContext, goal: options.goal, title: '' } : undefined;
        handleStartWorkoutRequest(generated, programContext);
    } else {
        setGenerationError("Sorry, I couldn't create a workout. Please try again.");
        if (audioService) {
            const audioData = await generateSpeech("Sorry, I couldn't create a workout right now.", 'technical', ai);
            if (audioData) {
                const audioBuffer = await decodeAudioData(audioData, audioService.getOutputContext());
                audioService.playAudioBuffer(audioBuffer);
            }
        }
    }
  }, [ai, userMood, handleStartWorkoutRequest, audioService]);
  
  const handleStartProgramDay = () => {
      const dayInfo = getCurrentProgramDay();
      // FIX: After changing ProgramDay.goal to allow 'rest', this check is necessary to prevent attempting to generate a workout on a rest day, which would cause a type error.
      if (!dayInfo || !activeProgram || dayInfo.goal === 'rest') return;

      const program = PROGRAMS.find(p => p.id === activeProgram.programId);
      if (!program) return;
      
      handleGenerateWorkout({
          goal: dayInfo.goal,
          duration: 30, // Default duration for program workouts for now
          level: 'intermediate', // Default level
          programContext: {
              programId: program.id,
              programName: program.name,
              week: activeProgram.currentWeek,
              day: activeProgram.currentDay,
          }
      });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsDropdownOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-start min-h-screen p-4 text-center overflow-y-auto">
        <ConstellationBackground workoutState="idle" intensity="medium" />
        <GenerateWorkoutModal 
            isVisible={showGenerateModal}
            onClose={() => setShowGenerateModal(false)}
            onGenerate={(options) => handleGenerateWorkout(options)}
        />
        <div className="absolute top-4 right-4 z-20">
            <div className="flex items-center space-x-4">
                <button
                    onClick={isListening ? stopListening : startListening}
                    className={`relative w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white ${isListening ? 'bg-purple-600' : 'bg-gray-700'}`}
                    aria-label={isListening ? 'Stop listening' : 'Start listening for voice commands'}
                >
                    {isListening && <div className="absolute inset-0 rounded-full border-2 border-purple-400" style={{ animation: 'pulse-ring 2s infinite' }}></div>}
                    <Icon name="microphone" className="w-6 h-6"/>
                </button>
                <Clock />
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(prev => !prev)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm text-white transition-all hover:bg-white/20 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white hover:ring-purple-500"
                        aria-label="Open profile menu"
                    >
                        <Icon name="user" className="w-6 h-6" />
                    </button>
                    {isDropdownOpen && <ProfileDropdown onShowHistory={onShowHistory} onClose={() => setIsDropdownOpen(false)} />}
                </div>
            </div>
        </div>
        
        <header className="my-10 z-10">
            <div className="relative inline-block" data-text="Athena">
                <div className="absolute -left-4 -top-2 w-16 h-16 rounded-full border-2 border-purple-500/50" style={{ animation: 'pulse-ring 2s infinite' }}></div>
                <h1 
                  className="reflection-container text-6xl md:text-8xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 filter drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                  style={{ 
                      animation: 'glow 4s ease-in-out infinite, fadeInUp 0.5s ease-out forwards',
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
            <p className="text-purple-300 mt-3 text-base h-6 animate-fade-in-up transition-opacity duration-300" style={{ animationDelay: '0.3s' }}>
              {generationError ? <span className="text-red-400">{generationError}</span> : voiceFeedback}
            </p>
        </header>

        <main className="w-full max-w-4xl z-10">
            {activeProgram && getCurrentProgramDay() ? (
              <ActiveProgramCard
                program={PROGRAMS.find(p => p.id === activeProgram.programId)!}
                activeState={activeProgram}
                day={getCurrentProgramDay()!}
                onStart={handleStartProgramDay}
                isGenerating={isGenerating}
              />
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    Structured Programs
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                    {PROGRAMS.map((p, i) => (
                        <ProgramCard 
                            key={p.id} 
                            program={p}
                            onSelect={() => startProgram(p.id)}
                            delay={0.5 + i * 0.15}
                        />
                    ))}
                </div>
              </>
            )}

            <h2 className="text-2xl font-bold mb-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                Single Sessions
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <li
                    className={`bg-gray-900/50 backdrop-blur-sm rounded-xl transition-all duration-300 hover:bg-gray-800/70 hover:scale-[1.03] cursor-pointer border border-white/10 ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{ animation: `fadeInUp 0.5s 0.5s ease-out forwards`, opacity: 0 }}
                    onClick={!isGenerating ? () => setShowGenerateModal(true) : undefined}
                >
                    <div className="p-6 flex flex-col items-center justify-center h-full">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
                            <Icon name="zap" className="w-8 h-8"/>
                        </div>
                        <h3 className="text-xl font-bold">{isGenerating ? 'Generating...' : 'AI Dynamic Session'}</h3>
                        <p className="text-gray-400 mt-2 text-sm h-10">
                            {isGenerating ? 'Athena is crafting your personalized workout...' : 'Let AI create a unique workout based on your goals.'}
                        </p>
                    </div>
                </li>
                {workouts.map((w, i) => (
                    <WorkoutCard 
                        key={w.name} 
                        workout={w} 
                        onSelect={() => handleStartWorkoutRequest(w)}
                        delay={0.6 + i * 0.15}
                        isGenerating={isGenerating}
                    />
                ))}
            </ul>
        </main>
        {startingWorkout && <StartingWorkout workoutName={startingWorkout.name} />}
    </div>
  );
};
