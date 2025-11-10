import type { StepConfig } from "../config/progressSteps";

export type StepState = "completed" | "active" | "upcoming";

export function getStepState(
  index: number,
  activeIndex: number
): StepState {
  if (index < activeIndex) return "completed";
  if (index === activeIndex) return "active";
  return "upcoming";
}

export function getChevronColor(
  index: number,
  activeIndex: number,
  steps: StepConfig[]
): string {
  // Get the state of the step this chevron leads INTO (next step)
  const nextIndex = index + 1;
  if (nextIndex >= steps.length) return "text-slate-300";
  
  const nextStepState = getStepState(nextIndex, activeIndex);

  // Chevron leading into completed step → green
  if (nextStepState === "completed") return "text-green-600";

  // Chevron leading into active step → matches active step's chevron color
  if (nextStepState === "active") {
    return steps[activeIndex].chevronColor;
  }

  // Chevron leading into upcoming step → slate/gray
  return "text-slate-300";
}

