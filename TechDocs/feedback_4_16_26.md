# Feedback

The following is feedback from users on features that can be improved upon in the interface. Help me with this.

## Image Quality of Life - Copy from Clipboard and supporting PNGs

For adding images via the Rich Text Editor, users want to be able to copy from the clipbord and paste images with PNGs as default. Quote from user "Because windows handles screenshots as PNGs as default and copying using snip puts images in your clipboard, it would be great to support pasting into the messages instead of 1 by 1 file upload (which seems to be very picky on file type currently)."

## SimCFB Portal only allows users to allocate 50 points

Quote from user: "Users can only allocate 50 points in the Transfer Portal for CFB. Interface is "out of 100" in text and confirmed with Toucan it should be out of 100."

In this case, for the SimCFB transfer portal (League === SimCFB), the maximum points allocatable for a team must be 100. Check if the Save button disables if points are > 50. The point maximum for SimCFB is 100, all other leagues is 50.

## Sorting in the Transfer Portal Profile Table

Quote from user: "Sorting works in the Overview table, but not the Transfer Portal Profile page." This may be related to sorting by specific columns. Check the table.tsx file in \_design directory. There are cases handled for specific pages & tables for sorting.

## SimPHL Interface Injured Reserve Not working

This one is technically a larger ask but for the Roster page, for SimCFB, SimCHL, SimPHL, and SimNFL, users should be able to send a player to the injury reserve. Check the roster tables for an injury reserve action that is clickable. We will need to likely have a modal prompt appear (ActionModal.tsx and constants.tsx handles this logic). If the user confirms, and endpoint from the respective sport store (SimFBAContext, SimHCKContext) should fire off an endpoint to the league's API to pass a player ID as a parameter and toggle the player as IsInjuryReserve. The SimFBA repo and SimHockey repo are viewable within the workspace. View each repo's main.go file for the endpoints handling injury reserve for each league.
