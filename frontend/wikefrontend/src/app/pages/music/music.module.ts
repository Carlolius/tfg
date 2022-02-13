import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MusicPageRoutingModule } from './music-routing.module';

import { MusicPage } from './music.page';
import { SearchresultpopComponent } from 'src/app/components/searchresultpop/searchresultpop.component';
import { PopmenuComponent } from 'src/app/components/popmenu/popmenu.component';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
	entryComponents: [
		SearchresultpopComponent,
		PopmenuComponent,
	],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MusicPageRoutingModule,
	ComponentsModule,
  ],
  declarations: [MusicPage]
})
export class MusicPageModule {}
