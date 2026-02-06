import { bbaUrl, fbaUrl, hckUrl } from "../_constants/urls.js";
import { GetCall, GetExportCall, PostCall } from "../_helper/fetchHelper.js";
import { MatchResultsResponse } from "../models/basketballModels.js";
import { GameResultsResponse as FootballGameResults } from "../models/footballModels.js";
import { GameResultsResponse as HockeyGameResults } from "../models/hockeyModels.js";

export default class FBAScheduleService {
  async GetCollegeGamesByTeamAndSeason(
    TeamID: number,
    SeasonID: number,
  ): Promise<any> {
    return await GetCall(`${fbaUrl}games/college/team/${TeamID}/${SeasonID}/`);
  }

  async GetNFLGamesByTeamAndSeason(
    TeamID: number,
    SeasonID: number,
  ): Promise<any> {
    return await GetCall(`${fbaUrl}games/nfl/team/${TeamID}/${SeasonID}/`);
  }

  async GetAllCollegeGamesInASeason(SeasonID: number): Promise<any> {
    return await GetCall(`${fbaUrl}games/college/season/${SeasonID}/`);
  }

  async GetAllNFLGamesInASeason(SeasonID: number): Promise<any> {
    return await GetCall(`${fbaUrl}games/nfl/season/${SeasonID}/`);
  }

  async UpdateTimeslot(dto: any): Promise<void> {
    await PostCall(`${fbaUrl}games/update/time/`, dto);
  }

  async GetCFBGameResultData(id: number): Promise<FootballGameResults> {
    return await GetCall(`${fbaUrl}games/result/cfb/${id}/`);
  }

  async GetNFLGameResultData(id: number): Promise<FootballGameResults> {
    return await GetCall(`${fbaUrl}games/result/nfl/${id}/`);
  }

  async GetCHLGameResultData(id: number): Promise<HockeyGameResults> {
    return await GetCall(`${hckUrl}games/result/chl/${id}/`);
  }

  async GetPHLGameResultData(id: number): Promise<HockeyGameResults> {
    return await GetCall(`${hckUrl}games/result/phl/${id}/`);
  }

  async FBATimeslotExport(dto: any): Promise<void> {
    await GetExportCall(
      `${fbaUrl}games/export/results/${dto.SeasonID}/${dto.WeekID}/${dto.WeekID}/${dto.Timeslot}/`,
      "blob",
    );
  }

  async BBATimeslotExport(dto: any): Promise<void> {
    await GetExportCall(
      `${bbaUrl}match/export/results/${dto.SeasonID}/${dto.WeekID}/${dto.WeekID}/${dto.Timeslot}/`,
      "blob",
    );
  }

  async HCKTimeslotExport(dto: any): Promise<void> {
    await GetExportCall(
      `${hckUrl}games/export/results/${dto.SeasonID}/${dto.WeekID}/${dto.Timeslot}/`,
      "blob",
    );
  }

  async HCKExportCHLPlayByPlay(dto: any): Promise<void> {
    await GetExportCall(
      `${hckUrl}games/result/export/chl/${dto.GameID}/`,
      "blob",
      `${dto.GameID}_${dto.Home}_vs_${dto.Away}_play_by_play`,
    );
  }

  async HCKExportPHLPlayByPlay(dto: any): Promise<void> {
    await GetExportCall(
      `${hckUrl}games/result/export/phl/${dto.GameID}/`,
      "blob",
      `${dto.GameID}_${dto.Home}_vs_${dto.Away}_play_by_play`,
    );
  }

  async GetCBBGameResultData(id: number): Promise<MatchResultsResponse> {
    return await GetCall(`${bbaUrl}match/result/cbb/${id}/`);
  }

  async GetNBAGameResultData(id: number): Promise<MatchResultsResponse> {
    return await GetCall(`${bbaUrl}match/result/nba/${id}/`);
  }

  async FBAExportCFBPlayByPlay(dto: any): Promise<void> {
    console.log({ dto });
    await GetExportCall(
      `${fbaUrl}statistics/cfb/export/play/by/play/${dto.GameID}/`,
      "blob",
      `${dto.GameID}_${dto.Home}_vs_${dto.Away}_play_by_play`,
    );
  }

  async FBAExportNFLPlayByPlay(dto: any): Promise<void> {
    await GetExportCall(
      `${fbaUrl}statistics/nfl/export/play/by/play/${dto.GameID}/`,
      "blob",
      `${dto.GameID}_${dto.Home}_vs_${dto.Away}_play_by_play`,
    );
  }

  // async ExportPlayByPlay(isNFL, id, ht, at) {
  //     const prefix = isNFL ? 'nfl' : 'cfb';
  //     let fullURL = `${url}statistics/${prefix}/export/play/by/play/${id}`;
  //     let response = await fetch(fullURL, {
  //         headers: {
  //             authorization: 'Bearer ' + localStorage.getItem('token'),
  //             'Content-Type': 'text/csv'
  //         },
  //         responseType: 'blob'
  //     })
  //         .then((res) => res.blob())
  //         .then((blob) =>
  //             saveAs(blob, `${id}_${ht}_vs_${at}_play_by_play.csv`)
  //         );

  //     if (response.ok) {
  //         // let blob = response.blob();
  //         // saveAs(blob, 'export.csv');
  //     } else {
  //         alert('HTTP-Error:', response.status);
  //     }
  // }

  // async ExportResults(seasonID, weekID, nflWeekID, timeslot, selectedWeek) {
  //     const fullURL = `${url}games/export/results/${seasonID}/${weekID}/${nflWeekID}/${timeslot}`;
  //     const response = await fetch(fullURL, {
  //         headers: {
  //             authorization: 'Bearer ' + localStorage.getItem('token'),
  //             'Content-Type': 'text/csv'
  //         },
  //         responseType: 'blob'
  //     })
  //         .then((res) => res.blob())
  //         .then((blob) =>
  //             saveAs(
  //                 blob,
  //                 `wahoos_secret_${selectedWeek}${timeslot}_results_list.csv`
  //             )
  //         );

  //     if (response.ok) {
  //         // let blob = response.blob();
  //         // saveAs(blob, 'export.csv');
  //     } else {
  //         alert('HTTP-Error:', response.status);
  //     }
  // }
}
