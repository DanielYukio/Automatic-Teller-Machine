import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { Router } from '@angular/router';
import { IUser, IUserMenu } from 'src/app/_interfaces';
import { SessionService } from 'src/app/_services';
import { AlertService } from 'src/app/_services/alert.service';
import { AuthService } from 'src/app/_services/auth.service';
import { isDesktopWidth } from 'src/app/_utils';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  public isSession = this.session.isToken;
  public menus?: IUserMenu[];
  public profile: IUser | null = null;
  public profileURL = 'assets/noProfile.png';
  public sizeDesktop = true;

  @ViewChild('expansionPanel', { static: false }) expansionPanel?: MatExpansionPanel

  constructor(
    private session: SessionService,
    private alert: AlertService,
    private auth: AuthService,
    private router: Router
  ) { }

  @HostListener('window:resize', ['$event']) onResize(event: Event) {
    this.sizeDesktop = isDesktopWidth();
  }

  ngOnInit(): void {
    this.sizeDesktop = isDesktopWidth();
    if (this.isSession) {
      this.profile = this.session.getProfile();
      this.menus = this.session.getMenu();
      this.auth.profile().subscribe({
        next: (userProfile) => {
          this.session.setProfile(userProfile.value);
          this.menus = this.session.getMenu();
          this.profile = this.session.getProfile();
          // this.profileURL = UserProfilePreviewURL(this.profile?.USR_ID);
        },
        error: (error) => {
          this.alert.onHTTPError(error);
        }
      })
    }
  }

  public logout() {
    this.session.destroySession();
    this.isSession = this.session.isToken;
    this.router.navigate(['/login']);
  }

  public tryLogout() {
    this.alert.customControlAlert('Deseja sair da sua conta?', '', 'question').subscribe(
      (result) => {
        if (result.isConfirmed) {
          this.logout();
        };
      }
    );
  }

  public closeExpansionPanel() {
    if (this.expansionPanel) {
      this.expansionPanel.close();
    }
  }

  public removeFocus() {
    (document.activeElement as any).blur();
  }

}
