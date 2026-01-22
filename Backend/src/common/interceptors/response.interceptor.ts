import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseDto } from '../dto/response.dto';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        // Si ya es ResponseDto, no lo vuelvas a envolver
        if (data && typeof data === 'object' && 'success' in data && 'statusCode' in data) {
          return data;
        }

        const statusCode = response.statusCode || 200;

        const payload: ResponseDto<any> = {
          success: statusCode < 400,
          statusCode,
          data,
          message: this.getMessageByStatus(statusCode),
          timestamp: new Date().toISOString(),
          path: request.url,
        };

        return payload;
      }),
    );
  }

  private getMessageByStatus(statusCode: number): string {
    const messages: Record<number, string> = {
      200: 'Operación exitosa',
      201: 'Recurso creado exitosamente',
      204: 'Recurso eliminado exitosamente',
      400: 'Solicitud inválida',
      401: 'No autenticado',
      403: 'No autorizado',
      404: 'Recurso no encontrado',
      500: 'Error interno del servidor',
    };
    return messages[statusCode] || 'Operación completada';
  }
}
