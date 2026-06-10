'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function LoadingScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftCurtainRef = useRef<HTMLDivElement>(null);
  const rightCurtainRef = useRef<HTMLDivElement>(null);
  const bottleRef = useRef<SVGSVGElement>(null);
  const fillRectRef = useRef<SVGRectElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // We want to animate:
    // 1. fillRectRef height from 0 to 220 (y from 300 to 80)
    // 2. show text
    // 3. hide bottle and text
    // 4. open curtains
    // 5. scale up main content
    
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
    gsap.set(fillRectRef.current, { attr: { y: 300, height: 0 } });
    gsap.set(textRef.current, { opacity: 0, scale: 0.8, y: 20 });
    gsap.set('#main-content', { scale: 0.85, filter: 'blur(10px)' });

    // 1. Fill the bottle (loading simulation)
    tl.to(fillRectRef.current, {
      attr: { y: 80, height: 220 },
      duration: 1.5,
      ease: 'power2.inOut',
      delay: 0.2
    });

    // 2. Show "Bienvenido a NOS"
    tl.to(textRef.current, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.5,
      ease: 'back.out(1.5)',
    });

    // Hold for a moment to read
    tl.to({}, { duration: 0.8 });

    // 3. Fade out bottle and text
    tl.to([bottleRef.current, textRef.current], {
      opacity: 0,
      scale: 0.9,
      duration: 0.4,
      ease: 'power2.in'
    });

    // 4 & 5. Part curtains and zoom in main page concurrently
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
        
        {/* NOS Bottle SVG */}
        <svg 
          ref={bottleRef}
          width="120" 
          height="320" 
          viewBox="0 0 200 350" 
          className="drop-shadow-2xl"
        >
          {/* Defs for clip path and gradients */}
          <defs>
            <clipPath id="bottle-fill-clip">
              <rect ref={fillRectRef} x="40" y="300" width="120" height="0" />
            </clipPath>
          </defs>

          {/* Valve and top mechanics */}
          <path d="M 85 80 L 85 40 L 70 40 L 70 20 L 130 20 L 130 40 L 115 40 L 115 80 Z" fill="#333" stroke="#111" strokeWidth="4" strokeLinejoin="round" />
          {/* Hose connector */}
          <circle cx="70" cy="50" r="10" fill="#222" />
          <path d="M 50 50 L 70 50" stroke="#111" strokeWidth="8" strokeLinecap="round" />
          
          {/* Main bottle shape (Empty background) */}
          <rect x="50" y="80" width="100" height="220" rx="40" fill="transparent" stroke="#111" strokeWidth="10" />

          {/* Filled bottle shape (Masked) */}
          <rect 
            x="50" 
            y="80" 
            width="100" 
            height="220" 
            rx="40" 
            fill="#111" 
            clipPath="url(#bottle-fill-clip)" 
          />

          {/* NOS Label inside the bottle (only visible when filled) */}
          <g clipPath="url(#bottle-fill-clip)">
            <rect x="60" y="140" width="80" height="40" fill="#FFD700" transform="rotate(-15, 100, 160)" />
            <text x="100" y="165" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="24" fill="#111" textAnchor="middle" transform="rotate(-15, 100, 160)">NOS</text>
          </g>

          {/* Shine / Reflection highlight on the bottle */}
          <path d="M 65 100 L 65 280" stroke="rgba(255,255,255,0.4)" strokeWidth="6" strokeLinecap="round" />
        </svg>

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
