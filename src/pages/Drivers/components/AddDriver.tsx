import { Plus } from "lucide-react";
import type { MouseEventHandler, PropsWithChildren } from "react";
import { cn } from "../../../shared/utils/cn";

type AddDriverProps = PropsWithChildren<{
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}>;

export function AddDriver({ className, onClick }: AddDriverProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full bg-blue-600/10 rounded-2xl p-3 h-12",

        className
      )}
      aria-label="Add Driver"
      data-name="Add Driver"
    >
      <div className="flex justify-center items-center font-bold text-sm text-blue-600">
        Add Driver
        <Plus />
      </div>
    </button>
  );
}
