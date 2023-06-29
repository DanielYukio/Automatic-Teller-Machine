import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IRegisterParans } from 'src/app/_interfaces';
import { AlertService } from 'src/app/_services/alert.service';
import { AuthService } from 'src/app/_services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: [
    './register.component.scss',
    '../../_styles/login-register.scss'
  ]
})
export class RegisterComponent {
  public loading = false;
  public hidePass = true;
  public hideConfirmPass = true;

  public formGroup = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    confirmPass: ['', [Validators.required]],
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private alert: AlertService,
  ) {
  }

  public get controls(): { [key: string]: AbstractControl } {
    return this.formGroup.controls;
  }

  public ngOnInit(): void {
  }

  public onSubmit() {
    if (this.formGroup.invalid) { return; }
    const values = this.formGroup.value as IRegisterParans;
    this.loading = true;
    this.auth.firstRegister(values).subscribe({
      next: (response) => {
        this.loading = false;
        this.alert.onSuccess(response.message);
        this.router.navigate(['./login']);
      },
      error: (error) => {
        this.loading = false;
        this.alert.onHTTPError(error);
        this.router.navigate(['./login']);
      },
    });
  }


  public onPasswordChange() {
    const password = this.controls['password'];
    const confirmPass = this.controls['confirmPass'];
    confirmPass.setErrors(password.value === confirmPass.value ? null : { mismatch: true });
  }

  public get invalidPass() {
    return this.controls['password'].invalid
  }
}
