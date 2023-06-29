import { Injectable } from '@angular/core';
import { IUser } from '../_interfaces/IDatabase';
import { IUserMenu } from '../_interfaces';
import { MenuUtils } from '../_utils';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private readonly keyToken = 'auth-token';
  private readonly keyProfile = 'user-profile';

  constructor() { }

  public get isToken(): boolean {
    return this.getToken() ? true : false;
  }
  public setToken(token: string): void {
    localStorage.setItem(this.keyToken, token);
  }
  public getToken(): string | null {
    return localStorage.getItem(this.keyToken);
  }
  private destroyToken(): void {
    localStorage.removeItem(this.keyToken);
  }


  public get isProfile(): boolean {
    return this.getProfile() ? true : false;
  }
  public setProfile(profile: IUser): void {
    localStorage.setItem(this.keyProfile, JSON.stringify(profile));
  }
  public getProfile(): IUser | null {
    const profile = localStorage.getItem(this.keyProfile);
    return profile ? JSON.parse(profile) : null;
  }
  private destroyProfile(): void {
    localStorage.removeItem(this.keyProfile);
  }


  public startSession(token: string, profile: IUser): void {
    this.setToken(token);
    this.setProfile(profile);
  }

  public destroySession(): void {
    this.destroyToken();
    this.destroyProfile();
  }

  public getMenu(): IUserMenu[] {
    const profile = this.getProfile();

    if (!profile) {
      this.destroySession();
      return [];
    }

    return MenuUtils.getMenu();

  }
}
