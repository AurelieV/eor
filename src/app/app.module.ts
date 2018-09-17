import { HttpClientModule } from '@angular/common/http'
import { NgModule } from '@angular/core'
import {
  MatButtonModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatSidenavModule,
  MatSnackBarModule,
  MatToolbarModule,
} from '@angular/material'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'
import { InlineSVGModule } from 'ng-inline-svg'
import { AppComponent } from './app.component'
import { LoginComponent } from './login.component'
import { MainComponent } from './main.component'
import { MOBILE_MEDIA_QUERY } from './tokens'

@NgModule({
  declarations: [AppComponent, MainComponent, LoginComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,

    // Material Modules
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatInputModule,
    MatSnackBarModule,

    // Other libraries
    InlineSVGModule.forRoot(),

    // App modules
    RouterModule.forRoot([
      {
        path: '',
        component: MainComponent,
        children: [
          {
            path: 'tournament',
            loadChildren:
              './modules/tournament/tournament.module#TournamentModule',
          },
        ],
      },
      { path: 'login', component: LoginComponent },
    ]),
  ],
  providers: [{ provide: MOBILE_MEDIA_QUERY, useValue: '(max-width: 720px)' }],
  bootstrap: [AppComponent],
})
export class AppModule {}
