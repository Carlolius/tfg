import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})

// Return true if the user has permissions, in this case if it's logged in.
export class AuthguardService implements CanActivate {
  constructor(public authService: AuthService, private router: Router) { }
	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
		// when the user is logged in and just navigated to another route...
		if (this.authService.isLoggedIn()) {
			return true; // proceeds if not loggedIn or F5/page refresh 
		} 
		this.authService.redirectUrl = state.url; // Store the attempted URL for redirecting later

		this.router.navigate(['/']); // go login page
		return false;
	}
}
