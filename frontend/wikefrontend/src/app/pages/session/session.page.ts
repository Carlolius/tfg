import { Component, OnInit } from '@angular/core';
import { Router } from  "@angular/router";
import { ApiService } from '../../services/api.service'

@Component({
	selector: 'app-session',
	templateUrl: './session.page.html',
	styleUrls: ['./session.page.scss'],
})
export class SessionPage implements OnInit {

	constructor(
		private  apiService: ApiService,
		private  router:  Router
	) { }

	ngOnInit() {
	}

	session(form) {
		this.apiService.RegisterSession(form.value.session)
			.subscribe((res)=>{
				if(res) {
					this.router.navigateByUrl(res + '/register');
				}
		});
	}

	login(){
		this.router.navigateByUrl('login');
	}
}
