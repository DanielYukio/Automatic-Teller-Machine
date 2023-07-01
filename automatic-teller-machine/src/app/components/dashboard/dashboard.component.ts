import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TransactionType } from 'src/app/_enums';
import { IAccount, ITransaction } from 'src/app/_interfaces';
import { ApiRequestService, SessionService } from 'src/app/_services';
import { AlertService } from 'src/app/_services/alert.service';
import { TransactionDialogComponent } from './transaction-dialog/transaction-dialog.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [
    './dashboard.component.scss',
    '../../_styles/common.scss'
  ]
})
export class DashboardComponent implements OnInit {
  public TransactionType = TransactionType;

  protected accountInfo?: IAccount;
  protected transactions?: ITransaction[];

  constructor(
    private api: ApiRequestService,
    private alert: AlertService,
    private session: SessionService,
    private dialog: MatDialog,
  ) {
  }

  ngOnInit(): void {
    this.getAccountInfo();
    this.getTransactions();
  }

  getAccountInfo() {
    this.api.getMyAccount().subscribe({
      next: (response) => {
        this.accountInfo = response.value;
      },
      error: (error) => {
        this.alert.onHTTPError(error);
      }
    });
  }

  getTransactions() {
    this.api.getMyTransactions({ page: 0, pageSize: 10 }).subscribe({
      next: (response) => {
        this.transactions = response.value;
      },
      error: (error) => {
        this.alert.onHTTPError(error);
      }
    })
  }

  protected openTransactionForm(type: TransactionType) {
    const dialog = this.dialog.open(TransactionDialogComponent, {
      data: type,
    })
  }

  protected onPageChanged(event: any) {
    console.log(event);
  }

}
