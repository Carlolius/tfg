import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';  // Import the music service
import { Router } from "@angular/router";

@Component({
  selector: 'app-callback',
  templateUrl: './callback.page.html',
  styleUrls: ['./callback.page.scss'],
})
export class CallbackPage implements OnInit {

  constructor(
		private apiService: ApiService,
		private router: Router
	) { }

  ngOnInit() {
		this.apiService.spotifyCallback();
		if (localStorage.getItem("session") != null) {
			this.router.navigate([localStorage.getItem("session") + '/home'])
		}
  }

	getSpotifyToken() {
		this.apiService.spotifyCallback()
	}
}
