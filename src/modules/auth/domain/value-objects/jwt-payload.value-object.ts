export class JwtPayload {
  constructor(
    public readonly sub: string,
    public readonly username: string,
    public readonly exp: number,
    public readonly iss: string
  ) {};

  static fromDecodedToken(payload: any): JwtPayload {
    return new JwtPayload(
      payload.sub,
      payload.username,
      payload.exp,
      payload.iss
    );
  };

  isExpired(): boolean {
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime >= this.exp;
  };
}