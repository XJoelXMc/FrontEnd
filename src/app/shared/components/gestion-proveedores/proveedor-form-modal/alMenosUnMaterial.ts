import { AbstractControl, FormArray, ValidationErrors } from '@angular/forms';

export function alMenosUnMaterial(control: AbstractControl): ValidationErrors | null {
  const array = control as FormArray;
  return array && array.length > 0 ? null : { sinMateriales: true };
}
