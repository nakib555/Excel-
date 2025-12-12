import React, { Suspense, ComponentType } from 'react';
import { GroupSkeleton, TabProps } from './shared';

/**
 * A centralized utility to create lazy-loaded Ribbon Groups with automatic Suspense 
 * and Skeleton loading states.
 * 
 * @param importFactory - The dynamic import function (e.g., () => import('./MyGroup'))
 * @returns A component that renders the lazy group wrapped in a Suspense boundary
 */
export function createLazyGroup(
  importFactory: () => Promise<{ default: ComponentType<TabProps> }>
) {
  const LazyComponent = React.lazy(importFactory);

  return function LazyGroupWrapper(props: TabProps) {
    return (
      <Suspense fallback={<GroupSkeleton />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}