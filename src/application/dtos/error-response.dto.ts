// DTO para respuestas de error - versión sin Swagger

export class ErrorResponseDto {
  // Indica que ocurrió un error
  error!: boolean;

  // Código de estado HTTP (401, 404, 500, etc.)
  statusCode!: number;

  // Código específico del error para el frontend
  errorCode!: string;

  // Mensaje descriptivo del error
  message!: string;

  // Timestamp cuando ocurrió el error
  timestamp!: string;
}