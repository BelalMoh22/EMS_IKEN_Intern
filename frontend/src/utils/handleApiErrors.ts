import { UseFormReturn, FieldValues, Path } from "react-hook-form";
import { AxiosError } from "axios";
import { ApiResponse } from "@/types";

export function handleApiErrors<T extends FieldValues>(
  error: unknown,
  methods: UseFormReturn<T>
) {
  const axiosError = error as AxiosError<ApiResponse<any>>;
  const data = axiosError?.response?.data;
  
  // Normalize response keys (handle both camelCase and PascalCase)
  const errors = data?.errors || data?.Errors;
  const initialMessage = data?.message || data?.Message || "Something went wrong";
  let finalMessage = initialMessage;

  // Handle field errors
  if (errors && typeof errors === "object") {
    const generalMessages: string[] = [];

    Object.entries(errors).forEach(([backendField, messages]) => {
      const errorMsg = Array.isArray(messages) ? messages.join(", ") : String(messages);

      if (backendField.toLowerCase() === "general") {
        generalMessages.push(errorMsg);
        return;
      }
      
      // Try to find the matching field name in the form (casing might differ)
      const formFields = Object.keys(methods.getValues());
      const matchedField = formFields.find(f => f.toLowerCase() === backendField.toLowerCase()) || backendField;

      methods.setError(matchedField as Path<T>, {
        type: "server",
        message: errorMsg,
      });
    });

    // If we have general messages, append them to the final message
    if (generalMessages.length > 0) {
      finalMessage = generalMessages.join(" | ");
    }

    // Auto-focus first error (UX Improvement)
    setTimeout(() => {
      const firstError = Object.keys(methods.formState.errors)[0];
      if (firstError) {
        const element = document.querySelector(`[name="${firstError}"]`) as HTMLElement;
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
export function extractErrorMessage(error: any, defaultMsg = "Something went wrong"): string {
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
