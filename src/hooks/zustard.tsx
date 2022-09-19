import create from "zustand";
import { IMeeting } from "../Tables/meeting";

export const useMeetingConclusinStore = create<{
  meeting: IMeeting | null;
  storeMeeting(meeting: IMeeting): void;
  deleteMeeting(): void;
}>((set) => ({
  meeting: null,
  storeMeeting: (meeting: IMeeting) =>
    set(() => ({
      meeting,
    })),
  deleteMeeting: () =>
    set(() => ({
      meeting: null,
    })),
}));
