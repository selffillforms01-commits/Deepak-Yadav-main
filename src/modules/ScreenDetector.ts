export interface DetectedField {
  id: string;
  name?: string;
  label?: string;
  type?: string;
  required?: boolean;
  focused?: boolean;
}

export interface ScreenInfo {
  path: string;
  name: string;
  title: string;
  fields: DetectedField[];
  focusedFieldId?: string;
}

function getFieldLabel(element: HTMLElement): string | undefined {
  const id = element.getAttribute("id");

  if (id) {
    const label = document.querySelector(
      `label[for="${CSS.escape(id)}"]`
    );

    if (label?.textContent?.trim()) {
      return label.textContent.trim();
    }
  }

  const parentLabel = element.closest("label");

  if (parentLabel?.textContent?.trim()) {
    return parentLabel.textContent.trim();
  }

  return (
    element.getAttribute("aria-label") ||
    element.getAttribute("placeholder") ||
    element.getAttribute("name") ||
    undefined
  );
}

function detectFields(): DetectedField[] {
  if (typeof document === "undefined") return [];

  const elements = Array.from(
    document.querySelectorAll<HTMLElement>(
      "input, textarea, select, [contenteditable='true']"
    )
  );

  return elements
    .filter((element) => {
      const style = window.getComputedStyle(element);
      return (
        style.display !== "none" &&
        style.visibility !== "hidden"
      );
    })
    .map((element, index) => {
      const id =
        element.getAttribute("id") ||
        element.getAttribute("name") ||
        `field-${index + 1}`;

      return {
        id,
        name: element.getAttribute("name") || undefined,
        label: getFieldLabel(element),
        type:
          element.getAttribute("type") ||
          element.tagName.toLowerCase(),
        required:
          element.hasAttribute("required") ||
          element.getAttribute("aria-required") === "true",
        focused: document.activeElement === element,
      };
    });
}

export function detectScreen(): ScreenInfo {
  if (typeof window === "undefined") {
    return {
      path: "",
      name: "Unknown",
      title: "",
      fields: [],
    };
  }

  const path = window.location.pathname;

  const name =
    path === "/"
      ? "Home"
      : path
          .replace(/^\/+|\/+$/g, "")
          .split("/")
          .filter(Boolean)
          .pop()
          ?.replace(/[-_]/g, " ") || "Home";

  const fields = detectFields();

  const focusedField = fields.find((field) => field.focused);

  return {
    path,
    name,
    title: document.title || name,
    fields,
    focusedFieldId: focusedField?.id,
  };
}

export function scanFormFields(): DetectedField[] {
  return detectFields();
}

export function getFocusedField(): DetectedField | null {
  if (typeof document === "undefined") return null;

  const active = document.activeElement;

  if (!(active instanceof HTMLElement)) return null;

  const fields = detectFields();

  return (
    fields.find((field) => field.focused) || null
  );
}

export const ScreenDetector = {
  detectScreen,
  scanFormFields,
  getFocusedField,
};
