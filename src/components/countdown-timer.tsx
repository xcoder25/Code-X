'use client';

import { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    // Target date: July 27, 2026, at 9:00 AM WAT (West Africa Time, UTC+1)
    const targetDate = new Date('2026-07-27T09:00:00+01:00').getTime();

    const calculateTimeLeft = () => {
      const difference = targetDate - Date.now();
      
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isExpired: false,
      });
    };

    // Calculate immediately on mount
    calculateTimeLeft();
    
    // Update every second
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!timeLeft) {
    // Skeleton loading state
    return (
      <div className="flex justify-center items-center gap-4 py-3 bg-black/40 backdrop-blur-md rounded-xl border border-orange-500/20 max-w-lg mx-auto w-full h-[88px]">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded bg-slate-800 h-10 w-48"></div>
        </div>
      </div>
    );
  }

  if (timeLeft.isExpired) {
    return (
      <div className="text-center py-4 px-6 bg-black/40 backdrop-blur-md rounded-xl border border-orange-500/20 max-w-lg mx-auto w-full">
        <p className="text-orange-500 font-bold uppercase tracking-wider text-sm animate-pulse">
          Registration Closed
        </p>
        <p className="text-white text-xs mt-1">
          The bootcamp is currently in progress or completed. Thank you!
        </p>
      </div>
    );
  }

  const timeBlocks = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <p className="text-orange-500 font-semibold uppercase tracking-widest text-xs sm:text-sm flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
        Registration Closes In
      </p>
      <div className="flex justify-center items-center gap-3 sm:gap-4 py-3 px-4 sm:px-6 bg-zinc-950/70 border border-zinc-800/80 rounded-2xl shadow-[0_0_20px_rgba(249,115,22,0.05)] w-full max-w-lg">
        {timeBlocks.map((block, idx) => (
          <div key={block.label} className="flex items-center">
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums tracking-tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
                {String(block.value).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs font-medium text-zinc-500 uppercase tracking-wide mt-0.5">
                {block.label}
              </span>
            </div>
            {idx < timeBlocks.length - 1 && (
              <span className="text-xl sm:text-2xl font-bold text-orange-500/40 ml-3 sm:ml-4 select-none animate-pulse">
                :
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
