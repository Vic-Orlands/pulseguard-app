"use client";

import { HugeiconsIcon } from "@/components/phosphor-icons";
import { Cancel01Icon } from "@/components/phosphor-icons";
import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { useSheetScale } from "@/components/dashboard/shared/sheet-scale";

function Sheet({
  open,
  defaultOpen,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Root>) {
  const scale = useSheetScale();
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(
    defaultOpen ?? false,
  );
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : uncontrolledOpen;
  const prevOpen = React.useRef(false);

  React.useEffect(() => {
    if (!scale) return;
    if (isOpen && !prevOpen.current) scale.increment();
    if (!isOpen && prevOpen.current) scale.decrement();
    prevOpen.current = Boolean(isOpen);
    return () => {
      if (prevOpen.current) {
        scale.decrement();
        prevOpen.current = false;
      }
    };
  }, [isOpen, scale]);

  return (
    <SheetPrimitive.Root
      data-slot="sheet"
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(next) => {
        if (!isControlled) setUncontrolledOpen(next);
        onOpenChange?.(next);
      }}
      {...props}
    />
  );
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "data-[state=open]:animate-overlay-in data-[state=closed]:animate-overlay-out fixed inset-0 z-50 bg-black/55",
        className
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left";
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "bg-pg-modal text-pg-text motion-sheet fixed z-50 flex flex-col gap-4 shadow-[0_24px_80px_rgba(0,0,0,0.28)]",
          side === "right" && "inset-y-0 right-0 h-full w-[min(96vw,48rem)]",
          side === "left" && "inset-y-0 left-0 h-full w-3/4 sm:max-w-sm",
          side === "top" && "inset-x-0 top-0 h-auto",
          side === "bottom" && "inset-x-0 bottom-0 h-auto",
          className
        )}
        {...props}
        data-side={side}
      >
        {children}
        <SheetPrimitive.Close className="text-pg-muted absolute top-4 right-4 rounded-lg p-1 opacity-70 transition-opacity hover:bg-pg-group hover:text-pg-text hover:opacity-100 focus:outline-hidden disabled:pointer-events-none">
          <HugeiconsIcon icon={Cancel01Icon} className="size-4 pg-icon" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-pg-text font-semibold", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-pg-muted text-sm", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
