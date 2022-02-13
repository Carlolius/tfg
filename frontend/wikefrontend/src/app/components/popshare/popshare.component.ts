import { Component, OnInit } from '@angular/core'
import { NavParams } from '@ionic/angular'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-popshare',
  templateUrl: './popshare.component.html',
  styleUrls: ['./popshare.component.scss'],
})
export class PopshareComponent implements OnInit {
  public urlqr: string = null
  address = environment.ionic_server

  constructor(private navParams: NavParams) {
    this.urlqr = 'test'
  }

  ngOnInit() {
    let session = this.navParams.data.session
    this.urlqr = this.address.concat(session, "/register")
  }
}
