import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { map, Observable, take, tap } from 'rxjs';
import { AuthService } from './services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AppRouteGuard implements CanActivate {

  constructor(
    private as: AuthService,
    private router: Router
    ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean>  {
      return this.as.isAuthenticated$.pipe(
        take(1), //make sure that the observable is only subscribed to once
        tap(isAuthenticated => {
          if (!isAuthenticated) {
            this.router.navigate(['/login']);
          }
        }
      ));
  }
  
}
