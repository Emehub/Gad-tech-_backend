import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        const serialized = this.serialize(data);
        if (serialized && typeof serialized === 'object' && 'data' in serialized) {
          return { success: true, ...serialized };
        }
        return { success: true, data: serialized };
      }),
    );
  }

  private serialize(value: any): any {
    if (value === null || value === undefined) return value;
    if (Array.isArray(value)) return value.map((v) => this.serialize(v));
    if (typeof value === 'object') {
      // Prisma Decimal — has s/e/d and a toNumber() method
      if (typeof value.toNumber === 'function') return value.toNumber();
      const out: any = {};
      for (const key of Object.keys(value)) out[key] = this.serialize(value[key]);
      return out;
    }
    return value;
  }
}
