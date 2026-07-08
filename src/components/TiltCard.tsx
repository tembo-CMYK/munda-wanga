import React, { useRef, useState } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Species } from '../types';

interface TiltCardProps {
  animal: Species;
  setSelectedAnimal: (animal: Species) => void;
}

// Vibrant, kid-friendly but highly polished premium luxury-brand themes for each animal
const CARD_THEMES: Record<string, {
  background: string;       // Rich, bright, high-contrast background color
  textTitle: string;        // High-legibility deep text color for headers
  textBody: string;         // High-legibility body color
  accent: string;           // Playful and punchy accent color
  tagBg: string;            // Symmetrical tags background fill
  tagText: string;          // Heavy typography tag text color
  focusGlow: string;        // Bright warm spotlights for the mouse-tilt glare
  border: string;           // Border defining properties
  buttonClass: string;      // Tailwind classes for buttons adhering to theme colors
}> = {
  leopards: {
    background: 'transparent',    
    textTitle: '#162625',     
    textBody: '#1e3331',      
    accent: '#388653',        
    tagBg: '#162625',         
    tagText: '#f2e9d8',
    focusGlow: 'rgba(255, 255, 255, 0)',
    border: 'transparent',
    buttonClass: 'border-[#162625]/20 text-[#162625] hover:bg-[#162625] hover:text-[#f2e9d8]'
  },
  parrots: {
    background: 'transparent',    
    textTitle: '#162625',     
    textBody: '#1e3331',      
    accent: '#388653',        
    tagBg: '#162625',
    tagText: '#f2e9d8',
    focusGlow: 'rgba(255, 255, 255, 0)',
    border: 'transparent',
    buttonClass: 'border-[#162625]/20 text-[#162625] hover:bg-[#162625] hover:text-[#f2e9d8]'
  },
  lions: {
    background: 'transparent',    
    textTitle: '#162625',     
    textBody: '#1e3331',      
    accent: '#388653',        
    tagBg: '#162625',
    tagText: '#f2e9d8',
    focusGlow: 'rgba(255, 255, 255, 0)',
    border: 'transparent',
    buttonClass: 'border-[#162625]/20 text-[#162625] hover:bg-[#162625] hover:text-[#f2e9d8]'
  }
};

const DEFAULT_THEME = {
  background: 'transparent',
  textTitle: '#162625',
  textBody: '#1e3331',
  accent: '#388653',
  tagBg: '#162625',
  tagText: '#f2e9d8',
  focusGlow: 'rgba(255, 255, 255, 0)',
  border: 'transparent',
  buttonClass: 'border-[#162625]/20 text-[#162625] hover:bg-[#162625] hover:text-[#f2e9d8]'
};

export default function TiltCard({ animal, setSelectedAnimal }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Retrieve matching theme configuration for the current species
  const theme = CARD_THEMES[animal.id] || DEFAULT_THEME;

  // Normalize cursor positions between 0 and 1
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  // Buttery-smooth springs to handle rotation & scaling physics with no sudden jumps
  const springOptions = { damping: 22, stiffness: 200 };
  const rotateXSpring = useSpring(useTransform(y, [0, 1], [12, -12]), springOptions);
  const rotateYSpring = useSpring(useTransform(x, [0, 1], [-12, 12]), springOptions);
  const scaleSpring = useSpring(1, springOptions);

  // Glare highlight tracking positions
  const glareX = useSpring(useTransform(x, [0, 1], [0, 100]), springOptions);
  const glareY = useSpring(useTransform(y, [0, 1], [0, 100]), springOptions);

  // Dynamically update the radial glare gradient overlay reflecting the mouse source position
  const glareBackground = useTransform(
    [glareX, glareY],
    ([latestX, latestY]) =>
      `radial-gradient(circle at ${latestX}% ${latestY}%, ${theme.focusGlow} 0%, rgba(255, 255, 255, 0) 65%)`
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Relative mouse position from 0 to 1 inside current card element bounds
    const relativeX = (e.clientX - rect.left) / width;
    const relativeY = (e.clientY - rect.top) / height;

    x.set(relativeX);
    y.set(relativeY);
  };

  const handleMouseEnter = () => {
    scaleSpring.set(1.025);
  };

  const handleMouseLeave = () => {
    scaleSpring.set(1);
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative cursor-pointer select-none h-full"
      style={{ perspective: 1000 }}
    >
      <motion.div
        style={{
          rotateX: rotateXSpring,
          rotateY: rotateYSpring,
          scale: scaleSpring,
          backgroundColor: theme.background,
          borderColor: theme.border,
          transformStyle: 'preserve-3d',
        }}
        className="w-full h-full rounded-3xl overflow-hidden flex flex-col justify-between group transition-shadow duration-300"
      >
        {/* Glamorous lighting shine overlay reflection */}
        <motion.div 
          style={{ 
            background: glareBackground,
            transform: 'translateZ(1px)' // Keeps glare correct relative to 3d backing
          }} 
          className="absolute inset-0 z-10 pointer-events-none rounded-3xl" 
        />

        <div style={{ transformStyle: 'preserve-3d' }}>
          
          {/* Top image section with depth */}
          <div className="relative aspect-video overflow-hidden rounded-t-2xl" style={{ transformStyle: 'preserve-3d' }}>
            <motion.div
              style={{ transform: 'translateZ(10px) scale(1.05)' }}
              className="w-full h-full"
            >
              <img
                src={animal.image}
                alt={animal.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            
            {/* Tag label pulled outward into luxury 3D space */}
            <span 
              style={{ 
                transform: 'translateZ(35px)',
                backgroundColor: theme.tagBg,
                color: theme.tagText
              }}
              className="absolute top-4 left-4 text-[9px] font-mono font-bold tracking-widest uppercase py-1.5 px-3.5 rounded-full shadow-lg"
            >
              {animal.tag}
            </span>
          </div>

          {/* Body textual content with deliberate layers of depth */}
          <div className="p-6 space-y-3" style={{ transformStyle: 'preserve-3d' }}>
            
            {/* Scientific name / subtitle category */}
            <p 
              style={{ 
                transform: 'translateZ(20px)',
                color: theme.accent
              }}
              className="text-[10px] font-mono tracking-widest uppercase font-black"
            >
              {animal.subtitle}
            </p>

            {/* Title bolded and lifted significantly off card base */}
            <h3 
              style={{ 
                transform: 'translateZ(40px)',
                color: theme.textTitle
              }}
              className="text-2xl font-display font-black tracking-tight"
            >
              {animal.name}
            </h3>

            {/* Description lifted with modest perspective */}
            <p 
              style={{ 
                transform: 'translateZ(15px)',
                color: theme.textBody
              }}
              className="text-xs font-medium leading-relaxed pt-1.5 font-sans line-clamp-3"
            >
              {animal.description}
            </p>
          </div>

        </div>

        {/* Elegant low card controls */}
        <div className="p-6 pt-0" style={{ transformStyle: 'preserve-3d' }}>
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent duplicate trigger from card click
              setSelectedAnimal(animal);
            }}
            style={{ 
              transform: 'translateZ(30px)',
            }}
            className={`w-full py-3.5 border text-center text-xs font-mono uppercase font-black tracking-widest rounded-2xl transition-all cursor-pointer flex justify-center items-center gap-2 group/btn shadow-md ${theme.buttonClass}`}
          >
            <span>Learn More</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform" />
          </button>
        </div>

      </motion.div>
    </div>
  );
}
