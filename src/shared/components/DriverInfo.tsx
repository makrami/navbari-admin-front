import {Star} from "lucide-react";
import {cn} from "../utils/cn";
import {getFileUrl} from "../../pages/LocalCompanies/utils";

type DriverInfoProps = {
  driverAvatarUrl?: string | null;
  driverName?: string | null;
  driverRating?: number | null;
  showRating?: boolean;
  avatarSize?: "sm" | "md" | "lg";
  nameClassName?: string;
  className?: string;
  showRatingBeforeName?: boolean; // For segments: show rating before name
  selected?: boolean; // For styling when selected (e.g., in EntityCard)
};

const avatarSizes = {
  sm: "size-4",
  md: "size-5",
  lg: "size-7",
};

// Format rating to remove trailing zeros (e.g., 4.0 -> 4, 4.5 -> 4.5)
function formatRating(rating: number): string {
  // Remove trailing zeros by converting to string and parsing back
  return parseFloat(rating.toString()).toString();
}

export function DriverInfo({
  driverAvatarUrl,
  driverName,
  driverRating,
  showRating = true,
  avatarSize = "md",
  nameClassName,
  className,
  showRatingBeforeName = false,
  selected = false,
}: DriverInfoProps) {
  if (!driverName) return null;

  const sizeClass = avatarSizes[avatarSize];
  const hasRating =
    showRating &&
    driverRating !== null &&
    driverRating !== undefined &&
    driverRating > 0;
  const formattedRating = hasRating ? formatRating(driverRating) : "";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {driverAvatarUrl ? (
        <img
          src={getFileUrl(driverAvatarUrl)}
          alt={driverName}
          className={cn("rounded-full object-cover", sizeClass)}
        />
      ) : null}

      <div className="flex items-center gap-1">
        {showRatingBeforeName && hasRating && (
          <>
            <span
              className={cn(
                "text-xs font-bold",
                selected ? "text-white" : "text-blue-600"
              )}
            >
              {formattedRating}
            </span>
            <Star
              className={cn(
                "size-4",
                selected
                  ? "fill-white text-white"
                  : "fill-yellow-400 text-yellow-400"
              )}
            />
          </>
        )}
        <span className={cn("text-slate-900", nameClassName)}>
          {driverName}
        </span>
        {!showRatingBeforeName && hasRating && (
          <>
            <span
              className={cn(
                "text-xs font-bold",
                selected ? "text-white" : "text-blue-600"
              )}
            >
              {formattedRating}
            </span>
            <Star
              className={cn(
                "size-4",
                selected
                  ? "fill-white text-white"
                  : "fill-yellow-400 text-yellow-400"
              )}
            />
          </>
        )}
      </div>
    </div>
  );
}
