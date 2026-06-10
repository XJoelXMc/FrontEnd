import { CategoriaInventario } from './categoriaInventario.model';

export interface Proveedor {
    id: number;
    nombre: string;
    nombreEmpresa: string;
    contacto: string;
    direccion?: string;
    imagenUrl?: string;
    categoriasOfrecidas?: CategoriaInventario[];
    categoriasOfrecidasIds?: number[];
}
