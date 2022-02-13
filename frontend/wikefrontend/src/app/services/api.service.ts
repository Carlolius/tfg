import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest} from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable } from "rxjs";
import { map, catchError } from 'rxjs/operators';

import {IEsongs} from '../songs';
import { AlertController } from '@ionic/angular';


@Injectable()

export class ApiService {

	private SERVER_ADDRESS: string = 'http://192.168.1.106:8000/';


	constructor(
		private httpClient: HttpClient,
		private router: Router,
		private alertController: AlertController,
	) {}

	get() {
		return this.httpClient.get(this.SERVER_ADDRESS);
	}

	async presentSessionError() {
		const alert = await this.alertController.create({
			cssClass: 'my-custom-class',
			header: 'Register error!',
			message: 'The session already exists',
			buttons: ['OK']
		});
		await alert.present();
	}
	
	RegisterSession(session: String) {
		return this.httpClient.post(this.SERVER_ADDRESS + 'api/sessionregister/', {urlSession: session}).pipe(
			catchError(e => {
				this.presentSessionError();
				throw new Error(e);
			})
		)
	}

	voteP(song:string){
		this.httpClient.post(this.SERVER_ADDRESS + 'api/votep/', {'uri': song}).subscribe()
	}

	voteN(song:string){
		this.httpClient.post(this.SERVER_ADDRESS + 'api/voten/', {'uri': song}).subscribe()
	}

	queueSongs(): Observable<IEsongs[]>{
		return this.httpClient.post<IEsongs[]>(this.SERVER_ADDRESS + 'api/queuesongs/', {request: Request});
	}

	isAdmin(){
		return this.httpClient.post(this.SERVER_ADDRESS + 'api/isadmin/', {request: Request})
	}

	// Check if can connect with Spotify 
	spotifyareToken(): Observable<any> {
		return this.httpClient.post(this.SERVER_ADDRESS + 'api/areToken/', {'request': Request})
	}

	// Gets the Spotify api login url and open it in the same window
	spotifyLoginUrl() {
		this.httpClient.post(this.SERVER_ADDRESS + 'api/token/', {'request': Request}).subscribe((response) => {
			window.open(response[0].url, '_self');
		})
	}

	// Makes a request giving the url that contains the token info
	spotifyCallback() {
		this.httpClient.post(this.SERVER_ADDRESS + 'api/callback/', {'url': window.location.href }).subscribe((response) => {
			console.log(response)
		})
	}

	spotifyChooseDevice(){
		return this.httpClient
		.post(this.SERVER_ADDRESS + 'api/choosedevice/', {'request': Request})
		.pipe(
			map(results => Object
					.keys(results)
					.map(key => ({value: results[key]}))
				 ),
		);
	}

	// Get the playlists of the user
	spotifyGetPlaylists(){
		return this.httpClient.post(this.SERVER_ADDRESS + 'api/playlists/', {'request': Request}).pipe(
			map(results => Object.keys(results).map(key => ({value: results[key]}))
				 ),
		);
	}

	// Search for songs in the spotify api
	// Get the results and map it to value result so it's printable in the html if empty search catches the error
	spotifySearch(searchTerm:string): Observable<any> {
		return this.httpClient.post(this.SERVER_ADDRESS + 'api/search/', {'search': searchTerm}).pipe(
			map(results => Object.keys(results).map(key => ({value: results[key]}))),
				catchError(err => ([]))
		);
	}

	// Add a searched song to Songs
	spotifyClickSeachedSong(songUri:string) {
		return this.httpClient
			.post(this.SERVER_ADDRESS + 'api/searchtosongs/', {'songUri': songUri})
			.subscribe();
	}

	// Add songs to Songs
	spotifyAddPlaylist(playlistId:string) {
		this.httpClient
			.post(this.SERVER_ADDRESS + 'api/addplaylist/', {'playlistId': playlistId})
			.subscribe();
	}

	// Start to play
	spotifyPlay(device:string){
		this.httpClient.post(this.SERVER_ADDRESS + 'api/playmusic/', {'device': device}).subscribe();
	}

	// Adds the current song to the model
	spotifyCurrentSong(){
		this.httpClient.post(this.SERVER_ADDRESS + 'api/currentplaying/', {'request': Request}).subscribe()
	}

	// Gets the current song to show at the frontend
	playingNow(): Observable<IEsongs[]>{
		return this.httpClient.post<IEsongs[]>(this.SERVER_ADDRESS + 'api/playingnow/', {request: Request});
	}

}
