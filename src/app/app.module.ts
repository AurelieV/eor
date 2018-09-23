import { HttpClientModule } from '@angular/common/http'
import { NgModule } from '@angular/core'
import { AngularFireModule } from '@angular/fire'
import { AngularFireAuthModule } from '@angular/fire/auth'
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
import { environment } from '../environments/environment'
import { AppComponent } from './app.component'
import { AuthentRedirectComponent } from './authent-redirect.component'
import { LoginComponent } from './login.component'
import { MainComponent } from './main.component'
import { MOBILE_MEDIA_QUERY } from './tokens'
import { UserService } from './user.service'

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    LoginComponent,
    AuthentRedirectComponent,
  ],
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
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,

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
      {
        path: 'authent-redirect',
        component: AuthentRedirectComponent,
      },
    ]),
  ],
  providers: [
    { provide: MOBILE_MEDIA_QUERY, useValue: '(max-width: 720px)' },
    UserService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
