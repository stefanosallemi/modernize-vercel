import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class AppSideLoginComponent {
  form = new FormGroup({
    uname: new FormControl('', [Validators.required, Validators.minLength(6)]),
    password: new FormControl('', [Validators.required]),
  });

  constructor(private router: Router, private http: HttpClient) { }

  get f() {
    return this.form.controls;
  }

  showErrorMessages = true;
  
  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
  
    if (control?.hasError('required')) {
      return 'Campo obbligatorio';
    }
  
    if (control?.hasError('minlength')) {
      const requiredLength = control?.errors?.['minlength'].requiredLength;
      return `Il campo deve contenere almeno ${requiredLength} caratteri`;
    }

    if (control?.hasError('usernameNotExists')) {
      return 'Questo username non esiste';
    }

    if (control?.hasError('incorrectPassword')) {
      return 'Password non valida';
    }
  
    return '';
  }

  submit() {
    if (this.form.invalid) {
      console.log("form not valid");
      return;
    }
  
    const { uname, password } = this.form.value;
  
    // Controllo dell'esistenza dell'username
    this.http.get(`${environment.apiUrl}/api/check-username?uname=${uname}`).subscribe(
      (response: any) => {
        if (response.exists) {
          // Effettua il login solo se l'username esiste
          this.http.post(`${environment.apiUrl}/api/login`, { uname, password }).subscribe(
            (loginResponse: any) => {
              const token = loginResponse.token;
              localStorage.setItem('authToken', token);
              console.log('Login successful');
              this.router.navigate(['/dashboard']);
            },
            (error) => {
              console.error('Login failed');
              this.form.get('password')?.setErrors({ incorrectPassword: true });
            }
          );
        } else {
          console.error('Username non esiste');
          this.form.get('uname')?.setErrors({ usernameNotExists: true });
        }
      },
      (error) => {
        console.error('Error occurred while checking username existence');
      }
    );
  }
  
  
}
