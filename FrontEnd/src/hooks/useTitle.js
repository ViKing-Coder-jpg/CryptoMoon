import { useEffect } from 'react';

export function useTitle(title) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title ? `CryptoMoon | ${title}` : 'CryptoMoon';
    
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
}
