import {
  League,
  SimCBB,
  SimCFB,
  SimCHL,
  SimCollegeBaseball,
  SimNBA,
  SimNFL,
  SimPHL,
  SimMLB,
} from "../_constants/constants";
import {
  BaseballLogos,
  CBLLogos,
  HCKLogos,
  ISLLogos,
  logos,
  retro_logos,
} from "../_constants/logos";

export const getLogo = (
  league: League,
  id: number,
  isRetro: boolean | undefined,
) => {
  const retro = isRetro || false;
  if (league === SimCFB) return getCFBLogo(id, retro);
  if (league === SimNFL) return getNFLLogo(id, retro);
  if (league === SimCBB) return getCBBLogo(id, retro);
  if (league === SimNBA) return getNBALogo(id, retro);
  if (league === SimCHL) return getCHLLogo(id, retro);
  if (league === SimPHL) return getPHLLogo(id, retro);
  if (league === SimMLB) return getMLBLogo(id, retro);
  if (league === SimCollegeBaseball) return getCollegeBaseballLogo(id, retro);
  return "";
};

export const getCFBLogo = (id: number, isRetro: boolean) => {
  const logoObj = isRetro ? retro_logos : logos;
  switch (id) {
    case 1:
      return logoObj.Air_Force;
    case 188:
      return logoObj.Alabama_AM;
    case 255:
      return logoObj.Abilene_Christian;
    case 2:
      return logoObj.Akron_Zips;
    case 203:
      return logoObj.Albany;
    case 186:
      return logoObj.Alcorn_State;
    case 191:
      return logoObj.Alabama_State;
    case 256:
      return logoObj.Austin_Peay;
    case 3:
      return logoObj.Alabama;
    case 4:
      return logoObj.App_State;
    case 5:
      return logoObj.Arizona;
    case 6:
      return logoObj.Arizona_State;
    case 7:
      return logoObj.Arkansas;
    case 8:
      return logoObj.Arkansas_State;
    case 9:
      return logoObj.Army;
    case 10:
      return logoObj.Auburn;
    case 11:
      return logoObj.Ball_State;
    case 12:
      return logoObj.Baylor;
    case 13:
      return logoObj.Boise_State;
    case 14:
      return logoObj.Boston_College;
    case 184:
      return logoObj.Bethune_Cookman;
    case 15:
      return logoObj.Bowling_Green;
    case 166:
      return logoObj.Brown;
    case 204:
      return logoObj.Bryant;
    case 16:
      return logoObj.Buffalo;
    case 147:
      return logoObj.Bucknell;
    case 235:
      return logoObj.Butler;
    case 17:
      return logoObj.BYU;
    case 18:
      return logoObj.California;
    case 205:
      return logoObj.Campbell;
    case 257:
      return logoObj.Central_Arkansas;
    case 227:
      return logoObj.Central_Connecticut;
    case 19:
      return logoObj.Central_Michigan;
    case 195:
      return logoObj.Charleston_Southern;
    case 20:
      return logoObj.Charlotte;
    case 21:
      return logoObj.Cincinnati;
    case 176:
      return logoObj.Citadel;
    case 22:
      return logoObj.Clemson;
    case 23:
      return logoObj.Coastal_Carolina;
    case 148:
      return logoObj.Colgate;
    case 24:
      return logoObj.Colorado;
    case 167:
      return logoObj.Columbia;
    case 168:
      return logoObj.Cornell;
    case 112:
      return logoObj.Connecticut;
    case 155:
      return logoObj.Cal_Poly;
    case 25:
      return logoObj.Colorado_State;
    case 97:
      return logoObj.Syracuse;
    case 169:
      return logoObj.Dartmouth;
    case 236:
      return logoObj.Davidson;
    case 237:
      return logoObj.Dayton;
    case 206:
      return logoObj.Delaware;
    case 238:
      return logoObj.Drake;
    case 221:
      return logoObj.Delaware_State;
    case 26:
      return logoObj.Duke;
    case 228:
      return logoObj.Duquesne;
    case 27:
      return logoObj.East_Carolina;
    case 196:
      return logoObj.Eastern_Illinois;
    case 258:
      return logoObj.Eastern_Kentucky;
    case 207:
      return logoObj.Elon;
    case 28:
      return logoObj.Eastern_Michigan;
    case 179:
      return logoObj.ETSU;
    case 156:
      return logoObj.Eastern_Washington;
    case 190:
      return logoObj.FAMU;
    case 29:
      return logoObj.FIU;
    case 30:
      return logoObj.Florida;
    case 31:
      return logoObj.Florida_Atlantic;
    case 32:
      return logoObj.Florida_State;
    case 152:
      return logoObj.Fordham;
    case 33:
      return logoObj.Fresno_State;
    case 174:
      return logoObj.Furman;
    case 183:
      return logoObj.Grambling_State;
    case 34:
      return logoObj.Georgia;
    case 35:
      return logoObj.Georgia_Southern;
    case 36:
      return logoObj.Georgia_State;
    case 37:
      return logoObj.Georgia_Tech;
    case 208:
      return logoObj.Hampton;
    case 171:
      return logoObj.Harvard;
    case 38:
      return logoObj.Hawaii;
    case 149:
      return logoObj.Holy_Cross;
    case 39:
      return logoObj.Houston;
    case 246:
      return logoObj.Houston_Baptist;
    case 222:
      return logoObj.Howard;
    case 157:
      return logoObj.Idaho;
    case 158:
      return logoObj.Idaho_State;
    case 40:
      return logoObj.Illinois;
    case 137:
      return logoObj.Illinois_State;
    case 41:
      return logoObj.Indiana;
    case 136:
      return logoObj.Indiana_State;
    case 42:
      return logoObj.Iowa;
    case 43:
      return logoObj.Iowa_State;
    case 131:
      return logoObj.JMU;
    case 194:
      return logoObj.Jackson_State;
    case 132:
      return logoObj.JacksonvilleState;
    case 44:
      return logoObj.Kansas;
    case 45:
      return logoObj.Kansas_State;
    case 46:
      return logoObj.Kent_State;
    case 134:
      return logoObj.KennesawState;
    case 47:
      return logoObj.Kentucky;
    case 150:
      return logoObj.Lafayette;
    case 248:
      return logoObj.Lamar;
    case 151:
      return logoObj.LeHigh;
    case 198:
      return logoObj.Lindenwood;
    case 229:
      return logoObj.Long_Island;
    case 48:
      return logoObj.Liberty;
    case 49:
      return logoObj.Louisiana;
    case 50:
      return logoObj.Louisiana_Monroe;
    case 51:
      return logoObj.Louisiana_Tech;
    case 52:
      return logoObj.Louisville;
    case 53:
      return logoObj.LSU;
    case 249:
      return logoObj.McNeese_State;
    case 209:
      return logoObj.Maine;
    case 54:
      return logoObj.Marshall;
    case 230:
      return logoObj.Mercyhurst;
    case 55:
      return logoObj.Maryland;
    case 56:
      return logoObj.Memphis;
    case 181:
      return logoObj.Mercer;
    case 57:
      return logoObj.Miami;
    case 58:
      return logoObj.Miami_OH;
    case 59:
      return logoObj.Michigan;
    case 60:
      return logoObj.Michigan_State;
    case 61:
      return logoObj.Middle_Tennessee;
    case 62:
      return logoObj.Minnesota;
    case 63:
      return logoObj.Mississippi_State;
    case 64:
      return logoObj.Missouri;
    case 210:
      return logoObj.Monmouth;
    case 159:
      return logoObj.Montana;
    case 240:
      return logoObj.Morehead;
    case 223:
      return logoObj.Morgan_State;
    case 138:
      return logoObj.Missouri_State;
    case 219:
      return logoObj.Merrimack;
    case 239:
      return logoObj.Marist;
    case 193:
      return logoObj.Mississippi_Valley;
    case 160:
      return logoObj.Montana_State;
    case 139:
      return logoObj.Murray_State;
    case 161:
      return logoObj.Northern_Arizona;
    case 65:
      return logoObj.Navy;
    case 212:
      return logoObj.North_Carolina_AT;
    case 225:
      return logoObj.North_Carolina_Central;
    case 66:
      return logoObj.NC_State;
    case 143:
      return logoObj.North_Dakota_State;
    case 67:
      return logoObj.Nebraska;
    case 68:
      return logoObj.Nevada;
    case 250:
      return logoObj.Nicholls_State;
    case 69:
      return logoObj.New_Mexico;
    case 70:
      return logoObj.New_Mexico_State;
    case 71:
      return logoObj.North_Carolina;
    case 72:
      return logoObj.North_Texas;
    case 73:
      return logoObj.NIU;
    case 224:
      return logoObj.Norfolk_State;
    case 74:
      return logoObj.Northwestern;
    case 251:
      return logoObj.Northwestern_State;
    case 75:
      return logoObj.Notre_Dame;
    case 76:
      return logoObj.Ohio;
    case 77:
      return logoObj.Ohio_State;
    case 78:
      return logoObj.Oklahoma;
    case 79:
      return logoObj.Oklahoma_State;
    case 80:
      return logoObj.Old_Dominion;
    case 81:
      return logoObj.Ole_Miss;
    case 82:
      return logoObj.Oregon;
    case 83:
      return logoObj.Oregon_State;
    case 170:
      return logoObj.Pennsylvania;
    case 241:
      return logoObj.Presbyterian_College;
    case 84:
      return logoObj.Penn_State;
    case 85:
      return logoObj.Pitt;
    case 172:
      return logoObj.Princeton;
    case 163:
      return logoObj.Portland_State;
    case 86:
      return logoObj.Purdue;
    case 185:
      return logoObj.Prairie_View;
    case 254:
      return logoObj.Rio_Grande_Valley;
    case 231:
      return logoObj.Robert_Morris;
    case 213:
      return logoObj.RhodeIsland;
    case 87:
      return logoObj.Rice;
    case 214:
      return logoObj.Richmond;
    case 88:
      return logoObj.Rutgers;
    case 175:
      return logoObj.Samford;
    case 226:
      return logoObj.South_Carolina_State;
    case 145:
      return logoObj.South_Dakota;
    case 89:
      return logoObj.San_Diego_State;
    case 252:
      return logoObj.Southeastern_Louisiana;
    case 199:
      return logoObj.Southeast_Missouri;
    case 261:
      return logoObj.SFA;
    case 232:
      return logoObj.Saint_Francis;
    case 133:
      return logoObj.SamHoustonState;
    case 220:
      return logoObj.Sacred_Heart;
    case 141:
      return logoObj.Southern_Illinois;
    case 90:
      return logoObj.San_Jose;
    case 91:
      return logoObj.SMU;
    case 187:
      return logoObj.Southern;
    case 92:
      return logoObj.South_Alabama;
    case 93:
      return logoObj.South_Carolina;
    case 164:
      return logoObj.Sacramento_State;
    case 94:
      return logoObj.South_Florida;
    case 95:
      return logoObj.Southern_Miss;
    case 96:
      return logoObj.Stanford;
    case 215:
      return logoObj.Stony_Brook;
    case 244:
      return logoObj.Stetson;
    case 243:
      return logoObj.St_Thomas;
    case 233:
      return logoObj.Stonehill;
    case 260:
      return logoObj.Southern_Utah;
    case 253:
      return logoObj.Texas_AM_Commerce;
    case 262:
      return logoObj.Tarleton;
    case 98:
      return logoObj.TCU;
    case 99:
      return logoObj.Temple;
    case 100:
      return logoObj.Tennessee;
    case 200:
      return logoObj.Tennessee_State;
    case 201:
      return logoObj.Tennessee_Tech;
    case 101:
      return logoObj.Texas;
    case 102:
      return logoObj.TAMU;
    case 103:
      return logoObj.Texas_State;
    case 104:
      return logoObj.Texas_Tech;
    case 192:
      return logoObj.Texas_Southern;
    case 105:
      return logoObj.Toledo;
    case 216:
      return logoObj.Towson;
    case 106:
      return logoObj.Troy;
    case 107:
      return logoObj.Tulane;
    case 108:
      return logoObj.Tulsa;
    case 109:
      return logoObj.UAB;
    case 189:
      return logoObj.Arkansas_Pine_Bluff;
    case 154:
      return logoObj.UC_Davis;
    case 247:
      return logoObj.Incarnate_Word;
    case 110:
      return logoObj.UCF;
    case 111:
      return logoObj.UCLA;
    case 113:
      return logoObj.UMASS;
    case 259:
      return logoObj.North_Alabama;
    case 162:
      return logoObj.Northern_Colorado;
    case 142:
      return logoObj.North_Dakota;
    case 211:
      return logoObj.New_Hampshire;
    case 140:
      return logoObj.Northern_Iowa;
    case 264:
      return logoObj.West_Georgia;
    case 114:
      return logoObj.UNLV;
    case 115:
      return logoObj.USC;
    case 178:
      return logoObj.Chattanooga;
    case 202:
      return logoObj.UT_Martin;
    case 263:
      return logoObj.Utah_Tech;
    case 116:
      return logoObj.UTEP;
    case 117:
      return logoObj.UTSA;
    case 118:
      return logoObj.Utah;
    case 119:
      return logoObj.Utah_State;
    case 245:
      return logoObj.Valparaiso;
    case 120:
      return logoObj.Vanderbilt;
    case 217:
      return logoObj.Villanova;
    case 121:
      return logoObj.Virginia;
    case 182:
      return logoObj.VMI;
    case 122:
      return logoObj.Virginia_Tech;
    case 234:
      return logoObj.Wagner;
    case 123:
      return logoObj.Wake_Forest;
    case 124:
      return logoObj.Washington;
    case 125:
      return logoObj.Washington_State;
    case 180:
      return logoObj.Western_Carolina;
    case 165:
      return logoObj.Weber_State;
    case 197:
      return logoObj.Gardner_Webb;
    case 146:
      return logoObj.Western_Illinois;
    case 218:
      return logoObj.William_and_Mary;
    case 177:
      return logoObj.Wofford;
    case 126:
      return logoObj.West_Virginia;
    case 127:
      return logoObj.Western_Kentucky;
    case 128:
      return logoObj.Western_Michigan;
    case 129:
      return logoObj.Wisconsin;
    case 130:
      return logoObj.Wyoming;
    case 173:
      return logoObj.Yale;
    case 135:
      return logoObj.Youngstown_State;
    case 242:
      return logoObj.U_San_Diego;
    case 153:
      return logoObj.Georgetown;
    case 144:
      return logoObj.South_Dakota_State;
    case 265:
      return logoObj.Chicago_State;
    case 266:
      return logoObj.New_Haven;
    default:
      return logoObj.Unknown;
  }
};
export const getNFLLogo = (id: number, isRetro: boolean) => {
  const logoObj = isRetro ? retro_logos : logos;
  switch (id) {
    case 29:
      return logoObj.ARI_Cardinals;
    case 25:
      return logoObj.ATL_Falcons;
    case 5:
      return logoObj.BAL_Ravens;
    case 1:
      return logoObj.BUF_Bills;
    case 26:
      return logoObj.CAR_Panthers;
    case 6:
      return logoObj.CIN_Bengals;
    case 7:
      return logoObj.CLE_Browns;
    case 21:
      return logoObj.CHI_Bears;
    case 17:
      return logoObj.DAL_Cowboys;
    case 13:
      return logoObj.DEN_Broncos;
    case 22:
      return logoObj.DET_Lions;
    case 23:
      return logoObj.GB_Packers;
    case 9:
      return logoObj.HOU_Texans;
    case 10:
      return logoObj.IND_Colts;
    case 11:
      return logoObj.JAX_Jaguars;
    case 14:
      return logoObj.KC_Chiefs;
    case 15:
      return logoObj.LV_Raiders;
    case 30:
      return logoObj.LA_Rams;
    case 16:
      return logoObj.LA_Chargers;
    case 2:
      return logoObj.MIA_Dolphins;
    case 24:
      return logoObj.MN_Vikings;
    case 3:
      return logoObj.NE_Patriots;
    case 27:
      return logoObj.NO_Saints;
    case 18:
      return logoObj.NY_Giants;
    case 4:
      return logoObj.NY_Jets;
    case 19:
      return logoObj.PHI_Eagles;
    case 8:
      return logoObj.PIT_Steelers;
    case 31:
      return logoObj.SF_49ers;
    case 32:
      return logoObj.SEA_Seahawks;
    case 28:
      return logoObj.TB_Buccaneers;
    case 12:
      return logoObj.TEN_Titans;
    case 20:
      return logoObj.WAS_Commies;

    default:
      return logoObj.Unknown;
  }
};
export const getCBBLogo = (id: number, isRetro: boolean) => {
  const logoObj = isRetro ? retro_logos : logos;
  switch (id) {
    case 1:
      return logoObj.Air_Force;
    case 346:
      return logoObj.Alabama_AM;
    case 223:
      return logoObj.Abilene_Christian;
    case 2:
      return logoObj.Akron_Zips;
    case 158:
      return logoObj.Albany;
    case 344:
      return logoObj.Alcorn_State;
    case 349:
      return logoObj.Alabama_State;
    case 336:
      return logoObj.Texas_AM_Corpus;
    case 232:
      return logoObj.American;
    case 149:
      return logoObj.Austin_Peay;
    case 3:
      return logoObj.Alabama;
    case 4:
      return logoObj.App_State;
    case 5:
      return logoObj.Arizona;
    case 6:
      return logoObj.Arizona_State;
    case 7:
      return logoObj.Arkansas;
    case 8:
      return logoObj.Arkansas_State;
    case 9:
      return logoObj.Army;
    case 10:
      return logoObj.Auburn;
    case 11:
      return logoObj.Ball_State;
    case 12:
      return logoObj.Baylor;
    case 13:
      return logoObj.Boise_State;
    case 14:
      return logoObj.Boston_College;
    case 342:
      return logoObj.Bethune_Cookman;
    case 175:
      return logoObj.Belmont;
    case 150:
      return logoObj.Bellarmine;
    case 15:
      return logoObj.Bowling_Green;
    case 159:
      return logoObj.Binghamton;
    case 176:
      return logoObj.Bradley;
    case 284:
      return logoObj.Brown;
    case 160:
      return logoObj.Bryant;
    case 233:
      return logoObj.Boston;
    case 16:
      return logoObj.Buffalo;
    case 234:
      return logoObj.Bucknell;
    case 193:
      return logoObj.Butler;
    case 17:
      return logoObj.BYU;
    case 18:
      return logoObj.California;
    case 272:
      return logoObj.Campbell;
    case 301:
      return logoObj.Canisius;
    case 151:
      return logoObj.Central_Arkansas;
    case 224:
      return logoObj.California_Baptist;
    case 363:
      return logoObj.Central_Connecticut;
    case 19:
      return logoObj.Central_Michigan;
    case 366:
      return logoObj.Chaminade;
    case 250:
      return logoObj.Charleston_Southern;
    case 354:
      return logoObj.Chicago_State;
    case 20:
      return logoObj.Charlotte;
    case 21:
      return logoObj.Cincinnati;
    case 323:
      return logoObj.Citadel;
    case 22:
      return logoObj.Clemson;
    case 273:
      return logoObj.Cleveland_State;
    case 23:
      return logoObj.Coastal_Carolina;
    case 259:
      return logoObj.Charleston;
    case 235:
      return logoObj.Colgate;
    case 24:
      return logoObj.Colorado;
    case 285:
      return logoObj.Columbia;
    case 308:
      return logoObj.Coppin_State;
    case 286:
      return logoObj.Cornell;
    case 173:
      return logoObj.Cal_Poly;
    case 172:
      return logoObj.Cal_State_Bakersfield;
    case 170:
      return logoObj.Cal_State_Fullerton;
    case 174:
      return logoObj.Cal_State_Northridge;
    case 25:
      return logoObj.Colorado_State;
    case 194:
      return logoObj.Creighton;
    case 287:
      return logoObj.Dartmouth;
    case 181:
      return logoObj.Davidson;
    case 182:
      return logoObj.Dayton;
    case 260:
      return logoObj.Delaware;
    case 274:
      return logoObj.Detroit_Mercy;
    case 261:
      return logoObj.Drexel;
    case 177:
      return logoObj.Drake;
    case 309:
      return logoObj.Delaware_State;
    case 214:
      return logoObj.Denver;
    case 26:
      return logoObj.Duke;
    case 183:
      return logoObj.Duquesne;
    case 27:
      return logoObj.East_Carolina;
    case 320:
      return logoObj.Eastern_Illinois;
    case 152:
      return logoObj.Eastern_Kentucky;
    case 262:
      return logoObj.Elon;
    case 28:
      return logoObj.Eastern_Michigan;
    case 326:
      return logoObj.ETSU;
    case 240:
      return logoObj.Eastern_Washington;
    case 302:
      return logoObj.Fairfield;
    case 348:
      return logoObj.FAMU;
    case 358:
      return logoObj.Fairleigh_Dickinson;
    case 29:
      return logoObj.FIU;
    case 30:
      return logoObj.Florida;
    case 31:
      return logoObj.Florida_Atlantic;
    case 32:
      return logoObj.Florida_State;
    case 184:
      return logoObj.Fordham;
    case 33:
      return logoObj.Fresno_State;
    case 321:
      return logoObj.Furman;
    case 222:
      return logoObj.Grand_Canyon;
    case 185:
      return logoObj.GeorgeMason;
    case 341:
      return logoObj.Grambling_State;
    case 186:
      return logoObj.GeorgeWashington;
    case 34:
      return logoObj.Georgia;
    case 35:
      return logoObj.Georgia_Southern;
    case 36:
      return logoObj.Georgia_State;
    case 37:
      return logoObj.Georgia_Tech;
    case 200:
      return logoObj.Gonzaga;
    case 263:
      return logoObj.Hampton;
    case 353:
      return logoObj.Hartford;
    case 289:
      return logoObj.Harvard;
    case 38:
      return logoObj.Hawaii;
    case 236:
      return logoObj.Holy_Cross;
    case 39:
      return logoObj.Houston;
    case 340:
      return logoObj.Houston_Baptist;
    case 264:
      return logoObj.Hofstra;
    case 305:
      return logoObj.Howard;
    case 252:
      return logoObj.High_Point;
    case 241:
      return logoObj.Idaho;
    case 242:
      return logoObj.Idaho_State;
    case 40:
      return logoObj.Illinois;
    case 208:
      return logoObj.Illinois_State;
    case 41:
      return logoObj.Indiana;
    case 207:
      return logoObj.Indiana_State;
    case 293:
      return logoObj.Iona;
    case 42:
      return logoObj.Iowa;
    case 43:
      return logoObj.Iowa_State;
    case 276:
      return logoObj.IUPUI;
    case 180:
      return logoObj.JMU;
    case 352:
      return logoObj.Jackson_State;
    case 146:
      return logoObj.JacksonvilleState;
    case 44:
      return logoObj.Kansas;
    case 215:
      return logoObj.Kansas_City_U;
    case 45:
      return logoObj.Kansas_State;
    case 46:
      return logoObj.Kent_State;
    case 148:
      return logoObj.KennesawState;
    case 47:
      return logoObj.Kentucky;
    case 187:
      return logoObj.LaSalle;
    case 237:
      return logoObj.Lafayette;
    case 338:
      return logoObj.Lamar;
    case 171:
      return logoObj.Long_Beach;
    case 238:
      return logoObj.LeHigh;
    case 357:
      return logoObj.Lemoyne;
    case 316:
      return logoObj.Lindenwood;
    case 153:
      return logoObj.Lipscomb;
    case 361:
      return logoObj.Long_Island;
    case 239:
      return logoObj.Loyola_Maryland;
    case 253:
      return logoObj.Longwood;
    case 319:
      return logoObj.Little_Rock;
    case 48:
      return logoObj.Liberty;
    case 49:
      return logoObj.Louisiana;
    case 50:
      return logoObj.Louisiana_Monroe;
    case 51:
      return logoObj.Louisiana_Tech;
    case 52:
      return logoObj.Louisville;
    case 188:
      return logoObj.LoyolaC;
    case 201:
      return logoObj.LoyolaM;
    case 53:
      return logoObj.LSU;
    case 295:
      return logoObj.Manhattan;
    case 331:
      return logoObj.McNeese_State;
    case 195:
      return logoObj.Marquette;
    case 161:
      return logoObj.Maine;
    case 54:
      return logoObj.Marshall;
    case 369:
      return logoObj.Mercyhurst;
    case 55:
      return logoObj.Maryland;
    case 56:
      return logoObj.Memphis;
    case 328:
      return logoObj.Mercer;
    case 57:
      return logoObj.Miami;
    case 58:
      return logoObj.Miami_OH;
    case 59:
      return logoObj.Michigan;
    case 60:
      return logoObj.Michigan_State;
    case 277:
      return logoObj.Milwaukee;
    case 61:
      return logoObj.Middle_Tennessee;
    case 62:
      return logoObj.Minnesota;
    case 63:
      return logoObj.Mississippi_State;
    case 64:
      return logoObj.Missouri;
    case 265:
      return logoObj.Monmouth;
    case 243:
      return logoObj.Montana;
    case 314:
      return logoObj.Morehead;
    case 307:
      return logoObj.Morgan_State;
    case 209:
      return logoObj.Missouri_State;
    case 362:
      return logoObj.Merrimack;
    case 297:
      return logoObj.Marist;
    case 294:
      return logoObj.Mount_St_Marys;
    case 351:
      return logoObj.Mississippi_Valley;
    case 244:
      return logoObj.Montana_State;
    case 210:
      return logoObj.Murray_State;
    case 245:
      return logoObj.Northern_Arizona;
    case 65:
      return logoObj.Navy;
    case 266:
      return logoObj.North_Carolina_AT;
    case 304:
      return logoObj.North_Carolina_Central;
    case 66:
      return logoObj.NC_State;
    case 217:
      return logoObj.North_Dakota_State;
    case 267:
      return logoObj.Northeastern;
    case 67:
      return logoObj.Nebraska;
    case 68:
      return logoObj.Nevada;
    case 300:
      return logoObj.Niagara;
    case 337:
      return logoObj.Nicholls_State;
    case 164:
      return logoObj.NJIT;
    case 278:
      return logoObj.Northern_Kentucky;
    case 69:
      return logoObj.New_Mexico;
    case 70:
      return logoObj.New_Mexico_State;
    case 71:
      return logoObj.North_Carolina;
    case 72:
      return logoObj.North_Texas;
    case 73:
      return logoObj.NIU;
    case 303:
      return logoObj.Norfolk_State;
    case 74:
      return logoObj.Northwestern;
    case 332:
      return logoObj.Northwestern_State;
    case 75:
      return logoObj.Notre_Dame;
    case 279:
      return logoObj.Oakland;
    case 76:
      return logoObj.Ohio;
    case 77:
      return logoObj.Ohio_State;
    case 78:
      return logoObj.Oklahoma;
    case 79:
      return logoObj.Oklahoma_State;
    case 80:
      return logoObj.Old_Dominion;
    case 81:
      return logoObj.Ole_Miss;
    case 82:
      return logoObj.Oregon;
    case 83:
      return logoObj.Oregon_State;
    case 218:
      return logoObj.Oral_Roberts;
    case 202:
      return logoObj.Pacific;
    case 288:
      return logoObj.Pennsylvania;
    case 280:
      return logoObj.Purdue_Fort_Wayne;
    case 254:
      return logoObj.Presbyterian_College;
    case 84:
      return logoObj.Penn_State;
    case 203:
      return logoObj.Pepperdine;
    case 85:
      return logoObj.Pitt;
    case 290:
      return logoObj.Princeton;
    case 196:
      return logoObj.Providence;
    case 247:
      return logoObj.Portland_State;
    case 86:
      return logoObj.Purdue;
    case 343:
      return logoObj.Prairie_View;
    case 296:
      return logoObj.Quinnipiac;
    case 156:
      return logoObj.Queens;
    case 255:
      return logoObj.Radford;
    case 229:
      return logoObj.Rio_Grande_Valley;
    case 298:
      return logoObj.Rider;
    case 281:
      return logoObj.Robert_Morris;
    case 189:
      return logoObj.RhodeIsland;
    case 87:
      return logoObj.Rice;
    case 190:
      return logoObj.Richmond;
    case 88:
      return logoObj.Rutgers;
    case 191:
      return logoObj.SaintJosephs;
    case 192:
      return logoObj.SaintLouis;
    case 322:
      return logoObj.Samford;
    case 368:
      return logoObj.AmericanSamoa;
    case 310:
      return logoObj.South_Carolina_State;
    case 220:
      return logoObj.South_Dakota;
    case 89:
      return logoObj.San_Diego_State;
    case 334:
      return logoObj.Southeastern_Louisiana;
    case 312:
      return logoObj.Southeast_Missouri;
    case 204:
      return logoObj.SFDons;
    case 226:
      return logoObj.SFA;
    case 365:
      return logoObj.St_Francis;
    case 360:
      return logoObj.Saint_Francis;
    case 147:
      return logoObj.SamHoustonState;
    case 356:
      return logoObj.Sacred_Heart;
    case 292:
      return logoObj.Siena;
    case 212:
      return logoObj.Southern_Illinois;
    case 311:
      return logoObj.SIU_E;
    case 90:
      return logoObj.San_Jose;
    case 205:
      return logoObj.SantaClara;
    case 206:
      return logoObj.SetonHall;
    case 91:
      return logoObj.SMU;
    case 345:
      return logoObj.Southern;
    case 299:
      return logoObj.Saint_Peters;
    case 92:
      return logoObj.South_Alabama;
    case 93:
      return logoObj.South_Carolina;
    case 248:
      return logoObj.Sacramento_State;
    case 94:
      return logoObj.South_Florida;
    case 95:
      return logoObj.Southern_Miss;
    case 197:
      return logoObj.StJohns;
    case 96:
      return logoObj.Stanford;
    case 270:
      return logoObj.Stony_Brook;
    case 157:
      return logoObj.Stetson;
    case 219:
      return logoObj.St_Thomas;
    case 359:
      return logoObj.Stonehill;
    case 225:
      return logoObj.Southern_Utah;
    case 97:
      return logoObj.Syracuse;
    case 335:
      return logoObj.Texas_AM_Commerce;
    case 227:
      return logoObj.Tarleton;
    case 98:
      return logoObj.TCU;
    case 99:
      return logoObj.Temple;
    case 100:
      return logoObj.Tennessee;
    case 313:
      return logoObj.Tennessee_State;
    case 318:
      return logoObj.Tennessee_Tech;
    case 101:
      return logoObj.Texas;
    case 102:
      return logoObj.TAMU;
    case 103:
      return logoObj.Texas_State;
    case 104:
      return logoObj.Texas_Tech;
    case 350:
      return logoObj.Texas_Southern;
    case 105:
      return logoObj.Toledo;
    case 268:
      return logoObj.Towson;
    case 106:
      return logoObj.Troy;
    case 107:
      return logoObj.Tulane;
    case 108:
      return logoObj.Tulsa;
    case 109:
      return logoObj.UAB;
    case 347:
      return logoObj.Arkansas_Pine_Bluff;
    case 166:
      return logoObj.UC_Davis;
    case 168:
      return logoObj.UC_Riverside;
    case 167:
      return logoObj.UC_Santa_Barbara;
    case 178:
      return logoObj.UIC;
    case 333:
      return logoObj.Incarnate_Word;
    case 110:
      return logoObj.UCF;
    case 111:
      return logoObj.UCLA;
    case 112:
      return logoObj.Connecticut;
    case 113:
      return logoObj.UMASS;
    case 306:
      return logoObj.Maryland_East;
    case 162:
      return logoObj.UMASS_Lowell;
    case 154:
      return logoObj.North_Alabama;
    case 256:
      return logoObj.UNC_Asheville;
    case 246:
      return logoObj.Northern_Colorado;
    case 329:
      return logoObj.UNCG;
    case 269:
      return logoObj.UNC_Wilmington;
    case 216:
      return logoObj.North_Dakota;
    case 155:
      return logoObj.North_Florida;
    case 163:
      return logoObj.New_Hampshire;
    case 211:
      return logoObj.Northern_Iowa;
    case 339:
      return logoObj.New_Orleans;
    case 364:
      return logoObj.Guam;
    case 367:
      return logoObj.West_Georgia;
    case 114:
      return logoObj.UNLV;
    case 257:
      return logoObj.USC_Upstate;
    case 115:
      return logoObj.USC;
    case 317:
      return logoObj.Southern_Indiana;
    case 228:
      return logoObj.UT_Arlington;
    case 325:
      return logoObj.Chattanooga;
    case 315:
      return logoObj.UT_Martin;
    case 230:
      return logoObj.Utah_Tech;
    case 116:
      return logoObj.UTEP;
    case 117:
      return logoObj.UTSA;
    case 118:
      return logoObj.Utah;
    case 119:
      return logoObj.Utah_State;
    case 165:
      return logoObj.Vermont;
    case 231:
      return logoObj.Utah_Valley;
    case 275:
      return logoObj.Green_Bay;
    case 213:
      return logoObj.Valparaiso;
    case 120:
      return logoObj.Vanderbilt;
    case 198:
      return logoObj.Villanova;
    case 121:
      return logoObj.Virginia;
    case 330:
      return logoObj.VMI;
    case 122:
      return logoObj.Virginia_Tech;
    case 355:
      return logoObj.Wagner;
    case 123:
      return logoObj.Wake_Forest;
    case 124:
      return logoObj.Washington;
    case 125:
      return logoObj.Washington_State;
    case 327:
      return logoObj.Western_Carolina;
    case 249:
      return logoObj.Weber_State;
    case 251:
      return logoObj.Gardner_Webb;
    case 258:
      return logoObj.Winthrop;
    case 221:
      return logoObj.Western_Illinois;
    case 271:
      return logoObj.William_and_Mary;
    case 324:
      return logoObj.Wofford;
    case 282:
      return logoObj.Wright_State;
    case 126:
      return logoObj.West_Virginia;
    case 127:
      return logoObj.Western_Kentucky;
    case 128:
      return logoObj.Western_Michigan;
    case 129:
      return logoObj.Wisconsin;
    case 130:
      return logoObj.Wyoming;
    case 199:
      return logoObj.Xavier;
    case 291:
      return logoObj.Yale;
    case 283:
      return logoObj.Youngstown_State;
    case 131:
      return logoObj.UMBC;
    case 132:
      return logoObj.Wichita_State;
    case 133:
      return logoObj.U_San_Diego;
    case 169:
      return logoObj.UC_San_Diego;
    case 134:
      return logoObj.St_Marys;
    case 135:
      return logoObj.VCU;
    case 136:
      return logoObj.Georgetown;
    case 137:
      return logoObj.St_Bonaventure;
    case 138:
      return logoObj.UC_Irvine;
    case 139:
      return logoObj.South_Dakota_State;
    case 140:
      return logoObj.DePaul;
    case 141:
      return logoObj.FGCU;
    case 142:
      return logoObj.Jacksonville;
    case 143:
      return logoObj.Nebraska_Omaha;
    case 144:
      return logoObj.Portland;
    case 145:
      return logoObj.Seattle;
    case 179:
      return logoObj.Evansville;
    case 370:
      return logoObj.New_Haven;
    case 371:
      return logoObj.GuamState;
    case 372:
      return logoObj.HawaiiHilo;
    case 373:
      return logoObj.JRU;
    case 374:
      return logoObj.SanBeda;
    case 375:
      return logoObj.Tuvalu;
    case 376:
      return logoObj.HawaiiPacific;
    case 377:
      return logoObj.USP_Fiji;
    case 378:
      return logoObj.West_Florida;

    default:
      return logoObj.Unknown;
  }
};
export const getNBALogo = (id: number, isRetro: boolean) => {
  const logoObj = isRetro ? retro_logos : logos;
  switch (id) {
    case 1:
      return logoObj.ATL_Hawks;
    case 3:
      return logoObj.BOS_Celtics;
    case 2:
      return logoObj.BRK_Nets;
    case 6:
      return logoObj.CLE_Cavaliers;
    case 4:
      return logoObj.CHA_Hornets;
    case 5:
      return logoObj.CHI_Bulls;
    case 7:
      return logoObj.DAL_Mavericks;
    case 8:
      return logoObj.DEN_Nuggets;
    case 9:
      return logoObj.DET_Pistons;
    case 10:
      return logoObj.GS_Warriors;
    case 11:
      return logoObj.HOU_Rockets;
    case 12:
      return logoObj.IND_Pacers;
    case 13:
      return logoObj.LA_Lakers;
    case 14:
      return logoObj.SD_Clippers;
    case 15:
      return logoObj.MEM_Grizzlies;
    case 16:
      return logoObj.MIA_Heat;
    case 17:
      return logoObj.MIL_Bucks;
    case 18:
      return logoObj.MIN_Timberwolves;
    case 19:
      return logoObj.NO_Pelicants;
    case 20:
      return logoObj.NY_Knicks;
    case 22:
      return logoObj.ORL_Magic;
    case 21:
      return logoObj.OKC_Thunder;
    case 23:
      return logoObj.PHI_76ers;
    case 24:
      return logoObj.PHO_Moons;
    case 25:
      return logoObj.POR_Trailblazers;
    case 26:
      return logoObj.SAC_Kings;
    case 27:
      return logoObj.SA_Spurs;
    case 28:
      return logoObj.SEA_Supersonics;
    case 29:
      return logoObj.TOR_Raptors;
    case 30:
      return logoObj.UTA_Jazz;
    case 31:
      return logoObj.VAN_Sealions;
    case 32:
      return logoObj.WAS_Wizards;
    case 97:
      return ISLLogos.ABCFighters;
    case 68:
      return ISLLogos.Adelaide;
    case 134:
      return ISLLogos.AELLimassol;
    case 131:
      return ISLLogos.Aguada;
    case 176:
      return ISLLogos.AlAhly;
    case 189:
      return ISLLogos.AlHilal;
    case 190:
      return ISLLogos.AlIttihad;
    case 188:
      return ISLLogos.AlNassr;
    case 182:
      return ISLLogos.AlRasheed;
    case 185:
      return ISLLogos.ALRiyadi;
    case 187:
      return ISLLogos.AlSadd;
    case 191:
      return ISLLogos.AlWahda;
    case 33:
      return ISLLogos.ALBA;
    case 61:
      return ISLLogos.Alvark;
    case 34:
      return ISLLogos.Anadolu;
    case 135:
      return ISLLogos.APOEL;
    case 138:
      return ISLLogos.Aquila;
    case 107:
      return ISLLogos.ASDouanes;
    case 85:
      return ISLLogos.Monaco;
    case 99:
      return ISLLogos.ASPolice;
    case 101:
      return ISLLogos.ASSale;
    case 150:
      return ISLLogos.Asker;
    case 151:
      return ISLLogos.Baerum;
    case 174:
      return ISLLogos.BahrainSC;
    case 143:
      return ISLLogos.Bakken;
    case 58:
      return ISLLogos.Barangay;
    case 35:
      return ISLLogos.Barcelona;
    case 36:
      return ISLLogos.Bayern;
    case 80:
      return ISLLogos.Andorra;
    case 76:
      return ISLLogos.Astana;
    case 132:
      return ISLLogos.BCBalcan;
    case 158:
      return ISLLogos.BCBudivelnyk;
    case 159:
      return ISLLogos.BCDnipro;
    case 95:
      return ISLLogos.EspoirFukash;
    case 149:
      return ISLLogos.BCLietkabelis;
    case 156:
      return ISLLogos.BCLulea;
    case 53:
      return ISLLogos.BeijingDucks;
    case 177:
      return ISLLogos.BeitSahour;
    case 112:
      return ISLLogos.BocaJuniors;
    case 69:
      return ISLLogos.Brisbane;
    case 140:
      return ISLLogos.BuducnostVoli;
    case 129:
      return ISLLogos.CaballosdeCocle;
    case 49:
      return ISLLogos.Caledonia;
    case 130:
      return ISLLogos.CangrejerosSanturce;
    case 125:
      return ISLLogos.CapitanesDeCiudad;
    case 108:
      return ISLLogos.CapeTown;
    case 37:
      return ISLLogos.CazooBaskonia;
    case 133:
      return ISLLogos.Cibona;
    case 91:
      return ISLLogos.GranCanaria;
    case 122:
      return ISLLogos.CDValdivia;
    case 111:
      return ISLLogos.CityOilers;
    case 109:
      return ISLLogos.CobraSport;
    case 38:
      return ISLLogos.CrvenaZvezda;
    case 153:
      return ISLLogos.CSKAMoscow;
    case 78:
      return ISLLogos.Daegu;
    case 170:
      return ISLLogos.DaNang;
    case 141:
      return ISLLogos.DinamoBucuresti;
    case 77:
      return ISLLogos.Vladivostok;
    case 136:
      return ISLLogos.FalcoSzombathely;
    case 94:
      return ISLLogos.Yaounde;
    case 40:
      return ISLLogos.Fenerbache;
    case 102:
      return ISLLogos.Beira;
    case 103:
      return ISLLogos.Maputo;
    case 117:
      return ISLLogos.Flamengo;
    case 118:
      return ISLLogos.Franca;
    case 73:
      return ISLLogos.Fujian;
    case 126:
      return ISLLogos.FuerzaMonterrey;
    case 98:
      return ISLLogos.GNBC;
    case 67:
      return ISLLogos.Goyang;
    case 147:
      return ISLLogos.Grindavik;
    case 56:
      return ISLLogos.Guandong;
    case 57:
      return ISLLogos.Guangzhou;
    case 88:
      return ISLLogos.Hamburg;
    case 137:
      return ISLLogos.HapoelJerusalem;
    case 1000:
      return ISLLogos.Heliopolis;
    case 89:
      return ISLLogos.Heroes;
    case 169:
      return ISLLogos.HiTechBangkok;
    case 62:
      return ISLLogos.Hiroshima;
    case 113:
      return ISLLogos.InstitutoACC;
    case 148:
      return ISLLogos.IR;
    case 54:
      return ISLLogos.Jilin;
    case 86:
      return ISLLogos.Bourg;
    case 183:
      return ISLLogos.KazmaSC;
    case 142:
      return ISLLogos.KKCedevita;
    case 45:
      return ISLLogos.KKPartizan;
    case 163:
      return ISLLogos.KualaLumpur;
    case 184:
      return ISLLogos.KuwaitSC;
    case 104:
      return ISLLogos.Kwara;
    case 41:
      return ISLLogos.LDLC;
    case 75:
      return ISLLogos.Levanga;
    case 127:
      return ISLLogos.LibertadoresQueretaro;
    case 154:
      return ISLLogos.LokomotivKuban;
    case 48:
      return ISLLogos.London;
    case 161:
      return ISLLogos.Louvre;
    case 42:
      return ISLLogos.Maccabi;
    case 180:
      return ISLLogos.MahramTehran;
    case 175:
      return ISLLogos.Manama;
    case 84:
      return ISLLogos.Manchester;
    case 92:
      return ISLLogos.Alger;
    case 70:
      return ISLLogos.Melbourne;
    case 87:
      return ISLLogos.Metropolitans92;
    case 119:
      return ISLLogos.Minas;
    case 120:
      return ISLLogos.MogiDasCruzes;
    case 63:
      return ISLLogos.Nagoya;
    case 72:
      return ISLLogos.NewZealand;
    case 171:
      return ISLLogos.NhaTrang;
    case 157:
      return ISLLogos.Norrkoping;
    case 82:
      return ISLLogos.Nymburk;
    case 114:
      return ISLLogos.ObrasSanitarias;
    case 39:
      return ISLLogos.Olimpia;
    case 43:
      return ISLLogos.Olympiacos;
    case 81:
      return ISLLogos.Oostende;
    case 83:
      return ISLLogos.Opava;
    case 164:
      return ISLLogos.Otago;
    case 44:
      return ISLLogos.Panathinaikos;
    case 139:
      return ISLLogos.Peja;
    case 71:
      return ISLLogos.Perth;
    case 93:
      return ISLLogos.Petro;
    case 181:
      return ISLLogos.Petrochimi;
    case 51:
      return ISLLogos.Prometey;
    case 145:
      return ISLLogos.Pyrinto;
    case 115:
      return ISLLogos.Quimsa;
    case 46:
      return ISLLogos.RealMadrid;
    case 128:
      return ISLLogos.RealEsteli;
    case 106:
      return ISLLogos.REG;
    case 105:
      return ISLLogos.Rivers;
    case 65:
      return ISLLogos.Ryuku;
    case 173:
      return ISLLogos.SabahBC;
    case 186:
      return ISLLogos.SagesseSC;
    case 172:
      return ISLLogos.Saigon;
    case 116:
      return ISLLogos.SanLorenzo;
    case 166:
      return ISLLogos.SanMiguel;
    case 121:
      return ISLLogos.SaoPaulo;
    case 162:
      return ISLLogos.SatriaMuda;
    case 66:
      return ISLLogos.Seoul;
    case 192:
      return ISLLogos.ShababAlAhli;
    case 55:
      return ISLLogos.Shandong;
    case 59:
      return ISLLogos.Shanghai;
    case 60:
      return ISLLogos.Shenzen;
    case 167:
      return ISLLogos.Singapore;
    case 96:
      return ISLLogos.SLAC;
    case 152:
      return ISLLogos.SlaskWroclaw;
    case 90:
      return ISLLogos.Benfica;
    case 74:
      return ISLLogos.SouthChina;
    case 178:
      return ISLLogos.SportingAlexandria;
    case 100:
      return ISLLogos.StadeMalien;
    case 64:
      return ISLLogos.Taipei;
    case 168:
      return ISLLogos.TaiwanCity;
    case 160:
      return ISLLogos.Tasmania;
    case 144:
      return ISLLogos.FOG;
    case 124:
      return ISLLogos.Titanes;
    case 146:
      return ISLLogos.TorpanPojat;
    case 79:
      return ISLLogos.Ulsan;
    case 123:
      return ISLLogos.UniversidadConcepcion;
    case 110:
      return ISLLogos.Monastir;
    case 52:
      return ISLLogos.VEF;
    case 50:
      return ISLLogos.Virtus;
    case 165:
      return ISLLogos.Whai;
    case 47:
      return ISLLogos.Zalgiris;
    case 179:
      return ISLLogos.ZamalekBC;
    case 155:
      return ISLLogos.ZenitSP;

    default:
      return logoObj.Unknown;
  }
};
export const getCHLLogo = (id: number, isRetro: boolean) => {
  const logoObj = isRetro ? retro_logos : logos;
  switch (id) {
    case 1:
      return logos.Air_Force;
    case 2:
      return HCKLogos.Fairbanks;
    case 3:
      return HCKLogos.Anchorage;
    case 4:
      return HCKLogos.AIC;
    case 5:
      return HCKLogos.ArizonaState;
    case 6:
      return logos.Army;
    case 7:
      return HCKLogos.Augustana;
    case 8:
      return HCKLogos.BemidjiState;
    case 9:
      return HCKLogos.Bentley;
    case 10:
      return logos.Boston_College;
    case 11:
      return HCKLogos.BostonU;
    case 12:
      return logos.Bowling_Green;
    case 13:
      return logos.Brown;
    case 14:
      return logos.Canisius;
    case 15:
      return HCKLogos.Clarkson;
    case 16:
      return logos.Colgate;
    case 17:
      return HCKLogos.CC;
    case 18:
      return logos.Connecticut;
    case 19:
      return logos.Cornell;
    case 20:
      return logos.Dartmouth;
    case 21:
      return logos.Denver;
    case 22:
      return HCKLogos.FerrisState;
    case 23:
      return logos.Harvard;
    case 24:
      return logos.Holy_Cross;
    case 25:
      return HCKLogos.LakeSuperiorState;
    case 26:
      return logos.Lindenwood;
    case 27:
      return logos.Long_Island;
    case 28:
      return HCKLogos.Maine;
    case 29:
      return logos.UMASS;
    case 30:
      return logos.UMASS_Lowell;
    case 31:
      return HCKLogos.Mercyhurst;
    case 32:
      return logos.Merrimack;
    case 33:
      return logos.Miami_OH;
    case 34:
      return logos.Michigan;
    case 35:
      return logos.Michigan_State;
    case 36:
      return HCKLogos.MichiganTech;
    case 37:
      return HCKLogos.Minnesota;
    case 38:
      return HCKLogos.MinnesotaDuluth;
    case 39:
      return HCKLogos.MinnesotaState;
    case 40:
      return logos.New_Hampshire;
    case 41:
      return HCKLogos.Niagara;
    case 42:
      return logos.North_Dakota;
    case 43:
      return logos.Northeastern;
    case 44:
      return HCKLogos.NorthernMichigan;
    case 45:
      return logos.Notre_Dame;
    case 46:
      return logos.Ohio_State;
    case 47:
      return logos.Nebraska_Omaha;
    case 48:
      return logos.Penn_State;
    case 49:
      return logos.Princeton;
    case 50:
      return logos.Providence;
    case 51:
      return logos.Quinnipiac;
    case 52:
      return HCKLogos.RPI;
    case 53:
      return logos.Robert_Morris;
    case 54:
      return HCKLogos.Rochester;
    case 55:
      return logos.Sacred_Heart;
    case 56:
      return HCKLogos.StCloudState;
    case 57:
      return HCKLogos.StLawrence;
    case 58:
      return logos.St_Thomas;
    case 59:
      return logos.Stonehill;
    case 60:
      return HCKLogos.Union;
    case 61:
      return logos.Vermont;
    case 62:
      return logos.Western_Michigan;
    case 63:
      return logos.Wisconsin;
    case 64:
      return logos.Yale;
    case 65:
      return logos.Tennessee_State;
    case 66:
      return logos.Binghamton;
    case 67:
      return HCKLogos.SFU;
    case 68:
      return HCKLogos.UAH;
    case 69:
      return logos.UNLV;
    case 70:
      return HCKLogos.StOlafs;
    case 71:
      return logos.West_Virginia;
    case 72:
      return HCKLogos.Minot;
    case 73:
      return logos.Illinois;
    case 74:
      return HCKLogos.Oregon;
    case 75:
      return HCKLogos.BrantfordBulldogs;
    case 76:
      return HCKLogos.Kingston;
    case 77:
      return HCKLogos.Oshawa;
    case 78:
      return HCKLogos.Ottawa_67s;
    case 79:
      return HCKLogos.Peterborough;
    case 80:
      return HCKLogos.BarrieColts;
    case 81:
      return HCKLogos.Brampton;
    case 82:
      return HCKLogos.NiagaraIceDogs;
    case 83:
      return HCKLogos.NorthBay;
    case 84:
      return HCKLogos.Sudbury;
    case 85:
      return HCKLogos.Erie;
    case 86:
      return HCKLogos.Guelph;
    case 87:
      return HCKLogos.Kitchener;
    case 88:
      return HCKLogos.LondonKnights;
    case 89:
      return HCKLogos.OwenSound;
    case 90:
      return HCKLogos.Flint;
    case 91:
      return HCKLogos.Saginaw;
    case 92:
      return HCKLogos.Sarnia;
    case 93:
      return HCKLogos.SaultSteMarie;

    case 94:
      return HCKLogos.Windsor;

    default:
      return logoObj.Unknown;
  }
};
export const getPHLLogo = (id: number, isRetro: boolean) => {
  const logoObj = isRetro ? retro_logos : logos;
  switch (id) {
    case 1:
      return HCKLogos.MONT;
    case 2:
      return HCKLogos.OTT;
    case 3:
      return HCKLogos.TOR;
    case 4:
      return HCKLogos.NYI;
    case 5:
      return HCKLogos.MIN;
    case 6:
      return HCKLogos.NYR;
    case 7:
      return HCKLogos.DET;
    case 8:
      return HCKLogos.FLA;
    case 9:
      return HCKLogos.PHI;
    case 10:
      return HCKLogos.PIT;
    case 11:
      return HCKLogos.ATL;
    case 12:
      return HCKLogos.NASH;
    case 13:
      return HCKLogos.CHI;
    case 14:
      return HCKLogos.COL;
    case 15:
      return HCKLogos.MNS;
    case 16:
      return HCKLogos.KCS;
    case 17:
      return HCKLogos.CALG;
    case 18:
      return HCKLogos.UTAH;
    case 19:
      return HCKLogos.SEA;
    case 20:
      return HCKLogos.SJ;
    case 21:
      return HCKLogos.NJ;
    case 22:
      return HCKLogos.VAN;
    case 23:
      return HCKLogos.VGK;
    case 24:
      return HCKLogos.CAL;
    case 25:
      return HCKLogos.BOS;
    case 26:
      return HCKLogos.BUF;
    case 27:
      return HCKLogos.TBL;
    case 28:
      return HCKLogos.CAR;
    case 29:
      return HCKLogos.CBJ;
    case 30:
      return HCKLogos.ANA;
    case 31:
      return HCKLogos.CBJ;
    case 32:
      return HCKLogos.WAS;

    default:
      return logoObj.Unknown;
  }
};

