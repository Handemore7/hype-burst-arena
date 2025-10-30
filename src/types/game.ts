export type TeamId = 1 | 2 | 3;

export type TeamColor = "red" | "purple" | "blue" | "green" | "yellow";

export interface Team {
  id: TeamId;
  name: string;
  points: number;
  color: TeamColor;
  isCombo: boolean;
  comboEndTime: number | null;
  streak: number;
  lastGain: number;
}

export interface GameState {
  teams: Team[];
  winner: TeamId | null;
  isPlaying: boolean;
  playerTeam: TeamId | null;
}
