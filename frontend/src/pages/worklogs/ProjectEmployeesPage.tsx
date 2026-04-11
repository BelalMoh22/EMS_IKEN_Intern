import { useNavigate, useParams } from "react-router-dom";
import { useProjectEmployees } from "@/hooks/useWorkLogs";
import { ProjectLeaderboard } from "./leaderboard/ProjectLeaderboard";

export default function ProjectEmployeesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const pid = Number(projectId);
  const { data, isLoading } = useProjectEmployees(pid);

  // Map backend response if needed (ensure structure { employeeId, employeeName, totalHours })
  const employees = data ?? [];

  return (
    <ProjectLeaderboard 
      employees={employees} 
      isLoading={isLoading} 
      projectId={pid} 
    />
  );
}
