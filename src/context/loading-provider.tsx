
'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  showLoading: (duration: number, onComplete?: () => void) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  const showLoading = useCallback((duration: number, onComplete?: () => void) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (onComplete) {
        onComplete();
      }
    }, duration);
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, showLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading(): LoadingContextType {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
