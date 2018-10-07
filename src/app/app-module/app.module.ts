import { HttpClientModule } from '@angular/common/http'
import { NgModule } from '@angular/core'
import { AngularFireModule } from '@angular/fire'
import { AngularFireAuthModule } from '@angular/fire/auth'
import { AngularFireDatabaseModule } from '@angular/fire/database'
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
import { AuthGuard, NotAuthGuard, RoleGuard } from '@appModule/auth.guard'
import { NotificationService } from '@appModule/services/notification.service'
import { InlineSVGModule } from 'ng-inline-svg'
import { environment } from '../../environments/environment'
import { MOBILE_MEDIA_QUERY } from '../tokens'
import { AppComponent } from './app.component'
import { AuthentRedirectComponent } from './layouts/authent-redirect.component'
import { LoginComponent } from './layouts/login.component'
import { MainComponent } from './layouts/main.component'
import { SidePanelService } from './services/side-panel.service'
import { UserService } from './services/user.service'

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
    AngularFireDatabaseModule,

    // App modules
    RouterModule.forRoot([
      {
        path: 'login',
        component: LoginComponent,
        canActivate: [NotAuthGuard],
      },
      {
        path: 'authent-redirect',
        component: AuthentRedirectComponent,
      },
      {
        path: '',
        component: MainComponent,
        children: [
          {
            path: 'tournament',
            loadChildren:
              '../routed-modules/tournament/tournament.module#TournamentModule',
          },
        ],
        canActivate: [AuthGuard],
      },
    ]),
  ],
  providers: [
    { provide: MOBILE_MEDIA_QUERY, useValue: '(max-width: 719px)' },
    UserService,
    SidePanelService,
    AuthGuard,
    NotAuthGuard,
    RoleGuard,
    NotificationService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
