import { Injectable } from '@angular/core';

import * as CryptoJS from 'crypto-js';

@Injectable({ providedIn: 'root' })
export class TokenService {
    private secretKey = 'P96Rc6d8fKs9Pac4d5e6f708192a3PpS'; // Use a secure method to retrieve this

    // Encrypt data
    encrypt(data: string): string {
        return CryptoJS.AES.encrypt(data, this.secretKey).toString();
    }

    // Decrypt data
    decrypt(data: string): string | null {
        const bytes = CryptoJS.AES.decrypt(data, this.secretKey);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);

        if (!decrypted) {
            console.error('Failed to decrypt data');
            return null;
        }

        return decrypted;
    }

    // Store encrypted token in localStorage
    setToken(token: string): void {
        const encryptedToken = this.encrypt(token);
        localStorage.setItem('accessToken', encryptedToken);
    }

    // Retrieve and decrypt token from localStorage
    getToken(): string | null {
        const encryptedToken = localStorage.getItem('accessToken');
        if (!encryptedToken) {
            return null;
        }

        return this.decrypt(encryptedToken);
    }

    // Remove token from localStorage
    removeToken(): void {
        localStorage.removeItem('accessToken');
    }
}
