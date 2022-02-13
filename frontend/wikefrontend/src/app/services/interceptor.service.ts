import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, filter, take, switchMap, finalize } from 'rxjs/operators';
import { ToastController } from '@ionic/angular';

@Injectable()
export class Interceptor implements HttpInterceptor {
	// Used for queued API calls while refreshing tokens
	tokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);
	isRefreshingToken = false;
	headerreq:any;

	constructor(private authService: AuthService, private toastCtrl: ToastController) { }

	// Intercept every HTTP call
	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		if (this.isInBlockedList(request.url)) {
			return next.handle(request);
		} else {
			return next.handle(this.addToken(request)).pipe(catchError(error => {
				if (error instanceof HttpErrorResponse) {
					switch (error.status) {
						case 400:
							return this.handle400Error();
						case 401:
							return this.handle401Error(request, next);
						default:
						return throwError(error);
					}
				} else {
					return throwError(error);
				}
			}));
		}
	}

	// Filter out URLs where don't want to add the token
	private isInBlockedList(url: string): Boolean {
		// Example: Filter out our login and logout API call
		if (url == `${environment.SERVER_ADDRESS}users/token/refresh/`
			|| url == `${environment.SERVER_ADDRESS}users/users/`
			|| url == `${environment.SERVER_ADDRESS}users/token/`) {
			return true;
		} else {
			return false;
		}
	}


	// Add current access token 
	private addToken(request: HttpRequest<any>) {
		if (this.authService.token) {
			return request.clone({
				headers: new HttpHeaders({
					Authorization: `Bearer ${this.authService.token['access']}`
				})
			});
		} else {
			return request;
		}
	}

	// Not authorized, couldn't refresh token or something else along the caching went wrong
	private async handle400Error() {
		// Potentially check the exact error reason for the 400
		// then log out the user automatically
		const toast = await this.toastCtrl.create({
			message: 'Logged out due to authentication mismatch',
			duration: 2000
		});
		toast.present();
		this.authService.logout();
		return of(null);
	}


	// Access token invalid, try to load a new one
	private handle401Error(request: HttpRequest <any>, next: HttpHandler): Observable <any> {
		// Check if another call is already using the refresh logic
		if(!this.isRefreshingToken) {

			// Set to null so other requests will wait
			// until we got a new token!
			this.tokenSubject.next(null);
			this.isRefreshingToken = true;

			// First, get a new access token
			return this.authService.refreshToken().pipe(
				switchMap(token => {
					if (token) {
						// Store the new token
						return this.authService.storeJwtToken(token).then(
							switchMap(_ => {
								// Use the subject so other calls can continue with the new token
								this.tokenSubject.next(token['access']);
								// Perform the initial request again with the new token
								return next.handle(this.addToken(request));
								// return next.handle(this.addToken(request, accessToken));
							})
						);
					} else {
						// No new token or other problem occurred
						return of(null);
					}
				}),
				finalize(() => {
					// Unblock the token reload logic when everything is done
					this.isRefreshingToken = false;
				})
			);
		} else {
			// "Queue" other calls while we load a new token
			return this.tokenSubject.pipe(
				filter(token => token !== null),
				take(1),
				switchMap(token => {
					// Perform the request again now that we got a new token!
					return next.handle(this.addToken(request));
					// return next.handle(this.addToken(request, token['access']));
				})
			);
		}
	}

}
