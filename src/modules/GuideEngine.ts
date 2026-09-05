export interface GuideStep {
  id: string;
  title: string;
  description?: string;
  fieldIds?: string[];
}

export interface GuideState {
  currentStep: GuideStep | null;
  nextStep: GuideStep | null;
  currentFieldId?: string;
  progress: number;
}

export function getCurrentGuideStep(
  steps: GuideStep[],
  currentIndex: number
): GuideStep | null {
  return steps[currentIndex] || null;
}

export function getNextGuideStep(
  steps: GuideStep[],
  currentIndex: number
): GuideStep | null {
  return steps[currentIndex + 1] || null;
}

export function getProgress(
  steps: GuideStep[],
  currentIndex: number
): number {
  if (!steps.length) return 0;

  const safeIndex = Math.max(
    0,
    Math.min(currentIndex, steps.length - 1)
  );

  return Math.round(((safeIndex + 1) / steps.length) * 100);
}

export function getCurrentFieldId(
  step: GuideStep | null,
  fields: Array<{ id: string; value?: unknown }>
): string | undefined {
  if (!step?.fieldIds?.length) return undefined;

  return step.fieldIds.find((fieldId) =>
    fields.some(
      (field) =>
        field.id === fieldId &&
        (field.value === undefined ||
          field.value === null ||
          String(field.value).trim() === "")
    )
  );
}

export function buildGuideState(
  steps: GuideStep[],
  currentIndex: number,
  fields: Array<{ id: string; value?: unknown }>
): GuideState {
  const currentStep = getCurrentGuideStep(steps, currentIndex);

  return {
    currentStep,
    nextStep: getNextGuideStep(steps, currentIndex),
    currentFieldId: getCurrentFieldId(currentStep, fields),
    progress: getProgress(steps, currentIndex),
  };
}

export function focusField(fieldId: string): boolean {
  if (typeof document === "undefined") return false;

  const element = document.getElementById(fieldId);

  if (!(element instanceof HTMLElement)) return false;

  element.focus();
  element.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  return true;
}

export const GuideEngine = {
  getCurrentGuideStep,
  getNextGuideStep,
  getProgress,
  getCurrentFieldId,
  buildGuideState,
  focusField,
};
