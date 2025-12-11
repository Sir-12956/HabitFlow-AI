import React, { useMemo, useState } from 'react';

interface HeatmapProps {
  data: Record<string, number>; // date -> count
  color: string; // Tailwind bg class prefix OR Hex Code
  startDate: string; // YYYY-MM-DD
  durationDays: number;
  targetValue?: number; // Count required for max intensity
  onClickDay?: (date: string) => void;
  interactive?: boolean;
}

export const HeatmapLegend: React.FC<{ color: string, targetValue?: number }> = ({ color, targetValue = 1 }) => {
  const isHex = color.startsWith('#');

  // Logic mirrors the Heatmap intensity logic (0-4)
  const getIntensity = (val: number) => {
      if (val === 0) return 0;
      if (val >= targetValue) return 4;
      return Math.ceil((val / targetValue) * 4);
  };

  const getStyle = (level: number) => {
    if (level === 0) return {};
    if (isHex) {
        // level 1=0.4, 2=0.6, 3=0.8, 4=1.0
        const opacity = 0.2 + (level * 0.2); 
        return { backgroundColor: color, opacity };
    }
    return {};
  };

  const getClass = (level: number) => {
    if (level === 0) return 'bg-slate-200 dark:bg-slate-700/50';
    if (isHex) return '';

    const baseColor = color.replace('bg-', '').replace('-500', '');
    if (level === 1) return `bg-${baseColor}-200 dark:bg-${baseColor}-900/80`;
    if (level === 2) return `bg-${baseColor}-300 dark:bg-${baseColor}-700/80`;
    if (level === 3) return `bg-${baseColor}-400 dark:bg-${baseColor}-500/80`;
    return `bg-${baseColor}-600 dark:bg-${baseColor}-400`; 
  };

  // Generate legend items: 0 to targetValue
  // Since we capped targetValue at 5 in the app, we can iterate from 0 to targetValue directly.
  const items = [];
  const maxSteps = Math.min(targetValue, 5); // Safety cap
  for (let i = 0; i <= maxSteps; i++) {
      items.push(i);
  }

  return (
    <div className="flex justify-end items-center gap-2 mt-3 text-[10px] opacity-60">
        <span className="mr-1">Less</span>
        <div className="flex gap-1">
            {items.map((val) => {
                const level = getIntensity(val);
                return (
                    <div 
                        key={val}
                        className={`w-3 h-3 rounded-sm ${getClass(level)}`}
                        style={getStyle(level)}
                        title={`Count: ${val}`}
                    />
                );
            })}
        </div>
        <span className="ml-1">More</span>
    </div>
  );
};

