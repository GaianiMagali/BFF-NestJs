import { JwtPayload } from '../value-objects/jwt-payload.value-object';

export class Token {
  constructor(
    private readonly jwtPayload: JwtPayload
  ) {}

  get sub(): string {
    return this.jwtPayload.sub;
  }

  get username(): string {
    return this.jwtPayload.username;
  }

  get exp(): number {
    return this.jwtPayload.exp;
  }

  get iss(): string {
    return this.jwtPayload.iss;
  }


  isExpired(): boolean {
    return this.jwtPayload.isExpired();
  }
}