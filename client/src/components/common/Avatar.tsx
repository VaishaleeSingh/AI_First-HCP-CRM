import { cn } from "../../utils/helpers/classNames";

interface AvatarProps {
  name: string;
  className?: string;
}

export const Avatar = ({ className, name }: AvatarProps) => {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  return (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700",
        className,
      )}
      title={name}
    >
      {initials}
    </div>
  );
};
