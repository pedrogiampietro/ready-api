import { Trip } from "./Trip";

export class User {
  id!: number;
  email!: string;
  password!: string;
  name?: string;
  trips?: Trip[];
}
