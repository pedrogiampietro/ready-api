import { User } from "./User";
import { Review } from "./Review";

export class Trip {
  id!: number;
  title!: string;
  banner!: string;
  locationName!: string;
  longitude!: number;
  latitude!: number;
  images!: string[];
  hotelName!: string;
  hotelPrice!: number;
  departureDate!: Date;
  returnDate!: Date;
  flightCost!: number;
  mealCost!: number;
  totalCost!: number;
  user!: User;
  userId!: number;
  reviews?: Review[];
}
