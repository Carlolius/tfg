import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { PopoverController } from '@ionic/angular';
import { Router } from "@angular/router";

@Component({
  selector: 'app-popmenu',
  templateUrl: './popmenu.component.html',
  styleUrls: ['./popmenu.component.scss'],
})
export class PopmenuComponent implements OnInit {

  constructor(
	  private popoverCtl: PopoverController,
	  private router: Router,
	  private authService: AuthService
) { }


  ngOnInit() {}

  logout(){
	  this.popoverCtl.dismiss({logout: "True"});
	  this.authService.logout();
	  this.router.navigateByUrl('/home')

  }

}
