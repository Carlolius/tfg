import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SearchresultpopComponent } from './searchresultpop/searchresultpop.component'
import { PopmenuComponent } from './popmenu/popmenu.component'
import { PopTokenComponent } from './pop-token/pop-token.component'
import { PopshareComponent } from './popshare/popshare.component'
import { IonicModule } from '@ionic/angular'
import { QRCodeModule } from 'angularx-qrcode'

@NgModule({
  declarations: [
    SearchresultpopComponent,
    PopmenuComponent,
    PopTokenComponent,
    PopshareComponent,
  ],
  exports: [SearchresultpopComponent],
  imports: [CommonModule, IonicModule, QRCodeModule],
})
export class ComponentsModule {}
