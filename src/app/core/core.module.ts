import { MOBILE_MEDIA_QUERY } from '@/app/tokens'
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
  MatProgressSpinnerModule,
  MatSidenavModule,
  MatSnackBarModule,
  MatToolbarModule,
} from '@angular/material'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'
import { CustomFormModule } from '@shared/custom-form/custom-form.module'
import { InlineSVGModule } from 'ng-inline-svg'
import { environment } from 'src/environments/environment'
import { AuthGuard, NotAuthGuard, RoleGuard } from './guards/auth.guard'
import { MainComponent } from './main.component'
import { AuthentRedirectComponent } from './pages/authent-redirect/authent-redirect.component'
import { LoginComponent } from './pages/login/login.component'
import { TournamentsListComponent } from './pages/tournament-list/tournaments-list.component'
import { HeaderService } from './services/header.service'
import { NotificationService } from './services/notification.service'
import { SidePanelService } from './services/side-panel.service'
import { UserService } from './services/user.service'

@NgModule({
  declarations: [MainComponent, AuthentRedirectComponent, TournamentsListComponent, LoginComponent],
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
    MatProgressSpinnerModule,

    // Other libraries
    InlineSVGModule.forRoot(),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFireDatabaseModule,

    // App modules
    CustomFormModule,
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
            path: '',
            component: TournamentsListComponent,
          },
          {
            path: 'tournament/:tournamentId',
            loadChildren: '@pages/tournament/tournament.module#TournamentModule',
          },
          {
            path: 'administration',
            loadChildren: '@pages/administration/administration.module#AdministrationModule',
            canActivate: [RoleGuard],
            data: {
              roles: {
                general: 'tournament-creation',
              },
            },
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
    HeaderService,
  ],
})
export class CoreModule {}
