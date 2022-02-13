import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthguardService } from './services/authguard.service';

const routes: Routes = [
	{ path: '', redirectTo: 'home', pathMatch: 'full' },
	/* { path: '', redirectTo: 'home', pathMatch: 'full' }, */
	{
		path: 'home',
		loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule),
	},
	{
		path: ':mySession/home',
		loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule),
			canActivate: [AuthguardService]
	},
	{
		path: ':mySession/register',
		loadChildren: () => import('./pages/register/register.module').then( m => m.RegisterPageModule)
	},
	{
		path: 'login',
		loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
	},
	{
		path: ':mySession/login',
		loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
	},
	{
		path: 'callback',
		loadChildren: () => import('./pages/callback/callback.module').then( m => m.CallbackPageModule),
			canActivate: [AuthguardService]
	},
	{
		path: 'music',
		// path: ':mySession/music',
		loadChildren: () => import('./pages/music/music.module').then( m => m.MusicPageModule),
			canActivate: [AuthguardService] /* Engadir mais Guards para comprobar que a instancia é a que é. */
	},
	{
		path: 'session',
		loadChildren: () => import('./pages/session/session.module').then( m => m.SessionPageModule)
	},
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
	],
	exports: [RouterModule]
})
export class AppRoutingModule { }
