

export interface IExternalTokenValidationPort {
  validateAndRenewToken(originalToken: string): Promise<string>;
}