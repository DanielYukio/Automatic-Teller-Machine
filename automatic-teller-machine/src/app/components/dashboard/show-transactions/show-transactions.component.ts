import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TransactionType } from 'src/app/_enums';
import { ITransaction } from 'src/app/_interfaces';

@Component({
  selector: 'app-show-transactions',
  templateUrl: './show-transactions.component.html',
  styleUrls: ['./show-transactions.component.scss']
})
export class ShowTransactionsComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ShowTransactionsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ITransaction[],
  ) { }


  ngOnInit(): void {

  }

}
