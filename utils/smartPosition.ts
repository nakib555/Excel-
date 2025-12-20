import { useState, useLayoutEffect, RefObject } from 'react';

export interface PositionState {
    top?: number | string;
    bottom?: number | string;
    left: number;
    maxHeight: number;
    transformOrigin: string;
    placement: 'top' | 'bottom';
    width?: number;
}

export const calculatePosition = (
    triggerRect: DOMRect,
    contentWidth: number,
    windowWidth: number,
    windowHeight: number,
    gap: number = 4
): PositionState => {
    // Horizontal Position
    let left = triggerRect.left;
    let transformOriginX = 'left';

    // Check right edge collision
    if (left + contentWidth > windowWidth - 8) {
        // Try right alignment relative to trigger
        const rightAlignedLeft = triggerRect.right - contentWidth;
        
        if (rightAlignedLeft > 8) {
             left = rightAlignedLeft;
             transformOriginX = 'right';
        } else {
             // Force fit on screen if both fail, prioritizing left edge visibility
             left = Math.max(8, windowWidth - contentWidth - 8);
             transformOriginX = 'right'; 
        }
    } else {
        // Check left edge safety
        if (left < 8) {
            left = 8;
            transformOriginX = 'left';
        }
    }

    // Vertical Position
    const spaceBelow = windowHeight - triggerRect.bottom - 8;
    const spaceAbove = triggerRect.top - 8;
    
    let top: number | string | undefined = triggerRect.bottom + gap;
    let bottom: number | string | undefined = undefined;
    let maxHeight = Math.min(spaceBelow, 500);
    let transformOriginY = 'top';
    let placement: 'top' | 'bottom' = 'bottom';

    // Flip to top if cramped below (< 200px) AND there is more space above
    if (spaceBelow < 200 && spaceAbove > spaceBelow) {
        top = undefined;
        bottom = windowHeight - triggerRect.top + gap;
        maxHeight = Math.min(spaceAbove, 500);
        transformOriginY = 'bottom';
        placement = 'top';
    } else {
        maxHeight = spaceBelow; 
    }

    return {
        top,
        bottom,
        left,
        maxHeight,
        transformOrigin: `${transformOriginY} ${transformOriginX}`,
        placement,
        width: Math.max(contentWidth, triggerRect.width)
    };
};

export function useSmartPosition(
    isOpen: boolean,
    triggerRef: RefObject<HTMLElement | null>,
    contentRef: RefObject<HTMLElement | null>,
    options?: { 
        widthClass?: string; 
        fixedWidth?: number;
        gap?: number;
    }
) {
    const [position, setPosition] = useState<PositionState | null>(null);

    useLayoutEffect(() => {
        if (!isOpen || !triggerRef.current) {
            setPosition(null);
            return;
        }

        const update = () => {
            if (!triggerRef.current) return;
            
            const triggerRect = triggerRef.current.getBoundingClientRect();
            let width = options?.fixedWidth || triggerRect.width;

            // Estimate width from class if content not mounted or as fallback
            if (options?.widthClass) {
                if (options.widthClass.includes('w-[520px]')) width = 520;
                else if (options.widthClass.includes('w-[360px]')) width = 360;
                else if (options.widthClass.includes('w-[340px]')) width = 340;
                else if (options.widthClass.includes('w-[325px]')) width = 325;
                else if (options.widthClass.includes('w-[260px]')) width = 260;
                else if (options.widthClass.includes('w-[240px]')) width = 240;
                else if (options.widthClass.includes('w-[200px]')) width = 200;
                else if (options.widthClass.includes('w-64')) width = 256;
                else if (options.widthClass.includes('w-56')) width = 224;
                else if (options.widthClass.includes('w-48')) width = 192;
                else if (options.widthClass.includes('w-40')) width = 160;
                else if (options.widthClass.includes('w-16')) width = 64;
            }

            // Prefer real content width if available
            if (contentRef.current) {
                const rect = contentRef.current.getBoundingClientRect();
                if (rect.width > 0) width = rect.width;
            }

            setPosition(calculatePosition(
                triggerRect,
                width,
                window.innerWidth,
                window.innerHeight,
                options?.gap
            ));
        };

        update();
        window.addEventListener('scroll', update, true);
        window.addEventListener('resize', update);
        
        return () => {
            window.removeEventListener('scroll', update, true);
            window.removeEventListener('resize', update);
        };
    }, [isOpen, options?.widthClass, options?.fixedWidth, options?.gap]);

    return position;
}