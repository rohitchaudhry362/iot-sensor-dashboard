import MuiSkeleton, { type SkeletonProps as MuiSkeletonProps } from '@mui/material/Skeleton';

export type SkeletonProps = MuiSkeletonProps;

export const Skeleton = (props: SkeletonProps) => <MuiSkeleton {...props} />;
