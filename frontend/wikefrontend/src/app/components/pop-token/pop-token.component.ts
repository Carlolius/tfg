import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';  // Import the music service

@Component({
  selector: 'app-pop-token',
  templateUrl: './pop-token.component.html',
  styleUrls: ['./pop-token.component.scss'],
})
export class PopTokenComponent implements OnInit {

	constructor(
		private apiService: ApiService,
	){}

  ngOnInit() {}

  getSpotifyToken() {
	  this.apiService.spotifyLoginUrl()
  }

}
