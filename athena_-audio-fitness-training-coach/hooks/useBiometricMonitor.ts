
import { useState, useEffect, useRef } from 'react';
import type { Biometrics, WorkoutState, BiometricFeedback } from '../types.ts';

const MAX_HISTORY_LENGTH = 12; // 12 * 5s = 60s of data
const FEEDBACK_COOLDOWN = 30 * 1000; // 30 seconds
const HYDRATION_INTERVAL = 10 * 60 * 1000; // 10 minutes

// Target biometric values for different workout states
const TARGETS: Record<WorkoutState, Partial<Biometrics>> = {
  idle: { heartRate: 70, pace: 0, cadence: 0 },
  warmup: { heartRate: 110, pace: 7.0, cadence: 155 },
  work: { heartRate: 155, pace: 5.0, cadence: 175 },
  rest: { heartRate: 100, pace: 0, cadence: 0 },
  cooldown: { heartRate: 90, pace: 8.0, cadence: 140 },
  finished: { heartRate: 80, pace: 0, cadence: 0 },
};

// More granular zones for 'work' state to provide nuanced feedback
const WORK_ZONES = {
    pace: { low: 5.5, target: 5.0, high: 4.5 }, // Lower is faster
    cadence: { low: 168, target: 175, high: 182 },
    heartRate: { low: 140, target: 155, high: 170 },
};

// Helper to analyze trends in recent data history.
function calculateTrend(history: number[], windowSize = 3, isInverted = false): -1 | 0 | 1 {
    if (history.length < windowSize) return 0;
    const recentHistory = history.slice(-windowSize);
    const first = recentHistory[0];
    const last = recentHistory[recentHistory.length - 1];
    const tolerance = first * 0.02; // 2% tolerance to consider it stable

    if (isInverted) { // For metrics like pace where lower is better
        if (last < first - tolerance) return 1; // Trend is improving
        if (last > first + tolerance) return -1; // Trend is worsening
    } else {
        if (last > first + tolerance) return 1; // Trend is improving
        if (last < first - tolerance) return -1; // Trend is worsening
    }
    return 0; // Stable
}


