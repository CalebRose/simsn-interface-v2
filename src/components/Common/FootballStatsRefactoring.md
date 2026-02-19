# Football Player Stats Modal Refactoring

## Overview

The `PlayerStatsModalView` component has been refactored into `FootballPlayerStatsModalView` with a more modular, reusable architecture. The large monolithic component has been broken down into smaller, focused utilities, hooks, and components.

## New Architecture

### Custom Hooks

- **`usePlayerStatsData`**: Manages player stats data fetching and loading states
- **`useStatsConfiguration`**: Handles stats configuration logic based on player position/archetype
- **`useValueLabels`**: Generates appropriate column labels based on stats configuration

### Utilities

- **`footballPositionUtils.ts`**: Position value mappings and stats type determination
- **`careerStatsCalculation.ts`**: Career stats aggregation logic
- **`statsDisplayUtils.ts`**: Stats display formatting and value calculation

### Components

- **`PlayerStatsRow`**: Reusable component for rendering individual stat rows
- **`FootballPlayerStatsModalView`**: Main component (renamed from `PlayerStatsModalView`)

## Usage Examples

### Using the Hooks Separately

```tsx
import {
  usePlayerStatsData,
  useStatsConfiguration,
} from "../_hooks/footballStatsHooks";

// In any component that needs player stats
const { playerStats, isLoading, error } = usePlayerStatsData(player, league);
const { statsConfig, footballStatsType } = useStatsConfiguration(player);
```

### Using the Utilities

```tsx
import {
  calculateCareerStats,
  getFootballStatsType,
} from "../_utility/footballStatsUtils";

const careerStats = calculateCareerStats(playerStats, league);
const statsType = getFootballStatsType(player.Position);
```

### Using the Row Component

```tsx
import { PlayerStatsRow } from "./PlayerStatsRow";

// In any table that displays player stats
<PlayerStatsRow
  item={statItem}
  index={index}
  backgroundColor={bgColor}
  valueLabels={labels}
  footballStatsType={statsType}
  statsView={viewType}
/>;
```

## Benefits of This Refactoring

1. **Reusability**: Individual hooks and utilities can be used in other components
2. **Testability**: Each piece can be unit tested independently
3. **Maintainability**: Smaller, focused functions are easier to understand and modify
4. **Performance**: Memoization is more granular and efficient
5. **Type Safety**: Better TypeScript support with focused interfaces

## Migration Guide

If you were using `PlayerStatsModalView` before:

```tsx
// Old import
import { PlayerStatsModalView } from "./PlayerStatsModalView";

// New import
import { FootballPlayerStatsModalView } from "./FootballPlayerStatsModalView";

// Usage remains the same
<FootballPlayerStatsModalView player={player} league={league} />;
```

The component interface remains the same, so existing usage should work without changes.
