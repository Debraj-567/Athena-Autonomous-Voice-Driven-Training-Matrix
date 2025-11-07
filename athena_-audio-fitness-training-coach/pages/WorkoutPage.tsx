// FIX: This file's content has been implemented to resolve "is not a module" and other related errors.
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { WorkoutSession, BiometricFeedback, WorkoutState } from '../types.ts';
import { GoogleGenAI } from '@google/genai';
import { useWorkoutEngine } from '../hooks/useWorkoutEngine.ts';
import { useBiometricMonitor } from '../hooks/useBiometricMonitor.ts';
import { WorkoutPlayer } from '../components/WorkoutPlayer.tsx';
import { ConstellationBackground } from '../components/ConstellationBackground.tsx';
import { AudioService } from '../services/audioService.ts';
import { generateSpeech, decodeAudioData } from '../services/geminiService.ts';
import { Icon } from '../components/Icon.tsx';

interface VoiceProps {
    isListening: boolean;
    voiceFeedback: string;
    startListening: () => void;
    stopListening: () => void;
}

interface WorkoutPageProps extends VoiceProps {
  workout: WorkoutSession;
  onBack: () => void;
  onFinished: (duration: number) => void;
  audioService: AudioService | null;
  ai: GoogleGenAI | null;
  workoutControl: 'pause' | 'resume' | null;
  onWorkoutControlHandled: () => void;
  isConfirmingSave: boolean;
  onConfirmSave: () => void;
  onDiscard: () => void;
}

export const WorkoutPage: React.FC<WorkoutPageProps> = ({
  workout,
  onBack,
  onFinished,
  audioService,
  ai,
  workoutControl,
  onWorkoutControlHandled,
  isConfirmingSave,
  onConfirmSave,
  onDiscard,
  ...voiceProps
}) => {
  const [currentExercise, setCurrentExercise] = useState(workout.blocks[0].exercises[0].name);
  const [caption, setCaption] = useState("Let's get started.");
  const [isInitializing, setIsInitializing] = useState(true);
  const workoutStartTime = useRef<number | null>(null);

  const playFeedback = useCallback(async (text: string, style: 'technical' | 'motivational' | 'warning') => {
    if (!ai || !audioService) return;
    try {
        audioService.duck();
        const voiceStyle = style === 'warning' ? 'commanding' : style;
        const audioData = await generateSpeech(text, voiceStyle, ai);
        if (audioData) {
            const audioBuffer = await decodeAudioData(audioData, audioService.getOutputContext());
            audioService.playAudioBuffer(audioBuffer, () => audioService.unduck());
        } else {
            audioService.unduck();
        }
    } catch (e) {
        console.error("Error playing feedback:", e);
        if (audioService) {
          audioService.unduck();
        }
    }
  }, [ai, audioService]);

  const onStateChange = useCallback((state: WorkoutState, exerciseName: string) => {
    setCurrentExercise(exerciseName);
    if (state === 'finished') {
        const duration = workoutStartTime.current ? Math.round((Date.now() - workoutStartTime.current) / 1000) : 0;
        onFinished(duration);
        setCaption("Workout Complete!");
        playFeedback("Workout complete. Great job.", 'motivational');
    } else {
        const stateMessage = state === 'rest' ? `Rest. Next up: ${exerciseName}` : exerciseName;
        setCaption(stateMessage);
        // Avoid announcing the very first exercise as it's handled by "get ready"
        if (workoutStartTime.current !== null) {
          playFeedback(stateMessage, 'technical');
        }
    }
  }, [onFinished, playFeedback]);

  const {
    workoutState,
    isRunning,
    timeRemaining,
    totalTime,
    progress,
    start,
    pause,
    reset,
    currentExerciseIndexInBlock,
    totalExercisesInBlock
  } = useWorkoutEngine(workout, onStateChange);

  const handleSafetyAlert = useCallback((message: string) => {
    pause();
    playFeedback(message, 'warning');
    // Here you could implement logic to adjust the workout, etc.
  }, [pause, playFeedback]);

  const handleBiometricFeedback = useCallback((feedback: BiometricFeedback) => {
    setCaption(feedback.message);
    const style = feedback.type === 'motivation' ? 'motivational' : 'technical';
    playFeedback(feedback.message, style);
  }, [playFeedback]);

  const { biometrics, heartRateHistory, paceHistory, cadenceHistory } = useBiometricMonitor(
    workoutState,
    isRunning,
    handleSafetyAlert,
    handleBiometricFeedback
  );
  
  const handlePlayPause = () => {
    if (isRunning) {
      pause();
    } else {
      if (workoutStartTime.current === null) {
        workoutStartTime.current = Date.now();
      }
      start();
    }
  };
  
  // Initial "Get Ready" prompt
  useEffect(() => {
    const initPrompt = `Get ready for ${workout.name}. The first exercise is ${workout.blocks[0].exercises[0].name}.`;
    playFeedback(initPrompt, 'technical').then(() => {
        setIsInitializing(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Handle external workout controls (from voice commands)
  useEffect(() => {
    if (workoutControl === 'pause') {
      pause();
      onWorkoutControlHandled();
    } else if (workoutControl === 'resume') {
      start();
      onWorkoutControlHandled();
    }
  }, [workoutControl, pause, start, onWorkoutControlHandled]);

  return (
    <div className="relative flex flex-col items-center justify-center h-screen w-full overflow-hidden">
      <ConstellationBackground workoutState={workoutState} intensity={workout.intensity} />
      
      <div className="absolute top-4 left-4 z-20">
        <button
            onClick={onBack}
            className="p-3 rounded-full text-gray-300 bg-black/20 backdrop-blur-sm hover:bg-white/20 hover:text-white transition-all active:scale-95"
            aria-label="Back to home"
        >
            <Icon name="back" className="w-6 h-6" />
        </button>
      </div>
      
      <div className="z-10 w-full flex-grow flex items-center justify-center">
        <WorkoutPlayer
          workoutState={workoutState}
          exerciseName={currentExercise}
          timeRemaining={timeRemaining}
          totalTime={totalTime}
          progress={progress}
          biometrics={biometrics}
          heartRateHistory={heartRateHistory}
          paceHistory={paceHistory}
          cadenceHistory={cadenceHistory}
          caption={caption}
          isRunning={isRunning}
          isLoading={false} // Loading logic can be added if needed for setup
          isInitializing={isInitializing}
          onPlayPause={handlePlayPause}
          analyserNode={audioService?.getAnalyserNode()}
          currentExerciseIndex={currentExerciseIndexInBlock}
          totalExercisesInBlock={totalExercisesInBlock}
          isConfirmingSave={isConfirmingSave}
          onConfirmSave={onConfirmSave}
          onDiscard={onDiscard}
        />
      </div>

       <div className="absolute bottom-4 right-4 z-20">
          <button
              onClick={voiceProps.isListening ? voiceProps.stopListening : voiceProps.startListening}
              className={`relative w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white ${voiceProps.isListening ? 'bg-purple-600' : 'bg-gray-700'}`}
              aria-label={voiceProps.isListening ? 'Stop listening' : 'Start listening for voice commands'}
          >
              {voiceProps.isListening && <div className="absolute inset-0 rounded-full border-2 border-purple-400" style={{ animation: 'pulse-ring 2s infinite' }}></div>}
              <Icon name="microphone" className="w-6 h-6"/>
          </button>
       </div>
    </div>
  );
};
