export type TeamId = 1 | 2 | 3;

export interface Team {
  id: TeamId;
  name: string;
  points: number;
  color: "cyan" | "purple" | "amber";
  isCombo: boolean;
  comboEndTime: number | null;
}

export interface GameState {
  teams: Team[];
  winner: TeamId | null;
  isPlaying: boolean;
  playerTeam: TeamId | null;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  color: string;
  tx: number;
  ty: number;
}
