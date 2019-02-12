export interface Feedback {
  id?: string;
  eventId: string;
  device: string;
  doorName: string;
  comment: string;
  feedbackDate?: Date;
  feedbackTime?: Date;
  guardEmail?: String;
}
