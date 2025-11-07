
import { GoogleGenAI, Modality, Type } from '@google/genai';
import type { VoiceStyle, WorkoutSession, WorkoutGoal, FitnessLevel, UserMood, ProgramContext } from '../types.ts';
import { ATHENA_VOICES } from '../constants.ts';

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
): Promise<AudioBuffer> {
  const sampleRate = 24000;
  const numChannels = 1;
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


export const generateSpeech = async (
  prompt: string,
  style: VoiceStyle,
  ai: GoogleGenAI | null
): Promise<Uint8Array | null> => {
  if (!ai) {
    throw new Error("Gemini AI client not initialized.");
  }
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: ATHENA_VOICES[style] },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return decode(base64Audio);
    }
    return null;
  } catch (error) {
    console.error("Error generating speech with Gemini:", error);
    return null;
  }
};

export const generateWorkout = async (
    ai: GoogleGenAI,
    goal: WorkoutGoal,
    durationMinutes: number,
    level: FitnessLevel,
    mood: UserMood,
    programContext?: Omit<ProgramContext, 'goal' | 'title'> & { programName: string }
): Promise<WorkoutSession | null> => {
    const schema = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: 'A creative and motivating name for the workout session. Should reflect the day\'s goal.' },
            description: { type: Type.STRING, description: 'A brief, 1-2 sentence description of the workout.' },
            intensity: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
            blocks: {
                type: Type.ARRAY,
                description: 'An array of workout blocks (warmup, work, cooldown).',
                items: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING, enum: ['warmup', 'work', 'cooldown'] },
                        rounds: { type: Type.INTEGER, description: 'Number of times to repeat the exercises in this block.' },
                        restBetweenRounds: { type: Type.INTEGER, description: 'Rest time in seconds between rounds. Nullable for warmup/cooldown.' },
                        exercises: {
                            type: Type.ARRAY,
                            description: 'An array of exercises for this block.',
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING, description: 'Clear name of the exercise (e.g., "Jumping Jacks").' },
                                    duration: { type: Type.INTEGER, description: 'Duration of the exercise in seconds.' }
                                },
                                required: ['name', 'duration']
                            }
                        }
                    },
                    required: ['type', 'rounds', 'exercises']
                }
            }
        },
        required: ['name', 'description', 'intensity', 'blocks']
    };
    
    let prompt = `You are an expert fitness coach AI named Athena. Generate a complete workout session in JSON format based on these parameters:
- Goal: ${goal}
- Total Duration: Approximately ${durationMinutes} minutes
- User's Fitness Level: ${level}
- User's Reported Mood/Energy: ${mood}
`;

    if (programContext) {
        prompt += `
This workout is part of a structured program:
- Program Name: ${programContext.programName}
- Current Week: ${programContext.week}
- Current Day: ${programContext.day}

IMPORTANT: Apply the principle of progressive overload. This workout should be appropriately more challenging than a workout from a previous week, but suitable for the specified fitness level.
`;
    }

    prompt += `
The workout must be balanced and follow a logical structure. It MUST include a warm-up block, at least one 'work' block, and a cooldown block. 
For a '${level}' user with '${mood}' energy, create a suitable challenge. For example, if the user is tired, suggest a slightly lower intensity workout. If they are energetic, make it more challenging.
Ensure the total calculated duration of all exercises and rests is close to the requested ${durationMinutes} minutes.
Exercise names should be common and easy to understand. Durations for each exercise should be in seconds.
Return ONLY the JSON object that adheres to the provided schema.
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });

        const jsonText = response.text;
        const workoutData = JSON.parse(jsonText) as WorkoutSession;
        
        // Basic validation
        if (workoutData && workoutData.name && workoutData.blocks && workoutData.blocks.length > 0) {
            return workoutData;
        }
        console.error("Generated JSON is missing required fields.", workoutData);
        return null;

    } catch (error) {
        console.error("Error generating workout with Gemini:", error);
        return null;
    }
};
