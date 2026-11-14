import { addDoc, collection, serverTimestamp, WithFieldValue } from "firebase/firestore";
import { League } from "../_constants/constants";
import { firestore } from "../firebase/firebase";
import { AdminReport } from "../models/adminReportModels";

export interface ResignationReportInput {
  league: League;
  teamID: number;
  userID: string;
  username: string;
  phase: number | null;
  weekID: number | null;
}

export const createResignationReport = async ({
  league,
  teamID,
  userID,
  username,
  phase,
  weekID,
}: ResignationReportInput): Promise<void> => {
  const report: WithFieldValue<AdminReport> = {
    League: league,
    TeamID: teamID,
    ReportType: "team_resignation",
    Message: `${username} resigned from their team.`,
    ResponseType: 0,
    Status: "pending",
    CreatedAt: serverTimestamp(),
    UpdatedAt: null,
    AdminResponse: null,
    ResolvedBy: null,
    ResolvedAt: null,
    Phase: phase,
    WeekID: weekID,
    ReportedBy: userID,
  };
  await addDoc(collection(firestore, "adminReports"), report);
};
