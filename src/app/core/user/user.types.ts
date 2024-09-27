export interface User {
    id?: string;                  // Optional
    username: string;            // Required
    password: string;            // Required
    email?: string;              // Optional
    phoneNumber?: string;        // Optional
    role?: string;            
    adminId?: string;            // Optional, references the admin
    bankId?: string;             // Optional, references the bank
    agencyId?: string;     
          // Optional, references the agency
}
