"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  mobileVariant = "centered",
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean
  /**
   * Layout variant at viewports below the `sm` breakpoint (640px).
   * - `"centered"` (default): existing centered-dialog behavior at all widths.
   * - `"bottom-sheet"`: anchored to the bottom edge of the viewport at `< sm`,
   *   full width, rounded only on top corners, slide-up animation, max-height
   *   `100dvh` so it respects mobile browser chrome. At `≥ sm` the centered
   *   classes apply unchanged.
   */
  mobileVariant?: "centered" | "bottom-sheet"
}) {
  // The bottom-sheet variant needs to swap most positioning classes (not
  // override them), because Tailwind v4 orders CSS by class name, not by
  // the order the classes appear in the className string. So a `max-sm:`
  // override of `-translate-x-1/2` would lose if the centered class is
  // emitted later in the stylesheet. Picking entirely different class
  // strings inside vs outside the `< sm` band sidesteps the cascade
  // entirely.
  const sharedClasses =
    "fixed z-50 grid w-full gap-4 bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0";
  const centeredClasses =
    "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[calc(100%-2rem)] sm:max-w-sm rounded-xl data-open:zoom-in-95 data-closed:zoom-out-95";
  // Below sm: anchor to the bottom edge; rounded only on top corners; no
  // translate; max-h-100dvh so mobile-browser chrome doesn't clip content.
  // At sm and above, the centered classes apply unchanged via `sm:` prefix.
  const bottomSheetMobileClasses =
    "max-sm:top-auto max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:!translate-x-0 max-sm:!translate-y-0 max-sm:max-w-none max-sm:max-h-[100dvh] max-sm:rounded-b-none max-sm:rounded-t-xl max-sm:data-open:slide-in-from-bottom max-sm:data-closed:slide-out-to-bottom sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-sm sm:rounded-xl sm:data-open:zoom-in-95 sm:data-closed:zoom-out-95";

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        data-mobile-variant={mobileVariant}
        className={cn(
          sharedClasses,
          mobileVariant === "bottom-sheet" ? bottomSheetMobileClasses : centeredClasses,
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-2 right-2"
                size="icon-sm"
              />
            }
          >
            <XIcon
            />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" />}>
          Close
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "font-heading text-base leading-none font-medium",
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
