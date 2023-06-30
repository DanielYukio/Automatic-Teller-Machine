import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TransactionRoutingModule } from './transaction-routing.module';
import { TransactionComponent } from './transaction.component';
import { GlobalModule } from 'src/app/global.module';
import { TransactionDialogComponent } from './transaction-dialog/transaction-dialog.component';


@NgModule({
  declarations: [
    TransactionComponent,
    TransactionDialogComponent
  ],
  imports: [
    CommonModule,
    TransactionRoutingModule,
    GlobalModule,
  ]
})
export class TransactionModule { }
