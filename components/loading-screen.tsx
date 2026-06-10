'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function LoadingScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftCurtainRef = useRef<HTMLDivElement>(null);
  const rightCurtainRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // We want to animate:
    // 1. show text
    // 2. hide text
    // 3. open curtains
    // 4. scale up main content
    
    // Prevent scrolling while loading
    document.body.style.overflow = 'hidden';
    
    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = '';
        if (containerRef.current) {
          containerRef.current.style.display = 'none';
        }
      }
    });

    // Reset initial states
    gsap.set(textRef.current, { opacity: 0, scale: 0.8, y: 20 });
    gsap.set('#main-content', { scale: 0.85, filter: 'blur(10px)' });

    // 1. Show "Bienvenido a NOS" with a slight delay
    tl.to(textRef.current, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.8,
      ease: 'back.out(1.5)',
      delay: 0.5
    });

    // Hold for a moment to read
    tl.to({}, { duration: 1.2 });

    // 2. Fade out text
    tl.to(textRef.current, {
      opacity: 0,
      scale: 0.9,
      duration: 0.4,
      ease: 'power2.in'
    });

    // 3 & 4. Part curtains and zoom in main page concurrently
    tl.to(leftCurtainRef.current, {
      xPercent: -100,
      duration: 1,
      ease: 'power3.inOut'
    }, 'open');
    
    tl.to(rightCurtainRef.current, {
      xPercent: 100,
      duration: 1,
      ease: 'power3.inOut'
    }, 'open');

    tl.to('#main-content', {
      scale: 1,
      filter: 'blur(0px)',
      duration: 1.2,
      ease: 'power3.inOut'
    }, 'open+=0.1'); // slight delay to zoom after curtains start opening

    return () => {
      tl.kill();
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] flex overflow-hidden pointer-events-none">
      {/* Left Curtain */}
      <div 
        ref={leftCurtainRef} 
        className="absolute left-0 top-0 bottom-0 w-1/2 bg-[#FFD700] origin-left pointer-events-auto"
      />
      
      {/* Right Curtain */}
      <div 
        ref={rightCurtainRef} 
        className="absolute right-0 top-0 bottom-0 w-1/2 bg-[#FFD700] origin-right pointer-events-auto"
      />

      {/* Content overlay (centered) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-auto">
        <h1 
          ref={textRef}
          className="mt-8 font-heading text-4xl sm:text-6xl font-900 uppercase tracking-tighter text-[#111] drop-shadow-sm text-center px-4"
        >
          Bienvenido a NOS
        </h1>
      </div>
    </div>
  );
}
