import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
})
export class AppSideRegisterComponent {
  constructor(private router: Router, private http: HttpClient) { }

  form = new FormGroup({
    name: new FormControl('', [Validators.required, this.customNameValidator]),
    uname: new FormControl('', [Validators.required, Validators.minLength(6)], this.validateUsernameExistence.bind(this)),
    password: new FormControl('', [
      Validators.required,
      this.customPasswordValidator
    ]),
  });

  showErrorMessages = true;

  get f() {
    return this.form.controls;
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);

    if (control?.hasError('required')) {
      return 'Campo obbligatorio';
    }

    if (control?.hasError('minlength')) {
      const requiredLength = control?.errors?.['minlength'].requiredLength;
      return `Il campo deve contenere almeno ${requiredLength} caratteri`;
    }

    if (control?.hasError('customNameValidator')) {
      return 'Il campo deve contenere solo lettere';
    }

    if (control?.hasError('customPasswordValidator')) {
      return 'La password deve contenere almeno 8 caratteri, una lettera maiuscola, un numero e un simbolo';
    }

    if (control?.hasError('usernameExists')) {
      return 'Questo username non è disponibile';
    }

    return '';
  }

  submit() {
    if (this.form.invalid) {
      console.log("form not valid");
      return;
    }

    const { name, uname, password } = this.form.value;

    this.http.post(`${environment.apiUrl}/register`, { name, uname, password }).subscribe(
      (response) => {
        console.log('Registration successful');
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error('Registration failed');
      }
    );
  }

  customNameValidator(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value;

    if (value && value.length > 0) {
      if (!/^[a-zA-Z]*$/.test(value)) {
        return { customNameValidator: true };
      }
    }

    return null;
  }

  customPasswordValidator(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value;
  
    if (value && value.length > 0) {
      if (!/(?=.*\d)(?=.*[A-Z])(?=.*[@$!%*?&]).{8,}$/.test(value)) {
        return { customPasswordValidator: true };
      }
    }
  
    return null;
  }

  validateUsernameExistence(control: AbstractControl): Promise<ValidationErrors | null> {
    return new Promise((resolve) => {
      const value: string = control.value;

      this.http.get(`${environment.apiUrl}/api/check-username?uname=${value}`).subscribe(
        (response: any) => {
          if (response.exists) {
            resolve({ usernameExists: true });
          } else {
            resolve(null);
          }
        },
        (error) => {
          console.error('Error occurred while checking username existence');
          resolve(null);
        }
      );
    });
  }
}