const Heatmap: React.FC<HeatmapProps> = ({ 
  data, 
  color, 
  startDate,
  durationDays,
  targetValue = 1,
  onClickDay,
  interactive = false
}) => {
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  
  // Generate calendar grid data
  const gridData = useMemo(() => {
    const days: { date: string; count: number; dayOfWeek: number; monthLabel?: string }[] = [];
    
    const start = new Date(startDate);
    // Align start to the previous Sunday for clean grid
    const dayOffset = start.getDay();
    const gridStart = new Date(start);
    gridStart.setDate(gridStart.getDate() - dayOffset);

    // Calculate end date
    const end = new Date(start);
    end.setDate(end.getDate() + durationDays);

    let current = new Date(gridStart);
    let index = 0;
    // Add buffer to fill row
    const totalDaysToRender = durationDays + dayOffset + (7 - (end.getDay() + 1)); 

    while (index < totalDaysToRender || days.length % 7 !== 0) {
      const dateStr = current.toISOString().split('T')[0];
      const count = data[dateStr] || 0;
      
      // Determine if we should show a month label
      let monthLabel = undefined;
      if (current.getDate() === 1) {
        monthLabel = current.toLocaleDateString('en-US', { month: 'short' });
      }

      days.push({
        date: dateStr,
        count,
        dayOfWeek: current.getDay(),
        monthLabel
      });

      // Move to next day
      current.setDate(current.getDate() + 1);
      index++;

      // Safety break
      if (index > 2000) break; 
    }
    return days;
  }, [startDate, durationDays, data]);

  // Group by weeks
  const weeks = useMemo(() => {
    const w: (typeof gridData)[] = [];
    for (let i = 0; i < gridData.length; i += 7) {
      w.push(gridData.slice(i, i + 7));
    }
    return w;
  }, [gridData]);

  // Check if color is a Tailwind class or a Hex code
  const isHex = color.startsWith('#');

  // Calculate intensity level (0-4) based on targetValue
  const getIntensity = (count: number) => {
    if (count === 0) return 0;
    if (count >= targetValue) return 4;
    return Math.ceil((count / targetValue) * 4);
  };

  const getStyle = (count: number) => {
    const level = getIntensity(count);
    if (level === 0) return {}; 
    
    if (isHex) {
        // Dynamic opacity based on level
        const opacity = 0.2 + (level * 0.2); // 0.4, 0.6, 0.8, 1.0
        return { backgroundColor: color, opacity };
    }
    return {};
  };

  const getClass = (count: number) => {
    const level = getIntensity(count);
    if (level === 0) return 'bg-slate-200 dark:bg-slate-700/50';
    if (isHex) return '';

    const baseColor = color.replace('bg-', '').replace('-500', '');
    if (level === 1) return `bg-${baseColor}-200 dark:bg-${baseColor}-900/80`;
    if (level === 2) return `bg-${baseColor}-300 dark:bg-${baseColor}-700/80`;
    if (level === 3) return `bg-${baseColor}-400 dark:bg-${baseColor}-500/80`;
    return `bg-${baseColor}-600 dark:bg-${baseColor}-400`; 
  };

  const endDate = new Date(new Date(startDate).getTime() + durationDays * 86400000).toISOString().split('T')[0];

  return (
    <div className="w-full">
      {/* Scrollable Grid Container */}
      <div className="w-full overflow-x-auto pb-2 custom-scrollbar">
        <div className="w-max flex gap-1 pb-4">
          <div className="flex gap-1 h-[100px]">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1 relative">
                {/* Month labels */}
                {week.find(d => d.monthLabel) ? (
                    <div className="text-[10px] opacity-50 absolute -top-5 w-max">
                      {week.find(d => d.monthLabel)?.monthLabel}
                    </div>
                ) : null}

                {week.map((day) => {
                  const isWithinRange = new Date(day.date) >= new Date(startDate) && 
                                        new Date(day.date) < new Date(new Date(startDate).getTime() + durationDays * 86400000);
                  
                  return (
                    <div
                        key={day.date}
                        onClick={() => isWithinRange && interactive && onClickDay && onClickDay(day.date)}
                        title={`${day.date}: ${day.count} activities`}
                        style={isWithinRange ? getStyle(day.count) : {}}
                        className={`
                          w-3 h-3 rounded-sm transition-all duration-200 
                          ${getClass(day.count)}
                          ${interactive && isWithinRange ? 'cursor-pointer hover:ring-2 ring-current/50' : ''}
                          ${!isWithinRange ? 'opacity-0 pointer-events-none' : ''} 
                        `}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer Legend / Interaction */}
      <div className="flex justify-between items-end pt-2 text-[10px] font-mono opacity-60 border-t border-dashed border-current/10 mt-2">
         <div className="flex gap-4">
            <span 
                onClick={() => setShowStart(!showStart)} 
                className="cursor-pointer hover:text-primary transition-colors hover:font-bold select-none"
                title={startDate}
            >
                {showStart ? startDate : 'Start'}
            </span>
         </div>
         
         <div className="flex gap-4">
            <span 
                onClick={() => setShowEnd(!showEnd)} 
                className="cursor-pointer hover:text-primary transition-colors hover:font-bold select-none"
                title={endDate}
            >
                {showEnd ? endDate : 'End'}
            </span>
         </div>
      </div>
    </div>
  );
};

export default Heatmap;