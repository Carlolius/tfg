import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';  // Import the music service

import { AuthService } from '../../services/auth.service';
import { OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ToastController } from '@ionic/angular';
import { Router } from "@angular/router";

@Component({
	selector: 'page-home',
	templateUrl: 'home.page.html',
	styleUrls: ['home.page.scss'],
})

export class HomePage implements OnInit {

	data = '';
	userName: string;
	sessionName: string;

	constructor(
		private authService: AuthService,
		private apiService: ApiService,
		private storage: Storage,
		private toastController: ToastController,
		private NavController: NavController,
		private router: Router
	){ }

	ngOnInit() {
		if (localStorage.getItem("session") != null) {
			this.router.navigate([localStorage.getItem("session") + '/home'])
		}
		this.userName = localStorage.getItem("username")
		this.sessionName = localStorage.getItem("session")
		if (this.isLoggedIn && localStorage.getItem("session") != null){
			this.router.navigate([localStorage.getItem("session") + '/music'])
		}
	}

	goToHome() {
		this.router.navigateByUrl("home")
	}

	goToSession() {
		this.router.navigateByUrl("session")
	}

	goToLogin() {
		this.router.navigateByUrl("login")
	}
	
	isLoggedIn() {
		this.authService.isLoggedIn()
		return true
	}	

	logout() {
		this.authService.logout();
		this.NavController.navigateRoot('/login');
	}

	getData() {
		this.authService.getData()
	}
	
	getSpotifyToken() {
		this.apiService.spotifyLoginUrl()
	}

	clearToken() {
		this.storage.remove('token');
		let toast = this.toastController.create({
			message: 'JWT removed',
			duration: 3000
		});
		toast.then(toast => toast.present());
	}

}
