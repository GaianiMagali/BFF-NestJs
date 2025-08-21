

export interface IExternalTokenRepository {
  validateAndRenewToken(originalToken: string): Promise<string>;
}