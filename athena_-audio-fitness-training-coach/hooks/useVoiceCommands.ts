import { useState, useEffect, useRef, useCallback } from 'react';

// FIX: Add type definitions for the Web Speech API to resolve the 'Cannot find name SpeechRecognition' error.
// These are not always included in default TypeScript DOM library files.
interface SpeechRecognition {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}


interface VoiceCommand {
  command: string; // The keyword to match, e.g., "start full body ignition"
  callback: () => void; // The function to call on match
}

// Get the SpeechRecognition object, handling vendor prefixes.
// FIX: Cast window to `any` to access experimental APIs and rename to avoid shadowing the `SpeechRecognition` type.
const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const useVoiceCommands = (commands: VoiceCommand[]) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  // FIX: The `SpeechRecognition` type is now resolved correctly after renaming the constant that was shadowing it.
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const userWantsToListen = useRef(false); // Track user's intent to listen

  // Use a ref for commands to avoid re-creating callbacks that depend on it
  const commandsRef = useRef(commands);
  useEffect(() => {
    commandsRef.current = commands;
  }, [commands]);

  const processTranscript = useCallback((text: string) => {
    let lowerCaseText = text.toLowerCase();
    
    // Pre-process to correct common mis-transcriptions for "HIIT"
    lowerCaseText = lowerCaseText.replace(/\b(hit|heat)\b blast/g, 'hiit blast');

    // Find the best matching command
    for (const { command, callback } of commandsRef.current) {
        if (lowerCaseText.includes(command)) {
            callback();
            return; // Stop after first match
        }
    }
  }, []);

  const stopListening = useCallback(() => {
    userWantsToListen.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const startListening = useCallback(async () => {
    userWantsToListen.current = true;
    if (isListening || recognitionRef.current) return;

    if (!SpeechRecognitionAPI) {
      setError("Voice recognition is not supported by your browser.");
      userWantsToListen.current = false;
      return;
    }

    try {
      // This requests permission and applies audio enhancements before listening.
      await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
          autoGainControl: true,
        },
      });
    } catch (err) {
      console.error("Error accessing microphone:", err);
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError("Microphone permission denied.");
      } else {
        setError("Could not access microphone.");
      }
      userWantsToListen.current = false;
      return;
    }

    const recognition: SpeechRecognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal) {
        const text = lastResult[0].transcript.trim();
        setTranscript(text);
        processTranscript(text);
      }
    };
    
    recognition.onerror = (event) => {
      // Ignore 'no-speech' which is frequent, and 'aborted' which happens on manual stop.
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setError(event.error);
        console.error('Speech recognition error:', event.error);
      }
    };
    
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      // Auto-restart if the user hasn't explicitly stopped it
      if (userWantsToListen.current) {
        // Use a small delay to prevent rapid-fire restart loops on some errors
        setTimeout(() => startListening(), 100);
      }
    };

    recognition.start();
  }, [isListening, processTranscript]);


  // Effect for cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return { isListening, transcript, error, startListening, stopListening };
};