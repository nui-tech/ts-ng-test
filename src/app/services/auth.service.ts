import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router) {
    this.setIsAuthenticated(this.checkToken());
  }

  private _isAuthenticatedSource = new BehaviorSubject<boolean>(false);

  private setIsAuthenticated(isAuthenticated: boolean): void { this._isAuthenticatedSource.next(isAuthenticated); }

  isAuthenticated$ = this._isAuthenticatedSource.asObservable();

  login(email: string, password: string): Promise<boolean> {
    localStorage.setItem('token', window.btoa(email + ':' + password));
    this.setIsAuthenticated(true);
    return Promise.resolve(true);
  }

  logout(): void {
    this.setIsAuthenticated(false);
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  private checkToken(): boolean {
    const token = localStorage.getItem('token');
    return token ? true : false;
  }

}
