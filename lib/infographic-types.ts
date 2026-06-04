export type InfographicFrame = {
  n: number;
  type: "cover" | "data" | "insight" | "cta";
  heading: string;
  stat: string | null;
  text: string;
  visual_note: string;
};

export type InfographicData = {
  title: string;
  subtitle: string;
  visual_type: string;
  frames: InfographicFrame[];
  hashtags: string;
  caption: string;
  music_suggestion: string;
};
