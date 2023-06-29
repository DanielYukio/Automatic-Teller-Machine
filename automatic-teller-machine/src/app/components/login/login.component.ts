import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { of, switchMap } from 'rxjs';
import { ILoginParams } from 'src/app/_interfaces';
import { SessionService } from 'src/app/_services';
import { AlertService } from 'src/app/_services/alert.service';
import { AuthService } from 'src/app/_services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: [
    './login.component.scss',
    '../../_styles/login-register.scss',
  ]
})
export class LoginComponent {

  public loading = false;
  public hide = true;

  formGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private session: SessionService,
    private alert: AlertService,
  ) {
  }

  public get controls(): { [key: string]: AbstractControl } {
    return this.formGroup.controls;
  }

  public onSubmit() {
    if (this.formGroup.invalid) { return; }
    const value = this.formGroup.value as ILoginParams;
    this.loading = true;
    this.auth.login(value).pipe(
      switchMap(response => {
        this.session.setToken(response.value.token);
        return this.auth.profile()
      }),
      switchMap((response) => {
        this.session.setProfile(response.value);
        return of(true);
      })
    ).subscribe({
      next: (auth) => {
        this.loading = false;
        location.reload();
      },
      error: (error) => {
        this.loading = false;
        this.alert.onHTTPError(error);
        this.session.destroySession();
      },
    })
  }
}