export const getMLBLogo = (id: number, isRetro: boolean) => {
  const logoObj = isRetro ? retro_logos : logos;
  switch (id) {
    case 1:
      return BaseballLogos.NYM;
    case 2:
      return BaseballLogos.TEX;
    case 3:
      return BaseballLogos.DET;
    case 4:
      return BaseballLogos.HOU;
    case 5:
      return BaseballLogos.NYY;
    case 6:
      return BaseballLogos.MIA;
    case 7:
      return BaseballLogos.PIT;
    case 8:
      return BaseballLogos.TOR;
    case 9:
      return BaseballLogos.ARI;
    case 10:
      return BaseballLogos.MIL;
    case 11:
      return BaseballLogos.TB;
    case 12:
      return BaseballLogos.LAA;
    case 13:
      return BaseballLogos.ATL;
    case 14:
      return BaseballLogos.OAK;
    case 15:
      return BaseballLogos.COL;
    case 16:
      return BaseballLogos.CWS;
    case 17:
      return BaseballLogos.SF;
    case 18:
      return BaseballLogos.KC;
    case 19:
      return BaseballLogos.MIN;
    case 20:
      return BaseballLogos.BOS;
    case 21:
      return BaseballLogos.CLE;
    case 22:
      return BaseballLogos.CHC;
    case 23:
      return BaseballLogos.PHI;
    case 24:
      return BaseballLogos.STL;
    case 25:
      return BaseballLogos.SEA;
    case 26:
      return BaseballLogos.BAL;
    case 27:
      return BaseballLogos.LAD;
    case 28:
      return BaseballLogos.SD;
    case 29:
      return BaseballLogos.CIN;
    case 30:
      return BaseballLogos.WAS;
case 31:
      return BaseballLogos.BIRM;
case 32:
      return BaseballLogos.SPRF;
case 33:
      return BaseballLogos.CHAT;
case 34:
      return BaseballLogos.COLC;
case 35:
      return BaseballLogos.READ;
case 36:
      return BaseballLogos.MID;
case 37:
      return BaseballLogos.PORT;
case 38:
      return BaseballLogos.ARKT;
case 39:
      return BaseballLogos.PENS;
case 40:
      return BaseballLogos.NWAN;
case 41:
      return BaseballLogos.WICH;
case 42:
      return BaseballLogos.BING;
case 43:
      return BaseballLogos.CCH;
case 44:
      return BaseballLogos.HARR;
case 45:
      return BaseballLogos.FRSC;
case 46:
      return BaseballLogos.ALTO;
case 47:
      return BaseballLogos.BILX;
case 48:
      return BaseballLogos.RICH;
case 49:
      return BaseballLogos.AKRD;
case 50:
      return BaseballLogos.TENN;
case 51:
      return BaseballLogos.BOW;
case 52:
      return BaseballLogos.TULS;
case 53:
      return BaseballLogos.HART;
case 54:
      return BaseballLogos.NHFC;
case 55:
      return BaseballLogos.SA;
case 56:
      return BaseballLogos.AMAR;
case 57:
      return BaseballLogos.ERIE;
case 58:
      return BaseballLogos.RCTP;
case 59:
      return BaseballLogos.SMST;
case 60:
      return BaseballLogos.MONT;
case 61:
      return BaseballLogos.SCRA;
case 62:
      return BaseballLogos.SACR;
case 63:
      return BaseballLogos.TACO;
case 64:
      return BaseballLogos.PASO;
case 65:
      return BaseballLogos.ROCH;
case 66:
      return BaseballLogos.INDI;
case 67:
      return BaseballLogos.STPS;
case 68:
      return BaseballLogos.BUFF;
case 69:
      return BaseballLogos.SALT;
case 70:
      return BaseballLogos.JAX;
case 71:
      return BaseballLogos.DURH;
case 72:
      return BaseballLogos.SLSC;
case 73:
      return BaseballLogos.IOWA;
case 74:
      return BaseballLogos.ALBQ;
case 75:
      return BaseballLogos.NASH;
case 76:
      return BaseballLogos.RRE;
case 77:
      return BaseballLogos.TOL;
case 78:
      return BaseballLogos.GWIN;
case 79:
      return BaseballLogos.OMA;
case 80:
      return BaseballLogos.OCBC;
case 81:
      return BaseballLogos.COLU;
case 82:
      return BaseballLogos.LVAV;
case 83:
      return BaseballLogos.MEMP;
case 84:
      return BaseballLogos.CHAR;
case 85:
      return BaseballLogos.LOU;
case 86:
      return BaseballLogos.LVAL;
case 87:
      return BaseballLogos.WORS;
case 88:
      return BaseballLogos.SYRA;
case 89:
      return BaseballLogos.RENO;
case 90:
      return BaseballLogos.NOR;
case 91:
      return BaseballLogos.SPOK;
case 92:
      return BaseballLogos.TCDD;
case 93:
      return BaseballLogos.BELT;
case 94:
      return BaseballLogos.PEOR;
case 95:
      return BaseballLogos.WISC;
case 96:
      return BaseballLogos.SBC;
case 97:
      return BaseballLogos.HICK;
case 98:
      return BaseballLogos.LANS;
case 99:
      return BaseballLogos.BRKN;
case 100:
      return BaseballLogos.EVAS;
case 101:
      return BaseballLogos.WILM;
case 102:
      return BaseballLogos.ABER;
case 103:
      return BaseballLogos.EUGE;
case 104:
      return BaseballLogos.JSHO;
case 105:
      return BaseballLogos.BGHR;
case 106:
      return BaseballLogos.FWTC;
case 107:
      return BaseballLogos.WMW;
case 108:
      return BaseballLogos.WISA;
case 109:
      return BaseballLogos.ASHV;
case 110:
      return BaseballLogos.GRBR;
case 111:
      return BaseballLogos.DAYT;
case 112:
      return BaseballLogos.HILL;
case 113:
      return BaseballLogos.CRK;
case 114:
      return BaseballLogos.ROME;
case 115:
      return BaseballLogos.GLL;
case 116:
      return BaseballLogos.LCC;
case 117:
      return BaseballLogos.QCRB;
case 118:
      return BaseballLogos.GRNV;
case 119:
      return BaseballLogos.HUDV;
case 120:
      return BaseballLogos.VANC;
case 121:
      return BaseballLogos.NYM_scraps;
case 122:
      return BaseballLogos.TEX_scraps;
case 123:
      return BaseballLogos.DET_scraps;
case 124:
      return BaseballLogos.HOU_scraps;
case 125:
      return BaseballLogos.NYY_scraps;
case 126:
      return BaseballLogos.MIA_scraps;
case 127:
      return BaseballLogos.PIT_scraps;
case 128:
      return BaseballLogos.TOR_scraps;
case 129:
      return BaseballLogos.ARI_scraps;
case 130:
      return BaseballLogos.MIL_scraps;
case 131:
      return BaseballLogos.TB_scraps;
case 132:
      return BaseballLogos.ATL_scraps;
case 133:
      return BaseballLogos.LAA_scraps;
case 134:
      return BaseballLogos.OAK_scraps;
case 135:
      return BaseballLogos.SD_scraps;
case 136:
      return BaseballLogos.CWS_scraps;
case 137:
      return BaseballLogos.COL_scraps;
case 138:
      return BaseballLogos.KC_scraps;
case 139:
      return BaseballLogos.MIN_scraps;
case 140:
      return BaseballLogos.SF_scraps;
case 141:
      return BaseballLogos.BOS_scraps;
case 142:
      return BaseballLogos.CLE_scraps;
case 143:
      return BaseballLogos.CHC_scraps;
case 144:
      return BaseballLogos.PHI_scraps;
case 145:
      return BaseballLogos.STL_scraps;
case 146:
      return BaseballLogos.SEA_scraps;
case 147:
      return BaseballLogos.BAL_scraps;
case 148:
      return BaseballLogos.CIN_scraps;
case 149:
      return BaseballLogos.LAD_scraps;
case 150:
      return BaseballLogos.WAS_scraps;
case 151:
      return BaseballLogos.LELS;
case 152:
      return BaseballLogos.DMRV;
case 153:
      return BaseballLogos.HCSB;
case 154:
      return BaseballLogos.LAKE;
case 155:
      return BaseballLogos.VLIA;
case 156:
      return BaseballLogos.CFF;
case 157:
      return BaseballLogos.LHBC;
case 158:
      return BaseballLogos.JUPI;
case 159:
      return BaseballLogos.MBP;
case 160:
      return BaseballLogos.FRES;
case 161:
      return BaseballLogos.JOSE;
case 162:
      return BaseballLogos.FYTV;
case 163:
      return BaseballLogos.CARO;
case 164:
      return BaseballLogos.STCK;
case 165:
      return BaseballLogos.CWAT;
case 166:
      return BaseballLogos.TONA;
case 167:
      return BaseballLogos.STLM;
case 168:
      return BaseballLogos.CHST;
case 169:
      return BaseballLogos.KANN;
case 170:
      return BaseballLogos.FRED;
case 171:
      return BaseballLogos.TAMP;
case 172:
      return BaseballLogos.FMMM;
case 173:
      return BaseballLogos.DUNE;
case 174:
      return BaseballLogos.AUGU;
case 175:
      return BaseballLogos.MOD;
case 176:
      return BaseballLogos.BRAD;
case 177:
      return BaseballLogos.IESS;
case 178:
      return BaseballLogos.PALM;
case 179:
      return BaseballLogos.SALM;
case 180:
      return BaseballLogos.RCQ;













      default:
      return logoObj.Unknown;
  }
};







