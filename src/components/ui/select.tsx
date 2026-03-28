import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@/lib/utils";

type SelectProps = SelectPrimitive.SelectProps & {
  enableModal?: boolean;
};

// Select component
const SelectRoot = SelectPrimitive.Root as unknown as React.FC<
  SelectPrimitive.SelectProps & { modal?: boolean }
>;

// Select component with optional modal behavior
const Select = ({ enableModal = true, onOpenChange, ...props }: SelectProps) => {
  const observerRef = React.useRef<MutationObserver | null>(null);

  const restoreBodyScroll = React.useCallback(() => {
    if (enableModal) return;

    const body = document.body;
    if (!body) return;

    body.style.overflow = "";
    body.style.removeProperty("padding-right");
    body.removeAttribute("data-scroll-lock");
    body.removeAttribute("data-scroll-lock-shown");
    body.classList.remove("react-remove-scroll-lock");
  }, [enableModal]);

  const teardownObserver = React.useCallback(() => {
    observerRef.current?.disconnect();
    observerRef.current = null;
  }, []);

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (!enableModal) {
        if (open) {
          restoreBodyScroll();

          if (!observerRef.current) {
            const body = document.body;
            if (body) {
              observerRef.current = new MutationObserver(() => {
                restoreBodyScroll();
              });
              observerRef.current.observe(body, {
                attributes: true,
                attributeFilter: ["style", "class", "data-scroll-lock", "data-scroll-lock-shown"],
              });
            }
          }
        } else {
          teardownObserver();
          restoreBodyScroll();
        }
      }

      onOpenChange?.(open);
    },
    [enableModal, onOpenChange, restoreBodyScroll, teardownObserver],
  );

  React.useEffect(
    () => () => {
      if (!enableModal) {
        teardownObserver();
        restoreBodyScroll();
      }
    },
    [enableModal, restoreBodyScroll, teardownObserver],
  );

  return <SelectRoot modal={enableModal} onOpenChange={handleOpenChange} {...props} />;
};

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;
const SelectIcon = SelectPrimitive.Icon;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex min-h-12 w-full items-center justify-between gap-2 rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground",
      className,
    )}
    {...props}
  >
    <span className="flex-1 min-w-0 truncate text-left leading-5">
      {children}
    </span>
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="mt-1 size-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className,
    )}
    {...props}
  >
    <ChevronUp className="size-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className,
    )}
    {...props}
  >
    <ChevronDown className="size-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
      "relative z-50 max-h-96 min-w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className,
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
          <SelectPrimitive.Viewport
            className={cn(
              "max-h-72 overflow-y-auto p-1",
              position === "popper" &&
                "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)]",
            )}
          >
            {children}
          </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-start gap-2 border-t border-slate-200 bg-white/95 py-2 pl-3 pr-9 text-sm leading-5 text-left transition first:rounded-t-md first:border-t-0 last:rounded-b-md focus:outline-none focus:bg-blue-50 focus:text-blue-900 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-900 data-[highlighted]:outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute right-2 flex size-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="size-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText className="whitespace-normal break-words">
      {children}
    </SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectIcon,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
