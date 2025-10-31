import React, { useEffect, useState } from 'react';

interface ChecklistItem {
  id: string;
  label: string;
}

interface ProgressiveChecklistProps {
  items: ChecklistItem[];
  delay?: number; // Delay between each item appearing (ms)
  autoStart?: boolean;
}

export const ProgressiveChecklist: React.FC<ProgressiveChecklistProps> = ({ 
  items, 
  delay = 400,
  autoStart = true 
}) => {
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!autoStart) return;

    items.forEach((item, index) => {
      setTimeout(() => {
        setVisibleItems(prev => new Set([...prev, item.id]));
      }, index * delay);
    });
  }, [items, delay, autoStart]);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {items.map((item) => (
        <div
          key={item.id}
          className={`
            flex items-center gap-3 p-4 border-b border-border last:border-b-0
            transition-all duration-400 ease-out
            ${visibleItems.has(item.id) 
              ? 'opacity-100 translate-x-0' 
              : 'opacity-0 -translate-x-5'
            }
          `}
        >
          <div 
            className={`
              w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
              transition-all duration-300
              ${visibleItems.has(item.id)
                ? 'border-green-500 bg-green-500'
                : 'border-border bg-transparent'
              }
            `}
          >
            <span 
              className={`
                text-white text-sm font-bold
                transition-all duration-300
                ${visibleItems.has(item.id)
                  ? 'opacity-100 scale-100'
                  : 'opacity-0 scale-0'
                }
              `}
            >
              ✓
            </span>
          </div>
          <span className="text-foreground text-sm">{item.label}</span>
        </div>
      ))}
    </div>
  );
};