import { ApiProperty } from '@nestjs/swagger';

export class ExternalUserInfoDto {
  @ApiProperty({ 
    description: 'ID del usuario en la API externa',
    example: 1 
  })
  id!: number;

  @ApiProperty({ 
    description: 'Nombre completo del usuario',
    example: 'Leanne Graham' 
  })
  name!: string;

  @ApiProperty({ 
    description: 'Nombre de usuario',
    example: 'Bret' 
  })
  username!: string;

  @ApiProperty({ 
    description: 'Email del usuario',
    example: 'Sincere@april.biz' 
  })
  email!: string;

  @ApiProperty({ 
    description: 'Teléfono del usuario',
    example: '1-770-736-8031 x56442' 
  })
  phone!: string;

  @ApiProperty({ 
    description: 'Website del usuario',
    example: 'hildegard.org' 
  })
  website!: string;

  @ApiProperty({ 
    description: 'Información de la empresa',
    example: { name: 'Romaguera-Crona', catchPhrase: 'Multi-layered client-server neural-net' }
  })
  company!: any;

  @ApiProperty({ 
    description: 'Dirección del usuario',
    example: { street: 'Kulas Light', city: 'Gwenborough' }
  })
  address!: any;
}