import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { TokenValidationGuard } from '../../infrastructure/guards/token-validation.guard';
import { Token } from '../../domain/entities/token.entity';
import { GetDataUseCase } from '../../application/use-cases/get-data.use-case';

// Extensión del Request para incluir información del token validado
interface RequestWithUser extends Request {
  user: Token;
  validatedToken: string;
}

/**
 * ========================================
 * 🎨 CONTROLADOR DE AUTENTICACIÓN - CAPA PRESENTATION
 * ========================================
 * 
 * La capa PRESENTATION maneja la interfaz HTTP con el mundo exterior.
 * Se encarga de recibir requests, validar entrada y enviar respuestas.
 * 
 * RESPONSABILIDADES:
 * 📡 Exponer endpoints HTTP
 * ✅ Validar datos de entrada (DTOs)
 * 🔄 Transformar respuestas para el cliente
 * 🛡️ Aplicar guards de autenticación
 * 
 */
@Controller()
export class AuthController {
  constructor(
    private readonly getDataUseCase: GetDataUseCase,
  ) {}
  
  /**
   * ENDPOINT ÚNICO: Validar Token y Obtener Datos
   * 
   * URL: GET /api
   * Header requerido: Authorization: Bearer <jwt-token>
   * 
   * FLUJO COMPLETO:
   * 1. Guard intercepta el request y valida el token
   * 2. Si el token es válido, permite el acceso al método
   * 3. El método usa el token validado para obtener datos
   * 4. Si hay error, el Exception Filter maneja la respuesta
   */
  @Get()
  @UseGuards(TokenValidationGuard)
  async validateToken(@Req() req: RequestWithUser): Promise<{ data: any }> {
    // El guard ya validó el token con la API externa
    // req.user contiene el token decodificado
    // req.validatedToken contiene el token validado por la API externa
    
    // Usar el token validado para obtener datos de la API de datos
    const data = await this.getDataUseCase.execute(req.validatedToken);

    return { data };
  }
}