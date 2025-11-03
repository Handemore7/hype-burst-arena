// game type definitions

// team identifier - supports up to 3 teams
export type TeamId = 1 | 2 | 3;

// available team colors - must match CSS variables in index.css
export type TeamColor = "red" | "purple" | "blue" | "green" | "yellow";

// team data structure
export interface Team {
  id: TeamId;
  name: string;
  points: number;
  color: TeamColor;
  isCombo: boolean; // whether team has active 2x multiplier
  comboEndTime: number | null; // when combo expires (timestamp)
  streak: number; // consecutive high-scoring ticks for fire effect
  lastGain: number; // points earned last tick (for floating animation)
}

// overall game state
export interface GameState {
  teams: Team[];
  winner: TeamId | null;
  isPlaying: boolean;
  playerTeam: TeamId | null; // reserved for future player interaction
}
