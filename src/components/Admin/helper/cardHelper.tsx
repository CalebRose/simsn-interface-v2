export const calculateStanding = (team: any) => {
  try {
    // Handle various date formats that might come from the API
    const lastLoginInput = team.LastLogin?.toString();
    if (!lastLoginInput) {
      return false; // No last login data = inactive
    }

    const lastLoginDate = new Date(lastLoginInput);

    // Check if the date is valid
    if (isNaN(lastLoginDate.getTime())) {
      console.warn(
        `Invalid date format for team ${team.teamLabel || "unknown"}: ${lastLoginInput}`,
      );
      return false; // Invalid date = inactive
    }

    const currentDate = new Date();

    // Calculate difference in milliseconds
    const diffInTime = currentDate.getTime() - lastLoginDate.getTime();

    // Convert to weeks (more precise calculation)
    const millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
    const diffInWeeks = diffInTime / millisecondsPerWeek;

    // Return true if in good standing (4 weeks or less), false if inactive (more than 4 weeks)
    return diffInWeeks <= 4;
  } catch (error) {
    console.error(
      `Error calculating standing for team ${team.teamLabel || "unknown"}:`,
      error,
    );
    return false; // Error = inactive for safety
  }
};

// Helper function to get weeks since last login (for display purposes)
export const getWeeksSinceLastLogin = (team: any): number => {
  try {
    const lastLoginInput = team.LastLogin?.toString();
    if (!lastLoginInput) return 999; // Large number for no login data

    const lastLoginDate = new Date(lastLoginInput);
    if (isNaN(lastLoginDate.getTime())) return 999;

    const currentDate = new Date();
    const diffInTime = currentDate.getTime() - lastLoginDate.getTime();
    const millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;

    return Math.floor(diffInTime / millisecondsPerWeek);
  } catch (error) {
    return 999;
  }
};
