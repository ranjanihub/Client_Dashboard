import React from 'react';

export function ExpertifyLogo({ className = "h-16 md:h-20" }: { className?: string }) {
  return (
    <div className="flex items-center select-none">
      <img
        src="/expertify-logo.png"
        alt="EXPERTIFY"
        className={`max-w-full w-auto object-contain transition-transform hover:scale-[1.02] ${className}`}
      />
    </div>
  );
}
