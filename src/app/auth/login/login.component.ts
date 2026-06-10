import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgForm } from '@angular/forms';
// --- ✨ 1. Importa tu AuthService ---
import { AuthService } from '../../services/auth.service'; // Asegúrate de que la ruta del servicio sea correcta
import { HttpClient } from '@angular/common/http'; // HttpClient aún es necesario para el registro

declare const google: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  // Propiedades de Login
  hidePassword = true;
  email = '';
  password = '';
  mensajeError = '';
  loading = false;

  // Propiedades de Registro
  nombre = '';
  apellidoPaterno = '';
  apellidoMaterno = '';
  direccion = '';
  celular = '';
  emailReg = '';
  passwordReg = '';
  passwordRepeat = '';
  mensajeRegistroError = '';
  hideRegPassword = true;

  @ViewChild('modalRegistro') modalRegistro!: TemplateRef<any>;
  @ViewChild('registroForm') registroForm!: NgForm;

  // Propiedad de Google y Términos
  autenticadoConGoogle = false;
  acceptTerms: boolean = false; // <-- ✨ Propiedad añadida que faltaba

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    // --- ✨ 2. Inyecta el AuthService ---
    private authService: AuthService,
    // Mantenemos HttpClient para la lógica de registro que aún no está en el servicio
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Usamos el servicio para verificar si ya hay una sesión
    if (this.authService.isLoggedIn()) {
      this.redirigirPorRol(this.authService.getRol()!);
      return;
    }

    // Lógica de Google (sin cambios)
    google.accounts.id.initialize({
      client_id: '784015246697-hnfrefqifasnu9p9ekn8f01af669ik70.apps.googleusercontent.com',
      callback: (response: any) => this.handleCredentialResponse(response)
    });

    google.accounts.id.renderButton(
      document.getElementById('googleButton'),
      { theme: 'outline', size: 'large', type: 'standard' }
    );
  }

  abrirModalRegistro() {
    // Resetear las variables y el estado del formulario antes de abrir el modal
    this.nombre = '';
    this.apellidoPaterno = '';
    this.apellidoMaterno = '';
    this.direccion = '';
    this.celular = '';
    this.emailReg = '';
    this.passwordReg = '';
    this.passwordRepeat = '';
    this.mensajeRegistroError = '';
    this.hideRegPassword = true;
    this.acceptTerms = false;

    if (this.registroForm) {
      this.registroForm.resetForm();
    }

    this.dialog.open(this.modalRegistro, {
      width: '95vw',
      maxWidth: '800px',
      maxHeight: '95vh',
      disableClose: true,
      panelClass: 'custom-modal'
    });
  }

  login() {
    this.loading = true;
    this.mensajeError = '';

    // --- ✨ 3. CAMBIO CRUCIAL: Se llama al método login() del AuthService ---
    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        // El servicio ya guardó el token y notificó al navbar.
        // Aquí solo nos encargamos de la redirección.
        this.loading = false;
        this.redirigirPorRol(res.rol);
      },
      error: (err) => {
        this.loading = false;
        this.mensajeError = err.error?.message || 'Usuario o contraseña incorrectos';
      }
    });
  }

  // --- ✨ 4. El método 'procesarLogin' ya no es necesario y se ha eliminado ---

  handleCredentialResponse(response: any) {
    const idToken = response.credential;
    // RECOMENDACIÓN: Mueve esta lógica a un método `loginWithGoogle` en tu AuthService para mantener la consistencia.
    this.http.post<any>('http://localhost:8080/api/auth/google', { idToken }).subscribe({
      next: (res) => {
        // Procesamos el login usando la lógica del AuthService para notificar a toda la app
        localStorage.setItem('token', res.token);
        localStorage.setItem('rol', res.rol);
        localStorage.setItem('nombre', res.nombre);
        // Llamamos al login del servicio con datos falsos solo para disparar el BehaviorSubject
        // O mejor aún, crea un método en el servicio que haga esto.
        // Por ahora, recargamos la página como solución simple para el login de Google.
        window.location.reload(); 
        this.redirigirPorRol(res.rol);
      },
      error: (err) => {
        this.mensajeError = err.error || 'Error al iniciar con Google';
      }
    });
  }

  registrarCliente() {
    // ... (Tu lógica de validación de registro no cambia)
    if (this.registroForm.invalid || !this.acceptTerms) {
        this.snackBar.open('Por favor, complete todos los campos y acepte los términos.', 'Cerrar', { duration: 4000 });
        return;
    }

    const payload = {
      // ... tu payload
    };

    this.loading = true;
    // RECOMENDACIÓN: Mueve esta llamada a un método `register` en tu AuthService.
    this.http.post<any>('http://localhost:8080/api/usuarios', payload).subscribe({
      next: (res) => {
        this.loading = false;
        this.snackBar.open('Registro exitoso. Iniciando sesión...', 'Cerrar', { duration: 3000 });
        this.email = this.emailReg;
        this.password = this.passwordReg;
        this.dialog.closeAll();
        // Esto ahora usará el método de login corregido que notifica al navbar
        this.login(); 
      },
      error: (err) => {
        this.loading = false;
        this.mensajeRegistroError = err.error?.message || 'Error al registrar.';
        this.snackBar.open(this.mensajeRegistroError, 'Cerrar', { duration: 4000 });
      }
    });
  }

  private redirigirPorRol(rol: string) {
    switch (rol) {
      case 'ADMINISTRADOR':
        this.router.navigate(['/admin']);
        break;
      case 'DUENO':
        this.router.navigate(['/owner']);
        break;
      case 'CLIENTE':
        this.router.navigate(['/client']);
        break;
      default:
        this.router.navigate(['/home']);
    }
  }
}