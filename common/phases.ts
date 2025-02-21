// enum value: URL Pathname
export enum Phases {
  Join = "join",
  QnA = "questions",
  Statistics = "statistics",
  ContentShare = "content-share",
}

export type PhaseKeys = keyof typeof Phases;
