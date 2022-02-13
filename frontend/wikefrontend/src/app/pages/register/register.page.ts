import { Component, OnInit } from '@angular/core';
import { Router } from  "@angular/router";
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-register',
	templateUrl: './register.page.html',
	styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

	mySession = null;
	
	constructor(
		private  authService:  AuthService,
		private  activatedRoute: ActivatedRoute,
		private  router:  Router
	) { }

	ngOnInit() {
		this.mySession = this.activatedRoute.snapshot.paramMap.get('mySession');
	}
	register(form) {
		this.authService.register(form.value.username, form.value.password, this.mySession)
			.subscribe((res)=>{
		});
	}

}