export const getCollegeBaseballLogo = (id: number, isRetro: boolean) => {
  const logoObj = isRetro ? retro_logos : logos;
  switch (id) {
case 181: return CBLLogos.AUB;
case 182: return CBLLogos.JST;
case 183: return CBLLogos.USA;
case 184: return CBLLogos.BAMA;
case 185: return CBLLogos.UAB;
case 186: return CBLLogos.SAM;
case 187: return CBLLogos.TROY;
case 188: return CBLLogos.ALST
case 189: return CBLLogos.AAMU

case 190: return CBLLogos.UNA
case 191: return CBLLogos.ARK
case 192: return CBLLogos.LR
case 193: return CBLLogos.UAPB
case 194: return CBLLogos.CARK
case 195: return CBLLogos.ARST
case 196: return CBLLogos.AZST
case 197: return CBLLogos.ZONA
case 198: return CBLLogos.GCU
case 199: return CBLLogos.UCLA

case 200: return CBLLogos.CSUF
case 201: return CBLLogos.CAL
case 202: return CBLLogos.USC
case 203: return CBLLogos.UCI
case 204: return CBLLogos.STAN
case 205: return CBLLogos.UCSB
case 206: return CBLLogos.CP
case 207: return CBLLogos.FRES
case 208: return CBLLogos.USD
case 209: return CBLLogos.SDSU

case 210: return CBLLogos.LBSU
case 211: return CBLLogos.PEPP
case 212: return CBLLogos.SCU
case 213: return CBLLogos.PAC
case 214: return CBLLogos.SJSU
case 215: return CBLLogos.UCD
case 216: return CBLLogos.CSUN
case 217: return CBLLogos.UCR
case 218: return CBLLogos.SSU
case 219: return CBLLogos.SF

case 220: return CBLLogos.LMU
case 221: return CBLLogos.SMC
case 222: return CBLLogos.UCSD
case 223: return CBLLogos.CBU
case 224: return CBLLogos.CSUB
case 225: return CBLLogos.CONN
case 226: return CBLLogos.YALE
case 227: return CBLLogos.USAF
case 228: return CBLLogos.UNCO
case 229: return CBLLogos.SHU

case 230: return CBLLogos.FAIR
case 231: return CBLLogos.CCSU
case 232: return CBLLogos.QUIN
case 233: return CBLLogos.UNH
case 234: return CBLLogos.GEOT
case 235: return CBLLogos.GW
case 236: return CBLLogos.DSU
case 237: return CBLLogos.DEL
case 238: return CBLLogos.MIAF
case 239: return CBLLogos.FLA

case 240: return CBLLogos.FSU
case 241: return CBLLogos.STET
case 242: return CBLLogos.UCF
case 243: return CBLLogos.FIU
case 244: return CBLLogos.FAU
case 245: return CBLLogos.BCU
case 246: return CBLLogos.USF
case 247: return CBLLogos.UNF
case 248: return CBLLogos.JU
case 249: return CBLLogos.ACU

case 250: return CBLLogos.FAMU
case 251: return CBLLogos.FGCU
case 252: return CBLLogos.GT
case 253: return CBLLogos.UGA
case 254: return CBLLogos.KNSW
case 255: return CBLLogos.GASO
case 256: return CBLLogos.GAST
case 257: return CBLLogos.MER
case 258: return CBLLogos.UWG
case 259: return CBLLogos.HAWI

case 260: return CBLLogos.IOWA
case 261: return CBLLogos.ILLI
case 262: return CBLLogos.NW
case 263: return CBLLogos.BRAD
case 264: return CBLLogos.WIU
case 265: return CBLLogos.UIC
case 266: return CBLLogos.NIU
case 267: return CBLLogos.ILST
case 268: return CBLLogos.SIU
case 269: return CBLLogos.SIUE

case 270: return CBLLogos.EIU
case 271: return CBLLogos.ND
case 272: return CBLLogos.IND
case 273: return CBLLogos.BALL
case 274: return CBLLogos.INST
case 275: return CBLLogos.PURD
case 276: return CBLLogos.BUT
case 277: return CBLLogos.USI
case 278: return CBLLogos.EVAN
case 279: return CBLLogos.VAL

case 280: return CBLLogos.KSST
case 281: return CBLLogos.KANS
case 282: return CBLLogos.WICH
case 283: return CBLLogos.LOU
case 284: return CBLLogos.UKEN
case 285: return CBLLogos.WKU
case 286: return CBLLogos.EKU
case 287: return CBLLogos.MORE
case 288: return CBLLogos.MUR
case 289: return CBLLogos.NKU

case 290: return CBLLogos.BELL
case 291: return CBLLogos.LSU
case 292: return CBLLogos.TLNE
case 293: return CBLLogos.LT
case 294: return CBLLogos.ULL
case 295: return CBLLogos.ULM
case 296: return CBLLogos.SELA
case 297: return CBLLogos.UNO
case 298: return CBLLogos.NWST
case 299: return CBLLogos.NICH

case 300: return CBLLogos.GRAM
case 301: return CBLLogos.SOU
case 302: return CBLLogos.MCN
case 303: return CBLLogos.NE
case 304: return CBLLogos.BC
case 305: return CBLLogos.HARV
case 306: return CBLLogos.MASS
case 307: return CBLLogos.HC
case 308: return CBLLogos.MRMK
case 309: return CBLLogos.STO

case 310: return CBLLogos.UML
case 311: return CBLLogos.UMD
case 312: return CBLLogos.NAVY
case 313: return CBLLogos.MSM
case 314: return CBLLogos.COPP
case 315: return CBLLogos.UMBC
case 316: return CBLLogos.TOW
case 317: return CBLLogos.UMES
case 318: return CBLLogos.ME
case 319: return CBLLogos.MICH

case 320: return CBLLogos.MIST
case 321: return CBLLogos.CMU
case 322: return CBLLogos.EMU
case 323: return CBLLogos.OAK
case 324: return CBLLogos.MINN
case 325: return CBLLogos.STMN
case 326: return CBLLogos.MIZZ
case 327: return CBLLogos.SEMO
case 328: return CBLLogos.SLU
case 329: return CBLLogos.LIN

case 330: return CBLLogos.MOST
case 331: return CBLLogos.MISS
case 332: return CBLLogos.MSST
case 333: return CBLLogos.USM
case 334: return CBLLogos.MSVU
case 335: return CBLLogos.JXST
case 336: return CBLLogos.ACLN
case 337: return CBLLogos.UNC
case 338: return CBLLogos.NCST
case 339: return CBLLogos.WAKE

case 340: return CBLLogos.ECU
case 341: return CBLLogos.DUKE
case 342: return CBLLogos.CHAR
case 343: return CBLLogos.UNCW
case 344: return CBLLogos.WCU
case 345: return CBLLogos.HP
case 346: return CBLLogos.UNCG
case 347: return CBLLogos.APST
case 348: return CBLLogos.DAV
case 349: return CBLLogos.UNCA

case 350: return CBLLogos.WEBB
case 351: return CBLLogos.CAMP
case 352: return CBLLogos.QUOC
case 353: return CBLLogos.NCAT
case 354: return CBLLogos.ELON
case 355: return CBLLogos.NDSU
case 356: return CBLLogos.NEB
case 357: return CBLLogos.CREI
case 358: return CBLLogos.UNOM
case 359: return CBLLogos.DART

case 360: return CBLLogos.RUTG
case 361: return CBLLogos.RID
case 362: return CBLLogos.MONM
case 363: return CBLLogos.HALL
case 364: return CBLLogos.NJIT
case 365: return CBLLogos.PRIN
case 366: return CBLLogos.FDU
case 367: return CBLLogos.SPU
case 368: return CBLLogos.NMSU
case 369: return CBLLogos.UNM

case 370: return CBLLogos.UNLV
case 371: return CBLLogos.NEV
case 372: return CBLLogos.STBK
case 373: return CBLLogos.ARMY
case 374: return CBLLogos.SJU
case 375: return CBLLogos.CAN
case 376: return CBLLogos.MRST
case 377: return CBLLogos.MAN
case 378: return CBLLogos.HOF
case 379: return CBLLogos.LEM

case 380: return CBLLogos.COLU
case 381: return CBLLogos.LIU
case 382: return CBLLogos.BING
case 383: return CBLLogos.SBON
case 384: return CBLLogos.COR
case 385: return CBLLogos.NIA
case 386: return CBLLogos.FOR
case 387: return CBLLogos.WAG
case 388: return CBLLogos.SIE
case 389: return CBLLogos.ALB

case 390: return CBLLogos.IONA
case 391: return CBLLogos.OHST
case 392: return CBLLogos.CINC
case 393: return CBLLogos.KENT
case 394: return CBLLogos.TLDO
case 395: return CBLLogos.MIAO
case 396: return CBLLogos.WRST
case 397: return CBLLogos.WMU
case 398: return CBLLogos.DAY
case 399: return CBLLogos.AKRN

case 400: return CBLLogos.BGSU
case 401: return CBLLogos.YSU
case 402: return CBLLogos.OHIO
case 403: return CBLLogos.XAV
case 404: return CBLLogos.OKLA
case 405: return CBLLogos.OKST
case 406: return CBLLogos.ORU
case 407: return CBLLogos.ORST
case 408: return CBLLogos.OREG
case 409: return CBLLogos.PORT

case 410: return CBLLogos.PITT
case 411: return CBLLogos.PNST
case 412: return CBLLogos.VILL
case 413: return CBLLogos.JOES
case 414: return CBLLogos.LAS
case 415: return CBLLogos.LAF
case 416: return CBLLogos.LEH
case 417: return CBLLogos.PENN
case 418: return CBLLogos.BUCK
case 419: return CBLLogos.MRCY

case 420: return CBLLogos.URI
case 421: return CBLLogos.BRWN
case 422: return CBLLogos.BRY
case 423: return CBLLogos.CCU
case 424: return CBLLogos.SOCA
case 425: return CBLLogos.CLEM
case 426: return CBLLogos.COFC
case 427: return CBLLogos.CIT
case 428: return CBLLogos.WOF
case 429: return CBLLogos.CHSO

case 430: return CBLLogos.UPST
case 431: return CBLLogos.PRE
case 432: return CBLLogos.WIN
case 433: return CBLLogos.SDST
case 434: return CBLLogos.TENN
case 435: return CBLLogos.VAND
case 436: return CBLLogos.MEMP
case 437: return CBLLogos.MTSU
case 438: return CBLLogos.APSU
case 439: return CBLLogos.UTM

case 440: return CBLLogos.ETSU
case 441: return CBLLogos.LIP
case 442: return CBLLogos.BEL
case 443: return CBLLogos.TNTC
case 444: return CBLLogos.TAMU
case 445: return CBLLogos.TCU
case 446: return CBLLogos.RICE
case 447: return CBLLogos.BAYL
case 448: return CBLLogos.TEX
case 449: return CBLLogos.UHOU

case 450: return CBLLogos.TTU
case 451: return CBLLogos.DBU
case 452: return CBLLogos.SHSU
case 453: return CBLLogos.LAM
case 454: return CBLLogos.UTSA
case 455: return CBLLogos.AMCC
case 456: return CBLLogos.HCU
case 457: return CBLLogos.RGV
case 458: return CBLLogos.UIW
case 459: return CBLLogos.TXST

case 460: return CBLLogos.UTA
case 461: return CBLLogos.SFA
case 462: return CBLLogos.PVAM
case 463: return CBLLogos.TAR
case 464: return CBLLogos.TXSO
case 465: return CBLLogos.UTAH
case 466: return CBLLogos.BYU
case 467: return CBLLogos.UTU
case 468: return CBLLogos.UVU
case 469: return CBLLogos.UVA

case 470: return CBLLogos.VT
case 471: return CBLLogos.LU
case 472: return CBLLogos.VCU
case 473: return CBLLogos.RAD
case 474: return CBLLogos.JMU
case 475: return CBLLogos.NORF
case 476: return CBLLogos.ODU
case 477: return CBLLogos.RICH
case 478: return CBLLogos.GMU
case 479: return CBLLogos.LONG

case 480: return CBLLogos.WandM
case 481: return CBLLogos.VMI
case 482: return CBLLogos.WASH
case 483: return CBLLogos.WAST
case 484: return CBLLogos.SEAU
case 485: return CBLLogos.GONZ
case 486: return CBLLogos.MILW
case 487: return CBLLogos.WVU
case 488: return CBLLogos.MRSH

case 489: return CBLLogos.INTAM
case 490: return CBLLogos.USHS

case 504: return CBLLogos.GUAM
case 505: return CBLLogos.SAMO

default:
      return logoObj.Unknown;
  }
};
