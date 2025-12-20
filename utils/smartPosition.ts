
import { useState, useLayoutEffect, RefObject } from 'react';

export interface PositionState {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    maxHeight: number;
    transformOrigin: string;
    width?: number | string;
}

export interface SmartPositionOptions {
    widthClass?: string;
    fixedWidth?: number;
    gap?: number;
    axis?: 'vertical' | 'horizontal';
}

export const calculatePosition = (
    triggerRect: DOMRect,
    contentRect: DOMRect,
    windowWidth: number,
    windowHeight: number,
    gap: number = 4,
    axis: 'vertical' | 'horizontal' = 'vertical'
): PositionState => {
    // 1. Determine Width
    // If specific width provided via logic, use it. Otherwise, use content's natural width.
    let finalWidth = contentRect.width; 

    // 2. Initial Coordinate Calculation
    let left: number;
    let top: number;
    let transformOriginX = 'left';
    let transformOriginY = 'top';

    if (axis === 'vertical') {
        // --- Vertical Axis (Main Dropdowns) ---
        
        // Align Left
        left = triggerRect.left;
        
        // Check Right Boundary
        if (left + finalWidth > windowWidth - 8) {
            // Try Align Right
            const rightAligned = triggerRect.right - finalWidth;
            if (rightAligned > 8) {
                left = rightAligned;
                transformOriginX = 'right';
            } else {
                // If neither fits perfectly, force it inside screen
                left = windowWidth - finalWidth - 8;
                // Clamp left to 8px
                if (left < 8) {
                    left = 8;
                    // Shrink width if it exceeds viewport
                    finalWidth = windowWidth - 16;
                }
            }
        }

        // Top/Bottom
        const spaceBelow = windowHeight - triggerRect.bottom - 8;
        const spaceAbove = triggerRect.top - 8;

        // Prefer Bottom
        top = triggerRect.bottom + gap;
        
        // Flip to Top if not enough space below AND more space above
        if (spaceBelow < Math.min(contentRect.height, 200) && spaceAbove > spaceBelow) {
            top = triggerRect.top - contentRect.height - gap;
            transformOriginY = 'bottom';
            
            // Adjust if top goes off screen
            if (top < 8) {
                top = 8;
                // Recalculate height to fit
            }
        }
    } else {
        // --- Horizontal Axis (Submenus) ---
        
        // Prefer Right Side
        left = triggerRect.right + gap;
        top = triggerRect.top - 4; // Slight offset for submenus

        // Check Right Boundary
        if (left + finalWidth > windowWidth - 8) {
            // Flip to Left
            left = triggerRect.left - finalWidth - gap;
            transformOriginX = 'right';
        }

        // Clamp Horizontal
        if (left < 8) {
            left = 8;
            if (left + finalWidth > windowWidth - 8) {
                finalWidth = windowWidth - 16;
            }
        } else if (left + finalWidth > windowWidth - 8) {
             left = windowWidth - finalWidth - 8;
        }

        // Check Bottom Boundary
        if (top + contentRect.height > windowHeight - 8) {
            // Shift Up
            const shiftUp = (top + contentRect.height) - (windowHeight - 8);
            top -= shiftUp;
            transformOriginY = 'bottom';
        }
        
        // Clamp Vertical
        top = Math.max(8, top);
    }

    // 3. Max Height Calculation
    const availableHeightBelow = windowHeight - top - 8;
    // Ensure we have at least some height, but don't overflow screen
    const maxHeight = Math.min(600, windowHeight - 16); 

    return {
        top,
        left,
        maxHeight,
        transformOrigin: `${transformOriginY} ${transformOriginX}`,
        width: finalWidth
    };
};

export function useSmartPosition(
    isOpen: boolean,
    triggerRef: RefObject<HTMLElement | null>,
    contentRef: RefObject<HTMLElement | null>,
    options?: SmartPositionOptions
) {
    const [position, setPosition] = useState<PositionState | null>(null);

    useLayoutEffect(() => {
        if (!isOpen || !triggerRef.current) {
            return;
        }

        let animationFrameId: number;
        let resizeObserver: ResizeObserver | null = null;

        const update = () => {
            if (!triggerRef.current) return;
            
            const triggerRect = triggerRef.current.getBoundingClientRect();
            
            // Default to a dummy rect if content isn't mounted yet to start the first paint
            const contentRect = contentRef.current 
                ? contentRef.current.getBoundingClientRect() 
                : { width: options?.fixedWidth || 200, height: 200 } as DOMRect;

            // Handle widthClass override for the calculation simulation
            if (options?.widthClass) {
                // If widthClass is set, we assume the CSS handles the width, 
                // but we need a rough estimate for positioning logic if contentRef is not ready.
                // Once contentRef is ready, getBoundingClientRect gives exact size.
            }

            const pos = calculatePosition(
                triggerRect,
                contentRect,
                window.innerWidth,
                window.innerHeight,
                options?.gap ?? (options?.axis === 'horizontal' ? -1 : 4),
                options?.axis
            );

            // Apply fixed width override if provided in options
            if (options?.fixedWidth) {
                pos.width = options.fixedWidth;
            } else if (options?.widthClass) {
                // Let CSS handle width via class, override calculated pixel width
                pos.width = undefined; 
            }

            setPosition(pos);
        };

        // Initial update
        update();

        // Polling for contentRef availability (fixes Portal chicken-egg problem)
        const checkForContent = () => {
            if (contentRef.current) {
                // Content is mounted, perform accurate update
                update();
                
                // Attach observer
                resizeObserver = new ResizeObserver(() => update());
                resizeObserver.observe(contentRef.current);
            } else {
                // Keep polling for a few frames
                animationFrameId = requestAnimationFrame(checkForContent);
            }
        };
        
        if (!contentRef.current) {
            animationFrameId = requestAnimationFrame(checkForContent);
        } else {
            resizeObserver = new ResizeObserver(() => update());
            resizeObserver.observe(contentRef.current);
        }

        window.addEventListener('scroll', update, true);
        window.addEventListener('resize', update);
        
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('scroll', update, true);
            window.removeEventListener('resize', update);
            if (resizeObserver) resizeObserver.disconnect();
        };
    }, [isOpen, options?.widthClass, options?.fixedWidth, options?.gap, options?.axis, triggerRef, contentRef]);

    return position;
}
