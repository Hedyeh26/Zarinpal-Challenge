import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "success" | "secondary" | "warning";
  size?: "default" | "sm" | "lg" | "icon" | "xl";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "default",
      size = "default",
      type = "button",
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      default: "bg-[#0A33FF] text-white hover:bg-[#0A33FF]/90 shadow-sm",
      secondary: "bg-[#F5F5F5] text-[#19191A] hover:bg-[#EEEEF1]",
      outline: "border border-[#DADBE1] bg-white hover:bg-[#F5F5F5] text-[#19191A]",
      ghost: "bg-transparent hover:bg-[#F5F5F5] text-[#19191A]",
      destructive: "bg-[#DC2626] text-white hover:bg-[#DC2626]/90 shadow-sm",
      success: "bg-[#16A34A] text-white hover:bg-[#16A34A]/90 shadow-sm",
      warning: "bg-[#FFD60A] text-[#19191A] hover:bg-[#FFD60A]/90 shadow-sm",
    };

    const sizeClasses = {
      default: "h-10 px-4 py-2",
      sm: "h-8 rounded-lg px-3 text-xs",
      lg: "h-12 rounded-xl px-6 text-base",
      xl: "h-14 rounded-xl px-8 text-lg",
      icon: "h-10 w-10 rounded-lg",
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A33FF] focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
