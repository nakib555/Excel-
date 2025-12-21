
import { useState, useLayoutEffect, RefObject } from 'react';

export interface PositionState {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    maxHeight: number;
    transformOrigin: string;
    width?: number | string;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    ready: boolean;
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
): Omit<PositionState, 'ready'> => {
    // 1. Mobile Detection & Override
    const isMobile = windowWidth < 640; 
    const viewportPadding = 8; // Minimum space from screen edges
    
    let finalAxis = axis;
    let finalGap = gap;

    if (isMobile && axis === 'horizontal') {
        finalAxis = 'vertical';
        // Ensure positive gap so it doesn't cover the button (requested behavior: "not on the button")
        finalGap = Math.abs(gap) < 4 ? 4 : Math.abs(gap);
    }

    let finalWidth = contentRect.width; 

    // 3. Initial Coordinate Calculation
    let left: number;
    let top: number;
    let transformOriginX = 'left';
    let transformOriginY = 'top';
    let placement: PositionState['placement'] = 'bottom';
    let maxHeight = 600; // Default cap

    if (finalAxis === 'vertical') {
        // --- Vertical Axis ---
        
        // Align Left/Right horizontally
        left = triggerRect.left;
        
        // Check Right Boundary
        if (left + finalWidth > windowWidth - viewportPadding) {
            // Try Align Right
            const rightAligned = triggerRect.right - finalWidth;
            if (rightAligned > viewportPadding) {
                left = rightAligned;
                transformOriginX = 'right';
            } else {
                // Force inside screen
                left = windowWidth - finalWidth - viewportPadding;
                if (left < viewportPadding) {
                    left = viewportPadding;
                    // On mobile, maximize width if tight, accounting for padding
                    finalWidth = windowWidth - (viewportPadding * 2);
                }
            }
        } else {
            // Check Left Boundary (if we shifted left for some reason or initial position is off)
             if (left < viewportPadding) {
                left = viewportPadding;
                if (left + finalWidth > windowWidth - viewportPadding) {
                     finalWidth = windowWidth - (viewportPadding * 2);
                }
            }
        }

        // Top/Bottom Placement
        const spaceBelow = windowHeight - triggerRect.bottom - viewportPadding; // Available space below
        const spaceAbove = triggerRect.top - viewportPadding; // Available space above

        // Determine if we should flip to top
        // Flip if:
        // 1. Content is taller than space below AND
        // 2. There is MORE space above than below
        // OR
        // 3. Space below is critically small (< 100px) and top is better
        const preferTop = (contentRect.height > spaceBelow - finalGap && spaceAbove > spaceBelow) || (spaceBelow < 100 && spaceAbove > 100);

        if (preferTop) {
            placement = 'top';
            transformOriginY = 'bottom';
            const availableHeight = Math.max(100, spaceAbove - finalGap);
            maxHeight = availableHeight;
            
            // For 'top' placement, we must calculate 'top' coordinate such that the bottom of the content
            // sits at (triggerRect.top - gap).
            // We use the effective height (clamped by maxHeight) for this calculation.
            const effectiveHeight = Math.min(contentRect.height, availableHeight);
            top = triggerRect.top - finalGap - effectiveHeight;
        } else {
            placement = 'bottom';
            transformOriginY = 'top';
            const availableHeight = Math.max(100, spaceBelow - finalGap);
            maxHeight = availableHeight;
            top = triggerRect.bottom + finalGap;
        }

    } else {
        // --- Horizontal Axis ---
        
        // Prefer Right Side
        left = triggerRect.right + finalGap;
        top = triggerRect.top - 4; // Slight offset for submenus

        // Check Right Boundary
        if (left + finalWidth > windowWidth - viewportPadding) {
            // Flip to Left
            left = triggerRect.left - finalWidth - finalGap;
            transformOriginX = 'right';
            placement = 'left';
        } else {
            placement = 'right';
        }

        // Clamp Horizontal
        if (left < viewportPadding) {
            left = viewportPadding;
            if (left + finalWidth > windowWidth - viewportPadding) {
                finalWidth = windowWidth - (viewportPadding * 2);
            }
        }

        // Check Bottom Boundary and shift vertically if needed
        if (top + contentRect.height > windowHeight - viewportPadding) {
            // Shift Up to fit
            const shiftUp = (top + contentRect.height) - (windowHeight - viewportPadding);
            top -= shiftUp;
            transformOriginY = 'bottom';
        }
        
        top = Math.max(viewportPadding, top);
        // Cap height if it still doesn't fit
        maxHeight = windowHeight - top - viewportPadding;
    }

    return {
        top,
        left,
        maxHeight,
        transformOrigin: `${transformOriginY} ${transformOriginX}`,
        width: finalWidth,
        placement
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
            if (position !== null) setPosition(null);
            return;
        }

        let animationFrameId: number;
        let resizeObserver: ResizeObserver | null = null;

        const update = () => {
            if (!triggerRef.current) return;
            
            const triggerRect = triggerRef.current.getBoundingClientRect();
            
            // Check if we have the real element to measure
            const hasContent = !!contentRef.current;
            
            const contentRect = hasContent
                ? contentRef.current!.getBoundingClientRect() 
                : { width: options?.fixedWidth || 200, height: 200 } as DOMRect;

            const pos = calculatePosition(
                triggerRect,
                contentRect,
                window.innerWidth,
                window.innerHeight,
                options?.gap ?? (options?.axis === 'horizontal' ? -1 : 4),
                options?.axis
            );

            // If we are using fallback dimensions (content not mounted yet), keep it invisible
            const ready = hasContent;

            let finalWidth: string | number | undefined = undefined;
            if (options?.fixedWidth) {
                finalWidth = options.fixedWidth;
            } else if (options?.widthClass) {
                // If the width was constrained by screen edges, use the numeric width
                // Otherwise leave undefined to let CSS class handle it
                if (pos.width !== undefined && typeof pos.width === 'number' && contentRect.width > 0 && pos.width < contentRect.width - 0.5) {
                    finalWidth = pos.width;
                } else {
                    finalWidth = undefined;
                }
            } else {
                // Natural width mode: if constrained, use specific width
                if (pos.width !== undefined && typeof pos.width === 'number' && contentRect.width > 0 && pos.width < contentRect.width - 0.5) {
                    finalWidth = pos.width;
                } else {
                    finalWidth = undefined;
                }
            }

            // Fallback for mobile: if calculated width is very close to screen width, just lock it
            if (typeof pos.width === 'number' && pos.width > window.innerWidth - 20) {
                finalWidth = pos.width;
            }

            setPosition({
                ...pos,
                width: finalWidth,
                ready
            });
        };

        // Initial update
        update();

        const checkForContent = () => {
            if (contentRef.current) {
                // Content is mounted, update with real dimensions
                update();
                resizeObserver = new ResizeObserver(() => update());
                resizeObserver.observe(contentRef.current);
            } else {
                // Keep checking until portal mounts
                animationFrameId = requestAnimationFrame(checkForContent);
            }
        };
        
        if (!contentRef.current) {
            animationFrameId = requestAnimationFrame(checkForContent);
        } else {
            resizeObserver = new ResizeObserver(() => update());
            resizeObserver.observe(contentRef.current);
        }

        // Capture phase scroll listener to detect scrolling of parent containers
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
