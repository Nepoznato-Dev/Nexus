import { useEffect } from 'react';

/**
 * Hook to signal page readiness to the loading system
 * Call this when your component has finished loading critical content
 * 
 * @param {boolean} isReady - Whether the page is ready (default: true when mounted)
 * @param {number} delay - Optional delay before signaling ready (ms)
 * 
 * @example
 * function MyPage() {
 *   const [data, setData] = useState(null);
 *   
 *   useEffect(() => {
 *     fetchData().then(setData);
 *   }, []);
 *   
 *   // Signal ready when data loads
 *   usePageReady(!!data);
 *   
 *   return <div>{data ? 'Content' : 'Loading...'}</div>;
 * }
 */
export function usePageReady(isReady = true, delay = 0) {
  useEffect(() => {
    if (!isReady) return;
    
    if (delay > 0) {
      const timer = setTimeout(() => {
        window.nexusPageReady?.();
      }, delay);
      return () => clearTimeout(timer);
    } else {
      window.nexusPageReady?.();
    }
  }, [isReady, delay]);
}
