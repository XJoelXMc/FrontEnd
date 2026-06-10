// models/usuario.model.ts
export interface Usuario {
  id: number;
  email: string;
  rol: 'CLIENTE' | 'ADMINISTRADOR' | 'DUENO';
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  direccion: string | null;
  celular: string | null;
}
