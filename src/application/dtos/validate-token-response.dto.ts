import { ApiProperty } from '@nestjs/swagger';
import { TokenInfoDto } from './token-info.dto';
import { ExternalUserInfoDto } from './external-user-info.dto';

export class ValidateTokenResponseDto {
  @ApiProperty({ 
    description: 'Indica si el token es válido',
    example: true 
  })
  valid!: boolean;

  @ApiProperty({ 
    description: 'Mensaje descriptivo del resultado',
    example: 'Token validated, renewed, and user info retrieved' 
  })
  message!: string;

  @ApiProperty({ 
    description: 'Información extraída del payload del JWT',
    type: TokenInfoDto 
  })
  tokenInfo!: TokenInfoDto;

  @ApiProperty({ 
    description: 'Información adicional del usuario obtenida de la API externa usando token renovado',
    type: ExternalUserInfoDto,
    required: false 
  })
  externalUserInfo?: ExternalUserInfoDto;
}