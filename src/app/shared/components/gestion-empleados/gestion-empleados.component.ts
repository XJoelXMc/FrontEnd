import { Component, OnInit, TemplateRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms'; // Importamos AbstractControl, ValidationErrors, ValidatorFn
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { EmpleadoService } from '../../../services/empleados.service';

// Validador personalizado para asegurar que al menos un apellido (paterno o materno) esté presente
export const atLeastOneApellidoValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const apellidoPaterno = control.get('apellidoPaterno')?.value;
  const apellidoMaterno = control.get('apellidoMaterno')?.value;

  // Si al menos uno de los apellidos tiene contenido (ignorando espacios en blanco)
  if ((apellidoPaterno && apellidoPaterno.trim().length > 0) || (apellidoMaterno && apellidoMaterno.trim().length > 0)) {
    return null; // La validación es exitosa
  }
  // Si ninguno de los apellidos tiene contenido, retorna un error
  return { atLeastOneApellidoRequired: true };
};

@Component({
  selector: 'app-gestion-empleados',
  templateUrl: './gestion-empleados.component.html',
  styleUrls: ['./gestion-empleados.component.scss']
})
export class GestionEmpleadosComponent implements OnInit, AfterViewInit {
  empleados = new MatTableDataSource<any>([]);
  columnas: string[] = ['nombre', 'apellido', 'rol', 'acciones'];

  @ViewChild('modalEmpleado') modalEmpleado!: TemplateRef<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  formulario!: FormGroup;
  editando = false;
  hidePassword = true;
  empleadoEditandoId: number | null = null;

  constructor(
    private empleadoService: EmpleadoService,
    public dialog: MatDialog,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarEmpleados();
  }

  ngAfterViewInit(): void {
    this.empleados.paginator = this.paginator;
  }

  inicializarFormulario() {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)]],
      // Apellidos ahora son opcionales individualmente, la validación "al menos uno" se aplica al FormGroup
      apellidoPaterno: ['', [Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)]],
      apellidoMaterno: ['', [Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)]],
      direccion: [''], // Mantengo como opcional en el front, backend tiene @NotBlank
      celular: [''],   // Mantengo como opcional en el front, backend tiene @NotBlank y @Pattern
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8), // Contraseña mínima de 8 caracteres
        // Expresión regular para una contraseña robusta:
        // al menos una minúscula (?=.*[a-z])
        // al menos una mayúscula (?=.*[A-Z])
        // al menos un dígito (?=.*\d)
        // al menos un carácter especial (?=.*[@$!%*?&])
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      rol: ['', Validators.required]
    }, { validators: atLeastOneApellidoValidator }); // Aplica el validador personalizado a todo el formulario
  }

  cargarEmpleados() {
    this.empleadoService.listar().subscribe(data => {
      this.empleados.data = data;
      if (this.paginator) {
        this.empleados.paginator = this.paginator;
      }
    });
  }

  abrirModal() {
    this.editando = false;
    this.formulario.reset();
    // Limpiar explícitamente los errores del formulario después de resetearlo
    this.formulario.clearValidators();
    this.formulario.setValidators(atLeastOneApellidoValidator);
    this.formulario.updateValueAndValidity();


    // Habilitar campos que podrían haber sido deshabilitados en modo edición
    this.formulario.get('email')?.enable();
    this.formulario.get('password')?.enable();

    this.dialog.open(this.modalEmpleado, {
      width: '600px',
      disableClose: true
    });
  }

  editarEmpleado(emp: any) {
    console.log('este es el id: ' + emp.id);
    this.editando = true;
    this.empleadoEditandoId = emp.id;

    this.formulario.patchValue({
      nombre: emp.nombre,
      apellidoPaterno: emp.apellidoPaterno,
      apellidoMaterno: emp.apellidoMaterno,
      direccion: emp.direccion,
      celular: emp.celular,
      email: emp.email,
      rol: emp.rol
    });

    // Asegurarse de que el validador personalizado se aplique en modo edición también,
    // y luego actualizar la validez del formulario.
    this.formulario.setValidators(atLeastOneApellidoValidator);
    this.formulario.updateValueAndValidity();

    console.log(this.formulario);

    // Solo desactivamos el campo email y password en edición
    this.formulario.get('email')?.disable();
    this.formulario.get('password')?.disable(); // La contraseña no se edita directamente

    this.dialog.open(this.modalEmpleado, {
      width: '600px',
      disableClose: true
    });
  }

  guardarEmpleado() {
    // Marcar los campos como tocados antes de la validación final para mostrar errores
    this.formulario.markAllAsTouched();

    if (this.formulario.invalid) {
      // Verifica si el error específico de apellidos está presente
      if (this.formulario.hasError('atLeastOneApellidoRequired')) {
        console.warn('Error: Se requiere al menos un apellido.');
        // Puedes mostrar un mensaje al usuario aquí, si lo deseas, o confiar en el *ngIf del HTML
      }
      return;
    }

    const formValue = this.formulario.getRawValue(); // Para obtener campos deshabilitados también
    let payload: any;

    if (this.editando && this.empleadoEditandoId) {
      payload = {
        rol: formValue.rol,
        persona: {
          nombre: formValue.nombre,
          apellidoPaterno: formValue.apellidoPaterno,
          apellidoMaterno: formValue.apellidoMaterno,
          direccion: formValue.direccion,
          celular: formValue.celular
        }
      };

      this.empleadoService.actualizar(this.empleadoEditandoId, payload).subscribe(() => {
        this.dialog.closeAll();
        this.cargarEmpleados();
        this.formulario.reset();
        // Limpiar errores del formulario después de resetear
        this.formulario.clearValidators();
        this.formulario.setValidators(atLeastOneApellidoValidator);
        this.formulario.updateValueAndValidity();

        this.editando = false;
        this.empleadoEditandoId = null;
      });
    } else {
      payload = {
        email: formValue.email,
        password: formValue.password,
        rol: formValue.rol,
        persona: {
          nombre: formValue.nombre,
          apellidoPaterno: formValue.apellidoPaterno,
          apellidoMaterno: formValue.apellidoMaterno,
          direccion: formValue.direccion,
          celular: formValue.celular
        }
      };

      this.empleadoService.crear(payload).subscribe({
        next: () => {
          this.dialog.closeAll();
          this.cargarEmpleados();
          this.formulario.reset();
          // Limpiar errores del formulario después de resetear
          this.formulario.clearValidators();
          this.formulario.setValidators(atLeastOneApellidoValidator);
          this.formulario.updateValueAndValidity();
        },
        error: err => {
          console.error('Error al crear empleado:', err);
          alert(err.error?.mensaje || 'Error al crear empleado');
        }
      });
    }
  }

  eliminarEmpleado(id: number) {
    if (confirm('¿Estás seguro de eliminar este empleado?')) {
      this.empleadoService.eliminar(id).subscribe(() => {
        this.cargarEmpleados();
      });
    }
  }
}