import {
  League,
  SimCBB,
  SimCHL,
  SimNBA,
  SimPHL,
} from "../_constants/constants";
import { bbaUrl, fbaUrl, hckUrl } from "../_constants/urls";
import { GetCall, GetSportAbbr, PostCall } from "../_helper/fetchHelper";
import {
  Request as CBBRequest,
  NBARequest,
  Team as CBBTeam,
  Request,
} from "../models/basketballModels";
import {
  CollegeTeam as CFBTeam,
  NFLRequest,
  TeamRequest as CFBTeamRequest,
} from "../models/footballModels";
import {
  CollegeTeamRequest,
  CollegeTeam as CHLTeam,
  ProTeamRequest,
  ProfessionalTeam,
} from "../models/hockeyModels";

// 🔥 Payload Interfaces
interface ApprovePayload {
  reqId: number;
  teamId: number;
  username: string;
}

interface CreateTeamRequest {
  teamId: number;
  username: string;
  isApproved: boolean;
}

interface RejectPayload {
  ID: number;
  ReqID: number;
  Username: string;
  IsApproved: boolean;
}

export interface RequestDTO {
  Username: string;
  TeamID: number;
  Role?: string;
  IsOwner?: boolean;
  IsManager?: boolean;
  IsCoach?: boolean;
  IsAssistant?: boolean;
  IsActive?: boolean;
  IsApproved: boolean;
  IsMarketing?: boolean;
  NFLTeamID?: number;
  NBATeamID?: number;
}

