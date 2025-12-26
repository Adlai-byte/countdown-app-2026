import { useState, useEffect } from 'react';

export interface Meme {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  box_count: number;
}

interface UseMemeResult {
  memes: Meme[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const IMGFLIP_API = 'https://api.imgflip.com/get_memes';

export function useMemes(): UseMemeResult {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMemes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(IMGFLIP_API);
      const data = await response.json();

      if (data.success) {
        setMemes(data.data.memes);
      } else {
        throw new Error('Failed to fetch memes');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMemes();
  }, []);

  return {
    memes,
    isLoading,
    error,
    refetch: fetchMemes,
  };
}
