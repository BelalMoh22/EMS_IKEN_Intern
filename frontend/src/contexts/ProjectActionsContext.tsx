import { createContext, useContext } from "react";
import type { Project } from "@/types/project";

// ─── Shape ───────────────────────────────────────────────
export interface ProjectActions {
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onReopen: (project: Project) => void;
  onClose: (project: Project) => void;
  onCardClick: (project: Project) => void;
}

// ─── Context ─────────────────────────────────────────────
const ProjectActionsContext = createContext<ProjectActions | null>(null);

// ─── Provider (re-export for convenience) ────────────────
export const ProjectActionsProvider = ProjectActionsContext.Provider;

// ─── Consumer hook ───────────────────────────────────────
export function useProjectActions(): ProjectActions {
  const ctx = useContext(ProjectActionsContext);
  if (!ctx) {
    throw new Error(
      "useProjectActions must be used within a <ProjectActionsProvider>"
    );
  }
  return ctx;
}
