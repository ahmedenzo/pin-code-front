export class AuthUtils {
    /**
     * Is token expired?
     */
    static isTokenExpired(token: string, offsetSeconds?: number): boolean {
        if (!token) {
          
            return true;
        }

        const expirationDate = this._getTokenExpirationDate(token);
     

        const isExpired = !expirationDate || expirationDate.valueOf() <= (new Date().valueOf() + (offsetSeconds || 0) * 1000);
        if (isExpired) {
           
        } else {
         
        }

        return isExpired;
    }

    /**
     * Decode token
     */
    static _decodeToken(token: string): any {
        if (!token) {
       
            return null;
        }

        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Token does not have the expected format.');
        }

        const decodedPayload = this._urlBase64Decode(parts[1]);
      

        return JSON.parse(decodedPayload);
    }

    /**
     * Get token expiration date
     */
    static _getTokenExpirationDate(token: string): Date | null {
        const decodedToken = this._decodeToken(token);
        if (!decodedToken || !decodedToken.exp) {
         
            return null;
        }

        const date = new Date(0);
        date.setUTCSeconds(decodedToken.exp);
     
        return date;
    }

    private static _urlBase64Decode(str: string): string {
        let output = str.replace(/-/g, '+').replace(/_/g, '/');
        switch (output.length % 4) {
            case 0: { break; }
            case 2: { output += '=='; break; }
            case 3: { output += '='; break; }
            default: { throw new Error('Illegal base64url string!'); }
        }
        const decoded = atob(output);
       
        return decodeURIComponent(
            decoded.split('').map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`).join(''),
        );
    }
}
