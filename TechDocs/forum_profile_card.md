# Forum System Technical Design

## Document Info

- **Project**: Forum-based community system for simulation sports leagues
- **Frontend**: React.js, TypeScript, Tailwind CSS
- **Backend / BaaS**: Firebase Authentication, Firestore, Cloud Functions, optional Cloud Storage
- **Primary Goal**: Create profile cards that can be viewable from forum posts by highlighting over the user's username or user logo.
- **Contexts Available** View UserProfileCard.tsx, includes access to the CurrentUser object, and to the sports stores as needed.

User should be able to update their profile card from the profile page. Can be anything as far as showcasing favorite teams within each sport, top 5 users, forum stats (number of posts, reacts, how long they've been a member for), which teams they coach, etc.

## The Card

The profile card should appear when the current user hovers over a user's username in a forum post or on the user's logo. Look at the PostAuthor object in ForumModels.ts for more context.

The card show show user information as far as their default logo, default league, leagues they participate in, how many forum posts they've made, when they joined, a top 5 users list, any achievements within the league (this will be a later feature, but I'll describe the structure below), along with recent posts/threads they participated in.

The card should show minimal information, but should also have a button that will allow the user to navigate to the profile page & be able to view the user's profile.

The profile page is being updated to accomodate to allow the current user to update their profile including their default league, their theme, the retro toggle, showcase how many media points they have, and the teams they currently coach. Additionally, we should allow the current user to update their top 5 list which would basically be their top 5 favorite users in the interface. Think of it like the MySpace top 5 feature.

For storing the top5 list, we could store it maybe as an array of ids. Thoughts?

Along with media points, we could also show how many posts they have made in the forum, how many reactions their post got as well.

We could also have a title feature which would allow the users to select a title that will display on forum posts near their username. The list could be derived from the achievements list to showcase their progress both in the forums and in the game itself.

Achievement structure

// Using Go code as an example
type Achievement struct {
ID: generic UID
CreatedAt: Timestamp // When the achievement was achieved
Title: string // The title of the achievement
League: string // The league the achievement was acquired
TeamID: number // The user's team at the time
SeasonID: number // The season in which the achievement was unlocked
Description: string // Short description of the achievement.
}

We could also have the current user be able to view other users. If they do so, the options that were modifiable should not be modifiable. Show a read-only view of the team information. If the user is viewing their own profile, they should be able to edit.

As far as inserting & giving achievements, that will be taken care of at a later date.
