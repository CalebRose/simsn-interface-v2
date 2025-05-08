import { fbaUrl, hckUrl } from "../_constants/urls.js";
import { GetCall, PostCall } from "../_helper/fetchHelper.js";
import { GameResultsResponse as FootballGameResults } from "../models/footballModels.js";
import { GameResultsResponse as HockeyGameResults } from "../models/hockeyModels.js";

export default class FBAScheduleService {
  async GetCollegeGamesByTeamAndSeason(
    TeamID: number,
    SeasonID: number
  ): Promise<any> {
    return await GetCall(`${fbaUrl}games/college/team/${TeamID}/${SeasonID}/`);
  }

  async GetNFLGamesByTeamAndSeason(
    TeamID: number,
    SeasonID: number
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
