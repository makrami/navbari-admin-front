import {useState, useEffect} from "react";
import {Star} from "lucide-react";
import {cn} from "../../../../shared/utils/cn";
import {useTranslation} from "react-i18next";
import {getFileUrl} from "../../../LocalCompanies/utils";

type StarRatingProps = {
  segmentId: string;
  currentRating?: number | null;
  onSubmit: (rating: number) => Promise<void>;
  driverAvatarUrl?: string;
  driverName?: string;
  className?: string;
};

export function StarRating({
  currentRating,
  onSubmit,
  driverAvatarUrl,
  driverName,
  className,
}: StarRatingProps) {
  const {t} = useTranslation();
  const [selectedRating, setSelectedRating] = useState<number>(
    currentRating ?? 0
  );
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(!!currentRating);

  // Sync state when currentRating prop changes (after refetch)
  useEffect(() => {
    if (currentRating !== null && currentRating !== undefined) {
      setSelectedRating(currentRating);
      setIsSubmitted(true);
    } else {
      setSelectedRating(0);
      setIsSubmitted(false);
    }
  }, [currentRating]);

  const handleStarClick = (rating: number) => {
    if (!isSubmitted) {
      setSelectedRating(rating);
    }
  };

  const handleStarHover = (rating: number) => {
    if (!isSubmitted) {
      setHoveredRating(rating);
    }
  };

  const handleStarLeave = () => {
    if (!isSubmitted) {
      setHoveredRating(0);
    }
  };

  const handleSubmit = async () => {
    if (selectedRating === 0 || isSubmitted || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(selectedRating);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Failed to submit rating:", error);
      // Reset on error so user can try again
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = hoveredRating || selectedRating;

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-3 px-4 py-2 bg-blue-50 rounded-lg border border-purple-300 border-dashed",
        className
      )}
    >
      <span className="text-sm font-medium text-slate-700">
        {t("segments.rating.yourRate") || "Your Rate"}
      </span>

      {!isSubmitted ? (
        <>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= displayRating;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleStarHover(star)}
                  onMouseLeave={handleStarLeave}
                  disabled={isSubmitting}
                  className={cn(
                    "transition-colors disabled:cursor-not-allowed",
                    "cursor-pointer hover:scale-110"
                  )}
                  aria-label={`${star} ${star === 1 ? "star" : "stars"}`}
                >
                  <Star
                    className={cn(
                      "size-5 transition-colors",
                      isFilled
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-none text-yellow-400 stroke-2"
                    )}
                  />
                </button>
              );
            })}
          </div>

          {selectedRating > 0 && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5",
                "bg-blue-100 text-blue-700 hover:bg-blue-200",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {t("segments.rating.submit") || "Submit"}{" "}
              <span className="flex items-center gap-0.5 font-bold">
                {selectedRating}
                <Star className="size-3 fill-yellow-400 text-yellow-400" />
              </span>
            </button>
          )}
        </>
      ) : (
        <div className="flex items-center gap-2">
          {driverAvatarUrl && (
            <img
              src={getFileUrl(driverAvatarUrl)}
              alt={driverName || "Driver"}
              className="size-6 rounded-full object-cover"
            />
          )}
          {driverName && (
            <span className="text-sm font-bold text-slate-900">
              {driverName}
            </span>
          )}
          <span className="text-sm font-bold text-blue-600">
            {parseFloat(selectedRating.toString()).toString()}
          </span>
          <Star className="size-4 fill-yellow-400 text-yellow-400" />
        </div>
      )}
    </div>
  );
}
