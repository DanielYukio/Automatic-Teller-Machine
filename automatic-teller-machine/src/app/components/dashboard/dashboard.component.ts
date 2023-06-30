import { Component, OnInit } from '@angular/core';
import { IAccount } from 'src/app/_interfaces';
import { ApiRequestService, SessionService } from 'src/app/_services';
import { AlertService } from 'src/app/_services/alert.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [
    './dashboard.component.scss',
    '../../_styles/common.scss'
  ]
})
export class DashboardComponent implements OnInit{

  protected accountInfo?: IAccount;

  constructor(
    private api: ApiRequestService,
    private alert: AlertService,
    private session: SessionService,
  ){
  }

  ngOnInit(): void {
    this.api.getMyAccount().subscribe({
      next: (response) => {
        console.log(response);
        this.accountInfo = response.value;
      },
      error: (error) => {
        this.alert.onHTTPError(error);
      }
    })
  }

}
