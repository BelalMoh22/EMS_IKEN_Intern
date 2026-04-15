/* eslint-disable @typescript-eslint/no-explicit-any */
import { UseFormReturn, FieldValues, Path } from "react-hook-form";
/*
| Type               | Meaning                                                     |
| ------------------ | ----------------------------------------------------------- |
| `UseFormReturn<T>` | Full form control object (methods like setError, getValues) |
| `FieldValues`      | Generic type for form data                                  |
| `Path<T>`          | Ensures field names are valid keys of form                  |

*/
import { AxiosError } from "axios"; // Handles HTTP Requests (Errors)
import { ApiResponse } from "@/types";

export function handleApiErrors<T extends FieldValues>(
  error: unknown,
  methods: UseFormReturn<T>,
): string | null {
  const axiosError = error as AxiosError<ApiResponse<any>>; // “This error comes from Axios and follows ApiResponse”
  const data = axiosError?.response?.data;

  // Normalize response keys (handle both camelCase and PascalCase)
  const errors = data?.errors || data?.Errors; // "Take errors if exists, otherwise take Errors"
  const initialMessage = data?.message || data?.Message || "Something went wrong";
  let finalMessage = initialMessage;

  // Handle field errors
  if (errors && typeof errors === "object") {
    const generalMessages: string[] = [];

    Object.entries(errors).forEach(([backendField, messages]) => {
      const errorMsg = Array.isArray(messages)
        ? messages.join(", ")
        : String(messages);

      if (backendField.toLowerCase() === "general") {
        // Route specific general messages to their matching form fields
        const generalToFieldMap: { pattern: RegExp; field: string }[] = [
          { pattern: /age/i, field: "dateOfBirth" },
        ];

        const msgs = Array.isArray(messages) ? messages : [String(messages)];
        for (const msg of msgs) {
          const match = generalToFieldMap.find((m) => m.pattern.test(String(msg)));
          if (match) {
            const formFields = Object.keys(methods.getValues());
            if (formFields.includes(match.field)) {
              methods.setError(match.field as Path<T>, {
                type: "server",
                message: String(msg),
              });
              continue;
            }
          }
          generalMessages.push(String(msg));
        }
        return;
      }

      // Custom mappings for fields that don't match exactly
      const manualMapping: Record<string, string> = {
        age: "dateOfBirth",
      };

      // Try to find the matching field name in the form (casing might differ)
      const formFields = Object.keys(methods.getValues());
      const matchedField =
        formFields.find(
          (f) => f.toLowerCase() === backendField.toLowerCase(),
        ) ||
        manualMapping[backendField.toLowerCase()] ||
        backendField;

      methods.setError(matchedField as Path<T>, {
        type: "server",
        message: errorMsg,
      });
    });

    // If we have general messages, append them to the final message
    if (generalMessages.length > 0) {
      finalMessage = generalMessages.join(" | ");
    } else {
      return null; // Return null if all errors were mapped to fields
    }

    // Auto-focus first error (UX Improvement)
    setTimeout(() => {
      const firstError = Object.keys(methods.formState.errors)[0];
      if (firstError) {
        const element = document.querySelector(
          `[name="${firstError}"]`,
        ) as HTMLElement;
        if (element) {
          element.focus();
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }, 100);
  }

  return finalMessage;
}

export function getGeneralErrors(error: unknown): string[] {
  const axiosError = error as AxiosError<ApiResponse<any>>;
  const data = axiosError?.response?.data;
  const errors = data?.errors || data?.Errors;
  return (errors as any)?.general || (errors as any)?.General || [];
}
export function extractErrorMessage(
  error: any,
  defaultMsg = "Something went wrong",
): string {
  const data = error?.response?.data;
  if (!data) return defaultMsg;

  const errors = data.errors || data.Errors;
  const message = data.message || data.Message;

  if (errors && typeof errors === "object") {
    // If there are many errors, take the first one
    const firstError = Object.values(errors).flat()[0];
    if (firstError) return String(firstError);
  }

  return message || defaultMsg;
}
export function extractAllErrorMessages(
  error: any,
  defaultMsg = "Something went wrong",
): string[] {
  const data = error?.response?.data;
  if (!data) return [defaultMsg];

  const errors = data.errors || data.Errors;
  const message = data.message || data.Message;

  if (errors && typeof errors === "object") {
    const allErrors = Object.values(errors).flat().map(String);
    if (allErrors.length > 0) return allErrors;
  }

  return message ? [message] : [defaultMsg];
}
