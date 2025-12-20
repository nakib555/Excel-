import { useState, useLayoutEffect, RefObject } from 'react';

export interface PositionState {
    top?: number | string;
    bottom?: number | string;
    left: number;
    maxHeight: number;
    transformOrigin: string;
    placement: 'top' | 'bottom' | 'left' | 'right';
    width?: number;
}

export interface SmartPositionOptions {
    widthClass?: string;
    fixedWidth?: number;
    gap?: number;
    axis?: 'vertical' | 'horizontal';
}

export const calculatePosition = (
    triggerRect: DOMRect,
    contentWidth: number,
    windowWidth: number,
    windowHeight: number,
    gap: number = 4,
    axis: 'vertical' | 'horizontal' = 'vertical'
): PositionState => {
    let top: number | string | undefined;
    let bottom: number | string | undefined;
    let left: number;
    let maxHeight: number;
    let transformOrigin: string;
    let placement: 'top' | 'bottom' | 'left' | 'right';

    if (axis === 'vertical') {
        // Horizontal Position (collision detection)
        left = triggerRect.left;
        let transformOriginX = 'left';

        if (left + contentWidth > windowWidth - 8) {
            const rightAlignedLeft = triggerRect.right - contentWidth;
            if (rightAlignedLeft > 8) {
                 left = rightAlignedLeft;
                 transformOriginX = 'right';
            } else {
                 left = Math.max(8, windowWidth - contentWidth - 8);
                 transformOriginX = 'right'; 
            }
        } else {
            if (left < 8) {
                left = 8;
                transformOriginX = 'left';
            }
        }

        // Vertical Position
        const spaceBelow = windowHeight - triggerRect.bottom - 8;
        const spaceAbove = triggerRect.top - 8;
        
        top = triggerRect.bottom + gap;
        bottom = undefined;
        maxHeight = Math.min(spaceBelow, 500);
        let transformOriginY = 'top';
        placement = 'bottom';

        // Flip to top if cramping
        if (spaceBelow < 200 && spaceAbove > spaceBelow) {
            top = undefined;
            bottom = windowHeight - triggerRect.top + gap;
            maxHeight = Math.min(spaceAbove, 500);
            transformOriginY = 'bottom';
            placement = 'top';
        }

        transformOrigin = `${transformOriginY} ${transformOriginX}`;
        
    } else { // Horizontal Axis (for submenus)
        // Vertical Alignment (Align Top by default with slight offset)
        const alignedTop = triggerRect.top - 4;
        const spaceBelow = windowHeight - alignedTop - 8;
        
        // Simple vertical collision check
        if (spaceBelow < 200) {
             // Try align bottom
             const alignedBottom = windowHeight - triggerRect.bottom - 4;
             // If bottom alignment has more space or current space is tiny
             if (windowHeight - alignedBottom > spaceBelow) {
                 top = undefined;
                 bottom = windowHeight - triggerRect.bottom - 4;
                 maxHeight = Math.min(triggerRect.bottom, 500);
                 transformOrigin = 'bottom left';
             } else {
                 top = alignedTop;
                 maxHeight = spaceBelow;
                 transformOrigin = 'top left';
             }
        } else {
            top = alignedTop;
            maxHeight = Math.min(spaceBelow, 500);
            transformOrigin = 'top left';
        }

        // Horizontal Position
        const spaceRight = windowWidth - triggerRect.right - 8;
        
        // Default to right
        left = triggerRect.right + (gap || 0); // Use gap (e.g. -1 to overlap)
        placement = 'right';

        // Flip to left if no space on right
        if (contentWidth > spaceRight) {
            left = triggerRect.left - contentWidth - (gap || 0);
            placement = 'left';
            transformOrigin = transformOrigin.replace('left', 'right');
        } else {
            // Ensure origin is left
            transformOrigin = transformOrigin.replace('right', 'left'); 
        }
    }

    return {
        top,
        bottom,
        left,
        maxHeight,
        transformOrigin,
        placement,
        width: Math.max(contentWidth, axis === 'vertical' ? triggerRect.width : 0)
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
            setPosition(null);
            return;
        }

        const update = () => {
            if (!triggerRef.current) return;
            
            const triggerRect = triggerRef.current.getBoundingClientRect();
            let width = options?.fixedWidth || triggerRect.width;

            if (options?.widthClass) {
                // Regex parsing for tailwind classes
                const wArbitrary = options.widthClass.match(/w-\[(\d+)px\]/);
                if (wArbitrary) {
                    width = parseInt(wArbitrary[1], 10);
                } else {
                    const wTailwind = options.widthClass.match(/w-(\d+)/);
                    if (wTailwind) {
                        width = parseInt(wTailwind[1], 10) * 4;
                    }
                }
            }

            // Ref measurement overrides heuristic if available (content is mounted)
            if (contentRef.current) {
                const rect = contentRef.current.getBoundingClientRect();
                if (rect.width > 0) {
                    // Use measured width if it seems reasonable (greater than heuristic or heuristic was 0)
                    // But if widthClass is strictly enforcing width, maybe we should stick to it?
                    // Generally, actual rendered width is source of truth.
                    width = rect.width;
                }
            }

            setPosition(calculatePosition(
                triggerRect,
                width,
                window.innerWidth,
                window.innerHeight,
                options?.gap ?? (options?.axis === 'horizontal' ? -1 : 4),
                options?.axis
            ));
        };

        update();
        
        let resizeObserver: ResizeObserver | null = null;
        if (contentRef.current) {
            resizeObserver = new ResizeObserver(() => update());
            resizeObserver.observe(contentRef.current);
        }

        window.addEventListener('scroll', update, true);
        window.addEventListener('resize', update);
        
        return () => {
            window.removeEventListener('scroll', update, true);
            window.removeEventListener('resize', update);
            if (resizeObserver) resizeObserver.disconnect();
        };
    }, [isOpen, options?.widthClass, options?.fixedWidth, options?.gap, options?.axis, triggerRef, contentRef]);

    return position;
}