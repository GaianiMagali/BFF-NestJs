export class TokenExpiredException extends Error {
    constructor(message = 'Token has expired') {
        super(message);
        this.name = 'TokenExpiredException';
    }
}