export class Token {
  constructor(
    private readonly sub: string,
    private readonly exp: number,
    private readonly iss: Date,
    private readonly username: string
  ) {}

 
  isExpired(): boolean {
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime >= this.exp;
  };

}