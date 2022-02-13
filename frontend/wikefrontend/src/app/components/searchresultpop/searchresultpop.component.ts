import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Observable } from 'rxjs';

@Component({
	selector: 'app-searchresultpop',
	templateUrl: './searchresultpop.component.html',
	styleUrls: ['./searchresultpop.component.scss'],
})
export class SearchresultpopComponent implements OnInit {

	results: Observable<any>

	constructor(
		private popoverController: PopoverController,
	) { }

	ngOnInit() {}

	onClick (songUri: string) {

		this.popoverController.dismiss({
			item: songUri
		});
	}

}
