import { User } from "../user/user.types";
import { TabBank } from "./Bank.model";

export interface Agency {
  id?: number;
  name?: string;
  contactEmail?: string;
  agencyCode?: string;
  contactPhoneNumber?: string;
  bank?: TabBank | null;
  users?: User[] | null;
}
