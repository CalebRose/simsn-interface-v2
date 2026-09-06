# SimHockey

## Simulation College Hockey & Pro Hockey League

## Table of Contents

[Table of Contents 2](#table-of-contents)

[**Foreword 5**](#foreword)

[**Summary 6**](#summary)

[How to Sign Up 6](#how-to-sign-up)

[**Season Format 8**](#season-format)

[College Format 8](#college-format)

[Scheduling Out of Conference Games 8](#scheduling-out-of-conference-games)

[Professional Format 9](#professional-format)

[Logistics Schedule 10](#logistics-schedule)

[Standings 11](#standings)

[College Conference Tournaments 11](#college-conference-tournaments)

[College Postseason Tournament 11](#college-postseason-tournament)

[Pro Postseason Tournament 12](#pro-postseason-tournament)

[**Game Format 12**](#game-format)

[Overtime Rules 13](#overtime-rules)

[The Rink 13](#the-rink)

[Event Types 14](#event-types)

[Faceoff Events 14](#faceoff-events)

[Defense Events (Stick & Body Checks) 14](<#defense-events-(stick-&-body-checks)>)

[Pass Events 15](#pass-events)

[Agility Events 15](#agility-events)

[Shot Events 16](#shot-events)

[Momentum 17](#momentum)

[Penalty Events 17](#penalty-events)

[Penalty Types 17](#penalty-types)

[Penalty Severity 18](#penalty-severity)

[Triggering a Penalty 18](#triggering-a-penalty)

[Penalty Table 18](#penalty-table)

[Home Advantage 20](#home-advantage)

[Streaming Games 20](#streaming-games)

[**Roster Format 21**](#roster-format)

[Roster Generation 21](#roster-generation)

[Players 22](#players)

[The Center 22](#the-center)

[The Forward 23](#the-forward)

[The Defenseman 23](#the-defenseman)

[The Goalie 24](#the-goalie)

[Archetype List 24](#archetype-list)

[Attribute List 27](#attribute-list)

[Potential Grades 29](#potential-grades)

[Progression 29](#progression)

[**Gameplan & Strategy 30**](#gameplan-&-strategy)

[Systems 30](#systems)

[Offensive Systems List 30](#offensive-systems-list)

[Defensive Systems List 32](#defensive-systems-list)

[Zone-Based System Effects 34](#zone-based-system-effects)

[Archetype Compatibility 34](#archetype-compatibility)

[Intensity System 34](#intensity-system)

[Low Intensity 35](#low-intensity)

[Medium Intensity 35](#medium-intensity)

[High Intensity 35](#high-intensity)

[Lines 35](#lines)

[Lines Example: 36](#example:)

[Lines Example 1: 37](#example-1:)

[Lines Example 2: 37](#example-2:)

[Why Passing the Puck? 37](#why-passing-the-puck?)

[Explaining Further 38](#explaining-further)

[AI Gameplanning 39](#ai-gameplanning)

[Stamina & Line Strategy 40](#stamina-&-line-strategy)

[Goalies 41](#goalies)

[Regarding Goalie Stamina 41](#regarding-goalie-stamina)

[Shootouts 41](#shootouts)

[**Recruiting 43**](#recruiting)

[What’s Staying the Same 43](#what’s-staying-the-same)

[Scholarships 43](#scholarships)

[The Profile System 44](#the-profile-system)

[Program Development 45](#program-development)

[Professional Development 45](#professional-development)

[Traditions 45](#traditions)

[Facilities 46](#facilities)

[Atmosphere 46](#atmosphere)

[Academic Prestige 46](#academic-prestige)

[Coach Rating 46](#coach-rating)

[Conference Prestige 46](#conference-prestige)

[Season Momentum 47](#season-momentum)

[Dynamic Adjustments to Attributes 47](#dynamic-adjustments-to-attributes)

[Player Preferences 48](#player-preferences)

[Recruiting Points Formula 48](#recruiting-points-formula)

[Points Formula Example 1 49](#example-1)

[Points Formula Example 2 50](#example-2)

[The Pipeline System 50](#the-pipeline-system)

[Pipeline Example 1 51](#example-1-1)

[Pipeline Example 2 51](#example-2-1)

[Pipeline Example 3 51](#example-3)

[The Scouting System 52](#the-scouting-system)

[Will all potential grades be revealed once a recruit has joined a program? 52](#will-all-potential-grades-be-revealed-once-a-recruit-has-joined-a-program?)

[The Recruiting Cycle 52](#the-recruiting-cycle)

[Viewing Players 53](#viewing-players)

[Adding Players 53](#adding-players)

[Assigning Points 53](#assigning-points)

[Recruiting Sync 53](#recruiting-sync)

[**Player Generation & Distribution 54**](#player-generation-&-distribution)

[Attribute Generation 54](#attribute-generation)

[Player Origin 55](#player-origin)

[Name Generation 63](#name-generation)

[Star Generation 63](#star-generation)

[Six Star Players (Generational) 63](<#six-star-players-(generational)>)

[**The Transfer Portal 64**](#the-transfer-portal)

[Promise Weights 65](#promise-weights)

[Portal Reputation 65](#portal-reputation)

[Regarding Collegiate Expansion 69](#regarding-collegiate-expansion)

[Club Teams 70](#club-teams)

[**Graduation 70**](#graduation)

[**SimPHL 71**](#simphl)

[Inaugural Teams List 72](#inaugural-teams-list)

[Expansion Opportunities 73](#expansion-opportunities)

[Building the Initial Pro Rosters 74](#building-the-initial-pro-rosters)

[Roster Limit 74](#roster-limit)

[Free Agency 75](#free-agency)

[Contracts 75](#contracts)

[Initial Contracts 75](#initial-contracts)

[Cuts/Buyouts 75](#cuts/buyouts)

[Clauses 75](#clauses)

[Player Value 76](#player-value)

[Preferences 76](#preferences)

[Signing 77](#signing)

[Extensions 78](#extensions)

[Trades 78](#trades)

[SimPHL Draft 78](#simphl-draft)

[Drafting for Rights 79](#drafting-for-rights)

[When can a player be brought up to SimPHL? 79](#when-can-a-player-be-brought-up-to-simphl?)

[Rookie Salaries (Technical explanation) 79](<#rookie-salaries-(technical-explanation)>)

[International Leagues 80](#international-leagues)

[**1.1 Offseason Updates 81**](#1.1-offseason-updates)

[Gameplan Systems 81](#gameplan-systems)

[Injuries 81](#injuries)

[Additional Talent Pools 81](#additional-talent-pools)

[Canadian Hockey League (Jr Talent Pool) 82](<#canadian-hockey-league-(jr-talent-pool)>)

[Can users select a Canadian Hockey League team to coach? 82](#can-users-select-a-canadian-hockey-league-team-to-coach?)

[**Special Thanks 83**](#special-thanks)

#

# Foreword

_For my older brother, David._

_This management sim is a passion project for a sport that deserves more recognition than it gets. This is designed to be the final simulation that I will develop, and is intentionally designed from the ground up to run by itself for years to come._

#

# Summary

**SimHockey (SimHCK)** is the next simulation league to be introduced to **Simulation Sports Network (SimSN)**. For the first time ever, we will be hosting a hockey simulation on our site and community, and it will be available only on Interface 2.0. Within SimHCK we will host two leagues: **SimCollegeHockey (SimCHL)** and **SimProHockey (SimPHL)**.

This game is a management simulation, similar to other video games like Football Coach: College Dynasty, the Football Manager series, Out of the Park baseball series and the Franchise Hockey Manager series. This is also a fully online multiplayer simulation; meaning, teams you face may either be another player or an AI.

**SimCHL** is a simulation of the NCAA D1 Men’s Hockey sport. The league will feature all 64 D1 college hockey teams with teams located from Massachusetts to Arizona and all the way up to Alaska. Along with the current 64 D1 schools, we are also including several programs including former D1 College Hockey programs, prospective college hockey programs, and some of the best ACHA programs in the country. SimCHL features an event-driven gameplan system dependent on the puck’s location, and who currently has the puck. SimCHL also features a new recruiting system that captures the details of the institutions within the league and the respective success of the teams made within the sim league.

**SimPHL** is a simulation of the NHL but rather than aiming for current realism, we’re allowing users to take on teams that have existed at any point in the NHL's existence. Meaning, users can choose to run existing franchises like Montreal Canadiens or previously active franchises like the Atlanta Thrashers. Teams within SimPHL will need to manage their rosters, be competitive on the ice, and manage their cap through operating expenses and making revenue from their games.

Each match simulated for SimCHL and SimPHL will have at least six active players per team on the ice: One center, two forwards, two defenders, and a goalie. The goal of a user is to set up the perfect lines for your team, strategize how you want your team to perform, and score goals on the opposing team.

There are no prerequisites for requesting a team in SimCHL or SimPHL, and there’s no monetary cost. This is a passion project and will always be free to play.

## How to Sign Up

Please use the below links for registering for SimHockey.  
[**Simulation Sports Network**](https://simulationsports.net/)**:** This is our home site where we host our forums. Users can apply to teams here and write media for their teams here.

[**Discord Server**](https://discord.gg/Jj6QtPvnfZ): Most of the community activity takes place here & we stream game results in text form in our server; so you can, in theory, watch your games in real time before results are revealed.

[**Interface**](https://calebrose.io/simsn-interface-v2/):This is the custom web application used for managing our college hockey teams. The current build is in beta as we’re slowly migrating our football & basketball sims here; but hockey is fully setup and ready.

# Season Format

## College Format

There will be 34 regular season games per team against at least 17 different opponents. Teams will face the same on their schedule opponents at least twice, but can be played separately during the season. This is to allow flexibility while adhering to IRL College Hockey scheduling as much as possible.

Games will be run on Tuesdays and Thursdays at an undisclosed time.

For the postseason, each college conference will have a 4-team conference tournament, which will be followed by a 16-team post-season tournament. All conference tournament winners are automatically qualified, with the remaining top teams placed into the tournament by a select committee.

### Scheduling Out of Conference Games

Because the system itself will take care of conference scheduling, users are still responsible for scheduling **out of conference (OOC) matchups**. All teams within a conference will need to schedule between 10-12 OOC games, whereas independents will need to fill out their entire schedule.

Here are the _recommended_ rules for OOC scheduling:

- Teams with a conference are allowed to schedule the same opponent twice, given that it is a Home-and-Away series
- Independents can schedule up to four Home-And-Away series (8 games) with other independents as needed.
- Independents may schedule up to two Home-And-Away series with teams within a conference on a needed basis.

## Professional Format

The inaugural season of the PHL will feature a 52 game season with three games simulated per week (Tuesdays, Thursdays, and Saturdays). A vote will be held in the future to discuss the future format and how it will look.

After the regular season, the post season will start. A total of eight teams will qualify for the postseason, consisting of eight teams from each conference.

For each conference, the top 3 teams within each division based on total points in the standings shall automatically qualify for the playoffs. The remaining two spots in each conference will be determined by the point total of all unqualified teams remaining in the conference, regardless of the division.

In the event of a tie in point total, tiebreakers will be determined by the following in order:

1. Regulation wins
2. Regulation \+ OT Wins
3. Goal Differential

In the postseason, each team will face an opponent based on the seeding in their bracket. They will play in rounds consisting of a **best-of-seven** series. The first team to win 4 games advances to the next round.

The series format will follow SimNBA: 2-2-1-1-1 (Home, Home, Away, Away, Home, Away, Home).

The final two teams remaining in the postseason will play in the Stanley Cup Final with a chance to win the Stanley Cup.

## Logistics Schedule

SimHockey is designed to be self-running. Meaning, once the sim officially becomes active, there will be no need to turn anything off save for scheduling in the offseason.To run a season of SimHockey, the following weeks need to be tracked and will be tracked through the Interface:

| Stage | Week | Games Ran | Recruiting | Portal | FA  | Trades | Draft | College Type                     |
| :---- | :--- | :-------- | :--------- | :----- | :-- | :----- | :---- | :------------------------------- |
| 1     | 1    | Yes       | Yes        | No     | Yes | Yes    | No    | Regular Season                   |
| 2     | 2    | Yes       | Yes        | No     | Yes | Yes    | No    | Regular Season                   |
| 3     | 3    | Yes       | Yes        | No     | Yes | Yes    | No    | Regular Season                   |
| 4     | 4    | Yes       | Yes        | No     | Yes | Yes    | No    | Regular Season                   |
| 5     | 5    | Yes       | Yes        | No     | Yes | Yes    | No    | Regular Season                   |
| 6     | 6    | Yes       | Yes        | No     | Yes | Yes    | No    | Regular Season                   |
| 7     | 7    | Yes       | Yes        | No     | Yes | Yes    | No    | Regular Season                   |
| 8     | 8    | Yes       | Yes        | No     | Yes | Yes    | No    | Regular Season                   |
| 9     | 9    | Yes       | Yes        | No     | Yes | Yes    | No    | Regular Season                   |
| 10    | 10   | Yes       | Yes        | No     | Yes | No     | No    | Regular Season                   |
| 11    | 11   | Yes       | Yes        | No     | Yes | No     | No    | Regular Season                   |
| 12    | 12   | Yes       | Yes        | No     | Yes | No     | No    | Regular Season                   |
| 13    | 13   | Yes       | Yes        | No     | Yes | No     | No    | Regular Season                   |
| 14    | 14   | Yes       | Yes        | No     | Yes | No     | No    | Regular Season                   |
| 15    | 15   | Yes       | Yes        | No     | Yes | No     | No    | Regular Season                   |
| 16    | 16   | Yes       | Yes        | No     | Yes | No     | No    | Regular Season                   |
| 17    | 17   | Yes       | Yes        | No     | Yes | No     | No    | Regular Season                   |
| 18    | 18   | Yes       | No         | No     | Yes | No     | No    | Post Season (Regular season PHL) |
| 19    | 19   | Yes       | No         | No     | Yes | No     | No    | Post Season                      |
| 20    | 20   | Yes       | No         | No     | Yes | No     | No    | Post Season                      |
| 21    | 21   | Yes       | No         | No     | Yes | No     | No    | Post Season                      |
| 22    | 22   | Yes       | No         | No     | Yes | No     | No    | Post Season                      |
| 23    | 23   | No        | No         | Yes    | Yes | Yes    | No    | Offseason                        |
| 24    | 24   | No        | No         | Yes    | Yes | Yes    | No    | Offseason                        |
| 25    | 25   | No        | No         | Yes    | Yes | Yes    | No    | Offseason                        |
| 26    | 26   | No        | No         | Yes    | No  | No     | Yes   | Offseason                        |
| 27    | 27   | No        | No         | Yes    | Yes | Yes    | No    | Offseason                        |
| 28    | 28   | No        | No         | Yes    | Yes | Yes    | No    | Offseason                        |

## Standings

For both the collegiate and professional leagues, standings will be kept with the following categories: Wins, Losses, Overtime Wins, Overtime losses, and points. No team can draw in this sim.

A team that wins a game nets 3 points. A team that loses nets 0 points. A team that wins in overtime nets 2 points, and the team that loses in overtime nets 1 point. For the professional league only, standings will be sorted by point total.

## College Conference Tournaments

Each conference will host a postseason tournament during weeks 18 and 19\. During week 18, each conference will host a quarterfinals series of 3 games between the top 8 seeded teams. Once this quarterfinal series completes, week 19 will host a semifinal game followed by a finals game.

For the inaugural season, the Big Ten will host conference tournaments of the top 4 teams, with the semifinals being a best-of-3 series and a championship game thereafter. Commissioners are currently voting on whether to expand from 72 to 74 teams as a means of getting the Big Ten to 8 members so that the Big Ten can follow the standard format that all other conference hockey teams will be using.

## College Postseason Tournament

After conference tournaments are complete, the league will host a post-season tournament consisting of the top 16 teams within the league. All winners of the conference tournament are automatically qualified, followed by a points system that will determine the at-large bids of the remaining 10 spots within the tournament. Seeding will be determined by the points system, consisting of the 16 selected teams within the tournament.

There will be four rounds, consisting of a Round of 16, Quarterfinal, Semifinal (The Frozen Four), and national championship. Each round is a best-of-1, with the winner moving up to the next round within their bracket.

Once a champion has been deemed and the championship complete, the college season will be considered over.

## Pro Postseason Tournament

The PHL tournament will consist of the top 8 teams within the inaugural season. There will be three rounds: A first round, a conference finals, and then a stanley cup finals. Each round will be a best-of-7 series, with the winner moving to the next round.

The selection of teams will be determined by the winners of each division and the second-place finisher within the division.

Once a champion has been deemed and the championship complete, the pro season will be considered over.

# Game Format

Each game run through the engine simulates a game of hockey. Two opposing teams, their roster, and playbook are placed into the engine. The engine simulates a hockey game consisting of 3 periods, 20 minutes each. After the initial faceoff, the game determines a puck carrier and selects an event from a range of possible events given the current location of the puck and the puck carrier. Users can set up their lines to behave in specific manners given the puck carrier, the players on the line, and the zone in which the player is located.

Each event consists of 1-5 seconds of play, and is determined based on the player’s agility and the event occurring. More than a thousand events can occur in a single game.

## Overtime Rules

If a game is tied at the end of the third period, an overtime period of 5 minutes will start. If a team scores within the 5 minute overtime period, the game is over.

If neither team scores within the Overtime period, a shootout period will occur. Six shots by both teams are recorded and accounted for. The team that has the most points from the shootouts is declared the winner. If the shootout score between both teams is still tied after both teams have shot six times, the teams will continue rotating through their roster until a player has scored.

## The Rink

The game engine simulates five different zones within a game of hockey to represent a rink.

The **Home Goal Zone** is the area around the home team’s net and the net itself. Opposing teams (away opponents) cannot do wrist shots in the goal zone. Home goalies are able to pass the buck both within the Home Goal Zone and to the Home Zone. Penalties that occur here will move the puck to the home zone for a faceoff.

The **Home Zone** represents the area outside of the home team’s net. Opposing team members are able to do wrist shots in the home zone. Penalties occurring within this zone will trigger a faceoff from the Home Zone.

**The Neutral Zone** is the largest zone and represents the very middle of the rink. Neither team can make a shot attempt in this zone.

The **Away Zone** represents the area outside of the away team’s net. Opposing team members are able to do wrist shots in the away zone. Penalties occurring within this zone will trigger a faceoff from the Away Zone.

The **Away Goal Zone** represents the area around the away team’s net and the net itself. Opposing teams (home opponents) cannot do wrist shots in the goal zone. Away goalies are able to pass the buck both within the Away Goal Zone and to the Away Zone. Penalties that occur here will move the puck to the away zone for a faceoff.

## Event Types

There are several different events that can occur in a game of hockey. The main ones are:

- Faceoff Events
- Defense Events (Stick & Body Checks)
- Pass Events
- Agility Events
- Shot Events
- Penalty Events

### Faceoff Events

Faceoffs occur at the start of each period, after each goal, after penalties, and when the Goalie holds onto the puck too long. The Center on the active Forward Lines of both teams is selected and a calculation is made prior to the faceoff to determine each center’s modifiers and weights.

The formula is the following:  
_HomeCenterFaceoffValue \= 10 \+ Log(Home Center Faceoff Modifier, 1.7)_  
_AwayCenterFaceoffValue \= 10 \+ Log(Away Center Faceoff Modifier, 1.7)_  
_TotalValue \= HomeCenterFaceoffValue \+ AwayCenterFaceoffValue_

_Random Number (0, TotalValue)_

If the number is less than or equal to the home team’s faceoff value, then the home team wins the faceoff. Otherwise, the away team wins the faceoff.

After that, the player retrieving the puck on the faceoff is determined by a weighted list. The team who wins the faceoff receives a large boon for all of their players within the player selection formula.

Defending players on faceoffs within their defending zone receive a small boon to their weights in the player selection formula.

### Defense Events (Stick & Body Checks)

When a player has a puck, defenders have a chance of causing a defensive event as an attempt to get the puck from the player. Users can prioritize which types of checks a defending player can make in their Line Strategy.

A Body Check is a physical check of hitting against the player as a means of getting the player away from the puck, and for the defender to attain possession.

A Stick Check is a dexterity check where the defender users their stick to hit the puck away from the possessing player and intercept the puck.

Defense events feature a Critical Fail and Critical Success check. If a Critical Fail is rolled, the possessing player automatically loses the puck. If a Critical Success is rolled, the possessing player successfully holds onto the puck and wards off the defender.

In the event of neither, the possessing player’s PuckHandling is compared against the defender’s respective defensive attribute in a formulaic dice roll.

Formula: _Rand(1,20) \< Base 14 \+ Puck Handling Modifier \- (StickCheckModifier OR BodyCheckModifier)_

If the random number generated is less than the PuckHandling sum, the player keeps the puck. If it is over, the defending player receives the puck.

### Pass Events

Pass Checks are direct in that the possessing player attempts a pass to another player on their team within the zone. There is a dice roll conducted to confirm if the pass is intercepted or not.  
Formula: _Rand(1,20) \< Base 8+ Pass Modifier \- (StickCheckModifier)_

A number greater than or equal to the Pass Check means the pass is safe. If the number is less than, a defender intercepts the puck.

The list of players the possessing player can pass to on a safe pass is all players on their team, with each player’s Passing Attribute modifier used as additional weights. Depending on the zone, forwards and defenders get a separate slight edge in receiving the puck.

There are two additional variations of the Pass Event: A **Long Pass** and a **Pass Back**. A long pass is a pass that propels the puck forward into the next zone. A Pass Back is the reverse. These variations are considered to be higher-risk, longer passes, than can increase the pace of play.  
Long Pass Formula: _Rand(1,20) \< Base 12+ Pass Modifier \- (StickCheckModifier)_

### Agility Events

Agility events represent the movement of the puck from one zone of the rink to the other.  
This event features a critical check on each agility event. A critical fail increases the time consumed on the event by 2-3 seconds. A critical success allows the player to avoid a defensive check and a breakaway opportunity (if leaving the neutral zone to the attacking zone).

If there is no critical success and if the dice roll \+agility and momentum modifiers do not pass, a defensive check is done on the player entering the new zone. A defender is selected with a 50-50 chance of conducting either a stick-check or body check against the moving player.

Moving to another zone gets the possessing team closer to the opponent’s goal, giving the player the opportunity to shoot the puck.

### Shot Events

There are two types of shots that can be conducted in the engine: Slapshots and Wrist Shots. Slapshots are shots made close to the opposing goal, and wrist shots are long-distance shots made on goal.

Teams can choose where to weigh their strategy when a line has possession of the puck and when the possessing player has the puck. Depending on the type of shot selected, the attributes used drastically change.

On wrist shots only, defenders have a small chance of blocking the puck before the goalie has a chance to attempt to block. If the block succeeds, the defender receives the puck.

If there is no blocked shot, an accuracy check is done to determine whether the puck makes it near the goal. If the shot is not accurate, the puck is considered rebounded, and a calculation is done to handle the rebound and determine the possessing player.

On a shot attempt, the following attributes are used for each shot type:

- Slapshots (Close)
  - Close Shot Accuracy
  - Close Shot Power
  - Goalie Strength
  - Goalkeeping
- Wrist Shots
  - Long Shot Accuracy
  - Long Shot Power
  - Goalie Agility
  - Goalie Vision

The Close Shot formula for the shot attempt is the following:  
_Rand(1,20) \+ Log(Power Modifier \+ (One Timer Modifier \* Momentum), 1.7) \> 18 \+ Log((GoaliePhysical Modifier \+ GoalKeeping Modifier), 1.7)_

The Long Shot formula for the shot attempt is the following:  
_Rand(1,20) \+ Log(Power Modifier \+ (One Timer Modifier \* Momentum), 1.7) \> 18 \+ Log((GoaliePhysical Modifier \+ GoalieVision Modifier), 1.7)_

If the resulting number is greater than 18, then the player has scored. The puck is then moved into the neutral zone for the subsequent Faceoff event.

If the Goalie saves the puck, then the next event is either a pass from the Goalie, or the Goalie holds onto the puck, triggering a Faceoff event in the Defending Zone.

### Momentum

As the possessing player makes their way across the ice, a global value is tracked called **Momentum**. Momentum is a bonus value that scales higher every time the possessing team passes the puck and makes a breakaway.

Momentum as a modifier is used in two specific scenarios: It is added as a small weight modifier to all shot events during event selection, and it is used as a bonus modifier when shots are being calculated. The higher the momentum modifier, the more likely the success of a shot on goal.

Whenever the defending team receives possession of the puck, and once a shot is made, the momentum of the game sets back to zero.

## Penalty Events

**Penalties** are built into the engine and are a part of the sport of hockey. Different types of events can be triggered at different times and can change the pace of the game entirely. Penalties can lead to fights, power plays, and even players leaving the game entirely.

When it comes to penalties, there are a few values that are accounted for and track that indicate whether a player will trigger a penalty or not. The player’s **Aggression** value and **Discipline** value indicate the type of penalty that will likely trigger during a game and cause a ruckus on the ice. In addition, only certain types of penalties happen within certain events.

### Penalty Types

There are four general types of Penalties that can occur within the game.

**General** penalties happen at random and outside of the scope of defensive events and agility events. These penalties are categorized from having too many players on the field, unsportsmanlike conduct with the ref, delaying the game, interfering with a team’s goalie, and attempting to poke another player with their hockey stick.

**Stick Check** penalties are penalties that can occur whenever a stick check is being calculated, and can range from cross-checking, hooking, slashing, throwing the hockey stick, high-sticking, and more. The range of these penalties are from minor penalties to major penalties.

**Body Check** penalties can occur during physical defensive checks on the possessing player, and can range from checking a player from behind, boardingthe player, attempting to injure the player, holding the player, kicking, kneeing, roughing, and slew-footing the player. The range of body check penalties that can occur are Minor, Major penalties to Match Penalties, which invokes forcing the player out of the game.

Finally, **Fight** penalties only occur when a fight occurs on the ice. Two players, one from each team engage in fisticuffs, throwing off their gloves and pummeling each other on center ice. This is one of the best things about watching hockey, and we’ve done our best to emulate that into text form. Fights will always trigger a major penalty, and the following can occur during a fight: Biting, eye-gouging, headbutting, and aggressive behavior. In the event of a fight occurring, both players involved are placed into the penalty box.

### Penalty Severity

The severity of a penalty can range from 2 minutes in the penalty box, to up to five minutes in the penalty box, and forcing a player out of the game. In the case of any penalty occurring, the game is reset with a faceoff occurring within specific zones. In the event of a penalty occurring near a team’s goal zone, the puck’s location will be placed within the defending team’s zone (one zone back).

**Minor Penalties** force a player into the penalty box for 2 minutes and will trigger a power play.  
**Major Penalties** force a player into the penalty box for 5 minutes and will trigger a power play.  
**Game Misconduct** and **Match Penalties** will always force a player out of the game.

### Triggering a Penalty

In order for a penalty to trigger once a penalty has been randomly selected, the player must meet the following requirements:  
Their **Aggression** must be greater than or equal to the aggression requirement of the penalty; and their **Discipline** must be lesser or equal to the discipline requirement of the penalty.

### Penalty Table

| ID  | Name                    | Type        | Severity        | Chance | Aggression Req. | Discipline Req. |
| :-- | :---------------------- | :---------- | :-------------- | :----- | :-------------- | :-------------- |
| 1   | Aggressor Penalty       | Fight       | Match           | 0.001  | 80              | 40              |
| 2   | Attempt to Injure       | Body Check  | Match           | 0.001  | 90              | 30              |
| 3   | Biting                  | Fight       | Major           | 0.1    | 85              | 20              |
| 4   | Boarding                | Body Check  | Minor           | 1      | 70              | 50              |
| 5   | Boarding                | Body Check  | Major           | 0.1    | 75              | 40              |
| 6   | Stabbing                | General     | Game Misconduct | 0.01   | 95              | 10              |
| 7   | Charging                | Body Check  | Minor           | 1      | 75              | 40              |
| 8   | Charging                | Body Check  | Major           | 0.1    | 85              | 30              |
| 9   | Checking from Behind    | Body Check  | Minor           | 1      | 80              | 50              |
| 10  | Checking from Behind    | Body Check  | Major           | 0.1    | 85              | 40              |
| 11  | Clipping                | Body Check  | Minor           | 1      | 60              | 60              |
| 12  | Clipping                | Body Check  | Major           | 0.1    | 65              | 50              |
| 13  | Cross Checking          | Stick Check | Minor           | 1      | 75              | 50              |
| 14  | Cross Checking          | Stick Check | Major           | 0.1    | 80              | 40              |
| 15  | Delay of Game           | General     | Minor           | 1      | 50              | 80              |
| 16  | Diving                  | General     | Minor           | 1      | 30              | 70              |
| 17  | Elbowing                | Body Check  | Minor           | 1      | 65              | 60              |
| 18  | Elbowing                | Body Check  | Major           | 0.1    | 70              | 50              |
| 19  | Eye-Gouging             | Fight       | Major           | 0.1    | 90              | 20              |
| 20  | Fighting                | Fight       | Major           | 0.5    | 80              | 30              |
| 21  | Goaltender Interference | General     | Minor           | 1.5    | 55              | 70              |
| 22  | Headbutting             | Fight       | Match           | 0.001  | 95              | 20              |
| 23  | High-Sticking           | Stick Check | Minor           | 1      | 60              | 70              |
| 24  | High-Sticking           | Stick Check | Major           | 0.1    | 65              | 60              |
| 25  | Holding                 | Body Check  | Minor           | 1      | 50              | 80              |
| 26  | Hooking                 | Stick Check | Minor           | 1      | 50              | 80              |
| 27  | Hooking                 | Stick Check | Major           | 0.1    | 55              | 70              |
| 28  | Kicking                 | Body Check  | Minor           | 1      | 70              | 60              |
| 29  | Kicking                 | Body Check  | Major           | 0.1    | 75              | 50              |
| 30  | Kneeing                 | Body Check  | Minor           | 1      | 60              | 70              |
| 31  | Kneeing                 | Body Check  | Major           | 0.1    | 65              | 60              |
| 32  | Roughing                | Body Check  | Minor           | 1      | 80              | 50              |
| 33  | Roughing                | Body Check  | Major           | 0.1    | 85              | 40              |
| 34  | Slashing                | Stick Check | Minor           | 1      | 65              | 60              |
| 35  | Slashing                | Stick Check | Major           | 0.1    | 70              | 50              |
| 36  | Slew Footing            | Body Check  | Minor           | 1      | 70              | 50              |
| 37  | Slew Footing            | Body Check  | Major           | 0.1    | 75              | 40              |
| 38  | Throwing the stick      | Stick Check | Minor           | 1      | 40              | 70              |
| 39  | Too many men on the ice | General     | Minor           | 1      | 10              | 90              |
| 40  | Tripping                | Stick Check | Minor           | 1      | 50              | 80              |
| 41  | Tripping                | Stick Check | Major           | 0.1    | 55              | 70              |
| 42  | Unsportsmanlike Conduct | General     | Minor           | 1      | 85              | 40              |

## Home Advantage

In simulations, home teams will have a slight advantage against away opponents based on a specific factor: the crowd in attendance.

## Streaming Games

In one simulated game of SimHCK, over 1000 events occur and are collected in a play-by-play. Due to the scale generated from one game, play by plays will only be stored for about a week. This is to keep the league efficient while giving users the chance to watch the games they want on our discord server. In addition, only user games will be streamed on the server due to how long the streams can take (At most, 30min-1hr per game).

# Roster Format

College teams will have rosters with a maximum size of 30 players, with 28 players generated for the inaugural season. At a minimum, a roster must be comprise of:

- 8 Forwards
- 4 Centers
- 6 Defenders
- 2 Goalies (Starters and a rotational backup).

## Roster Generation

The initial rosters will consist of 28 generated players, with 7 players per class. Each yearly class will consist of 2 Forwards, a center, 2 defenders, a goalie, and one flex player.

For users that have shown interest in a specific school, they may select three players by position and archetype that will be generated. There will be a 10% boost towards the star rating generated for these players. In total, users will be able to determine the position and archetypes of 12 players on their generated roster.

## Players

The **Players** are the active players participating on the rink. In the game of Hockey, they can play one of four positions: The **Center**, the **Forward**, the **Defenseman**, and the **Goalie**. In all SimHockey leagues, positions are strict in that players in the current variation cannot switch positions or play out of position.

### The Center

The Center is an important position in SimHockey. They are currently the only position allowed to handle faceoffs against the opposing line. Their position is more akin to leading the forward line and ensuring playmaking opportunities for the team’s offense. Centers often share the same archetypes with that of the forward.

### The Forward

Forwards are a team’s offensive weapons and are players that are more-often seen within the attacking zones within the game. The Archetypes available for Centers and Forwards are **Enforcer**, **Grinder**, **Playmaker**, **Power**, **Sniper**, and **Two-Way**.

### The Defenseman

The Defenseman is the team’s defense against opposing forwards and centers. Their job is to intercept the puck and initiate the building of momentum for the team’s offense. The archetypes available for defensemen are **Enforcer**, **Offensive**, **Defensive**, and **Two-Way**.

### The Goalie

The Goalie is the last line of defense for a team. They guard the team’s defensive goal zone and the defending team’s goal. The archetypes available for goalies are **Stand-Up**, **Hybrid**, and **Butterfly**.

### Archetype List

- Enforcer
  - The Enforcer tends to have stronger intangibles regarding strength and are exceptionally more agile and have better handling of the puck. What they lack in shooting capability, they do well with holding onto the puck. They also tend to be more aggressive.
  - Strengths
    - Better Puck Handling
    - Better Strength
    - Better Agility
  - Weaknesses
    - Worse Shooting power
    - More Aggressive
- Grinder
  - Forward Grinders are considered the “Defensive Forward”. Grinders are exceptionally good with passing the puck and with conducting checks on defenders when they have the puck within their defending zone.
  - Strengths
    - Better Defense
    - Better Strength
    - Better Passing
  - Weaknesses
    - Worse puck handling
    - Worse shooting accuracy
    - Worse shooting power
- Playmaker
  - The Playmaker opens up opportunities for the team’s offense. They’re excellent at holding onto the puck and at passing.
  - Strengths
    - Better Passing
    - Better Puck Handling
  - Weaknesses
    - Worse Strength
    - Average in about everything else
- Power
  - Power Forwards have powerful shot-making capabilities and can cause tension when in attacking zones.
  - Strengths
    - Better Close Shot Power
    - Better strength
  - Weaknesses
    - Worse Long Shot Power
    - Worse defense
- Sniper
  - Snipers are excellent with the puck and taking shots on goal. What they lack in defense and physical tangibles, they do well with navigating the puck \- whether it be as a pass or as a shot on goal.
  - Strengths
    - Better Long Shot Accuracy & Power
    - Better Passing
  - Weaknesses
    - Worse slapshot (close) power
    - Worst Defense
    - Worse Strength
- Two-Way
  - Two-Way forwards are able to play both sides of the ice. They’re generally very balanced with their attributes, doing well with passing and with defensive abilities. Consider these players as a jack of all trades, master of none.
  - Strengths
    - Better passing
    - Better defense
  - Weaknesses
    - Absolutely average
- Defensive Defenseman
  - Defensive Defenders are excellent at shutting down opposing forwards and tend to have strong physical intangibles.
  - Strengths
    - Better body checking
    - Better stick Checking
    - Better strength
    - Better shot blocking
  - Weaknesses
    - Worst offensive attributes
    - Worse accuracy
    - Worse puck handling
- Enforcer Defenseman
  - Enforcers are aggressive and move exceptionally fast on the ice. They are excellent at body-checks, although worse at stick-checks. They also tend to get into fights more often.
  - Strengths
    - Best strength
    - Better body checking ability
    - Better agility
  - Weaknesses
    - Worse puck handling
    - More aggressive
    - Worse stick checking
- The Offensive Defenseman is great at stick checks and does well with passing the puck to their team’s forwards. They’re great at turning over the puck and help initiating the offensive strategy.
  - Strengths
    - Better Passing
    - Better Puck Handling
    - Better Wrist Shot
    - Better Stick Checking
  - Weaknesses
    - Worse body-checking
    - Worse strength intangibles
    - Worse slapshot
    - Worse shot blocking
- Two-Way Defenseman
  - Two-Way defenders are balanced on defensive playmaking, while tending to do worse with offensive attributes.
  - Strengths
    - Better passing
    - Better Body Check
    - Better Stick Check
  - Weaknesses
    - Worse agility
    - Worse slapshot
    - Worse wristshot
    - Worse puck handling
- Stand-Up Goalie
  - Stand-Up Goalies have great vision and do exceptionally well against long-distance wrist shots.
  - Strengths
    - Better Goalie Vision, better against wrist shots
    - Better Goalie Strength
  - Weaknesses
    - Worse goaltending, worse against slapshots
    - Worse Agility
- Hybrid Goalie
  - Hybrid Goalies are balanced in their goalkeeping attributes, being neither better nor worse at stopping wrist shots and slapshots.
    - Strengths
      - Generally balanced between goalie vision and goalkeeping
    - Weaknesses
      - Generally balanced between goalie vision and goalkeeping
- Butterfly Goalie
  - Butterfly Goalies are more agile in protecting the net and do exceptionally better with being positioned to stop slapshot attempts.
  - Strengths
    - Better Agility
    - Better Goaltending
  - Weaknesses
    - Worse Strength
    - Worse Goalie Vision

## Attribute List

Listed below are the player attributes that are used in SimHockey games.

- **Agility**
  - How fast a player can go in-between zones
- **Faceoffs**
  - Ability of the player to win faceoffs
- **Long Shot Accuracy**
  - How accurate a player is on long-distance shots
- **Long Shot Power**
  - The power behind a player’s long-distance shot ability
- **Close Shot Accuracy**
  - How accurate a player is on close shots
- **Close Shot Power**
  - The power behind a player’s close shot ability
- **One Timer**
  - Bonus modifier calculated with momentum that helps possessing player with making a successful shot. The higher the momentum the better the boost from a player’s One-Timer
- **Passing**
  - The ability of the player to pass the puck and make successful passes
- **Puck Handling**
  - The player’s ability to hold onto the puck when a defensive check occurs
- **Body Checking**
  - A physical defensive ability to obtain the puck
- **Stick Checking**
  - A non-physical, stick-focused ability to obtain the puck.
- **Shot Blocking**
  - The defensemen’s ability to block a long-distance shot being made.
- **Goalkeeping**
  - Goalkeeper’s ability to block and save close shots
- **Goalie Vision**
  - Goalkeeper’s ability to detect long shots.
- Discipline
  - Player’s ability to adhere to the rules of the game and to not cause non-physical penalties.
- Aggression
  - Player’s ability to adhere to the rules of the game and to not cause physical penalties. Also correlates to how likely the player will cause fights.
- Stamina
  - The general endurance of the player
- Injury Rating
  - How likely a player will be healthy during a game.
  - Not implemented yet.
- Discipline Deviation
  - Modifier that slightly adjusts a player’s discipline in-between games.
- Aggression Deviation
  - Modifier that slightly adjusts a player’s aggression in-between games.
- Prime Age
  - The peak of a player in developing
- Clutch
  - A small modifier that applies to the player to perform in high-profile games.
  - Not implemented yet.

### Potential Grades

In SimHockey, players will have a potential grade for each player attribute in the sim. All of the bold attributes listed above? Each one of those has a potential grade which will determine how far the skill will grow in the player’s career. The current grading goes by the following: A+, A, A-, B+, B, B-, C+, C, C-, D+, D, D-, F. The higher the grade, the higher the player’s respective attribute will grow in an offseason.

## Progression

Progression in SimHockey utilizes **Prime Age**, **Potential** attributes, and a **Growth Rate** to determine how players develop during their entire career. Growth rate is a new factor that changes based on the age of the player in their career. There are three phases for Growth rate: Pre-Prime Growth Rate, the Peak Rate, and the Regression Rate.

Pre-Prime refers to the level of growth a player will experience before they reach their **prime age**. Players will grow the most in this phase. The younger the player is from their prime age, the more likely they will continue to grow.

At a player’s **peak phase**, their growth will begin to plateau and their skills will only grow between 0-2 points. This will occur once a player has hit their prime age and the year after their prime age.

In a player’s **regression phase**, players will regress at a rate given the number of years past their prime, and an individual **decay rate** that is unique to the player only. Meaning, some players will regress faster than others, some will regress slower. The decay rate is a floating number that is set between 1 and 3, and is generated on a normalized basis with 2 being the mean. The purpose of a decay rate attribute helps with the longevity that some players experience in real life hockey careers, like Jaromir Jagr.

# Gameplan & Strategy

Users will have access to a gameplan page which will showcase a team’s **Playbook**, providing them access to customize the team’s **Offensive System**, **Defensive System**, **Lines,** and a **Shootout Lineup**. Lines will consist of a set of players, with different numbers and sets depending on if the line consists of offensive players or defense.

## Systems

Systems are a new feature for SimHockey for the 2026 Season (2nd iterative season) and beyond. Systems are the identity of your team while on the ice, and how your team behaves when on offense and defense. For SimHockey, we implemented 16 different systems – 8 offense and 8 defense – allowing up to 64 different combinations.

Systems control how your team behaves when in certain zones, player selection within each zone, and even attribute modifiers. Additionally, users can control the **Intensity** on how impactful a system can be.

### Offensive Systems List

| System           | Philosophy                                                       | Zone Effects                                                                                                                                                                                           | Archetype Fits                                                                                                                                  |
| :--------------- | :--------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------- |
| 1-2-2 Forecheck  | Balanced forechecking with two forwards pressuring, one covering | AZ: ShotBonus \+2, PassBonus \+3, TurnoverChance \-1 (slight vulnerability) NeutralZone: PassBonus \+2, AgilityBonus \+3                                                                               | Fits: Grinder (+3), Two-Way (+4), Playmaker (+2), Defensive Defensemen (+3)Anti-Fits: Power (-2)                                                |
| 2-1-2 Forecheck  | Aggressive two-forward pressure with one support                 | AGZ: TurnoverChance \+5AZ: ShotBonus \+4, StickCheckBonus \+2 (puck battles), TurnoverChance \+5 NeutralZone: AgilityBonus \+4, StickCheckBonus \+1 (battle ability), TurnoverChance \-2               | Fits: Grinder (+4), Enforcer (+5), Playmaker (+3), TwoWay (+2), Defensive D (+2) Anti-fits: Sniper (-2) \- poor defense for aggressive system   |
| 1-1-3 Forecheck  | Offensive three-forward attack with minimal backchecking         | AZ: ShotBonus \+6, PassBonus \+3, TurnoverChance \+3 NeutralZone: AgilityBonus \-2 (vulnerable due to limited coverage)                                                                                | Fits: Sniper (+5), Playmaker (+4), Power (+4) Anti-fits: Grinder (-3), Defensive D (-4) \- too defensive for aggressive offense                 |
| Cycle Game       | Possession-based offense with extended zone time                 | AGZ: ShotBonus \+5, PassBonus \+4, AgilityBonus \-3 AZ: PassBonus \+5, ShotBonus \+3, AgilityBonus \-3                                                                                                 | Fits: Playmaker (+5), Power (+4), Sniper (+4) Anti-fits: Grinder (-3), Enforcer (-2) \- skill-based system                                      |
| Quick Transition | Fast breakouts and rapid zone transitions                        | AttackingZone: PassBonus \-3, AgilityBonus \+3NeutralZone: PassBonus \+5, AgilityBonus \+5 \- your highway to offense DefendingZone: PassBonus \+4, AgilityBonus \+3 \- rapid breakout execution       | Fits: Offensive D (+5), Sniper (+4), TwoWay (+3) Anti-fits: Enforcer (-3), Power (-6) \- too slow for quick transition                          |
| 1-3-1 Umbrella   | Structured passing attack with D-man quarterback                 | AGZ: ShotBonus \+4, PassBonus \+5 AZ: PassBonus \+6, ShotBonus \-4                                                                                                                                     | Fits: Playmaker (+6), Offensive D (+5), Sniper (+4), TwoWay (+3) Anti-fits: Enforcer (-4), Grinder (-3) \- finesse system requiring skill       |
| East-West Motion | Lateral puck movement and constant player motion                 | AGZ: PassBonus \+5, AgilityBonus \+4 AZ: PassBonus \+6, AgilityBonus \+5                                                                                                                               | Fits: Playmaker (+6), Sniper (+4), TwoWay (+3), Offensive D (+3) Anti-fits: Power (-3), Enforcer (-4) \- too slow/aggressive for finesse system |
| Crash the Net    | Physical, net-front presence and rebounds                        | AGZ: ShotBonus \+6, BodyCheckBonus \+3 (net battles), TurnoverChance \-2, AgilityBonus \-3, PassBonus \+1 AZ: ShotBonus \-3, BodyCheckBonus \+2 (physical presence), TurnoverChance \-1, PassBonus \-1 | Fits: Power (+6), Enforcer (+4), Grinder (+3) Anti-fits: Playmaker (-3), Sniper (-3) \- finesse doesn't suit crashing                           |

### Defensive Systems List

| System               | Philosophy                                              | Zone Effects                                                                                                                                                                                                                         | Archetype Fits                                                                                                                                     |
| :------------------- | :------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| Balanced             | Neutral Defensive approach with versatility             | DZ: Solid checking balance (+2 stick, \+2 body) covers all scenarios DGZ: Consistent net protection (+2 stick, \+2 body) without gaps NZ: Decent puck support (+1 pass) for quick transitions                                        | Fits: TwoWay (+4), Defensive D (+2), Grinder (+2), Offensive D (+1) Anti-fits: Enforcer (-1) \- too one-dimensional                                |
| Man-to-Man           | Direct player assignment and coverage                   | DZ: Physical individual pressure (+3 stick, \+5 body) \- hit your man hard DGZ: Intimidating coverage (+4 stick, \+6 body) \- maximum physicality around the net                                                                     | Fits: Defensive D (+4), Grinder (+3) Anti-fits: None significant                                                                                   |
| Zone Defense         | Area coverage with structured positioning               | DZ: Smart positional play (+3 stick) with transition support (+4 pass) DGZ: Elite net protection (+4 stick) with physical presence (+3 body) NZ: Superior breakout capability (+3 pass) for quick transitions                        | Fits: Defensive D (+4), TwoWay (+3), Grinder (+2), Playmaker (+2) Anti-fits: Enforcer (-2), Power (-2) \- too aggressive/slow for structured zones |
| Neutral Zone Trap    | Clog neutral zone and force turnovers                   | DGZ: Elite poke-checking (+5 stick) with superior positioning (+4 agility) Turnover Creation: Force mistakes through superior positioning (+4 turnover) AZ: Maintain checking pressure (+3 stick) even when attacking                | Fits: Grinder (+5), Defensive D (+4), TwoWay (+3) Anti-fits: Offensive D (-3), Sniper (-2) \- offensive players don't suit trap                    |
| Left-Wing Lock       | Disciplined defensive structure with left-wing coverage | DZ: Superior checking coverage (+4 stick, \+3 body) through structured positioning DGZ: Extended defensive pressure (+3 stick) that continues the forechecking intensity                                                             | Fits: TwoWay (+5), Defensive D (+4), Grinder (+3) Anti-fits: Offensive D (-3), Power (-2) \- poor at disciplined defense                           |
| Aggressive Forecheck | High-pressure defensive attack in all zones             | AZ: Maximum physical pressure (+6 body, \+4 stick) creates absolute chaos Turnover Machine: Exceptional puck recovery (+5 turnover) through relentless pressure DGZ: Extend the punishment (+5 body, \+3 agility) throughout the ice | Fits: Enforcer (+5), Grinder (+4) Anti-fits: Playmaker (-3), Sniper (-4) \- finesse doesn't suit aggression                                        |
| Collapsing Defense   | Protect goal area by collapsing towards net             | DGZ: Maximum net protection (+4 body, \+3 stick) through concentrated defense DZ: Strong physical presence (+3 body, \+3 stick) throughout defensive area                                                                            | Fits: Defensive D (+5), TwoWay (+3), Enforcer (+2) Anti-fits: Offensive D (-4), Sniper (-3) \- poor at goal-area defense                           |
| Box Defense          | Structured four-player box in defensive zone            | DGZ: Elite defensive structure (+4 stick, \+3 body) around the net Penalty Kill Perfection: Designed specifically for man-down situations                                                                                            | Fits: Defensive D (+4), Grinder (+3), TwoWay (+3), Enforcer (+2) Anti-fits: Offensive D (-3), Playmaker (-2) \- too finesse for box structure      |

### Zone-Based System Effects

Each given system provides modifiers that directly impact the weighting of game events. The higher the intensity, the more likely the players will adhere to the system.

- ShotBonus: Modifier to shot attempt frequency and quality (-10 to \+10)
- PassBonus: Modifier to passing accuracy and opportunities (-10 to \+10)
- AgilityBonus: Modifier to player positioning and movement (-10 to \+10)
- StickCheckBonus: Modifier to stick checking effectiveness (defensive teams only) (-10 to \+10)
- BodyCheckBonus: Modifier to body checking power and frequency (defensive teams only) (-10 to \+10)
- TurnoverChance: Modifier to creating turnovers (positive) or vulnerability to turnovers (negative) (-10 to \+10)

## Event Selection by Zone

Every simulated tick of the game resolves as a single **event**. Your offensive and defensive systems don't just provide vague bonuses, they directly shift the weighted probability pool that the engine draws from when deciding what happens next. This section explains that pipeline precisely.

### The Event Selection Pipeline

For every active game tick, the engine runs three sequential steps:  
**Step 1 — Build Base Event Weights**  
Base weights are pulled from your lineup's zone allocations. The _Attacking Goal Zone Shot_, _Defensive Zone Pass_, _Neutral Zone Agility_ values etc. set in your gameplan for the zone where the puck currently sits. These represent your players' raw positional tendencies before any system influence.

**Step 2 — Apply System Modifiers**  
The engine then adds your system's zone-specific bonuses on top of the base weights:

\- The **possessing team's offensive system** adds to _ShotWeight_, _PassWeight_, and _AgilityWeight_.  
\- The **defending team's defensive system** adds to _StickCheckWeight_ and _BodyCheckWeight_.

Modifiers scale linearly with intensity:

_bonus \= defined_value × (intensity / 5\)_

At intensity 5 the multiplier is 1.0×; at intensity 10 it is 2.0×; at intensity 1 it is 0.2×.

**Step 3 — Roll and Resolve**  
A random float is rolled from 1 to \`totalWeight\`. The result falls into one of the event cutoff bands, and that event is executed. Higher weight \= proportionally higher probability.

### Available Events by Zone

Each zone has a fixed set of events that can be selected. Systems can only shift the weights of events that exist for that zone — they cannot add new event types.

| Zone                           | Offensive Events                    | Defensive Events        |
| :----------------------------- | :---------------------------------- | :---------------------- |
| Attacking Goal Zone            | Close Shot, Pass, Pass Back         | Stick Check, Body Check |
| Attacking Zone                 | Long Shot, Pass, Long Pass, Agility | Stick Check, Body Check |
| Neutral Zone                   | Pass, Agility                       | Stick Check, Body Check |
| Defensive Zone (own puck)      | Pass, Agility                       | Stick Check, Body Check |
| Defensive Goal Zone (own puck) | Pass, Long Pass, Agility, Faceoff\* | Stick Check, Body Check |

_\*Faceoff only triggers when the goalie is the puck carrier (covered puck)_

\> **Key Insight**: There are no shot events in the Neutral Zone, Defensive Zone, or Defending Goal Zone. Shot bonus modifiers on these zones (e.g. Quick Transition's Defending Zone pass/agility bonuses) shift the pace of breakout play, not shooting directly.

### Offensive System Event Weight Impacts

#### 1-2-2 Forecheck

| Zone           | Shot | Pass | Agility |
| :------------- | :--- | :--- | :------ |
| Attacking Zone | \+2  | \+3  | \-      |
| Neutral Zone   | \-   | \+2  | \+3     |

**Effect**: Modestly increases shot and pass options when pressuring, plus agility in transition. No bonuses at the goal mouth — finishes are left to player skill alone. The most evenly distributed offensive footprint.

#### 2-1-2 Forecheck

| Zone                | Shot | Pass | Agility |
| :------------------ | :--- | :--- | :------ |
| Attacking Goal Zone | \+4  | \-   | \-      |
| Attacking Zone      | \-   | \-   | \+4     |

**Effect**: Dramatically boosts shot attempts in the offensive zone — the two-forward pressure generates more direct shot opportunities. The large agility bonus in the neutral zone speeds up the transition back after failed attacks. Note that the _StickCheckBonus_ (+2 AZ, \+1 NZ) defined in this system affects **puck battle resolution**, not the primary event weight pool.

#### 1-1-3 Forecheck

| Zone           | Shot | Pass | Agility |
| :------------- | :--- | :--- | :------ |
| Attacking Zone | \+6  | \+3  | \-      |
| Neutral Zone   | \-   | \-   | \-2     |

**Effect**: The largest raw shot bonus of any offensive system in the attacking zone. Three forwards camping the offensive zone dramatically spike shot probability. The **\-2 agility penalty in the neutral zone** is critical, it represents the reduced coverage when committing three forwards deep, making zone exits harder if possession is lost.

#### Cycle Game

| Zone                | Shot | Pass | Agility |
| :------------------ | :--- | :--- | :------ |
| Attacking Goal Zone | \+5  | \+4  | \-      |
| Attacking Zone      | \+3  | \+5  | \-      |

**Effect**: The only offensive system that provides strong bonuses in **both** the attacking zone and the attacking goal zone simultaneously. Heavy pass weight in the attacking zone reflects possession cycling; when the puck reaches the goal mouth, both shot and pass options are elevated, giving the engine a real choice between pass-for-a-better-look or shoot from the current position.

#### Quick Transition

| Zone           | Shot | Pass | Agility |
| :------------- | :--- | :--- | :------ |
| Neutral Zone   | \-   | \+5  | \+5     |
| Defending Zone | \-   | \+4  | \+3     |

**Effect**: The only system with **zero offensive-zone modifiers**. All bonuses are concentrated in the neutral zone and own defensive zone, reflecting the philosophy that scoring comes from rapid breakouts, not sustained zone pressure. The large neutral zone pass+agility stack makes zone entries faster and more likely to result in odd-man rushes.

#### Umbrella

| Zone                | Shot | Pass | Agility |
| :------------------ | :--- | :--- | :------ |
| Attacking Goal Zone | \+4  | \+5  | \-      |
| Attacking Zone      | \+   | \+6  | \-      |

**Effect**: The highest pass bonus of any system in the attacking zone (+6). The engine will overwhelmingly lean toward pass events when in the offensive zone, simulating puck movement in search of the optimal shot. The goal zone then sees a balanced Shot+4/Pass+5 split, reflecting the umbrella's philosophy of one more pass for a better angle before firing.

#### East-West Motion

| Zone                | Shot | Pass | Agility |
| :------------------ | :--- | :--- | :------ |
| Attacking Goal Zone | \-   | \+5  | \+4     |
| Attacking Zone      | \-   | \+6  | \+5     |

**Effect**: **No shot bonuses anywhere**. This system adds zero weight to shot events. Instead, the system piles equally large bonuses into pass and agility across both offensive zones. The engine will persist in passing and repositioning far longer than any other system before a shot occurs. This can generate high-quality looks but requires many successful pass checks to reach them.

#### Crash the Net

| Zone                | Shot | Pass | Agility |
| :------------------ | :--- | :--- | :------ |
| Attacking Goal Zone | \+6  | \-   | \-      |
| Attacking Zone      | \+4  | \-   | \-      |

**Effect**: Pure shot weight, no pass or agility bonuses. The engine will select shot events at the highest combined rate of any system. The _BodyCheckBonus_ values (+3 AGZ, \+2 AZ) defined in this system influence **puck battle resolution** in net-front scrums rather than primary event selection, reflecting the physical presence in traffic.

### Defensive System Event Weight Impacts

#### Balanced

| Zone                | Stick | Body Check | Pass  |
| :------------------ | :---- | :--------- | :---- |
| Defending Zone      | \+2   | \+2        | \-    |
| Defending Goal Zone | \+2   | \+2        | \-    |
| Neutral Zone        | \-    | \-         | \+1\* |

_\*The neutral zone \`PassBonus\` here actually benefits **the possessing team's transition**, a deliberate design reflecting balanced defense's flexibility rather than aggression._

**Effect**: No zone has overwhelming defensive weight. Both stick and body check probabilities rise equally everywhere in the defensive end. The most reliable defensive profile with no obvious hole to exploit.

#### Man-to-Man

####

| Zone                | Stick | Body Check |
| :------------------ | :---- | :--------- |
| Defending Zone      | \+3   | \+5        |
| Defending Goal Zone | \+4   | \+6        |

**Effect**: By far the largest body check bonuses in the game. In the defending goal zone, body check probability gets a \+6 modifier. The engine will aggressively select body check events when opponents enter the slot. No neutral zone modifiers, meaning this system offers no trap-style resistance in transition; opponents can enter your zone more freely, but once there they face maximum physicality.

#### Zone Defense

| Zone                | Stick | Body Check | Pass  |
| :------------------ | :---- | :--------- | :---- |
| Defending Zone      | \+3   | \-         | \+4\* |
| Defending Goal Zone | \+4   | \+3        | \-    |
| Neutral Zone        | \-    | \-         | \+3\* |

_\*The neutral zone \`PassBonus\` here actually benefits **the possessing team's transition**, they represent the space that disciplined zone coverage intentionally concedes on the perimeter._

**Effect**: Heavy stick-check emphasis over body checking in the defensive zone. The pass bonuses in the defending zone and neutral zone are a design trade-off — zone defense gives up neutral-zone possession to protect high-danger areas, so the engine makes breakout passes more likely while the goal mouth gets both strong stick (+4) and physical (+3) coverage.

#### Neutral Zone Trap

| Zone           | Stick | Body Check | Agility |
| :------------- | :---- | :--------- | :------ |
| Neutral Zone   | \+5   | \-         | \+4\*   |
| Attacking Zone | \+3   | \-         | \-      |

_\*The neutral zone \`Agility\` here actually benefits **the possessing team's transition**, they represent the space that disciplined zone coverage intentionally concedes on the perimeter._

**Effect**: The only defensive system with significant bonuses in the **attacking zone and neutral zone** rather than the defensive end. Stick check probability spikes enormously in neutral ice (+5). Interceptions and poke checks become the dominant event in the trap zone. The agility bonus (+4) represents defenders reading lanes and stepping into passing seams. No defensive-zone bonuses at all: the trap is designed to prevent the opponent from ever reaching your defensive zone.

#### Left-Wing Lock

| Zone           | Stick | Body Check |
| :------------- | :---- | :--------- |
| Neutral Zone   | \+3   | \-         |
| Defending Zone | \+4   | \+3        |

**Effect**: A two-zone defensive footprint. The defending zone gets a balanced stick+4/body+3 split. The neutral zone carries a \+3 stick check bonus as the locked-in left winger maintains pressure through the middle of the ice. Compared to Man-to-Man, this system sacrifices some peak physicality for wider coverage across two zones.

#### Aggressive Forecheck

| Zone           | Stick | Body Check | Agility |
| :------------- | :---- | :--------- | :------ |
| Neutral Zone   | \-    | \+6        | \+3\*   |
| Attacking Zone | \+4   | \+5        | \-      |

_\*The neutral zone \`Agility\` here actually benefits **the possessing team's transition**, they represent the space that disciplined zone coverage intentionally concedes on the perimeter._

**Effect**: The heaviest body check bonuses for any defensive system in the **opponent's** zone (+6 AZ). This system creates high body check event probability while the puck carrier is trying to break out of their own end — reflects the swarming pressure style. The neutral zone carries \+5 body check weight, maintaining that physical harassment through the middle. No defensive-zone modifiers: if the opponent breaks through, you have no fallback structure.

#### Collapsing Defense

| Zone                | Stick | Body Check |
| :------------------ | :---- | :--------- |
| Defending Goal Zone | \+3   | \+4        |
| Defending Zone      | \+3   | \+3        |

**Effect**: Concentrated bonuses strictly in the defensive half. The goal zone places slightly more weight on body checking (+4) than stick checking (+3), reflecting physical bodies blocking lanes and engaging in net-front battles. Evenly weighted stick+3/body+3 in the broader defensive zone. No neutral zone or attacking zone presence, opponents can move freely until they reach the defensive cluster.

#### Box Defense

| Zone                | Stick | Body Check |
| :------------------ | :---- | :--------- |
| Defending Goal Zone | \+4   | \+3        |

**Effect**: The most focused defensive system **only modifies the defending goal zone**. Enormous stick check priority (+4) in the box area reflects disciplined positional sticks breaking up passing lanes. Designed specifically for penalty kills and structured man-down situations where protecting the immediate net area is the sole priority.

### System Matchup: How Both Teams Interact

Because the engine applies **both** teams' systems simultaneously, the practical probability of each event depends on the **combination** of the two systems in play. The possessing team shifts shot/pass/agility; the defending team shifts stick/body check. Neither team directly cancels the other's bonuses. They add independently to the same shared pool.

**System Example — Crash the Net vs. Man-to-Man at intensity 5, Attacking Goal Zone:**

| Event       | Base Weight | Crash the Net Adds | Man to Man Adds | Final Weight |
| :---------- | :---------- | :----------------- | :-------------- | :----------- |
| Shot        | 20          | 6                  | \-              | 26           |
| Pass        | 15          | \-                 | \-              | 15           |
| Stick Check | 15          | \-                 | 4               | 19           |
| Body Check  | 10          | \-                 | 6               | 16           |

Total pool: 76 → Shot probability: **34%** vs. raw 25%. Stick/body check probability: **46%** combined vs. 33% raw. This is the highest-contested goal-zone environment in the game.

**System Example — Quick Transition vs. Neutral Zone Trap at intensity 5, Neutral Zone:**

| Event       | Base Weight | Crash the Net Adds | Man to Man Adds | Final Weight |
| :---------- | :---------- | :----------------- | :-------------- | :----------- |
| Shot        | 20          | \+5                | \-              | 25           |
| Pass        | 15          | \+5                | \+4             | 24           |
| Stick Check | 10          | \-                 | \+5             | 15           |
| Body Check  | 10          | \-                 | \-              | 10           |

Total pool: 74 → Despite the high pass/agility weights, the trap's \+5 stick check nearly matches pass probability, creating a high-turnover neutral zone battleground — exactly the chaos both systems are designed to generate from their respective sides.

### Archetype Compatibility

Your tactical success doesn't just depend on the systems you choose \- it depends on matching those systems to the players you have. Each player archetype brings unique strengths and weaknesses that can make or break your tactical approach.

### Intensity System

Choosing a system is just the beginning \- deciding how intensely to implement it can make or break your tactical approach. Think of intensity as the volume knob on your tactical stereo. Turn it up too high with the wrong roster, and you'll create chaos. Keep it too low, and you'll never realize your team's potential.

Your system intensity determines how rigidly your players follow tactical guidelines versus playing to their natural strengths. It's the ultimate risk-reward decision in tactical hockey.

#### Low Intensity

When to Use:

- New teams still learning to play together
- Rosters with mixed archetypes that don't fit one mold
- When individual talent is more important than system adherence
- Against unpredictable opponents where flexibility matters

#### Medium Intensity

When to Use:

- Most regular season situations
- Teams with solid chemistry but diverse skill sets
- When you want tactical advantages without major risks
- Against familiar opponents where you know what works

#### High Intensity

When to Use:

- Playoff situations where you need maximum effectiveness
- Rosters built specifically for your systems
- Against opponents you've studied extensively
- When you have significant tactical advantages to exploit

Remember: Higher intensity isn't always better. It's like seasoning food \- the right amount enhances everything, too much ruins the meal.

Common Mistakes:

- Using high intensity with poorly fitting rosters (creates more problems than solutions)
- Staying at low intensity with perfect system rosters (wasting tactical advantages)
- Never adjusting intensity based on opponents or situations (tactical inflexibility)

#### Intensity as a Probability Dial

Every modifier scales as \`value × (intensity / 5)\`. This means:

| Intensity | Multiplier | Practical Effect                                              |
| :-------- | :--------- | :------------------------------------------------------------ |
| 1         | 0.2x       | System barely influences the pool \- near neutral play        |
| 3         | 0.6x       | Moderate lean towards system-preferred events                 |
| 5         | 1.0x       | Full design intent as documented above                        |
| 7         | 1.4x       | Strong system identity, opponent can read your tendencies     |
| 10        | 2.0x       | Maximum expression, all bonuses doubled, highest risk/reward. |

Running a Crash the Net at intensity 10 in the attacking goal zone adds \+12 to shot weight — roughly doubling shot probability versus a neutral distribution. Running it at intensity 1 adds only \+1.2, making the system nearly invisible in the event pool.

## Lines

To better explain, each user will have access to four Forward lines, and three Defensive lines, and two Goalie lines.

Each forward line must have two forwards and a center; each defensive line must have two defenders, and each Goalie line must have one goalie.

Users can set two Goalie lines, with each Goalie line corresponding to the alternating schedule in the college hockey season. The same Goalie **_cannot_** start on both Goalie lines.

In addition to the **Lines**, users can also access configurable options on how they want each line to behave during the simulation.

Users can define how each line behaves on both offense and defense depending on where the puck is on the rink. Users can choose to have their forwards focus more on passing in the neutral zone, prioritize close shots in the attacking zone, and many more options.

The total point count that can be accumulated for all categorized options in a line is (15 \* the number of options available in the designated zone). The range for any event within a line must be between 0 and 25\. For defensive options (body check and skill check), the total point count on defense is from 0 to 20 (10 points per option).

### Lines Example:

The Neutral Zone has two offensive options (pass & agility) and two defensive options (body check & stick check) available to customize with. This means that there are two options available within each category. Users must have up to 30 points accumulated towards both offensive options, and users must also have 30 points accumulated towards both defensive options separately.

In addition to LineBehaviors, each player on a line can have weight modifiers that stack on the Line Behaviors. The range of these modifiers goes from \-10 to 10\.

### Lines Example 1:

Player A is on Line A for the home team. Player A has the puck in the neutral zone. The home team for Line A decided to prioritize agility when in the neutral zone, as a means of attacking with the puck quicker. Line A’s Neutral Zone Agility modifier is set to 15 of 30 in weight, and their Passing modifier is set to 15 of 30\. The defense has 15 of 30 set to body check and 15 of 30 set to stick check. The total number pooled towards determining the next event is 60\.

Player A, unfortunately does not have great Agility. Fortunately, Player A’s individual modifiers for agility in the Neutral zone were set to \-10, and their passing modifier was set to 10\. So for the next event calculated, Player A has a 8% chance (5/60) of moving up the puck, and a 42% chance (25/60) of passing the puck.

### Lines Example 2:

Player B is on Line A for the home team. Player A has moved the puck to the away team’s zone and passed the puck to B. The home team for Line A has prioritized long shots when in the away team’s zone. Because of the addition of the shot option, the total customizable points for the home team goes from 30 available points to 45\. Line A’s Attacking Zone Agility modifier is set to 5 of 45 in weight, their Passing modifier is set to 15 of 45, and their shot option is set to 25 of 45\. The defense has 15 of 30 set to body check and 15 of 30 set to stick check. The total number pooled towards determining the next event is 75\.

Player B has no individual modifiers towards the decision making in the attacking zone. For the next determined event, Player B has a 33% chance of shooting the puck, 7% chance of moving up to the away team’s goal zone, a 20% chance of passing the puck, and 40% chance of encountering a defensive check (body-check or stick check).

### Why Passing the Puck?

Passing the puck gives your team the chance of retaining control of the puck, gives other playmakers on your team the chance to move across the rink and open opportunities. In addition, as explained above in the engine mechanics, teams will want to build up their **momentum** modifier.

In example 2, I provided a base explanation on how events are made in SimHockey and how the user can customize their gameplan to determine how their team behaves within specific zones. In regards to teams within their respective attacking zones (home team in away team zones, away team in home team zones), shot outcomes are not only determined by the weights set by the player, but also by how much momentum the team has. Meaning, the more the puck is passed, the more likely the team will find an open opportunity to shoot the puck; and the more likely a shot will be attempted.

### Explaining Further

Here are the available list of configurable events by zone:

- Attacking Goal Zone
  - Close Shot
  - Pass
  - Pass Back
  - Stick Check (Defense Only)
  - Body Check (Defense Only)
- Attacking Zone
  - Long Shot
  - Pass
  - Long Pass
  - Agility
  - Stick Check (Defense Only)
  - Body Check (Defense Only)
- Neutral Zone
  - Pass
  - Agility
  - Stick Check (Defense Only)
  - Body Check (Defense Only)
- Defending Zone
  - Pass
  - Pass Back
  - Agility
  - Stick Check (Defense Only)
  - Body Check (Defense Only)
- Defending Goal Zone
  - Pass
  - Long Pass
  - Agility
  - Stick Check (Defense Only)
  - Body Check (Defense Only)

## AI Gameplanning

At a glance, putting together a strategy by line will appear to be a steep curve. To mitigate this, we do provide a base template to make the process of running the lineup you want easier. On the Lineups page, clicking the “AI” button will provide a prompt and give you a number of configuration options on how you want your team to behave at a glance:

- **AI Toggle:** Enabling this will allow the game to make a lineup for you.
- **Enable Long Passes:** This will enable long passes primarily from the Defensive Goal Zone to the Defensive Zone, from the Attacking Zone to the Attacking Goal Zone, and from the Attacking Goal Zone to the Attacking Zone. Longer passes are riskier by design to help you move the puck faster.
- **Forward Shot Preference**: Will tell your forward lines to lean towards a particular shot type. Selecting “Close Shots” means that your players will lean heavily towards making shots in the Attacking Goal Zone. “Long Shots” means that your players will lean heavily towards making shots from a range in the Attacking Zone. “Balanced” is a mix of the two.
- **Defensive Shot Preference:** Same as above, but in the event one of your defenders has the puck.
- **Forward Check Preference**: Will tell your forward lines to lean towards a particular defensive check type. Selecting “Body Check” means that your players will lean towards body-checking opposing players as a means of getting the puck. “Stick Check” means that your players will lean heavily towards making stick checks to get the puck. “Balanced” is a mix of the two.
- **Defensive Check Preference:** Same as above, but for your defenders.
- **Center Sort Preference:** This allows you to set preferences for how you want the AI to sort your players, particularly your Centers. The comparison will look at your players cumulative value of the attributes selected and will sort your players in the best way possible. You can select up to 3 attributes for the sort including the following:
  - Overall (will overtake all other options)
  - Agility
  - Faceoff
  - Passing
  - Close Shot
  - Long Shot
  - Strength
  - Puck Handling
  - Body Checking
  - Stick Checking
- **Forward Sort Preference:** Same as above, but for Forwards.
- **Defender Sort Preference:** Same as above, but for Defenders.
- **Goalie Sort Preference:** Same as above, but for Goalies and with the following attributes:
  - Overall
  - Goalkeeping
  - Goalie Vision

## Stamina & Line Strategy

Each player on a line has a set Stamina. For SimHockey and all leagues that use the engine, Stamina is used to calculate how long a team is on the rink at a time. To emulate the sport of hockey as close as we can, line changes occur every 30 to 90 seconds.

For the engine, each player on their individual line (Forward Line, Defensive Line, Goalie) has their stamina accumulated with all other players and then averaged. Meaning, the stamina of a line is the average stamina of all players on that line.

For every event in a game, the stamina decrements by one. Whenever a line is out of play and off the rink, they increment their stamina by 1\.

Each event burns off 2-5 seconds from the clock. Given this knowledge, each line will likely be on the ice for about 8-18 events at a time, depending on the stamina of that line.

## Goalies

When gameplanning during the week, two goalies must be at least set per game. However, Goalies cannot start consecutive games in a week. To prevent tampering, Goalie selection is locked once games have been run starting on Day A.

The Goalie in Goalie Line 1 is expected to start for Game A, and the Goalie in Goalie Line 2 is expected to start for Game B.

#### Regarding Goalie Stamina

Goalies have incredible stamina and will generally play the entirety of a match. With this in mind, goalie stamina will work differently. Goalies will have an attribute called **Goalie Fatigue** which tracks whether or not a goalie will be able to play the next match. For each match played, based on the Goalie's stamina rating, the fatigue meter will go down. If there is not enough stamina for the goalie to start the next match, a warning will appear on the UI and will prompt the user to select a different Goalie to start.

In the case for AI teams and AI functionality, a Goalie will be selected based on their available stamina & talent rating. All available goalies with at least ¾ stamina available will be considered selectable. In the case of a user team placing a goalie as starter when they do not have enough stamina, the engine will automatically swap the goalie for another goalie that’s ready.

Goalies will generally recover stamina at the same rate.

## Shootouts

Teams will be able to assign six players as their designated shooters whenever a game goes from overtime to shootout. In addition, teams can also assign a shot type for the type of player to make when it is their turn to shoot.

A player may either rush to the goal and attempt a close shot, or prepare a wrist shot from afar and strike for the goal.

Puck Battles  
Puck around and find out (I need to fill out this section a bit more).

# Recruiting

SimCHL’s recruiting system is designed to be granular and the most varied one yet in a SimFBA simulation. Teams will be able to spend points on recruits with adjusted modifiers taking place depending on the team’s recruiting profile and the player’s preferences. In addition, there is a close to home feature that is a bit more dynamic than in other leagues.

## What’s Staying the Same

The systems from SimCFB and SimCBB where teams add players to their recruiting board, offer scholarships, and allocate points onto players will be remaining the same.

There will be three additions to SimHockey’s recruiting system for college that are going to be new: The Profile System, The Pipeline System, and the Scouting System.

## Scholarships

Scholarships may be offered or revoked from recruits at any point during the simulation. Each team has 20 scholarships available that they may offer towards recruits at a time.

When a scholarship is offered, the points allocated towards that recruit will be considered whenever the recruiting sync occurs. Meaning, the points will go towards the calculation on whether the recruit is ready to sign or not. When a scholarship is offered, the number of available scholarships to offer by the team goes down by **one**.

When a scholarship is revoked, it means that your team is not actively recruiting the player. Additionally, any points applied or previously applied will not be considered during the recruiting sync. When a scholarship is revoked, the number of available scholarships to offer by the team goes up by **one.**

Once a scholarship is revoked, a user cannot offer a scholarship back towards the recruit.

## The Profile System

The **Profile System** is a system that reflects the current state of a college athletic program in recruiting based on intangible and tangible attributes, while providing a numeric value in what a recruit may prefer for their college career. It is a prestige system designed to reward successful programs while giving other programs the chance to build based on both static attributes and the success of the conference.

Each college hockey team will have a set of nine attributes that are associated with the program's tangible and intangible attributes based on the quality of the school and the school’s facilities. Each attribute is rated between 1 and 10; 1 being the worst, 10 being the best rating.

Some attributes are dynamic; meaning that they will change every offseason based on team performance and graduating players. The remaining attributes are static due to them being qualities of the school that is being represented within the SimCHL league. These values will only change depending on if the school makes a change or an impact that correlates to one of the below attributes.

Each school will offer a different experience when recruiting with some schools being much easier to sign players with than others. For example, North Dakota, Michigan, and Boston College are powerhouse schools that will likely be the easiest to recruit for; whereas schools such as Stonehill, Lindenwood, and Canisius may have a more difficult time building their roster.

### Program Development

**Program Development** correlates to the team’s performance across the entire legacy of the sim. Meaning, depending on how the team teams from season to season, the team’s Program Development will dynamically change in each offseason.

At the start of the inaugural season, each team’s Program Development attribute will be set to 5\.

### Professional Development

**Professional Development** correlates to how often players on the team are drafted into the SimPHL. The more players are drafted into the league, the higher the bonus acquired from Professional Development.

At the start of the inaugural season, each team’s Professional Development attribute will be set to 5\.

### Traditions

**Traditions** is a reflection of the team’s IRL counterpart within the actual NCAA D1 College Hockey sport. The more successful well-known teams are given a higher rating based on the following quantifiers:

- Win/Loss Record
- Conference Championships
- Frozen Four appearances
- National Championships

Tradition will be treated as a static value.

### Facilities

The **Facilities** attribute reflects the age of the IRL hockey program of the school but also on how up to date a program’s arena, practice facilities, and locker room are. Newer facilities in the IRL program will give the SimCHL team a higher rating.

Facilities will be treated as a static value.

### Atmosphere

**Atmosphere** ties into the gameday experience for both players and attendees at the school’s home arena. The rating between 1-10 ties into the program’s home arena capacity (1 point per 1000 attendees, with a minimum of 1 and maximum of 10\. There’s some large hockey arenas in the Big Ten).

Atmosphere will be treated as a static value.

### Academic Prestige

**Academic Prestige** is rating based on how well the school does academically IRL as both a school and the athletic program.

Given that a number of schools participating in SimCHL are very acclaimed universities, the Academic Prestige rating had to be balanced with a near-even amount of teams making up each possible rating when applicable.

### Coach Rating

Coach rating is a Dynamic attribute that correlates to the coach’s overall success in the sim. This variable will fluctuate at a slightly faster rate than program momentum and will equate to the coach’s success throughout their career within the sim.

New coaches entering the league will always have a CoachRating of 5\. Once the season ends, their W/L record through the season will be applied and will generate a new rating.

### Conference Prestige

Conference Rating is a dynamic attribute that correlates to the level of play that’s involved in the team’s conference. Recruits will have some bias regarding the conference they would like to play in, depending on how competitive the conference is.

For the inaugural season, each team’s Conference Rating is 5\. At the end of every season, each team’s conference rating will be adjusted based on the post-season performance of the conference members.

### Season Momentum

Season Momentum is a dynamic attribute that correlates to how well the team performed the previous season. Like Coach Rating, Season Momentum follows a similar practice but will instead only intake the W/L record of the previous season. In addition, if a team wins any big games such as a rivalry game or a playoff game, the score will adjust.

### Dynamic Adjustments to Attributes

Program Development and Professional Development at the moment are the only variables that will be dynamic from season to season.

Program Development reflects the team’s on-ice success, and professional development reflects the team’s success in their players being drafted into the professional league.

If a team goes winless in the regular season, their **program development** will decrease by 2 points.

If a team wins less than 25% of their total games in the regular season, their **program development** will decrease by 2 points.

If a team wins less than 50% of their total games in the regular season, their **program development** will decrease by 1 point.

If a team wins 75% of their regular season games, their **program development** increases by 1 point.

If a team goes undefeated in the regular season, their **program development** increases by 2 points.

If a team makes it to the quarterfinals of the postseason tournament, their **program development** increases by 1 (non-stacking).

If a team makes it to the frozen four or is the runner-up, their **program development** increases by 2 (non-stacking).

The team that wins the national championship will have their **program development** increase by 3 (non-stacking).

A team that does not have any players drafted for more than one season will have their **professional development** decrease by 1\.

A team that has at least a player drafted in consecutive seasons will have their **professional development** increase by 1\.

A team that has at least 3 players drafted in consecutive seasons will have their **professional development** increase by 2\.

If all participating teams within a conference are defeated in the first round of the postseason tournament, their **conference prestige** will decrease by 1\.

If a team makes it to the frozen four or wins the national championship, their **conference prestige** will increase by 1\.

## Player Preferences

In the same way that each team has varying attributes, players will have their preference attributes that correlate to a team’s specific attribute. Preference attributes can range between 1 and 9; 1 being the lowest, 9 being the highest.

The player preference feature is in place instead of affinities to showcase the player’s preference regarding which kind of school they would like to play for.

Player preferences generated on each recruit will be on a normalized scale, with 5 being the expected average, with a standard deviation of 2\.

## Recruiting Points Formula

SimCHL uses team profile attributes and player preferences as part of a formula determining how impactful a team’s recruiting points are on a recruit.

The following formula compares each Team Attribute with the corresponding Player Preference attribute and forms an average using each attribute applicable. At the end of the formula, if the player is either close to home or is part of a pipeline, a small bonus is added onto the end of the modifier.

The first stage of the formula sets up a base modifier using the team attribute as a weight:

The second stage of the formula calculates the adjusted modifier based on the difference between the team’s attribute, and the player’s preference. The greater the difference between the team attribute and the player preference, the more impactful the modifier. The higher the player preference, the less impactful the modifier becomes.

And the final multiplier is calculated by the following:

If the recruit is close to home to the school, a 25% (0.25pt) bonus is applied onto the modifier. If the recruit is part of a pipeline and not close to home, a 15% (0.15pt) bonus is applied.

I’m going to showcase two examples on how the modifiers will work given a point submission of 10 points.

### Points Formula Example 1

North Dakota is recruiting Test Testaverde, a Center located in North Dakota right outside Bismark. Below are North Dakota’s team attributes and Test Testaverde’s player attributes

|                 | Program | Prof. Dev. | Traditions | Facilities | Atmosphere | Academics | Conference | Coach | Season | CTH? | Avg    | Total  |
| :-------------- | ------- | ---------- | ---------- | ---------- | ---------- | --------- | ---------- | ----- | ------ | ---- | ------ | ------ |
| North Dakota    | 5       | 5          | 10         | 9          | 10         | 7         | 5          | 5     | 5      | 0.25 |        |        |
| Test Testaverde | 5       | 5          | 5          | 5          | 5          | 5         | 5          | 5     | 5      |      |        |        |
|                 | 1       | 1          | 2          | 1.8        | 2          | 1.4       | 1          | 1     | 1      |      |        |        |
|                 | 1       | 1          | 1.5        | 1.4        | 1.5        | 1.2       | 1          | 1     | 1      |      | 1.4278 | 14.278 |

North Dakota’s biggest strengths are in its Traditions as a program and for having one of the premier arenas in NCAA College Hockey. Because of that, North Dakota’s Traditions, Facilities, and Atmosphere attributes are the most impactful attributes as part of the formula.

The average of all of the modifiers becomes 1.1778. Because Testaverde is considered a recruit that’s close to home, a 25% bonus is applied, making the modifier 1.4278

### Points Formula Example 2

Lindenwood is a fairly new program and is attempting to make waves in recruiting. They are attempting to recruit Seamus O’Conner, a Forward based in Minnesota. Here is how the calculation goes:

|                 | Program | Prof. Dev. | Traditions | Facilities | Atmosphere | Academics | Conf. | Coach | Season | CTH? | Avg    | Total |
| :-------------- | ------- | ---------- | ---------- | ---------- | ---------- | --------- | ----- | ----- | ------ | ---- | ------ | ----- |
| Lindenwood      | 5       | 5          | 4          | 6          | 2          | 5         | 5     | 5     | 5      | 0    |        |       |
| Seamus O'Conner | 5       | 5          | 2          | 9          | 9          | 5         | 9     | 9     | 5      |      |        |       |
|                 | 1       | 1          | 0.8        | 1.2        | 0.4        | 1         | 1     | 1     | 1      |      |        |       |
|                 | 1       | 1          | 1.2        | 0.7        | 0.3        | 1         | 0.6   | 0.6   | 1      |      | 0.8222 | 8.222 |

Because Lindenwood’s hockey team is just starting, they have fairly new facilities but don’t have the same traditions that many midwestern schools have. Because Seamus deeply cares about playing at a school that offers a fantastic gameday experience – rowdy fans, large arena, his name on the jumbotron; in addition, a program being in a historic conference lead by a coach who knows how to win; the points that Lindenwood spends on Seamus are less impactful. The modifier in this case averages to about 0.8222.

## The Pipeline System

The Pipeline System is an evolution of the Close to Home system that we have in SimCFB.

**Close to Home** is an additional bonus that grants schools recruiting players within their home state a bonus. The bonus is static and will not fluctuate like how Player Preference & Team attributes can.

In addition to Close to Home, schools can also acquire a **pipeline** based on the amount of players that they’ve recruited from a given state, province, or country. If a team’s current roster consists of _seven_ players originating from the same state, province, or country (**_applicable to non North American countries only_**); the pipeline bonus will be applied onto the player. The Pipeline bonus will help balance things out for teams located in dire recruiting spots such as Alaska, Arizona, Tennessee, and Maine.

Close to Home will net a 25% boost to the modifier towards the player. The pipeline bonus will net a 15% boost to the modifier towards the player.

The pipeline bonus unfortunately does not stack with the Close to Home bonus.

### Pipeline Example 1

Ferris State is recruiting Dante Ross, the long lost cousin of David Ross who happens to live in Michigan. For every point that Ferris State applies onto Dante Ross, a 25% Close to Home Bonus will be applied. In addition, Ferris State also happens to have ten players from Michigan on their roster. Even though they meet the requirements for the pipeline bonus, the pipeline bonus will _not_ stack on top because the Close to Home bonus takes precedence.

### Pipeline Example 2

Alaska-Anchorage is recruiting Jacob Kirby from Örebro, Sweden. Sweden is nowhere near Alaska, meaning the Close to Home bonus will not apply onto any points that are spent on Jacob Kirby. However, Anchorage happens to have twelve players on their roster from the country of Sweden. Meaning, the pipeline bonus is applied to all players they recruit from Sweden. So for every point that Anchorage spends on Jacob Kirby, a 15% bonus will be applied.

### Pipeline Example 3

Lake Superior State’s roster includes at least ten players from Ontario, granting them the pipeline bonus for all Canadien players from the province of Ontario. In the 2025 season, they signed at least three players from Ontario. However, at the end of the 2025 season, one of their players from the Ontario province has entered the portal, and five have graduated. They do not pick up any other players from Ontario in the portal. In the 2026 season, Lake Superior State now has seven players from the Ontario region. Because Lake Superior State no longer has ten players from Ontario, they no longer have the pipeline bonus for any recruits from the province of Ontario.

## The Scouting System

Due to the plethora of potential attributes that exist per player in the sim, I wanted to introduce a system that would make recruiting more interesting while remaining competitive. The result of this is a system that exists alongside the points system that we use and would give coaches a chance to scout and find what matters to them and their program.

The **Scouting System** is a new system where college coaches will need to scout out the potential grades of recruits in the recruiting system. It is nearly similar to the scouting system that we use for the SimNFL draft and the SimNBA draft; but this time, for recruiting. The scouting system emulates the time it takes for coaches and scouts to identify what they see in recruits whether it be game tape, or watching the team at practice.

By design, _all base attribute grades will be revealed by default_ and _all potential attributes will be hidden_ on recruitable players.

During the offseason before the first sync, teams will have access to 30 scouting points. Scouting points are a new currency in the recruiting system and can be used outside of the general points that teams may place to entice recruits into signing to their program.

Once the regular season begins and after the first sync, each team’s available scouting points will reset to 10 scouting points.

The cost of revealing a potential attribute is one scouting point. To scout a player’s potential attribute, find the attribute that you would like to reveal and click the ? button. Players will be able to view the potential grade for the attribute that they have selected.

### Will all potential grades be revealed once a recruit has joined a program?

Yes. Once a recruit officially signs and is part of the team’s roster, the coach will be able to view the player’s potential grades for all attributes.

## The Recruiting Cycle

Outside of the modifiers, SimCHL will follow a similar system to SimFBA and SimBBA in that recruiting will take place over the regular season and will use the same decision system when it comes to recruits ready to sign & make a decision.

During the regular season teams will have access to 50 applicable points and 10 scouting points per week. Teams will on average need to fill out a class of at least 7 recruits on average. There will be \~20 weeks of recruiting during the regular season and the postseason.

### Viewing Players

Players and their letter grades will be viewable from the Recruit Overview page. Potential attributes, however, will be hidden from the overview page.

### Adding Players

To add a player to your board, simply click the plus sign next to the player to add them to your board.

### Assigning Points

Users can allocate 0-20 points per recruit based on their points available. A column next to the allocation input will project the worth of the points based on the assumed multiplier towards that player.

### Recruiting Sync

The recruiting sync will follow the same principles of SimCFB and SimCBB. It will iterate player by player, and then on all active profiles on said player. Points will be applied based on the points allotted to the player and their respective multipliers. Once a player’s point threshold has been met across all competing teams, a player will then make a decision and sign with the team based on a weighted distribution of all points allocated to said player.

In order to be considered in contention, all competing teams must be within 60% of the leading team’s points.

# Player Generation & Distribution

After the initial generation of collegiate rosters, each team will have \~28 players per roster, 7 players per class. On average, recruiting class sizes will average around 7 players per signed team. The designated roster cap for each team will be set to 32 players and will be adjusted based on data & analysis during the length of the sim.

### Attribute Generation

SimHockey takes a similar approach to SimFBA’s recruit generation system, utilizing maps of each possible position+archetype combination, along with a given star rating. Players that specialize in specific archetypes will be given specific attribute maps related to their position+archetype combination. If a player does not specialize in an attribute nor is weak in a specific attribute, a default numeric attribute set is used. Attributes that a position+archetype is weak in will use an “underutilized” attribute set with generation.

Meaning, player attributes will have a value generated within a specific unnormalized range. On the other hand, the player preferences and attribute potentials are generated on a normalized range.

Player preferences are generated on a normalized range between 1 through 9, with 5 being designated the mean.

Potential attributes are generated on a normalized range with a mean set to 50, and standard deviation set to 15\. If a potential attribute matches as a strength to a player’s position and archetype, the mean is set to 60\. If the potential attribute matches as a weakness to a player’s position and archetype, the mean is set to 40\. Because attributes have individual potential attribute grades, it felt necessary to “boom” the potential attribute if it fits the position+archetype, and to “bust” the potential attribute if it does not fit the position+archetype.

Stamina, Discipline, Aggression, and Injury Rating are also generated on a normalized range (50m, 15 std.dev). However, if a player’s archetype is an Enforcer, the aggression is boosted by a random number between 10 and 30\.

### Player Origin

Players recruitable for SimCHL can be generated across the globe. For the first time ever, this simulation will include city and team data from not only the United States, but also from Canada, Sweden, and Russia. Below are the weighted distributions by Country, State, and Province.

Below are the weighted tables used to determine where a player’s country of origin is located.

| Country        | Weight |
| :------------- | :----- |
| Canada         | 40     |
| USA            | 35     |
| Sweden         | 10     |
| Russia         | 10     |
| Finland        | 8      |
| Czech Republic | 6      |
| Slovakia       | 5      |
| Germany        | 3      |
| Switzerland    | 2      |
| Latvia         | 1      |
| Norway         | 1      |
| Denmark        | 1      |
| Netherlands    | 1      |
| Belarus        | 1      |
| Ukraine        | 1      |

| State | Weight |
| :---- | :----- |
| MN    | 50     |
| MI    | 45     |
| MA    | 40     |
| NY    | 40     |
| IL    | 38     |
| WI    | 37     |
| PA    | 37     |
| ND    | 35     |
| CO    | 34     |
| OH    | 33     |
| CT    | 27     |
| VT    | 27     |
| AK    | 27     |
| NH    | 18     |
| RI    | 18     |
| ME    | 18     |
| NJ    | 16     |
| IN    | 12     |
| DE    | 11     |
| NE    | 10     |
| MT    | 10     |
| MD    | 5      |
| VA    | 5      |
| MO    | 5      |
| CA    | 5      |
| OR    | 5      |
| WA    | 5      |
| IA    | 3      |
| NM    | 3      |
| SD    | 3      |
| AZ    | 3      |
| UT    | 3      |
| WY    | 3      |
| ID    | 3      |
| NV    | 3      |
| TN    | 3      |
| NC    | 3      |
| TX    | 3      |
| KY    | 1      |
| WV    | 1      |
| SC    | 1      |
| GA    | 1      |
| AL    | 1      |
| MS    | 1      |
| FL    | 1      |
| AR    | 1      |
| LA    | 1      |
| OK    | 1      |
| KS    | 1      |
| HI    | 1      |

| Province | Weight |
| :------- | :----- |
| ON       | 40     |
| QC       | 20     |
| BC       | 10     |
| AB       | 10     |
| MB       | 8      |
| SK       | 5      |
| NS       | 3      |
| NB       | 2      |
| PE       | 1      |
| NL       | 1      |
| YT       | 1      |
| NWT      | 1      |
| NVT      | 1      |

| Province Name | Weight |
| :------------ | :----- |
| Angermanland  | 10     |
| Blekinge      | 10     |
| Bohuslan      | 10     |
| Dalarna       | 10     |
| Dalsland      | 5      |
| Gastrikland   | 8      |
| Gotland       | 5      |
| Halland       | 8      |
| Halsingland   | 6      |
| Harjedalen    | 4      |
| Jamtland      | 6      |
| Lappland      | 5      |
| Medelpad      | 8      |
| Narke         | 7      |
| Norrbotten    | 9      |
| Oland         | 3      |
| Ostergotland  | 10     |
| Skane         | 10     |
| Smaland       | 10     |
| Sodermanland  | 10     |
| Uppland       | 40     |
| Varmland      | 8      |
| Vasterbotten  | 9      |
| Vastergotland | 10     |
| Vastmanland   | 7      |

| Region Name                    | Weight |
| :----------------------------- | ------ |
| Adygea                         | 5      |
| Altai Krai                     | 5      |
| Altai Republic                 | 5      |
| Amur Oblast                    | 5      |
| Arkhangelsk Oblast             | 5      |
| Astrakhan Oblast               | 5      |
| Bashkortostan                  | 10     |
| Belgorod Oblast                | 5      |
| Bryansk Oblast                 | 5      |
| Buryatia                       | 5      |
| Chechnya                       | 5      |
| Chelyabinsk Oblast             | 10     |
| Chukotka Autonomous Okrug      | 3      |
| Chuvashia                      | 5      |
| Dagestan                       | 5      |
| Ingushetia                     | 3      |
| Irkutsk Oblast                 | 5      |
| Ivanovo Oblast                 | 5      |
| Jewish Autonomous Oblast       | 3      |
| Kabardino-Balkaria             | 5      |
| Kaliningrad Oblast             | 5      |
| Kalmykia                       | 3      |
| Kaluga Oblast                  | 5      |
| Kamchatka Krai                 | 3      |
| Karachay-Cherkessia            | 5      |
| Karelia                        | 5      |
| Kemerovo Oblast                | 8      |
| Khabarovsk Krai                | 5      |
| Khakassia                      | 5      |
| Khanty-Mansi Autonomous Okrug  | 8      |
| Kirov Oblast                   | 5      |
| Komi                           | 5      |
| Kostroma Oblast                | 3      |
| Krasnodar Krai                 | 10     |
| Krasnoyarsk Krai               | 13     |
| Kurgan Oblast                  | 5      |
| Kursk Oblast                   | 5      |
| Leningrad Oblast               | 8      |
| Lipetsk Oblast                 | 5      |
| Magadan Oblast                 | 3      |
| Mari El                        | 3      |
| Mordovia                       | 5      |
| Moscow                         | 40     |
| Moscow Oblast                  | 30     |
| Murmansk Oblast                | 5      |
| Nenets Autonomous Okrug        | 2      |
| Nizhny Novgorod Oblast         | 10     |
| North Ossetia-Alania           | 3      |
| Novgorod Oblast                | 5      |
| Novosibirsk Oblast             | 13     |
| Omsk Oblast                    | 10     |
| Orenburg Oblast                | 8      |
| Oryol Oblast                   | 5      |
| Penza Oblast                   | 5      |
| Perm Krai                      | 8      |
| Primorsky Krai                 | 8      |
| Pskov Oblast                   | 3      |
| Rostov Oblast                  | 8      |
| Ryazan Oblast                  | 5      |
| Sakha (Yakutia)                | 3      |
| Sakhalin Oblast                | 3      |
| Samara Oblast                  | 10     |
| Saratov Oblast                 | 5      |
| Saint Petersburg               | 30     |
| Smolensk Oblast                | 5      |
| Stavropol Krai                 | 5      |
| Sverdlovsk Oblast              | 10     |
| Tambov Oblast                  | 5      |
| Tatarstan                      | 10     |
| Tomsk Oblast                   | 5      |
| Tuva                           | 3      |
| Tula Oblast                    | 5      |
| Tver Oblast                    | 5      |
| Tyumen Oblast                  | 8      |
| Udmurtia                       | 5      |
| Ulyanovsk Oblast               | 5      |
| Vladimir Oblast                | 5      |
| Volgograd Oblast               | 5      |
| Vologda Oblast                 | 5      |
| Voronezh Oblast                | 8      |
| Yamalo-Nenets Autonomous Okrug | 5      |
| Yaroslavl Oblast               | 8      |
| Zabaykalsky Krai               | 5      |

### Name Generation

In SimCFB, players were generated with the given knowledge they are from the United States. College Player generation in SimCBB uses very similar tables, though the naming conventions of players generated outside the United States does not reflect the name and familial customs of the player’s designated country. This was partially resolved with the further development of the International Super League (ISL), where we use a name generation system that matches a player’s country of origin to an individual set list of first names and last names that are common or originate from that country.

For SimHockey, we’re using the same name generation system from the ISL and have expanded on it to include the first names and last names of famous hockey players. Players generated in SimHockey will have a first and last name that reflects their country of origin.

### Star Generation

Stars represent the level of initial talent a player is generated with at the start of their career as a high school player. Star rating generates the baseline and does not reflect the growth and potential that a player will have during the course of their career.

The following weights reflect how likely a player will be generated with the following level of talent.

| Star | Odds        |
| :--- | :---------- |
| 1    | 349 of 1000 |
| 2    | 300 of 1000 |
| 3    | 230 of 1000 |
| 4    | 80 of 1000  |
| 5    | 40 of 1000  |
| 6    | 1 of 1000   |

### Six Star Players (Generational)

Unique to SimHockey, Six Star players are generational players that often come every so-often in the sim. Think of these players like Wayne Gretzky, Alexander Ovechkin, Connor McDavid, and Nathan McKinnon. Six Star players are by design intended to be drafted earlier into the SimPHL than other players and will have a more immediate impact.

Six Star players during high school recruiting will be shown as five star players by design, but the details will lie in their player attributes.

# The Transfer Portal

The Transfer Portal designed for SimCHL is exactly that of which we have in SimCFB.  
Players will announce their intention after progressions run, with coaches given one week to commit a promise to players with the intent of having them stay on their team. Any players that do **not** commit enter the portal.

There will be 8 weeks of the transfer portal, with coaches able to create one promise for each player on their board, and being able to commit up to 10 points per player, with a max of 50 spread across all players.

Users will also be able to scout out the potential grade attributes of players during the transfer portal. Each team will be given 100 scouting points total while the transfer portal is active. Points will not reaccumulate in-between portal syncs.

The decision system will be the same one as which we use for SimCHL recruiting. All teams within 66% of the leading team’s points will be in consideration.

Please promise players at your own discretion. The following types of promises are allowed below:

- Wins for the season
- No redshirt
- Number of minutes played per game
- Line placement (Non-goalies only. Lowest number applicable at 3.)
- Winning the conference
- Making it to the post-season tournament
- Making it to the Frozen Four.
- Winning the national championship

Promises are high risk by design. While a player can commit to only one promise at a time, users can make as many promises as they want to any number of players. There's no limit. With that in mind, the coaches are responsible to ensure that the promises are fulfilled within the next season.

During the transfer intention phase, promises are used to retain the player. During the transfer portal phase, promises can be made to add a multiplier to ensure the players you're targeting sign with you. The higher the promise, the higher the multiplier.

### Promise Weights

Promises during the transfer portal can be made to players as a means of making your points submitted on the player more impactful. The larger the weight of the promise, the higher the multiplier and the higher your points will go.  
It should be noted, however, that

### Portal Reputation

Portal Reputation is the final multiplier toward points submissions in this stage. Portal Reputation is a long-term modifier that is designed to reward/deter coaches based on the promises committed onto players through player retention and the transfer portal.

If a coach has a high portal reputation, players will be more likely to consider the points submission of the coach and the promise.

If a coach has a low portal reputation, points submissions on players will be less effective.

The starting portal reputation for a coach is set to 100\. The range for portal reputation values is between 1-120. Meaning that a coach that successfully promises can find benefits; and a coach that has promises fail will struggle.

Portal Reputation will adjust at the end of the next season during the next season’s Transfer Portal Intention Sync. Any promise that succeeds or fails will adjust the reputation of the coach in the following manner:

**Success**:

- Extremely Low: 1 point (if a coach’s reputation is above 100, 0 points)
- Very Low Priority: 3 points (if a coach’s reputation is above 100, 0 points)
- Low Priority: 5 points (if a coach’s reputation is at 100 or above, 1 points)
- Medium Priority: 10 points (If a coach’s reputation is at 100 or above, 3 points)
- High Priority: 15 points (If a coach’s reputation is at 100 or above, 5 points)
- Very High: 20 points (If a coach’s reputation is at 100 or above, 7 points)
- Extremely High: 25 points (If a coach’s reputation is at 100 or above, 10 points)
- National Championship: 30 points (If a coach’s reputation is at 100 or above, 15 points)

**Failure**:

- Extremely Low: \-10 points
- Very Low Priority: \-7 points
- Low Priority: \-5 points
- Medium Priority: \- 10 points
- High Priority: \-20 points
- Very High: \- 25 points
- Extremely High: \- 35 points
- National Championship: \- 45 points

**The case with Extremely Low**: The only category where Extremely Low is available is if the team wins only once during the entire season. If in the event the user does not win one game during the entire regular season, including losing the Toilet Bowl; at this point, the player you made that ridiculous promise to would be disappointed.

# The Teams

SimCHL will feature 72 teams across the United States including six conferences and five independent schools. Schools from New England all the way to Alaska.

| Team Name              | Mascot          | Abbreviation | Conference  | City             | State |
| :--------------------- | :-------------- | :----------- | :---------- | :--------------- | :---- |
| Air Force              | Falcons         | USAF         | AHA         | Colorado Springs | CO    |
| American International | Yellow Jackets  | AIC          | AHA         | Springfield      | MA    |
| Army                   | Black Knights   | ARMY         | AHA         | West Point       | NY    |
| Bentley                | Falcons         | BENT         | AHA         | Waltham          | MA    |
| Canisius               | Golden Griffins | CANI         | AHA         | Buffalo          | NY    |
| Holy Cross             | Crusaders       | HC           | AHA         | Worcester        | MA    |
| Mercyhurst             | Lakers          | MRCY         | AHA         | Erie             | PA    |
| Niagara                | Purple Eagers   | NU           | AHA         | Lewiston         | NY    |
| Robert Morris          | Colonials       | RMU          | AHA         | Moon Township    | PA    |
| Rochester              | Tigers          | RIT          | AHA         | Rochester        | NY    |
| Sacred Heart           | Pioneers        | SHU          | AHA         | Fairfield        | CT    |
| Michigan               | Wolverines      | MICH         | Big Ten     | Ann Arbor        | MI    |
| Michigan State         | Spartans        | MSU          | Big Ten     | East Lansing     | MI    |
| Minnesota              | Golden Gophers  | MINN         | Big Ten     | Minneapolis      | MN    |
| Notre Dame             | Fighting Irish  | ND           | Big Ten     | South Bend       | IN    |
| Ohio State             | Buckeyes        | OSU          | Big Ten     | Columbus         | OH    |
| Penn State             | Nittany Lions   | PNST         | Big Ten     | State College    | PA    |
| Wisconsin              | Badgers         | WISC         | Big Ten     | Madison          | WI    |
| Augustana              | Vikings         | AGUS         | CCHA        | Sioux Falls      | SD    |
| Bemidji State          | Beavers         | BEMI         | CCHA        | Bemidji          | MN    |
| Bowling Green State    | Falcons         | BGSU         | CCHA        | Bowling Green    | OH    |
| Ferris State           | Bulldogs        | FRST         | CCHA        | Big Rapids       | MI    |
| Lake Superior State    | Lakers          | LSS          | CCHA        | Sault Ste. Marie | MI    |
| Michigan Tech          | Huskies         | MTU          | CCHA        | Houghton         | MI    |
| Minnesota State        | Mavericks       | MSU          | CCHA        | Mankato          | MN    |
| Northern Michigan      | Wildcats        | NMU          | CCHA        | Marquette        | MI    |
| St. Thomas             | Tommies         | STMN         | CCHA        | Saint Paul       | MN    |
| Brown                  | Bears           | BRWN         | ECAC        | Providence       | RI    |
| Clarkson               | Golden Knights  | CLRK         | ECAC        | Potsdam          | NY    |
| Colgate                | Raiders         | COLG         | ECAC        | Colgate          | NY    |
| Cornell                | Big Red         | COR          | ECAC        | Ithaca           | NY    |
| Dartmouth              | Big Green       | DART         | ECAC        | Hanover          | NH    |
| Harvard                | Crimson         | HARV         | ECAC        | Cambridge        | MA    |
| Princeton              | Tigers          | PRIN         | ECAC        | Princeton        | NJ    |
| Quinnipiac             | Bobcats         | QUIN         | ECAC        | Hamden           | CT    |
| RPI                    | Engineers       | RPI          | ECAC        | Troy             | NY    |
| St. Lawrence           | Saints          | STL          | ECAC        | Canton           | NY    |
| Union                  | Garnet Chargers | UNION        | ECAC        | Schenectady      | NY    |
| Yale                   | Bulldogs        | YALE         | ECAC        | New Haven        | CT    |
| Boston College         | Eagles          | BC           | Hockey East | Chestnut Hill    | MA    |
| Boston University      | Terriers        | BU           | Hockey East | Boston           | MA    |
| UConn                  | Huskies         | CONN         | Hockey East | Storrs           | CT    |
| Maine                  | Black Bears     | ME           | Hockey East | Orono            | ME    |
| UMass                  | Minutemen       | MASS         | Hockey East | Amherst          | MA    |
| UMass-Lowell           | River Hawks     | UML          | Hockey East | Lowell           | MA    |
| Merrimack              | Warriors        | MRMK         | Hockey East | North Andover    | MA    |
| New Hampshire          | Wildcats        | UNH          | Hockey East | Durham           | NH    |
| Northeastern           | Huskies         | NE           | Hockey East | Boston           | MA    |
| Providence             | Friars          | PROV         | Hockey East | Providence       | RI    |
| Vermont                | Catamounts      | VT           | Hockey East | Burlington       | VT    |
| Fairbanks              | Nanooks         | UAF          | Independent | Fairbanks        | AK    |
| Anchorage              | Seawolves       | UAA          | Independent | Anchorage        | AK    |
| Lindenwood             | Lions           | LIND         | Independent | St. Charles      | MO    |
| Long Island            | Sharks          | LIU          | Independent | Brooklyn         | NY    |
| Stonehill              | Skyhawks        | STON         | Independent | Easton           | MA    |
| UNLV                   | Rebels          | UNLV         | Independent | Las Vegas        | NV    |
| West Virginia          | Mountaineers    | WVU          | Independent | Morgantown       | WV    |
| Alabama-Huntsville     | Chargers        | UAH          | Independent | Huntsville       | AL    |
| Simon Fraser           | Red Leafs       | SFU          | Independent | Vancouver        | BC    |
| Binghamton             | Bearcats        | BING         | Independent | Binghamton       | NY    |
| Tennessee State        | Tigers          | TNST         | Independent | Nashville        | TN    |
| Minot State            | Beavers         | MINOT        | Independent | Minot            | ND    |
| St. Olaf’s             | Oles            | OLAF         | Independent | Northfield       | MN    |
| Arizona State          | Sun Devils      | ASU          | NCHC        | Tempe            | AZ    |
| Colorado College       | Tigers          | CC           | NCHC        | Colorado Springs | CO    |
| Denver                 | Pioneers        | DU           | NCHC        | Denver           | CO    |
| Miami (OH)             | RedHawks        | MIAO         | NCHC        | Oxford           | OH    |
| Minnesota-Duluth       | Bulldogs        | MND          | NCHC        | Duluth           | MN    |
| North Dakota           | Fighting Hawks  | UND          | NCHC        | Grand Forks      | ND    |
| Nebraska-Omaha         | Mavericks       | UNO          | NCHC        | Omaha            | NE    |
| St. Cloud State        | Huskies         | STCL         | NCHC        | St. Cloud        | MN    |
| WMU                    | Broncos         | WMU          | NCHC        | Kalamazoo        | MI    |
| Tennessee State        | Tigers          | TNST         | Independent | Nashville        | TN    |
| Binghamton             | Bearcats        | BING         | Independent | Binghamton       | NY    |
| Simon Fraser           | Red Leafs       | SFU          | Independent | Surrey           | BC    |
| UNLV                   | Rebels          | UNLV         | Independent | Las Vegas        | NV    |
| Minot State            | Beavers         | MINOT        | Independent | Minot            | ND    |
| West Virginia          | Mountaineers    | WVU          | Independent | Morgantown       | WV    |
| St. Olaf’s             | Oles            | OLAF         | Independent | Northfield       | MN    |
| Alabama-Huntsville     | Chargers        | UAH          | Independent | Huntsville       | AL    |

## Regarding Collegiate Expansion

For SimCHL, scheduling has been set and optimized with 72 teams in mind. Due to issues with OOC scheduling, we have added some potential D1 teams, former D1 hockey programs, and club teams to SimCHL.

The teams with first priority of expansion are teams with intentions of entering the IRL NCAA D1 Hockey league; the next teams in priority with those with previous membership in the league (teams that had to either drop from D1 or drop their team entirely).

Here is the current shortlist of teams in consideration:

- Illinois Illini (potential D1/Club)
- Utah Utes (Club)
- Oklahoma Sooners (Club)
- Arizona Wildcats (Club)
- Oregon Ducks (Club)
- Syracuse Orange
- Rhode Island Rams
- California Golden Bears
- Montana State Bobcats
- Jamestown Jimmies
- Utah State Aggies
- Delaware Blue Hens
- _University of Guam Tritons (once hell freezes over)_

### Club Teams

In the event that the above shortlist of teams have been added to the league and if there is further interest in adding spots to the college hockey leagues, I will consider the following options:

- Adding club leagues to the college leagues as independents/club conferences
- Adding USport teams (Canadian Colleges) to the college league.

In the event that club leagues are added, their attributes will be treated based on real-life attributes of the school’s club team. Meaning, the team attributes for the University of Oregon’s club team will be based on where the club team plays, who they compete against, and how successful the club is. This will likely mean that club teams will have a higher difficulty in recruiting than existing D1 programs.

In the event that we add USport teams, the Canadian schools will be treated based on the real-life attributes of their school’s hockey programs.

# Graduation

There are two ways that a college hockey player can graduate from the league: They must play either four full years as a student (five if redshirt); or be called up from a SimPHL hockey team that has drafted the player. Please see the Draft section for more info on calling up a college player.

# SimPHL

SimPHL is a prospective league that will feature the best hockey players within all hockey sims.

The NHL has a wide history of teams ranging across the United States and Canada and also has a history of teams that have relocated and folded. I want to give users the flexibility in coaching the teams they’d like to coach. In the way that SimNBA includes the Seattle Supersonics, Vancouver Sea Lions and the San Diego Clippers; the following teams are available to select from for the initial 32:

| Team Name    | Mascot         | Abbreviation | Division     | City           | State |
| :----------- | :------------- | :----------- | :----------- | :------------- | :---- |
| Boston       | Bruins         | BOS          | Atlantic     | Boston         | MA    |
| Buffalo      | Sabres         | BUF          | Atlantic     | Buffalo        | NY    |
| Detroit      | Red Wings      | DET          | Atlantic     | Detroit        | MI    |
| Florida      | Panthers       | FLA          | Atlantic     | Sunrise        | FL    |
| Montreal     | Canadiens      | MONT         | Atlantic     | Montreal       | QC    |
| Ottawa       | Senators       | OTT          | Atlantic     | Ottawa         | ON    |
| Tampa Bay    | Lightning      | TBL          | Atlantic     | Tampa          | FL    |
| Toronto      | Maple Leafs    | TOR          | Atlantic     | Toronto        | ON    |
| Carolina     | Hurricanes     | CAR          | Metropolitan | Raleigh        | NC    |
| Columbus     | Blue Jackets   | COL          | Metropolitan | Columbus       | OH    |
| New Jersey   | Devils         | NJ           | Metropolitan | Newark         | NJ    |
| New York     | Islanders      | NYI          | Metropolitan | Elmont         | NY    |
| New York     | Rangers        | NYR          | Metropolitan | New York       | NY    |
| Philadelphia | Flyers         | PHI          | Metropolitan | Philadelphia   | PA    |
| Pittsburgh   | Penguins       | PIT          | Metropolitan | Pittsburgh     | PA    |
| Washington   | Capitals       | WAS          | Metropolitan | Washington     | DC    |
| Chicago      | Blackhawks     | CHI          | Central      | Chicago        | IL    |
| Colorado     | Avalanche      | AVS          | Central      | Denver         | CO    |
| Dallas       | Stars          | DAL          | Central      | Dallas         | TX    |
| Minnesota    | Wild           | MIN          | Central      | Saint Paul     | MN    |
| Nashville    | Predators      | NASH         | Central      | Nashville      | TN    |
| St. Louis    | Blues          | STB          | Central      | St. Louis      | MO    |
| Utah         | HC             | UTAH         | Central      | Salt Lake City | UT    |
| Winnipeg     | Jets           | WIN          | Central      | Winnipeg       | MB    |
| Anaheim      | Ducks          | ANA          | Pacific      | Anaheim        | CA    |
| Calgary      | Flames         | CALG         | Pacific      | Calgary        | AB    |
| Edmonton     | Oilers         | EDM          | Pacific      | Edmonton       | AB    |
| Los Angeles  | Kings          | LAK          | Pacific      | Los Angeles    | CA    |
| San Jose     | Sharks         | SJ           | Pacific      | San Jose       | CA    |
| Seattle      | Kraken         | SEA          | Pacific      | Seattle        | WA    |
| Vancouver    | Canucks        | VAN          | Pacific      | Vancouver      | BC    |
| Vegas        | Golden Knights | VGK          | Pacific      | Paradise       | NV    |
| Hartford     | Whalers        | HART         |              | Hartford       | CT    |
| Atlanta      | Flames         | ATL          |              | Atlanta        | GA    |
| Atlanta      | Thrashers      | ATL          |              | Atlanta        | GA    |
| Colorado     | Rockies        | COL          |              | Denver         | CO    |
| Kansas City  | Scouts         | KCS          |              | Kansas City    | MO    |
| Quebec       | Nordiques      | QUE          |              | Quebec City    | QC    |
| Minnesota    | North Stars    | MN           |              | Bloomington    | MN    |
| California   | Golden Seals   | CAL          |              | Oakland        | CA    |
| Cleveland    | Barons         | CLE          |              | Cleveland      | OH    |
| Montreal     | Maroons        | MONT         |              | Montreal       | QC    |
| Hamilton     | Tigers         | HAM          |              | Hamilton       | ON    |
| Arizona      | Coyotes        | ARI          |              | Phoenix        | AZ    |
| St. Louis    | Eagles         | STL          |              | St. Louis      | MO    |

## Inaugural Teams List

Below is the list of all teams participating in the inaugural season.

| Team Name    | Mascot         | Abbreviation | Division | City         | State |
| :----------- | :------------- | :----------- | :------- | :----------- | :---- |
| Montreal     | Canadiens      | MONT         | Eastern  | Atlantic     | GA    |
| Ottawa       | Senators       | OTT          | Eastern  | Atlantic     | NY    |
| Toronto      | Maple Leafs    | TOR          | Eastern  | Atlantic     | MI    |
| Columbus     | Blue Jackets   | COL          | Eastern  | Atlantic     | FL    |
| Quebec       | Nordiques      | QUE          | Eastern  | Atlantic     | QC    |
| New York     | Rangers        | NYR          | Eastern  | Atlantic     | ON    |
| Detroit      | Red Wings      | DET          | Eastern  | Metropolitan | FL    |
| Florida      | Panthers       | FLA          | Eastern  | Metropolitan | ON    |
| Philadelphia | Flyers         | PHI          | Eastern  | Metropolitan | NC    |
| Pittsburgh   | Penguins       | PIT          | Eastern  | Metropolitan | OH    |
| Atlanta      | Thrashers      | ATL          | Eastern  | Metropolitan | NJ    |
| Nashville    | Predators      | NASH         | Eastern  | Metropolitan | NY    |
| Chicago      | Blackhawks     | CHI          | Western  | Central      | NY    |
| Colorado     | Avalanche      | COL          | Western  | Central      | PA    |
| Dallas       | Stars          | DAL          | Western  | Central      | PA    |
| Kansas City  | Scouts         | KCS          | Western  | Central      | DC    |
| Calgary      | Flames         | CALG         | Western  | Central      | IL    |
| Edmonton     | Oilers         | EDM          | Western  | Central      | CO    |
| Anaheim      | Ducks          | ANA          | Western  | Pacific      | TX    |
| San Jose     | Sharks         | SJ           | Western  | Pacific      | MN    |
| Seattle      | Kraken         | SEA          | Western  | Pacific      | TN    |
| Vancouver    | Canucks        | VAN          | Western  | Pacific      | MO    |
| Vegas        | Golden Knights | VGK          | Western  | Pacific      | UT    |
| California   | Golden Seals   | CAL          | Western  | Pacific      | MB    |

## Expansion Opportunities

In the event that there is more interest to join & participate in the SimPHL, we will expand the number of teams as necessary; ideally with 4 teams at a time. If there is a driving interest, we will expand further if needed.

## Building the Initial Pro Rosters

Each petitioned team will have a roster made up of 23 players. The grouping, however, will be determined differently. Rather than 7 players per “class”, teams will have a set number of players generated by a given age. None of the generated players are expected to retire… yet.

| Age   | Number of players generated | Number of progressions ran |
| :---- | :-------------------------- | :------------------------- |
| 21    | 0                           | 0                          |
| 22    | 0                           | 0                          |
| 23    | 2                           | 1                          |
| 24    | 2                           | 2                          |
| 25    | 3                           | 3                          |
| 26    | 3                           | 4                          |
| 27    | 4                           | 5                          |
| 28    | 3                           | 6                          |
| 29    | 3                           | 7                          |
| 30    | 2                           | 8                          |
| 31    | 1                           | 13                         |
| 32    | 0                           | 14                         |
| 33    | 0                           | 15                         |
| 34    | 0                           | 16                         |
| Total | 23                          |                            |

In addition to the generated rosters, approximately 250 free agents will be generated to create the initial FA market.

### Roster Limit

A Pro Hockey team can have at maximum 50 players signed at a time. Players not part of the active 23 may be placed in any of the following:

- Injury Reserves (must be injured)
- Affiliate Team

## Free Agency

Free Agency is designed to take place on a daily basis throughout the season. No weekly sync, a daily sync.

During the off-season period, players will take on offers on a daily basis. Once an offer has been made on a player, the player will consider the offer for 3 days. If no other team places an offer on that same player within the three day period, the player will sign with the team.

If a team places an offer on a player who has 1+ offers, the countdown period will reset, and the player will consider all of their offers within the next three days. In addition to this rule, once a second offer is placed on a player, all offers will remain hidden on the player (the only information provided will be the name of the teams in contention for the player).

### Contracts

Contracts are designed to incorporate **the signing bonus** and **salary** as part of a player’s contract to a team. In addition, we’ll also be introducing the concept of **clauses** as options in a contract.

#### Initial Contracts

Information regarding contracts will be provided in the future as reference after player generation testing is complete. Expect the following:

- Rookies will have \~$700-925K as the yearly salary on their contracts
- Veteran players (25+ in age) will have a yearly salary between $1M and $8M based on their overall
- Star players (25+ in age) will have a yearly salary between $8M and $12.5M based on their overall.

#### Cuts/Buyouts

If a player that is 26 years or older is cut, their buyout is the full value of their signing bonus of the current year and ⅔ of the remaining guaranteed money owed on the contract.  
If a player is younger than 26 years, their buyout is the full value of the signing bonus in the current year and ⅓ of the remaining salary owed on the contract.

All money owed from a buyout will be spread out over twice the remaining years of the contract, at maximum five years.

#### Clauses

**Clauses** are rules that can be added to a contract, made to entice the player with signing the contract. Some players have preferences as far as where they would like to play and who they would like to play for. Clauses help add realism to the sim.

There are currently two available clauses:

- No Trade Clause (NTC): A player with an NTC on their contract cannot be traded to another team.
- No Movement Clause (NMC): A player with an NMC cannot be moved down to a lower level league.

If a clause is broken, a team will be fined 50% of the current year total of the current player’s contract, which will be applied to the team’s current year dead cap.

### Player Value

The value of which a player will be looking for a contract will be dependent on the player’s overall rating and their age. In addition, any players that re-enter FA after the duration of their contract will use their previous contract’s value as a reference for their minimum value. Depending on the player’s age, the minimum value will fluctuate by \+/- 10%. A table will be provided in the future after roster generation testing.

### Preferences

Preferences are a concept taken from the SimNBA league and applied here. They are variables that define what a player is looking for when signing with a new / existing team. There are three categories of preferences: **market, competitive, and financial preference**. A player can have up to three preferences, one in each category.

**Market Preference** reflects where the player would prefer to play. Players can prefer to play **close to their home**, **in a large market**, **a small market**, **not in a large market, nor in a small market,** or **stay loyal to a specific team, or completely avoid their previous team**. Additionally, a player may want to be on a roster where the roster consists of a number of non-North Americans, based on their country.

- If a player is from Russia or Sweden, the threshold is set to at least 5 players.
- If a player is from any other Non-North American country outside of Sweden & Russia, the threshold is set to at least 3 players.
- _These thresholds will be adjusted based on ethnicity generation updates in the simulation, and on potential additions of other leagues including international leagues (Swedish Hockey, KHL, International Super Hockey League, etc.)_

**Competitive Preference** places an emphasis on what the player wants from the game. Some players want to play in the highest league (SimPHL), some want playing time on the 1st or 2nd lines, some want mentorship, and some want to play on a competitive team.

- The mentorship value essentially means they want to be on a team with a veteran player of the same position and archetype (5+ years older than they are). Only available for players 24 years and younger.
- In vice-versa to the above bullet point, a player older than 28 may seek out a team with an average player age less than 28, as a means to provide mentorship in a mentor role.
- The competitive team value equates to a team that made the playoff in the previous season and aims at returning to the playoff picture in the current season.

**Financial Preference** equates to the financial value that lies in the contract offers that a player receives. Some players prefer shorter term contracts, some want to stay with a team on longer contracts, and some will want a larger AAV on their contract.

These preferences are designed to add a sense of realism to SimPHL and add a bit of character to how free agents will behave in the league. Market & Financial Preference will change in every odd season (every two years), while competitive preference will change every year.

**Contract Variability**  
There are two sets of rules for contract variability (how much the contract varies year to year) based on if the contract is front-loaded or back-loaded. Front-loaded deals are defined as:  
\-Total player compensation in first half of contract divided by \# of years in first half of contract (if contract has odd \# of years, half of the middle year is included in the first half) is called "First Half AAV"  
\-If First Half AAV is greater than the full contract AAV, then the contract is considered front-loaded. If not, contract is considered back-loaded Front-Loaded Contract Variability  
\-The difference between compensation in any year and the year immediately before or after cannot exceed 25% of compensation in Year 1 of the contract.  
\-Compensation in any year cannot be less than 60% of the highest compensation year. Back-Loaded Contract Variability:  
\-The difference between Year 1 and 2 compensation cannot be more than the lower of the 2 years (i.e., the highest compensation permitted in Year 2 is double Year 1).  
\-For all subsequent years, any increase from year to year cannot exceed the lower of the year 1 and year 2 compensation.  
\-For all subsequent years, any decrease from year to year cannot exceed 50% of the lower of the year 1 and year 2 compensation.

### Signing

When a player is ready to sign & has more than one offer, a decision will be made based on the following factors:

- The contract value of the offer & how the offer matches based on the preferences of the player & the team offering.
  - Each preference can either increase the player’s preferred value on an offer by \+/-5%. The more that a team matches with what a player’s looking for, the more value that will be perceived from their offer.
  - If a team offers a player that doesn’t match with the preferences of the player, the lower the perceived value will be from the offer.
- The offer with the highest perceived value will be signed by the player.

## Extensions

Teams may choose to sign an extension to a player **at any time** during the final year of the player’s contract. Extensions will be processed as part of the weekly sync. Teams will be notified if a player has accepted or declined an extension offer.

## Trades

Trades will work similar to how we have trades calculated for SimNFL. Teams may choose to trade players and draft picks in return for other players and other draft picks. When trading players, the following will occur regarding contracts:

- Teams trading away players must pay the player’s current year signing bonus on the cap hit. All prorated signing bonuses remaining on the player’s contract will be paid by their new team.
- The team receiving the player will be responsible for the remainder of the player’s salary. However, the team sending the player may choose to retain some of the player’s salary as part of the trade.
  - If a retention is activated, the team sending the player will retain a portion of the player’s contract and cap hit for the **entire remaining years left** on the player’s contract.
  - A team can retain up to 50% of a player’s salary. Each retention will be added to the cap hit allocated on each year.
  - Further, a team may choose to retain a salary in a maximum of three trades **at any given time**. Contracts retained will be kept in reference until the contract is completed or extended.

## SimPHL Draft

The SimPHL draft will be one of the methods a team may use to add young talent onto their roster. Unlike our other sim leagues SimCFB and SimCBB, in SimHockey; professional teams can draft and pick players for their playing rights once they are ready to move up. When a SimPHLteam drafts a player, they’re drafting **for the rights to pick up** the player in the following year (given they meet the below criteria):

- The player is born in the USA or Canada and is between the ages of 18 and 20
- The player is born elsewhere and is between the ages of 18-21

Any players that do not meet either piece of criteria will join the SimPHL team automatically. Otherwise, the player will be picked up by the SimPHL team in the following year.

The SimPHLdraft will take place over 7 rounds; however, it is designed to allow users to take their time on drafting the pick they would like to make.

First round picks, each team will have 24 hours to make their pick.  
Rounds 2-3, each team will have 12 hours to make their pick.  
Rounds 4-7, each team will have 8 hours to make their pick.

This system will feature an AI auto-draft feature, allowing teams to have the AI make decisions for them based on the current state of their roster and where they need talent and youth.

### Drafting for Rights

To repeat what was written above, when a SimPHL team drafts a player, they’re drafting for the rights to pick up the player in the following year. This means that if the player meets the above criteria (18-20 yr old Canadian or 18-21 yr old American), teams will need to wait at least a season before the player may join the team’s roster. If the player is 22 years and older (21+ if Canadian and in the CHL), the player will automatically join the team’s roster.

Once a year has passed, if the drafted player still meets the above criteria, the SimPHL team which drafted the player may choose one of the following:

- Pick up the player, signing them to a contract that will start in the next immediate season.
- Continue to let them develop in the college league.

If a player continues to develop in the college league after being drafted and when they hit the age to graduate (22 years for non-redshirts, 23 for redshirts), the player will automatically join the SimPHL’s team and sign a new contract.

### When can a player be brought up to SimPHL?

Players that meet the age criteria of 22+ automatically join their team’s roster. For everyone else outside of the age range, teams are drafting for rights to the player. After a full season has passed, that player then becomes eligible to join their respected team they were drafted by.

In addition, SimPHL teams have for the full offseason to bring up players they hold the rights to. From the moment both leagues finish their season, and before the preseason, teams can bring up players as they see fit.

### Rookie Salaries (Technical explanation)

When a player is drafted, a contract will be created but will be considered deactivated until the player is either picked up or graduated.

## International Leagues

There is interest in seeing leagues such as the SHL and KHL make their way into the sim. At the moment, my focus is going to be on implementing SimCHL and SimPHL.

# 1.1 Offseason Updates

The following section applies to changes made after the first simulated season. Changes made to existing systems will be written above with the version number (1.1) applied afterwards. New systems will be listed below.

## Gameplan Systems

Offensive, Defensize, Neutral, and Powerplay systems are being added this offseason and are added to the gameplan section above.

More info to arrive in the near future.

## Injuries

Next season we are adding injuries to the game simulation. A lot of the infrastructure around injuries and handling recovery has already been implemented; however, the work that needs to be done is adding the event of an injury and an injury table to the game engine. This work will begin after both SimCHL and SimPHL are complete.

Expect injuries to have an impact on player progression & to have an impact on the prime age of a player.

## Additional Talent Pools

The career path for a hockey player is very different from that in other sports, namely basketball and football. In our other simulations, both the college and pro leagues have the exact same talent pool: Colleges build their roster from high school talent and through the transfer portal. For SimNFL teams, they build their roster through the SimNFL draft (college talent) and through free agency & trading.

For the sport of hockey, the ways that teams can build a roster is different. NHL teams IRL aren’t only looking at collegiate talent when drafting. They’re looking at other junior hockey programs and drafting from there as well. Teams scout and draft players not only from the United States & Canada, but across the world.

In SimHockey, we’re going to emulate that aspect for both pro sports and collegiate talent by introducing a new pool of talent teams can build talent from: we’re adding one of the Canadian Hockey Leagues to the simulation.

### Canadian Hockey League (Jr Talent Pool)

The Canadian Hockey league is one of the top leagues in North America where teams can draft players from & build up their roster. Just very recently, the NCAA has allowed players from the CHL to participate in their D1 Men’s Ice Hockey league. To reflect this unique relationship, we’re adding the Canadian Hockey League as a talent pool where teams can sign in CHL players exclusively from the transfer portal, and also allow SimPHL teams to draft the rights to CHL players outright.

For the 2026 season, we will be adding the Ontario Hockey League, culminating in 20 teams in simulation. These teams will consist entirely of Canadian players from an age range of 16 to 20\. Below are the specific rules regarding age of players & generation:

- Players generated from the initial roster for these Canadian teams will be spread from 16 to 20 years of age. Players will generate at the starting age of 16 and will have a progression until their designated age. The age of players will be spread evenly on each roster.
- Players generated from the CHL will have their star rating generated with a steeper curve; meaning, the odds of a five star player being generated in this league will be slimmer. These players, however, can be generated at a younger age. Through progression, I believe that this should balance out the level of talent with the high school recruiting system.
- During the transfer portal phase, collegiate teams will be able to transfer in Canadian players that meet the age requirement to participate in the SimCHL league (18+).
  - If a Canadian player from the Canadian League signs over to a SimCHL team, they will have four years of eligibility available. This will occur regardless of the player’s current age.
- All CHL players will be eligible for the SimPHL once these players reach the age of 18\. Additionally, if a PHL team drafts the rights to a CHL player and the CHL player has just transferred through the portal to a collegiate team, the SimPHL team must wait a season before being able to call the player up.
- Approximately 28 players will be generated for each CHL team. Meaning, 560 players total will be initially generated (28\*20). Of the 560 players available, 280 players will be eligible for both the transfer portal & the SimPHL draft.

#### Can users select a Canadian Hockey League team to coach?

At the moment, these teams will be AI only. Depending on the bandwidth I have this offseason, the teams may have a round-robin schedule generated for each team (H\&A game each team). If there is enough interest & demand I may look to expand & allow users to coach these teams; granted, new rules regarding roster building will need to be developed.

# Special Thanks

I want to thank the following users for their help in making SimHockey a reality. This project has been in development since late October 2024; and while I’ve poured a lot of hours into this project, a lot of this work would not have been possible without the help of others within the SimSN community and within the general hockey community.

- **Kirby:** Kirby’s been a huge help with getting Interface 2.0 functional and running for SimHockey. Without Kirby’s work on Interface 2.0, none of this wouldn’t be possible. Kirby also provided crucial feedback on the generation for international players including nations where the sport is popular such as Sweden & Russia. Kirby is also additionally responsible for conceptualizing and implementing the player faces feature which SimHockey, and our other sports now use.
- **Acewulf** & **Bundy**: Both users provided very early feedback regarding the concept of the simulation, attribute design, player archetypes, lineup design, and the event system the engine uses.
- **Spoof**: Spoof helped drive our roster creation for SimPHL, including hosting & running the inaugural SimPHL Auction draft. Spoof’s work on contract rules from salary requirements, max salaries, and cap limits for the league were crucial in adding realism to the project.
- **Wabbit:** Wabbit’s knowledge on player scouting was crucial towards driving player generation & player progression within SimHockey. His feedback in playing style from various leagues including SHL, KHL, and Liiga was crucial in adding realism to accounting nation of origin when generating player attributes. Wabbit also helped design the Goalie Fatigue system to be more realistic to how teams manage their goalies in between games.
- **Jieret:** Jieret has been a huge help behind the scenes since our Auction draft with helping in the design for our Free Agency rules, cap management, contract rules and trade rules.
- **All users who helped participate in QA testing for Interface 2.0 & for the Hockey Sim:**
  - All users mentioned above
  - Subsequent
  - Rocketcan
  - Smackemz
  - Alexfall862
  - Piercewise
- **The /r/CollegeHockey Discord:** A lot of my early work was actually shared in the discord since October 2024; the interest & feedback provided was crucial in continuing to build out SimHockey.
- **The SimSN Community:** We’re passionate about online management sims at both the collegiate & professional level; at the same time, our community feedback has been crucial into making SimSN what it is today. And for that, I would like to say to the SimSN community: Thank you.
