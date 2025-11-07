import React, { useState, useEffect } from 'react';

interface PageAnimatorProps {
  children: React.ReactNode;
  pageKey: string;
  direction: 'forward' | 'back';
}

export const PageAnimator: React.FC<PageAnimatorProps> = ({ children, pageKey, direction }) => {
  const [currentChildren, setCurrentChildren] = useState(children);
  const [currentKey, setCurrentKey] = useState(pageKey);
  const [animationClass, setAnimationClass] = useState('animate-fade-in');

  useEffect(() => {
    if (pageKey !== currentKey) {
      // Phase 1: Animate out the old content
      setAnimationClass(direction === 'forward' ? 'animate-slide-out-left' : 'animate-slide-out-right');

      const timeout = setTimeout(() => {
        // Phase 2: Switch the content and animate in the new content
        setCurrentChildren(children);
        setCurrentKey(pageKey);
        setAnimationClass(direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left');
      }, 400); // This duration must match the CSS animation duration

      return () => clearTimeout(timeout);
    }
  }, [pageKey, children, direction, currentKey]);

  return (
    <div key={currentKey} className={`w-full h-full absolute inset-0 ${animationClass}`}>
      {currentChildren}
    </div>
  );
};
