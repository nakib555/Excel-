
import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '../utils';

export interface TooltipProps {
    children?: React.ReactNode;
    content?: string | React.ReactNode;
    side?: 'top' | 'bottom' | 'left' | 'right';
    align?: 'start' | 'center' | 'end';
    delayDuration?: number;
    className?: string;
    sideOffset?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
    children, 
    content, 
    side = 'top', 
    align = 'center', 
    delayDuration = 300, 
    className,
    sideOffset = 5
}) => {
    if (!content) return <>{children}</>;
    
    return (
        <TooltipPrimitive.Provider delayDuration={delayDuration}>
            <TooltipPrimitive.Root>
                <TooltipPrimitive.Trigger asChild onClick={(e) => e.stopPropagation()}>
                    {children}
                </TooltipPrimitive.Trigger>
                <TooltipPrimitive.Portal>
                    <TooltipPrimitive.Content
                        side={side}
                        align={align}
                        sideOffset={sideOffset}
                        className={cn(
                            "z-[9999] px-2.5 py-1.5 bg-slate-900/95 backdrop-blur-md text-white text-[11px] font-medium rounded-md shadow-xl border border-white/10 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 select-none max-w-[250px] leading-tight",
                            className
                        )}
                    >
                        {content}
                        <TooltipPrimitive.Arrow className="fill-slate-900/95" />
                    </TooltipPrimitive.Content>
                </TooltipPrimitive.Portal>
            </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
    );
};
