import { ApiProperty } from '@nestjs/swagger';

export class TokenInfoDto {
  @ApiProperty({ 
    description: 'ID del usuario (subject)',
    example: '12345' 
  })
  sub!: string;

  @ApiProperty({ 
    description: 'Nombre de usuario del token',
    example: 'john_doe' 
  })
  username!: string;

  @ApiProperty({ 
    description: 'Timestamp de expiración del token',
    example: 1703980800 
  })
  exp!: number;

  @ApiProperty({ 
    description: 'Timestamp de emisión del token',
    example: 1703980800 
  })
  iat!: number;

  @ApiProperty({ 
    description: 'Payload completo del JWT decodificado',
    example: { sub: '12345', username: 'john_doe', exp: 1703980800, iat: 1703980800 }
  })
  payload!: any;
}