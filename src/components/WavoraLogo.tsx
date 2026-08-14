import React from 'react';

interface WavoraLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'auto';
}

export default function WavoraLogo({ className = '', size = 'md' }: WavoraLogoProps) {
  // Determine dimensions based on size preset
  const dimensions = {
    sm: { width: 140, height: 32 },
    md: { width: 180, height: 42 },
    lg: { width: 240, height: 56 },
    auto: { width: '100%', height: 'auto' }
  };

  const dim = dimensions[size];

  return (
    <svg
      viewBox="0 0 240 50"
      width={dim.width}
      height={dim.height}
      className={`select-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      id="wavora_logo_svg"
    >
      <defs>
        {/* Gradients for the horizontal lines under the main text */}
        <linearGradient id="leftLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#A855F7" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#6366F1" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="rightLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366F1" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.8" />
        </linearGradient>

        {/* Gradients for the soundwave capsule bars to make them pop */}
        <linearGradient id="bar1Grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
        <linearGradient id="bar2Grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#A5B4FC" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
        <linearGradient id="bar3Grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id="bar4Grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id="bar5Grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
      </defs>

      {/* --- WAVORA TEXT (Geometric & Custom Stylized Paths) --- */}
      <g 
        stroke="white" 
        strokeWidth="3.2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        fill="none"
        opacity="0.95"
      >
        {/* W */}
        <path d="M 10 2 L 16 26 L 22 10 L 28 26 L 34 2" />
        
        {/* A (No crossbar, clean chevron) */}
        <path d="M 40 26 L 52 2 L 64 26" />
        
        {/* V */}
        <path d="M 70 2 L 82 26 L 94 2" />
        
        {/* O */}
        <ellipse cx="112" cy="14" rx="11" ry="12" />
        
        {/* R */}
        <path d="M 130 26 L 130 2 L 143 2 C 149.5 2 149.5 14 143 14 L 130 14 M 141 14 L 152 26" />
        
        {/* A (No crossbar, clean chevron) */}
        <path d="M 158 26 L 170 2 L 182 26" />
      </g>

      {/* --- SOUNDWAVE (Pills with gradients) --- */}
      <g strokeLinecap="round" strokeWidth="4.5">
        {/* Bar 1 */}
        <line x1="194" y1="11" x2="194" y2="17" stroke="url(#bar1Grad)" />
        
        {/* Bar 2 */}
        <line x1="202" y1="6" x2="202" y2="22" stroke="url(#bar2Grad)" />
        
        {/* Bar 3 */}
        <line x1="210" y1="2" x2="210" y2="26" stroke="url(#bar3Grad)" />
        
        {/* Bar 4 */}
        <line x1="218" y1="6" x2="218" y2="22" stroke="url(#bar4Grad)" />
        
        {/* Bar 5 */}
        <line x1="226" y1="11" x2="226" y2="17" stroke="url(#bar5Grad)" />
      </g>

      {/* --- LIVE SUBTITLE & HORIZONTAL GRADIENT LINES --- */}
      {/* Left Line */}
      <line x1="10" y1="38" x2="72" y2="38" stroke="url(#leftLineGrad)" strokeWidth="1.5" />
      
      {/* LIVE Text */}
      <text
        x="96"
        y="42"
        fill="#93C5FD"
        fontSize="10"
        fontWeight="800"
        letterSpacing="5"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, sans-serif"
        opacity="0.9"
      >
        LIVE
      </text>
      
      {/* Right Line */}
      <line x1="120" y1="38" x2="182" y2="38" stroke="url(#rightLineGrad)" strokeWidth="1.5" />
    </svg>
  );
}
