import { create } from "zustand";
import { RuntimeEvent } from "@/runtime/events";
import { SupportedLanguage } from "@/types/languages";

export interface ExecutionStoreState {
  events: RuntimeEvent[];
  currentStepIndex: number;
  isPlaying: boolean;
  playbackSpeed: number; // in milliseconds per step
  selectedLanguage: SupportedLanguage;

  // Store Actions
  setEvents: (events: RuntimeEvent[]) => void;
  addEvent: (event: RuntimeEvent) => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (index: number) => void;
  reset: () => void;
  setIsPlaying: (isPlaying: boolean) => void;
  togglePlay: () => void;
  setPlaybackSpeed: (speed: number) => void;
  setSelectedLanguage: (lang: SupportedLanguage) => void;
}

export const useExecutionStore = create<ExecutionStoreState>((set, get) => ({
  events: [],
  currentStepIndex: -1,
  isPlaying: false,
  playbackSpeed: 800,
  selectedLanguage: "c",

  setSelectedLanguage: (selectedLanguage: SupportedLanguage) => {
    set({ selectedLanguage });
  },

  setEvents: (events: RuntimeEvent[]) => {
    set({
      events,
      currentStepIndex: events.length > 0 ? 0 : -1,
      isPlaying: false,
    });
  },

  addEvent: (event: RuntimeEvent) => {
    set((state) => ({
      events: [...state.events, event],
      currentStepIndex: state.currentStepIndex === -1 ? 0 : state.currentStepIndex,
    }));
  },

  nextStep: () => {
    const { events, currentStepIndex } = get();
    if (currentStepIndex < events.length - 1) {
      set({ currentStepIndex: currentStepIndex + 1 });
    } else {
      set({ isPlaying: false });
    }
  },

  previousStep: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      set({ currentStepIndex: currentStepIndex - 1 });
    }
  },

  goToStep: (index: number) => {
    const { events } = get();
    if (index >= 0 && index < events.length) {
      set({ currentStepIndex: index });
    }
  },

  reset: () => {
    set({
      currentStepIndex: get().events.length > 0 ? 0 : -1,
      isPlaying: false,
    });
  },

  setIsPlaying: (isPlaying: boolean) => {
    set({ isPlaying });
  },

  togglePlay: () => {
    const { isPlaying, currentStepIndex, events } = get();
    if (!isPlaying && events.length > 0 && currentStepIndex >= events.length - 1) {
      // If at end, loop to beginning on play
      set({ currentStepIndex: 0, isPlaying: true });
    } else {
      set({ isPlaying: !isPlaying });
    }
  },

  setPlaybackSpeed: (speed: number) => {
    set({ playbackSpeed: speed });
  },
}));
