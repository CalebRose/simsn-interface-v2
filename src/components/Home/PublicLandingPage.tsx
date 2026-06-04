import { NavLink } from "react-router-dom";
import { fieldImage } from "../../_utility/getField";
import { simLogos } from "../../_constants/logos";
import routes from "../../_constants/routes";
import { Text } from "../../_design/Typography";
import { PublicAvailableTeamsCard } from "./PublicAvailableTeamsCard";
import { SimCFB, SimNFL, SimCBB, SimNBA, SimCHL, SimPHL, SimCBL, SimMLB } from "../../_constants/constants";

const leagueLogos = [
  [SimCFB, simLogos.SimCFB],
  [SimNFL, simLogos.SimNFL],
  [SimCBB, simLogos.SimCBB],
  [SimNBA, simLogos.SimNBA],
  [SimCHL, simLogos.SimCHL],
  [SimPHL, simLogos.SimPHL],
  [SimCBL, simLogos.SimCBL],
  [SimMLB, simLogos.SimMLB],
];

export const PublicLandingPage = () => {
  const fieldImg = fieldImage();

  return (
    <section className="relative min-h-screen w-screen overflow-hidden bg-gray-950 pt-10 text-white">
      <img
        alt="Sports field"
        src={fieldImg}
        className="absolute inset-0 h-full w-full object-cover opacity-75"
      />
      <div className="absolute inset-0 bg-black/55" />

      <main className="relative z-10 flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-10 sm:px-8">
        <div className="flex w-full max-w-5xl flex-col items-center rounded-md bg-black/75 gap-2 px-5 py-8 text-center shadow-2xl sm:px-10 lg:px-12">
          <img
            src={simLogos.SimSN}
            className="h-24 object-contain sm:h-32 lg:h-40"
            alt="SimSNLogo"
          />

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            {leagueLogos.map(([key, logo]) => (
              <img
                key={key}
                src={logo}
                className="h-10 object-contain opacity-75 sm:h-14 lg:h-16"
                alt={`${key} logo`}
              />
            ))}
          </div>

          <Text variant="h2">
            <b>Sim Sports Network</b>
          </Text>
          <Text variant="body">
            An online multiplayer sports simulation community for college and
            professional football, basketball, hockey, and baseball.
          </Text>
          <Text variant="body-small">
            Build a roster, manage a program, follow league news, and compete
            with other coaches, owners, and general managers across the SimSN
            universe.
          </Text>

          <Text variant="body-small">
            If you're not sure where to start, please join our{" "}
            <a target="_blank" href="https://discord.gg/q46vwZ83RH">
              Discord server
            </a>{" "}
            and we shall help you there.
          </Text>
          <div className="pt-2 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
            <NavLink
              to={routes.REGISTER}
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-blue-600 bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-transparent hover:text-blue-300 focus:outline-none focus:ring"
            >
              Create an account
            </NavLink>
            <NavLink
              to={routes.LOGIN}
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/70 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-gray-950 focus:outline-none focus:ring"
            >
              Log in
            </NavLink>
          </div>
          
          <PublicAvailableTeamsCard />

        </div>
      </main>
    </section>
  );
};
