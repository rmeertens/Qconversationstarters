import React from 'react';

interface GameCardProps {
  cardNumber?: string;
  title?: string;
  subtitle?: string;
  mainQuestion?: string;
  followUpQuestion?: string;
  hashtags?: string[];
  brandColors?: {
    primary: string;
    secondary: string;
  };
}

export function GameCard({
  cardNumber = "Card 1",
  title = "QCon",
  subtitle = "QCONVERSATION STARTER",
  mainQuestion = "What's the most surprising insight you've heard at QCon so far?",
  followUpQuestion = "How might that insight affect the way you work next week?",
  hashtags = ["#AI", "#Leadership", "#TeamCulture", "#TechTrends"],
  brandColors = { primary: "#22c55e", secondary: "#3b82f6" }
}: GameCardProps) {
  return (
    <div className="relative w-80 h-[500px] bg-gradient-to-br from-slate-100 to-blue-50 rounded-3xl p-6 shadow-xl overflow-hidden">
      {/* Background hexagon patterns */}
      <div className="absolute top-4 left-4 w-6 h-6 opacity-20">
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
          <path d="M17.5 3.5L22 12L17.5 20.5H6.5L2 12L6.5 3.5H17.5Z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </div>
      <div className="absolute top-8 left-12 w-4 h-4 opacity-15">
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
          <path d="M17.5 3.5L22 12L17.5 20.5H6.5L2 12L6.5 3.5H17.5Z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </div>
      <div className="absolute bottom-8 right-4 w-5 h-5 opacity-20">
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
          <path d="M17.5 3.5L22 12L17.5 20.5H6.5L2 12L6.5 3.5H17.5Z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </div>
      <div className="absolute bottom-16 right-12 w-4 h-4 opacity-15">
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
          <path d="M17.5 3.5L22 12L17.5 20.5H6.5L2 12L6.5 3.5H17.5Z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </div>

      {/* Card content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Brand and title - removed header with card number */}
        <div className="mb-6">
          <div className="mb-2">
            <span style={{ color: brandColors.primary }} className="text-4xl font-bold">
              {title.charAt(0)}
            </span>
            <span style={{ color: brandColors.secondary }} className="text-4xl font-bold">
              {title.slice(1)}
            </span>
          </div>
          <div className="text-slate-600 text-sm font-medium tracking-widest">
            {subtitle}
          </div>
        </div>

        {/* Question section - moved up by adjusting positioning */}
        <div className="mt-8">
          <div className="flex items-start gap-4 mb-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
              style={{ backgroundColor: brandColors.secondary }}
            >
              Q
            </div>
            <div className="text-slate-800 text-xl leading-relaxed">
              {mainQuestion}
            </div>
          </div>

          {followUpQuestion && (
            <>
              <hr className="border-slate-300 my-4" />
              <div className="text-slate-600 text-lg leading-relaxed mb-8">
                {followUpQuestion}
              </div>
            </>
          )}
        </div>

        {/* Hashtags - moved to the left and positioned higher */}
        <div className="absolute bottom-12 left-4 flex flex-wrap gap-2 max-w-[280px]">
          {hashtags.map((tag, index) => (
            <span 
              key={index} 
              className="text-blue-600 text-sm font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}