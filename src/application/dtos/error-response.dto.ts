import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ 
    description: 'Indica que ocurrió un error',
    example: true 
  })
  error!: boolean;

  @ApiProperty({ 
    description: 'Código de estado HTTP',
    example: 401 
  })
  statusCode!: number;

  @ApiProperty({ 
    description: 'Código específico del error',
    example: 'TOKEN_EXPIRED' 
  })
  errorCode!: string;

  @ApiProperty({ 
    description: 'Mensaje descriptivo del error',
    example: 'Token has expired' 
  })
  message!: string;

  @ApiProperty({ 
    description: 'Timestamp cuando ocurrió el error',
    example: '2024-01-15T10:00:00.000Z' 
  })
  timestamp!: string;
}