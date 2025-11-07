
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useWorkoutHistory } from './hooks/useWorkoutHistory.ts';
import { useVoiceCommands } from './hooks/useVoiceCommands.ts';
import { useProgramTracker } from './hooks/useProgramTracker.ts';
import { AudioService } from './services/audioService.ts';
import { HomePage } from './pages/HomePage.tsx';
import { WorkoutPage } from './pages/WorkoutPage.tsx';
import { HistoryPage } from './pages/HistoryPage.tsx';
import type { Page, WorkoutSession, VoiceCommand, UserMood, ProgramContext } from './types.ts';
import { WORKOUTS } from './data/session.ts';
import { PROGRAMS } from './data/programs.ts';
import { PageAnimator } from './components/PageAnimator.tsx';
import { EntryScreen } from './components/EntryScreen.tsx';
import { generateSpeech, decodeAudioData } from './services/geminiService.ts';

type AppState = 'initializing' | 'welcoming' | 'ready' | 'confirming_save';

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('home');
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutSession | null>(null);
  const [animationDirection, setAnimationDirection] = useState<'forward' | 'back'>('forward');
  const { workoutHistory, addWorkoutToHistory } = useWorkoutHistory();
  const [audioService, setAudioService] = useState<AudioService | null>(null);
  const [ai, setAi] = useState<GoogleGenAI | null>(null);
  const [appState, setAppState] = useState<AppState>('initializing');
  const [voiceFeedback, setVoiceFeedback] = useState("Initializing Athena...");
  const [workoutControl, setWorkoutControl] = useState<'pause' | 'resume' | null>(null);
  const [confirmationData, setConfirmationData] = useState<{ workout: WorkoutSession, duration: number, programContext?: ProgramContext } | null>(null);
  const programTracker = useProgramTracker();
  
  const handleSelectWorkout = (workout: WorkoutSession, programContext?: ProgramContext) => {
    setSelectedWorkout(workout);
    // When starting a program workout, store its context.
    if (programContext) {
        setConfirmationData(prev => ({ ...prev, programContext }));
    }
    setAnimationDirection('forward');
    setPage('workout');
  };

  const handleShowHistory = () => {
    setAnimationDirection('forward');
    setPage('history');
  };
  
  const handleBack = useCallback(() => {
    setAnimationDirection('back');
    setPage('home');
  }, []);

  const handleWorkoutFinished = (duration: number) => {
    if (selectedWorkout) {
        // Pass program context through to the confirmation data
        const programContext = confirmationData?.programContext;
        setConfirmationData({ workout: selectedWorkout, duration, programContext });
        setAppState('confirming_save');
    }
  };

  const handleConfirmSave = useCallback((shouldSave: boolean) => {
    if (confirmationData) {
        if (shouldSave) {
            addWorkoutToHistory({
                workoutName: confirmationData.workout.name,
                duration: confirmationData.duration,
            });
            // If the saved workout was part of a program, complete the day.
            if (confirmationData.programContext) {
                programTracker.completeDay();
            }
        }
    }
    setConfirmationData(null);
    setAppState('ready');
    handleBack();
  }, [confirmationData, addWorkoutToHistory, handleBack, programTracker]);

  const voiceCommands: VoiceCommand[] = useMemo(() => {
    if (appState === 'confirming_save') {
        return [
            { command: 'yes', callback: () => handleConfirmSave(true) },
            { command: 'save session', callback: () => handleConfirmSave(true) },
            { command: 'save', callback: () => handleConfirmSave(true) },
            { command: 'no', callback: () => handleConfirmSave(false) },
            { command: 'discard', callback: () => handleConfirmSave(false) },
        ];
    }
    
    const baseCommands = [
        { command: 'go back', callback: handleBack, guard: () => page !== 'home' },
        { command: 'return to main', callback: handleBack, guard: () => page !== 'home' },
    ];

    if (page === 'home') {
        const workoutCommands = WORKOUTS.map(workout => ({
            command: `start ${workout.name.toLowerCase()}`,
            callback: () => handleSelectWorkout(workout),
        }));
        
        const programCommands = programTracker.activeProgram ? [{
            command: 'start todays workout',
            callback: () => {
                // This is a placeholder; the actual generation is UI-driven
                // but this allows voice to trigger it if we add a ref.
                console.log("Starting today's program workout via voice.");
            }
        }] : PROGRAMS.map(p => ({
            command: `start ${p.name.toLowerCase()}`,
            callback: () => programTracker.startProgram(p.id)
        }));

        return [
            ...workoutCommands,
            ...programCommands,
            { command: 'show history', callback: handleShowHistory },
            { command: 'open history', callback: handleShowHistory },
        ];
    }
    if (page === 'workout') {
        return [
            ...baseCommands,
            { command: 'pause workout', callback: () => setWorkoutControl('pause') },
            { command: 'pause', callback: () => setWorkoutControl('pause') },
            { command: 'resume workout', callback: () => setWorkoutControl('resume') },
            { command: 'resume', callback: () => setWorkoutControl('resume') },
        ];
    }
    if (page === 'history') {
        return baseCommands;
    }
    return [];
  }, [appState, page, handleBack, handleConfirmSave, programTracker]);

  const { isListening, transcript, error, startListening, stopListening } = useVoiceCommands(voiceCommands);
  
  const playPrompt = useCallback(async (prompt: string, style: 'technical' | 'calm', onEnd?: () => void) => {
    if (ai && audioService) {
        try {
            const audioData = await generateSpeech(prompt, style, ai);
            if (audioData) {
                const audioBuffer = await decodeAudioData(audioData, audioService.getOutputContext());
                audioService.playAudioBuffer(audioBuffer, onEnd);
            } else if (onEnd) {
                onEnd();
            }
        } catch (e) {
            console.error("Failed to play prompt:", e);
            if (onEnd) onEnd();
        }
    } else if (onEnd) {
      onEnd();
    }
  }, [ai, audioService]);

  // Initialize services on mount
  useEffect(() => {
    setAudioService(new AudioService());
    setAi(new GoogleGenAI({ apiKey: process.env.API_KEY as string }));
  }, []);
  
  // App State Machine
  useEffect(() => {
    if (appState === 'welcoming') {
        playPrompt("Hi, I am Athena. Ready to begin?", 'technical', () => {
            setAppState('ready');
        });
    } else if (appState === 'ready') {
        startListening();
    } else if (appState === 'confirming_save') {
        playPrompt("Workout complete. Would you like to save this session?", 'technical', () => {
            startListening();
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appState]);

  // Update voice feedback UI text
  useEffect(() => {
    if (appState === 'initializing') setVoiceFeedback("Initializing Athena...");
    else if (appState === 'welcoming') setVoiceFeedback("Welcome...");
    else if (appState === 'confirming_save') setVoiceFeedback("Listening for 'Yes' or 'No'");
    else if (error) setVoiceFeedback(`Voice error: ${error}.`);
    else if (isListening) {
        let listeningPrompt = "Listening...";
        if (page === 'home') listeningPrompt = "Listening for 'Start...' or 'Show history'";
        if (page === 'workout') listeningPrompt = "Listening for 'Pause', 'Resume', or 'Go back'";
        if (page === 'history') listeningPrompt = "Listening for 'Go back'";
        setVoiceFeedback(listeningPrompt);
    } else {
        setVoiceFeedback("Voice commands paused.");
    }
  }, [isListening, error, page, appState]);

  const handleEnterApp = async () => {
    if (audioService) {
        await audioService.getOutputContext().resume();
        setAppState('welcoming');
    }
  };

  const handleWorkoutControl = () => setWorkoutControl(null);
  const voiceProps = { isListening, error, startListening, stopListening, voiceFeedback };

  return (
    <div className="bg-black text-white min-h-screen font-sans relative">
      {appState === 'initializing' && audioService ? (
        <EntryScreen onEnter={handleEnterApp} />
      ) : (
        <PageAnimator pageKey={page} direction={animationDirection}>
          {page === 'home' && (
            <HomePage 
              workouts={WORKOUTS} 
              onSelectWorkout={handleSelectWorkout} 
              onShowHistory={handleShowHistory}
              audioService={audioService}
              ai={ai}
              userMood={'normal'}
              programTracker={programTracker}
              {...voiceProps}
            />
          )}
          {page === 'workout' && selectedWorkout && (
            <WorkoutPage 
              workout={selectedWorkout} 
              onBack={handleBack}
              onFinished={handleWorkoutFinished}
              audioService={audioService}
              ai={ai}
              workoutControl={workoutControl}
              onWorkoutControlHandled={handleWorkoutControl}
              isConfirmingSave={appState === 'confirming_save'}
              onConfirmSave={() => handleConfirmSave(true)}
              onDiscard={() => handleConfirmSave(false)}
              {...voiceProps}
            />
          )}
          {page === 'history' && (
            <HistoryPage 
              history={workoutHistory} 
              onBack={handleBack}
              {...voiceProps}
            />
          )}
        </PageAnimator>
      )}
    </div>
  );
};

export default App;
