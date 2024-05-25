import { Trip } from "./Trip";

export class User {
  id!: string;
  email!: string;
  password!: string;
  name: string;
  trips?: Trip[];
}
