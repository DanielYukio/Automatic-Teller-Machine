import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TransactionType } from 'src/app/_enums';
import { ITransaction } from 'src/app/_interfaces';
import { ApiRequestService, SessionService } from 'src/app/_services';
import { AlertService } from 'src/app/_services/alert.service';

@Component({
  selector: 'app-transaction-dialog',
  templateUrl: './transaction-dialog.component.html',
  styleUrls: [
    './transaction-dialog.component.scss',
    '../../../_styles/common.scss'
  ]
})
export class TransactionDialogComponent implements OnInit {

  private profile = this.session.getProfile();

  protected transaction: ITransaction = {
    amount: undefined,
    originAccountNumber: this.profile?.accountNumber || 0,
    type: this.transactionType,
    secondaryAccountNumber: null
  }

  protected get formValid() {
    return (this.transaction.amount || 0) > 0
      && (!(this.transactionType === TransactionType.TRANSFERENCIA)
        || this.transaction.secondaryAccountNumber);
  }

  constructor(
    private api: ApiRequestService,
    private alert: AlertService,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TransactionDialogComponent>,
    private session: SessionService,
    @Inject(MAT_DIALOG_DATA) public transactionType: TransactionType,
  ) { }


  ngOnInit(): void {
  }

  protected onSubmit() {
    if (!this.formValid) { return; }
    this.api.executeTransaction(this.transaction).subscribe({
      next: (response) => {
        this.alert.onSuccess(response.message).subscribe(() => location.reload());
      },
      error: (error) => {
        this.alert.onHTTPError(error);
      }
    })
  }



}
