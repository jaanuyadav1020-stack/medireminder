
export enum Frequency {
  Daily = "Daily",
  Weekly = "Weekly",
}

export enum AdherenceStatus {
  Pending = "Pending",
  Taken = "Taken",
  Missed = "Missed",
}

export interface Medicine {
  id: string;
  name: string;
  photo?: string; // base64 string
  description?: string;
  time: string; // "HH:MM" format
  frequency: Frequency;
  dayOfWeek?: number; // 0 (Sun) - 6 (Sat), only for weekly
  adherence: { [date: string]: AdherenceStatus }; // key is "YYYY-MM-DD"
}

export interface User {
  isLoggedIn: boolean;
  isGuest: boolean;
  name?: string;
}