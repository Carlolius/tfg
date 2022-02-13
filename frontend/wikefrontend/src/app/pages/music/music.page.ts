import { Component, OnInit, OnDestroy } from '@angular/core';
import { interval, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { ApiService } from '../../services/api.service';  // Import the music service
import { PopoverController } from '@ionic/angular';
import { SearchresultpopComponent } from 'src/app/components/searchresultpop/searchresultpop.component';
import { PopmenuComponent } from 'src/app/components/popmenu/popmenu.component';
import { PopTokenComponent } from 'src/app/components/pop-token/pop-token.component';
import { PopshareComponent } from 'src/app/components/popshare/popshare.component';
import { AuthService } from '../../services/auth.service';

@Component({
	selector: 'app-music',
	templateUrl: './music.page.html',
	styleUrls: ['./music.page.scss'],
})

export class MusicPage implements OnInit {
	results: Observable<any>
	playlists: any
	playlistSongs: any
	searchTerm: string
	searchedSong: any
	queueSongs: any
	devices: any
	deviceName:string = "Choose device"
	deviceId:string
	currentPlaying:any
	userName:any
	userSession:any
	admin:any
	check5:any 

	constructor(
		private apiService: ApiService,
		private authService: AuthService,
		private searchPopover: PopoverController,
		private popMenu: PopoverController,
		private popToken: PopoverController,
		private popShare: PopoverController,
	) { }

	ngOnInit() {
		this.getUsername();
		this.getSession();
		this.spotifyareToken();
		this.checkAdmin();
		this.getDevices();
		this.currentSong();
		this.showQueue();
		// Necessary checks for the backend
		// Subscribe to an observable to get the data
		this.check5 = interval(10000).subscribe(() => {
			this.getDevices();
			this.currentSong();
			this.showQueue();
		})
	}

	ngOnDestroy(){
		this.endCheck()
	}

	// Finish the subscription to the observable
	endCheck() {
		this.check5.next()
		this.check5.complete()
		this.check5.unsubscribe()
	}

	getUsername() {
		this.authService.getUsername().subscribe(data => {
			this.userName = data;
		})
	}

	getSession() {
		this.authService.getSession().subscribe(data => {
			this.userSession = data;
		})
	}

	// Shows the obtain token popover
	async tokenPopover(){
		const popover = await this.popToken.create({
			component: PopTokenComponent,
		});
		await popover.present();
	}
				
	// Check to obtain the Spotify token
	spotifyareToken(){
		this.apiService.spotifyareToken().subscribe(data => {
			if(data != true){
				// If there aren't token, stop the checks and ask to login in Spotify
				this.check5.next()
				this.check5.complete()
				this.tokenPopover()
			}
		});
	}

	// Checks if the user is admin or not
	checkAdmin(){
		this.apiService.isAdmin().subscribe(data => {
			this.admin = data;
		})
	}

	// When click in a search result
	clickSearchSong( songUri:string ) {
		this.searchedSong = this.apiService.spotifyClickSeachedSong(songUri)
		setTimeout(() => {
			this.showQueue();
		}, 500);
	}
	
	// Vote positive for a song
	voteP(uri:string){
		this.apiService.voteP(uri);
		setTimeout(() => {
			this.showQueue();
		}, 500);
	}

	// Vote negative for a song
	voteN(uri:string){
		this.apiService.voteN(uri)
		setTimeout(() => {
			this.showQueue();
		}, 500);
	}

	showQueue(){
		return this.apiService.queueSongs().subscribe(data => {
			if (JSON.stringify(this.queueSongs) != JSON.stringify(data)) {
				this.queueSongs = data
			}});
	}

	// Add playlist songs to Songs
	addPlaylist( playlistId:string ) {
		this.playlistSongs = this.apiService.spotifyAddPlaylist( playlistId )
	}

	async showShare(){
		const popover = await this.popShare.create({
			component: PopshareComponent,
			align: 'center',
			cssClass: 'share-popover',
			componentProps: {
				session: this.userSession
			}
		});
		await popover.present();
		 const {data} = await popover.onDidDismiss();
		 if (data)
			 this.endCheck()
	}

	async showPopMenu(ev: any){
		 const popover = await this.popMenu.create({
			 component: PopmenuComponent,
			 event: ev
		 });
		 await popover.present();
		 const {data} = await popover.onDidDismiss();
		 if (data)
			 this.endCheck()
	}

	// Popover that shows results of search
	async searchShowpop( ev: any ) {
		const popover = await this.searchPopover.create({
			component: SearchresultpopComponent, 
			event: ev,
			componentProps: {
				results: this.results,
			},
		});
		// If the search field it's empty don't show the popover
		if (this.searchTerm != "") {
			await popover.present();
		}
		const { data } = await popover.onWillDismiss();
		// Check if there are data
		if (data) {
			this.clickSearchSong( data.item)
		}
	}

	// Infinite scroll of songs
	infinitesongs(){
		console.log( "Cargando siguientes..." )
	}

	chooseDevice( device:any ){
		this.deviceName = device.value.name
		this.deviceId = device.value.id
	}

	getDevices(){
		this.apiService.spotifyChooseDevice().subscribe(data => {
			if (data.length = 1) { // engadir que o device non pode ser "ningún"
				this.devices = data
				this.deviceName = data[0].value.name
				this.deviceId = data[0].value.id
			} else {
				this.devices = data
			}
		});
	}

	// Get the user playlists
	getPlaylists() {
		this.playlists = this.apiService.spotifyGetPlaylists();
	}

	// When something is written in search bar
	searchChanged() {
		this.results = this.apiService.spotifySearch( this.searchTerm );
	}

	playButton(){
		this.apiService.spotifyPlay(this.deviceId)
	}

	showPlayingNow() {
		this.apiService.playingNow().subscribe(data => this.currentPlaying = data);
	}

	currentSong(){
		this.showPlayingNow();
		this.apiService.spotifyCurrentSong();
	}

}
