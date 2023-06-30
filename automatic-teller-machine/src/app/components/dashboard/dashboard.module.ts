import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { GlobalModule } from 'src/app/global.module';
import { TransactionDialogComponent } from './transaction-dialog/transaction-dialog.component';
import { ShowTransactionsComponent } from './show-transactions/show-transactions.component';
// import { TransactionComponent } from '../transaction/transaction.component';


@NgModule({
  declarations: [
    DashboardComponent,
    TransactionDialogComponent,
    ShowTransactionsComponent,
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    GlobalModule,
  ]
})
export class DashboardModule { }
