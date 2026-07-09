import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/helpers/classNames";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-brand-600 text-white shadow-sm hover:bg-brand-700",
  secondary:
    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-slate-100",
  danger: "bg-rose-600 text-white hover:bg-rose-700",
};

export const Button = ({
  children,
  className,
  disabled,
  leftIcon,
  loading,
  rightIcon,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) => (
  <button
    className={cn(
      "inline-flex min-h-10 max-w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-center text-sm font-semibold leading-5 transition focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
      variantStyles[variant],
      className,
    )}
    disabled={disabled || loading}
    type={type}
    {...props}
  >
    {(loading || leftIcon) && (
      <span className="shrink-0">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : leftIcon}
      </span>
    )}
    <span className="min-w-0 whitespace-normal break-words">{children}</span>
    {rightIcon && <span className="shrink-0">{rightIcon}</span>}
  </button>
);
