import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
// --- ✨ 1. Importa tu AuthService ---
import { AuthService } from '../services/auth.service'; // Asegúrate de que la ruta sea correcta

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    // --- ✨ 2. Inyecta el AuthService ---
    private authService: AuthService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // 3. Obtén el token a través del AuthService, que es la fuente única de verdad.
    const token = this.authService.getToken();

    // 4. Si el token existe, SIEMPRE clona la petición y añade la cabecera.
    if (token) {
      // Clona la petición para añadir la nueva cabecera de autorización.
      const clonedRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Envía la petición clonada (con el token) al siguiente manejador.
      return next.handle(clonedRequest).pipe(
        catchError((error: HttpErrorResponse) => {
          // Si el servidor responde 401 o 403, incluso con token, significa que ha expirado o es inválido.
          if (error.status === 401 || error.status === 403) {
            console.error('Token inválido o expirado. Cerrando sesión.', error);
            // Usamos el método centralizado de logout que también notifica al navbar y redirige.
            this.authService.logout();
          }
          return throwError(() => error);
        })
      );
    }

    // 5. Si no hay token, simplemente deja pasar la petición original.
    // Esto es para las rutas públicas como /login. El backend se encargará de aceptarlas o rechazarlas.
    return next.handle(request);
  }
}
