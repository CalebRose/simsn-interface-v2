import { Timestamp } from "firebase/firestore";

export type AdminReportStatus =
  | "pending"
  | "acknowledged"
  | "resolved"
  | "dismissed";

export interface AdminReport {
  League: string;
  TeamID: number;
  ReportType: string;
  Message: string;
  ResponseType: number;
  Status: AdminReportStatus;
  CreatedAt: Timestamp;
  UpdatedAt: Timestamp | null;
  AdminResponse: string | null;
  ResolvedBy: string | null;
  ResolvedAt: Timestamp | null;
  Phase: number | null;
  WeekID: number | null;
  ReportedBy?: string;
}