export const useBiometricMonitor = (
  workoutState: WorkoutState,
  isRunning: boolean,
  onSafetyAlert: (message: string) => void,
  onBiometricFeedback: (feedback: BiometricFeedback) => void,
) => {
  const [biometrics, setBiometrics] = useState<Biometrics>({
    heartRate: 70,
    pace: 0,
    cadence: 0,
  });
  const [heartRateHistory, setHeartRateHistory] = useState<number[]>([70]);
  const [paceHistory, setPaceHistory] = useState<number[]>([0]);
  const [cadenceHistory, setCadenceHistory] = useState<number[]>([0]);

  const fatigueIndexHistory = useRef<number[]>([]);
  const lastFeedbackTime = useRef(0);
  const lastHydrationTime = useRef(0);
  const workoutStartTime = useRef(0);

  // Effect 1: Simulate and update biometric data on a timer
  useEffect(() => {
    if (!isRunning) {
      if (workoutStartTime.current !== 0) workoutStartTime.current = 0;
      return;
    }
    
    if (workoutStartTime.current === 0) {
        workoutStartTime.current = Date.now();
        lastHydrationTime.current = Date.now();
    }

    const interval = setInterval(() => {
      const target = TARGETS[workoutState];

      setBiometrics(prev => {
        const newHeartRate = prev.heartRate + ((target.heartRate ?? prev.heartRate) - prev.heartRate) * 0.1 + (Math.random() - 0.48) * 5;
        const newPace = prev.pace > 0 ? prev.pace + ((target.pace ?? prev.pace) - prev.pace) * 0.1 + (Math.random() - 0.5) * 0.2 : (target.pace ?? 0);
        const newCadence = prev.cadence > 0 ? prev.cadence + ((target.cadence ?? prev.cadence) - prev.cadence) * 0.1 + (Math.random() - 0.5) * 4 : (target.cadence ?? 0);

        const clampedHR = Math.max(60, Math.min(190, newHeartRate));
        const clampedPace = newPace > 0 ? Math.max(3.0, Math.min(10.0, newPace)) : 0;
        const clampedCadence = newCadence > 0 ? Math.max(130, Math.min(190, newCadence)) : 0;
        
        setHeartRateHistory(h => [...h, clampedHR].slice(-MAX_HISTORY_LENGTH));
        setPaceHistory(p => [...p, clampedPace].slice(-MAX_HISTORY_LENGTH));
        setCadenceHistory(c => [...c, clampedCadence].slice(-MAX_HISTORY_LENGTH));

        return {
          heartRate: Math.round(clampedHR),
          pace: clampedPace,
          cadence: Math.round(clampedCadence)
        };
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isRunning, workoutState]);

  // Effect 2: Analyze biometrics and provide feedback when data changes
  useEffect(() => {
    if (!isRunning) return;

    // --- Enhanced Feedback Logic ---
    const now = Date.now();
    if (now - lastFeedbackTime.current > FEEDBACK_COOLDOWN) {
        let feedbackGiven = false;

        if (workoutState === 'work') {
            const paceTrend = calculateTrend(paceHistory, 3, true); // true because lower pace is faster

            // Priority 1: High fatigue signs (High HR + Dropping Pace)
            if (biometrics.heartRate > WORK_ZONES.heartRate.high && paceTrend === -1) {
                onBiometricFeedback({ type: 'warning', message: "Your heart rate is very high and your pace is falling. Let's pull back to recover." });
                feedbackGiven = true;
            }
            // Pace corrections
            else if (biometrics.pace > WORK_ZONES.pace.low) { // Pace is too slow
                onBiometricFeedback({ type: 'info', message: "Pace is a bit slow. Focus on increasing your step rate." });
                feedbackGiven = true;
            } else if (biometrics.pace < WORK_ZONES.pace.high) { // Pace is too fast
                onBiometricFeedback({ type: 'info', message: "You're pushing hard. Let's ease back to a more sustainable pace to conserve energy." });
                feedbackGiven = true;
            }
            // Cadence correction
            else if (biometrics.cadence < WORK_ZONES.cadence.low) {
                onBiometricFeedback({ type: 'info', message: "Focus on shorter, quicker steps to bring your cadence up." });
                feedbackGiven = true;
            }
            // Positive reinforcement
            else if (paceTrend === 0 && Math.abs(biometrics.pace - WORK_ZONES.pace.target) < 0.3) {
                onBiometricFeedback({ type: 'motivation', message: "Excellent. You're holding a strong, steady pace. Keep this rhythm." });
                feedbackGiven = true;
            }
        } 
        // Feedback for other states
        else if (workoutState === 'rest' && biometrics.heartRate > 135) {
            onBiometricFeedback({ type: 'warning', message: "Heart rate is still high. Focus on slow, deep breaths to bring it down." });
            feedbackGiven = true;
        }

        // Hydration check (runs if no other feedback was given)
        if (!feedbackGiven && workoutState !== 'idle' && workoutState !== 'finished' && now - lastHydrationTime.current > HYDRATION_INTERVAL) {
            onBiometricFeedback({ type: 'info', message: "Remember to stay hydrated. A quick sip can make a big difference." });
            lastHydrationTime.current = now; // Only update hydration time when message is sent
            feedbackGiven = true;
        }

        if (feedbackGiven) {
            lastFeedbackTime.current = now;
        }
    }

    // --- Safety Alert Logic ---
    const normalizedHR = (biometrics.heartRate - 60) / 130;
    const normalizedPace = biometrics.pace > 0 ? (10.0 - biometrics.pace) / 7.0 : 0;
    const fatigueIndex = (normalizedHR * 0.6 + normalizedPace * 0.4) * 100;
    
    fatigueIndexHistory.current.push(fatigueIndex);
    if (fatigueIndexHistory.current.length > MAX_HISTORY_LENGTH) {
      fatigueIndexHistory.current.shift();
      const initialFI = fatigueIndexHistory.current[0];
      const currentFI = fatigueIndexHistory.current[fatigueIndexHistory.current.length - 1];
      
      if (initialFI > 0 && workoutState === 'work') {
        const spike = ((currentFI - initialFI) / initialFI) * 100;
        if (spike > 15) {
          onSafetyAlert("Fatigue Index spike detected. Mandating a 10% reduction in effort.");
          fatigueIndexHistory.current = []; // Reset after alert
        }
      }
    }
    
  }, [biometrics, isRunning, workoutState, onSafetyAlert, onBiometricFeedback, paceHistory, cadenceHistory]);


  return { biometrics, heartRateHistory, paceHistory, cadenceHistory };
};
