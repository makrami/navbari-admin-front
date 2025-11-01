import { useNavigate } from "react-router-dom";
import type { MouseEventHandler, PropsWithChildren } from "react";
import { cn } from "../../shared/utils/cn";

type SegmentButtonProps = PropsWithChildren<{
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}>;

export function SegmentButton({ className, onClick }: SegmentButtonProps) {
  const navigate = useNavigate();

  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    if (onClick) {
      onClick(e);
    } else {
      navigate("/segments");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "flex items-center justify-center rounded-2xl bg-white p-4",
        "text-slate-900 transition-transform duration-150 ease-in-out",
        "border border-slate-300",
        "hover:scale-101 active:scale-99",
        className
      )}
      aria-label="Segment"
      data-name="Segment Button"
    >
      <span className="text-sm font-bold">Segments</span>
    </button>
  );
}
