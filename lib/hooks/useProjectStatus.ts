import { useState, useEffect } from 'react';
import { getProjectStatus } from '@/lib/services/projectStatus';

export function useProjectStatus() {
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProjectStatus = async () => {
      try {
        setIsLoading(true);
        const status = await getProjectStatus();
        setIsActive(status);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setIsActive(false); // Assume the project is inactive if there's an error
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectStatus();
  }, []);

  return { isActive, isLoading, error };
} 