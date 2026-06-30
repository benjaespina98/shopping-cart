import { useEffect, useRef, useState } from 'react';

// Plays a fade+rise once when the element enters the viewport.
// Usage: const { ref, className } = useReveal(); <section ref={ref} className={className}>
export function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, className: `ps-reveal${visible ? ' ps-reveal-visible' : ''}` };
}
