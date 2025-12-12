import React from 'react';
import { cn } from '../../utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
  className?: string;
}

export function Skeleton({ className, shimmer = true, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-slate-200/80",
        shimmer ? "shimmer" : "animate-pulse",
        className
      )}
      {...props}
    />
  );
}