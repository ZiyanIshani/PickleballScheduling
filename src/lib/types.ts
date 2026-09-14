export type SignalType = "thinking" | "going";

export type Profile = {
  id: string;
  name: string;
  contact: string | null;
  dupr_rating: number | null;
  created_at: string;
};

export type Court = {
  id: string;
  name: string;
};

export type Availability = {
  id: string;
  user_id: string;
  court_id: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
  signal_type: SignalType;
  created_at: string;
};

export type AvailabilityWithProfile = Availability & {
  profiles: Pick<Profile, "id" | "name" | "dupr_rating"> | null;
};
