import React, { createContext, useContext } from 'react';
import { useProjectStatus } from '@/lib/hooks/useProjectStatus';
import { Blocked } from '@/components/Blocked';

interface ProjectStatusContextType {
  isActive: boolean;
  isLoading: boolean;
  error: Error | null;
}

const ProjectStatusContext = createContext<ProjectStatusContextType | undefined>(undefined);

export function useProjectStatusContext() {
  const context = useContext(ProjectStatusContext);
  if (context === undefined) {
    throw new Error('useProjectStatusContext must be used within a ProjectStatusProvider');
  }
  return context;
}

export function ProjectStatusProvider({ children }: { children: React.ReactNode }) {
  const { isActive, isLoading, error } = useProjectStatus();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show blocked component if project is inactive
  if (!isActive) {
    return <Blocked />;
  }

  // Provide project status to children
  return (
    <ProjectStatusContext.Provider value={{ isActive, isLoading, error }}>
      {children}
    </ProjectStatusContext.Provider>
  );
} 