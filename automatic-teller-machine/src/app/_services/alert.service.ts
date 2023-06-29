import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from } from 'rxjs';
import Swal from 'sweetalert2';
import { isInvalidSession } from 'src/app/_utils';
import { SessionService } from './session.service';


export type swalIcons =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'question';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(
    private session: SessionService,
  ) { }

  public customAlert(title: string, htmlMessage: string, icon: swalIcons) {
    return from(Swal.fire({
      title, icon,
      html: htmlMessage,
      cancelButtonText: 'Fechar',
      showCancelButton: true,
      showConfirmButton: false,
    }));
  }

  public customControlAlert(title: string, htmlMessage: string, icon: swalIcons) {
    return from(Swal.fire({
      title, icon,
      html: htmlMessage,
      cancelButtonText: 'Não',
      confirmButtonText: 'Sim',
      confirmButtonColor: 'red',
      focusCancel: true,
      showCancelButton: true,
      showConfirmButton: true,
    }))
  }

  public onSuccess(message: string) {
    return from(Swal.fire({
      title: 'Sucesso!',
      text: message,
      icon: 'success',
      cancelButtonText: 'Fechar',
      showCancelButton: true,
      showConfirmButton: false,
    }));
  }

  public onWarning(message: string) {
    return from(Swal.fire({
      title: 'Alerta!',
      html: message,
      icon: 'warning',
      cancelButtonText: 'Ok',
      showCancelButton: true,
      showConfirmButton: false,
    }));
  }

  public onError(message: string) {
    return from(Swal.fire({
      title: 'Erro!',
      text: message,
      icon: 'error',
      cancelButtonText: 'Fechar',
      showCancelButton: true,
      showConfirmButton: false
    }));
  }

  public onWarningControl(message: string) {
    return from(Swal.fire({
      title: 'Alerta!',
      icon: 'warning',
      cancelButtonText: 'Não',
      confirmButtonText: 'Sim',
      confirmButtonColor: 'red',
      html: message,
      focusCancel: true,
      showCancelButton: true,
      showConfirmButton: true,
    }))
  }

  public onHTTPError(error: HttpErrorResponse) {
    if (error && (error.message || error.error.message)) {
      let msg = error.message;
      msg = error.error.message ? error.error.message : msg;
      if (error.statusText && error.statusText === 'Unknown Error') {
        msg = 'Falha (interna) no Servidor, Contate o Suporte.'
      }

      if (isInvalidSession(msg)) {
        // Router.prototype.navigate(['/login']);
        setTimeout(() => this.session.destroySession(), 200);
        this.onWarning(msg).subscribe(() => {
          location.reload();
        });
      } else {
        this.onWarning(msg);
      }

    } else {
      this.onError('Erro Inesperado. Tente novamente ou contate o suporte.');
    }
  }
}