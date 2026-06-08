"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-stone-900/40" />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 rounded-2xl border border-stone-200 bg-white p-6 shadow-xl",
          "top-[max(1rem,env(safe-area-inset-top))] max-h-[min(90dvh,calc(100%-2rem))] translate-y-0 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]",
          "pb-[max(1.5rem,env(safe-area-inset-bottom))]",
          "sm:top-1/2 sm:max-h-[min(90dvh,calc(100%-4rem))] sm:-translate-y-1/2",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-md p-1 text-stone-500 hover:bg-stone-100">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-4 space-y-1.5", className)} {...props} />
  );
}

export function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("text-lg font-semibold text-stone-900", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-sm text-stone-500", className)}
      {...props}
    />
  );
}
