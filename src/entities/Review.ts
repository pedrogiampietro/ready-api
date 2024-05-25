import { Trip } from "./Trip";

export class Review {
  id!: number;
  rating!: number;
  comment?: string;
  trip!: Trip;
  tripId!: number;
}
