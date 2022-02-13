import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { tap, catchError, map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from "@angular/router";

import { AuthResponse } from '../models/auth-response';
import { NavController } from '@ionic/angular';

import { Storage } from '@ionic/storage-angular';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AlertController } from '@ionic/angular';

@Injectable({
	providedIn: 'root'
})

export class AuthService {

	private _storage: Storage | null = null;

	SERVER_ADDRESS = environment.SERVER_ADDRESS;
	isAuthenticated = new BehaviorSubject<boolean>(null);
	JwtHelper = new JwtHelperService();

	token:any;
	access:any;
	refresh:any;
	userid:any;
	username:any;
	session:any;
	redirectUrl: string;

	constructor(
		private httpClient: HttpClient,
		private storage: Storage,
		private navCtrl: NavController,
		private router: Router,
		private alertController: AlertController,
	) {
		this.checkToken();  // Check if ther's a token stored
		this.initStorage(); // Initiates the storage service
	}

	// Init for storage service
	async initStorage() {
		if(this._storage != null) {
			return;
		}
		const storage = await this.storage.create();
		this._storage = storage;
	}

	// Check if the user is already logged in.
	async checkToken() {
		await this.getRefreshToken().then(refresh => {
			this.refresh = refresh
		})
		await this.getJwtToken().then(token => {
			if(token) {
				this.token = token
				let decoded = this.JwtHelper.decodeToken(token['access']);
				let isAccessExpired = this.JwtHelper.isTokenExpired(token['access']);
				// console.log("Accessexpired?", isAccessExpired);
				if(!isAccessExpired) {
					this.storeAccessToken(token['access'])
					this.userid = decoded['user_id'];
					this.getUsername();
					this.session = this.getSession();
					this.isAuthenticated.next(true);
					if(this.redirectUrl) {
						this.router.navigate([this.redirectUrl]);
					}
				}
				else {
					this.removeToken();
					this.isAuthenticated.next(false);
				}
			}
		})
	}

	// Check if the user is logged in
	isLoggedIn(): boolean {
		return this.isAuthenticated.value;
	}

	// Check the user session
	getSession() {
		return this.httpClient.post(this.SERVER_ADDRESS + 'users/getsession/', {request: Request})
	}

	// Check the username
	getUsername(){
		return this.httpClient.post(this.SERVER_ADDRESS + 'users/getusername/', {request: Request})
	}

	// Login
	// Alert login error
	async presentLoginError() {
		const alert = await this.alertController.create({
			header: 'Login error!',
			message: 'Wrong username or password.',
			buttons: ['OK']
		});
		await alert.present();
	}

	login(username: String, password: String){
		return this.httpClient.post(this.SERVER_ADDRESS + 'users/token/', {"username": username, "password": password}).pipe(
			tap(token => {
				this.storeJwtToken(token)
				this.storeAccessToken(token['access'])
				this.storeRefreshToken(token['refresh'])
				// this.storeUser(username.toString())
				let decoded = this.JwtHelper.decodeToken(token['access']);
				this.userid = decoded['user_id'];
				// this.session = this.getSession();
				this.isAuthenticated.next(true);
			}),
			catchError(e => {
				this.presentLoginError();
				throw Error(e['error']['detail']);
			})
		)
	}

	// Register
	// Alert register error
	async presentRegisterError() {
		const alert = await this.alertController.create({
			header: 'Register error!',
			message: 'The username already exists.',
			buttons: ['OK']
		});
		await alert.present();
	}

	register(username: String, password: String, mySession:string) {
		return this.httpClient.post(this.SERVER_ADDRESS + 'users/users/', {"username": username, "password": password, "userSession": mySession}).pipe(
			tap(res => {
				console.log("resres", res);
				this.login(username, password).subscribe(
					tap(logres => {
						console.log("logres", logres);
						
					})
				)
				}),
			catchError(error => {
				if (error['status'] == 400){
					this.presentRegisterError();
				}
				throw new Error(error);
			})
		)
	}

	// Logout
	logout() {
		this.removeToken();
		this.isAuthenticated.next(false);
		this.navCtrl.navigateRoot('/home');
	}

	// Interceptor
	async storeJwtToken(token:any):Promise<any> {
		await this.initStorage();
		this.token = token;
		// this.storeRefreshToken(token['refresh'])
		return this._storage?.set("token", token);
	}

	async getJwtToken():Promise<any> {
		await this.initStorage();
		return await this._storage?.get("token");
	}

	async storeAccessToken(token:any):Promise<any> {
		await this.initStorage();
		this.access = token;
		return this._storage?.set("access", token);
	}

	async getAccessToken():Promise<any> {
		await this.initStorage();
		return await this._storage?.get("access");
	}

	async storeRefreshToken(token:any):Promise<any> {
		console.log("storeRefreshToken", token);
		
		this.refresh = token;
		await this.initStorage();
		console.log("thistokenafter", this.refresh)
		return this._storage?.set("refresh", token);
	}

	async getRefreshToken():Promise<any> {
		await this.initStorage();
		return await this._storage?.get("refresh");
	}

	async removeToken():Promise<any> {
		await this.initStorage();
		return await this._storage?.clear();
	}

	refreshToken() {
		return this.httpClient.post(this.SERVER_ADDRESS + 'users/token/refresh/', {
			'refresh': this.refresh
			}).pipe(tap(token => {
				this.storeAccessToken(token['access']);
		}));
	}

	// Get data function for testing

	getData() {
		const headers = new HttpHeaders({
			'Authorization': "Bearer " + this.token.access
		});

		console.log(headers)
		this.httpClient.get(this.SERVER_ADDRESS + 'api/').subscribe((response)=> {
			console.log(response);
		});
	}

}
