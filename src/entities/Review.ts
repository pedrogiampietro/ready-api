import { Trip } from "./Trip";

export class Review {
  id!: string;
  rating!: number;
  comment?: string;
  trip!: Trip;
  tripId!: string;
}
