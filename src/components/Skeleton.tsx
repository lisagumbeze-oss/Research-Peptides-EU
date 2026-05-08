import React from 'react';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-md ${className}`}></div>
  );
}

export function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <Skeleton className="h-64 w-full rounded-none" />
      <div className="p-6 space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex justify-between items-center pt-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function DetailedProductSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 animate-pulse">
      <div className="space-y-4">
        <Skeleton className="aspect-square w-full rounded-3xl" />
        <div className="flex gap-4">
          <Skeleton className="h-20 w-20 rounded-xl" />
          <Skeleton className="h-20 w-20 rounded-xl" />
          <Skeleton className="h-20 w-20 rounded-xl" />
        </div>
      </div>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <Skeleton className="h-10 w-3/4" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-12 w-1/3" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="flex space-x-4">
          <Skeleton className="h-14 w-32 rounded-xl" />
          <Skeleton className="h-14 flex-1 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function CartPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Skeleton className="h-10 w-56 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <Skeleton className="h-24 w-24 rounded-lg" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-8 w-36 rounded-lg" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <Skeleton className="h-7 w-40 mb-6" />
          <div className="space-y-4 mb-8">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export function CheckoutSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Skeleton className="h-10 w-64 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 sm:p-10 rounded-[2rem] shadow-sm border border-gray-100 min-h-[500px]">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-2xl md:col-span-1" />
            ))}
            <Skeleton className="h-14 w-full rounded-2xl md:col-span-2" />
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 h-fit">
          <Skeleton className="h-5 w-32 mb-6" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
