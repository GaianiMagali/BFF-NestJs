
export class TokenValidationResponseDto {
  readonly message: string;
  readonly user: UserInfoDto;
  readonly validatedToken: string;

  constructor(message: string, user: UserInfoDto, validatedToken: string) {
    this.message = message;
    this.user = user;
    this.validatedToken = validatedToken;
  }
}

export class UserInfoDto {
  readonly sub: string;
  readonly username: string;
  readonly validated: boolean;

  constructor(sub: string, username: string, validated: boolean = true) {
    this.sub = sub;
    this.username = username;
    this.validated = validated;
  }
}