// src/app/services/auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private backendUrl = 'http://localhost:8080/api/auth';
// --- ✨ NUEVO: El locutor de radio ---
  // BehaviorSubject que guarda el estado de autenticación (true/false).
  // Empieza en 'false' porque al inicio nadie está logueado.
  private loggedInStatus = new BehaviorSubject<boolean>(this.isLoggedIn());
   // Hacemos público el "sintonizador de la radio" para que otros componentes escuchen.
  authStatus$ = this.loggedInStatus.asObservable();

  constructor(private http: HttpClient, private router: Router) {}
  
  login(email: string, password: string) {
    return this.http.post<{ token: string; rol: string; nombre: string }>(`${this.backendUrl}/login`, {
      email,
      password
    }).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('rol', response.rol);
        localStorage.setItem('nombre', response.nombre);

        // --- ✨ Notifica a todos los oyentes que el estado ha cambiado a "logueado" ---
        this.loggedInStatus.next(true);
      })
    );
  }

  logout() {
    localStorage.clear();
    // --- ✨ Notifica a todos los oyentes que el estado ha cambiado a "no logueado" ---
    this.loggedInStatus.next(false);
    this.router.navigate(['/welcome']); // Navega a la página pública
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRol(): string | null {
    return localStorage.getItem('rol');
  }

  getNombre(): string | null {
    return localStorage.getItem('nombre');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}

