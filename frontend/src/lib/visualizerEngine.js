import { useState, useEffect, useRef, useCallback } from 'react';

export function useVisualizer(states = []) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef(null);

  // Constants
  const BASE_SPEED_MS = 1000;
  
  const reset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const play = useCallback(() => {
    if (currentStep < states.length - 1) {
      setIsPlaying(true);
    }
  }, [currentStep, states.length]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const stepForward = useCallback(() => {
    if (currentStep < states.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, states.length]);

  const stepBackward = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Main playback loop
  useEffect(() => {
    if (isPlaying && currentStep < states.length - 1) {
      timerRef.current = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, BASE_SPEED_MS / speed);
    } else if (isPlaying && currentStep >= states.length - 1) {
      setIsPlaying(false);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStep, speed, states.length]);

  const currentState = states.length > 0 ? states[currentStep] : null;

  return {
    currentStep,
    totalSteps: states.length,
    currentState,
    isPlaying,
    speed,
    setSpeed,
    play,
    pause,
    stepForward,
    stepBackward,
    reset
  };
}