export const RequestService = {
  GetLeagueRequests: async (league: League): Promise<any> => {
    let baseUrl = fbaUrl;
    if (league === SimCBB || league === SimNBA) baseUrl = bbaUrl;
    if (league === SimCHL || league === SimPHL) baseUrl = hckUrl;
    const sportAbbr = GetSportAbbr(league);
    return await GetCall(`${baseUrl}admin/requests/${sportAbbr}`);
  },

  // ✅ College Football (CFB)
  GetCFBRequests: async (): Promise<CFBTeamRequest[]> => {
    return await GetCall(`${fbaUrl}requests/all`);
  },

  GetNFLRequests: async (): Promise<NFLRequest[]> => {
    return await GetCall(`${fbaUrl}nfl/requests/all/`);
  },

  ApproveCFBRequest: async (payload: CFBTeamRequest): Promise<Response> => {
    return await fetch(`${fbaUrl}requests/approve/`, {
      headers: {
        authorization: localStorage.getItem("token") || "",
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify({
        ID: payload.ID,
        TeamID: payload.TeamID,
        Username: payload.Username,
        IsApproved: true,
      }),
    });
  },

  ApproveNFLRequest: async (payload: any): Promise<NFLRequest> => {
    return await PostCall(`${fbaUrl}nfl/requests/approve/`, payload);
  },

  AssignCFBTeam: async (
    payload: CreateTeamRequest,
  ): Promise<CFBTeamRequest> => {
    return await PostCall(`${fbaUrl}teams/assign/${payload.teamId}`, {
      TeamID: payload.teamId,
      Username: payload.username,
      IsApproved: true,
    });
  },

  CreateCFBTeamRequest: async (
    team: CFBTeam,
    username: string,
  ): Promise<void> => {
    await PostCall(`${fbaUrl}requests/create/`, {
      TeamID: team.ID,
      Username: username,
      IsApproved: false,
    });
  },

  CreateCHLTeamRequest: async (
    team: CHLTeam,
    username: string,
  ): Promise<CollegeTeamRequest> => {
    return await PostCall(`${hckUrl}chl/requests/create`, {
      TeamID: team.ID,
      Username: username,
      IsApproved: false,
      IsActive: true,
    });
  },

  CreatePHLTeamRequest: async (
    payload: CreateTeamRequest,
  ): Promise<ProTeamRequest> => {
    return await PostCall(`${hckUrl}phl/requests/create`, payload);
  },

  CreateNFLTeamRequest: async (
    payload: CreateTeamRequest,
  ): Promise<NFLRequest> => {
    return await PostCall(`${fbaUrl}nfl/requests/create/`, payload);
  },

  RejectCFBRequest: async (payload: any): Promise<void> => {
    await fetch(`${fbaUrl}requests/reject/`, {
      headers: {
        authorization: localStorage.getItem("token") || "",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  RejectNFLRequest: async (payload: any): Promise<void> => {
    await fetch(`${fbaUrl}nfl/requests/reject/`, {
      headers: {
        authorization: localStorage.getItem("token") || "",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  RemoveUserFromNFLTeamRequest: async (teamID: number): Promise<Response> => {
    return await fetch(`${fbaUrl}nfl/requests/remove/${teamID}`, {
      headers: {
        authorization: localStorage.getItem("token") || "",
        "Content-Type": "application/json",
      },
      method: "POST",
    });
  },

  // ✅ Basketball (CBB & NBA)
  GetCBBTeamRequests: async (): Promise<CBBRequest[]> => {
    return await GetCall(`${bbaUrl}requests/`);
  },

  GetNBATeamRequests: async (): Promise<NBARequest[]> => {
    return await GetCall(`${bbaUrl}nba/requests/all/`);
  },

  CreateCBBTeamRequest: async (
    team: CBBTeam,
    username: string,
  ): Promise<CBBRequest> => {
    return await PostCall(`${bbaUrl}requests/createTeamRequest`, {
      TeamID: team.ID,
      Username: username,
      IsApproved: false,
    });
  },

  ApproveCBBRequest: async (payload: Request): Promise<Response> => {
    return await fetch(`${bbaUrl}requests/approveTeamRequest`, {
      headers: {
        authorization: localStorage.getItem("token") || "",
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  RejectCBBTeamRequest: async (payload: Request): Promise<Response> => {
    return await fetch(`${bbaUrl}requests/rejectTeamRequest`, {
      headers: {
        authorization: localStorage.getItem("token") || "",
        "Content-Type": "application/json",
      },
      method: "DELETE",
      body: JSON.stringify(payload),
    });
  },

  RevokeUserFromCBBTeamRequest: async (teamId: number): Promise<Response> => {
    return await fetch(`${bbaUrl}team/removeUserFromTeam/${teamId}`, {
      headers: {
        authorization: localStorage.getItem("token") || "",
        "Content-Type": "application/json",
      },
      method: "PUT",
    });
  },

  CreateNBATeamRequest: async (
    payload: CreateTeamRequest,
  ): Promise<NBARequest> => {
    return await PostCall(`${bbaUrl}nba/requests/create/`, payload);
  },

  ApproveNBARequest: async (payload: NBARequest): Promise<NBARequest> => {
    return await PostCall(`${bbaUrl}nba/requests/approve/`, payload);
  },

  RejectNBARequest: async (payload: NBARequest): Promise<NBARequest> => {
    return await PostCall(`${bbaUrl}nba/requests/reject/`, payload);
  },

  RevokeNBARequest: async (payload: RejectPayload): Promise<NBARequest> => {
    return await PostCall(`${bbaUrl}nba/requests/revoke/`, payload);
  },
  ApproveCHLRequest: async (
    payload: CollegeTeamRequest,
  ): Promise<CollegeTeamRequest> => {
    return await PostCall(`${hckUrl}chl/requests/approve`, payload);
  },

  RejectCHLRequest: async (
    payload: CollegeTeamRequest,
  ): Promise<CollegeTeamRequest> => {
    return await PostCall(`${hckUrl}chl/requests/reject`, payload);
  },
  ApprovePHLRequest: async (
    payload: ProTeamRequest,
  ): Promise<ProTeamRequest> => {
    return await PostCall(`${hckUrl}phl/requests/approve`, payload);
  },

  RejectPHLRequest: async (
    payload: ProTeamRequest,
  ): Promise<ProTeamRequest> => {
    return await PostCall(`${hckUrl}phl/requests/reject`, payload);
  },
};
