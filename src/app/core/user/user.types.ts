
import { TabBank } from "../Model/Bank.model";
export interface User {
    id?: string;
    username: string;
    password?: string;
    email?: string;
    phoneNumber?: string;
    roles?: string[];
    bank?:TabBank
    adminId?: string;
    bankId?: string;
    agencyId?: string;
    sessionId?: string;
}
