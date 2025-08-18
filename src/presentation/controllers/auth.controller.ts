import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiHeader 
} from '@nestjs/swagger';
import { TokenValidationGuard } from '../../infrastructure/guards/token-validation.guard';
import { Token } from '../../domain/entities/token.entity';
import { ValidateTokenResponseDto, ErrorResponseDto } from '../../application/dtos';

// Extensión del Request para incluir toda la información del usuario
interface RequestWithUser extends Request {
  user: Token;
  userInfo?: any;
  message?: string;
}

/**
 * CONTROLADOR DE AUTENTICACIÓN - Capa de Presentación
 * 
 * Expone el endpoint HTTP que el frontend consume para validar tokens.
 * El BFF recibe el token, verifica que no esté vencido y retorna la información.
 */
@ApiTags('Autenticación')
@Controller()
export class AuthController {
  
  /**
   * ENDPOINT ÚNICO: Validar Token
   * 
   * URL: GET /api
   * Header requerido: Authorization: Bearer <jwt-token>
   * 
   * El frontend envía el token en el header, el BFF lo procesa:
   * 1. Decodifica el JWT (sin validar firma)
   * 2. Verifica que no esté vencido
   * 3. Retorna información del usuario o error 401
   * 
   * La validación de la firma se delega a la API externa.
   */
  @Get()
  @UseGuards(TokenValidationGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Validar Token JWT',
    description: `
    Valida un token JWT y obtiene información adicional del usuario.
    
    **Flujo:**
    1. Decodifica el JWT (sin validar firma)
    2. Verifica que no esté vencido
    3. Llama a API externa para obtener info del usuario
    4. Retorna datos combinados
    
    **Nota:** La validación de firma se delega a APIs externas.
    `
  })
  @ApiResponse({
    status: 200,
    description: 'Token válido - Retorna información del usuario',
    type: ValidateTokenResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido, vencido o no proporcionado',
    type: ErrorResponseDto,
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token JWT',
    required: true,
    example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  validateToken(@Req() req: RequestWithUser): ValidateTokenResponseDto {
    // El guard ya validó el token y obtuvo la info del usuario
    // req.user contiene el token decodificado
    // req['userInfo'] contiene los datos de la API externa (si están disponibles)
    
    const response = {
      valid: true,
      message: req.message || 'Token is valid',
      tokenInfo: {
        sub: req.user.getSub,           // ID del usuario del token
        username: req.user.getUsername, // Nombre del usuario del token
        exp: req.user.getExp,           // Timestamp de expiración
        iat: req.user.getIat,           // Timestamp de emisión
        payload: req.user.getPayload,   // Payload completo del JWT
      },
      ...(req.userInfo && { externalUserInfo: req.userInfo })
    };

    return response;
  }
}