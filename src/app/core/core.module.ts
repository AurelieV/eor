import { MOBILE_MEDIA_QUERY } from '@/app/tokens'
import { HttpClientModule } from '@angular/common/http'
import { NgModule } from '@angular/core'
import { AngularFireModule } from '@angular/fire'
import { AngularFireAuthModule } from '@angular/fire/auth'
import { AngularFireDatabaseModule } from '@angular/fire/database'
import {
  MatButtonModule,
  MatDialogModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatProgressSpinnerModule,
  MatSidenavModule,
  MatSnackBarModule,
  MatToolbarModule,
} from '@angular/material'
import {
  BrowserModule,
  HammerGestureConfig,
  HAMMER_GESTURE_CONFIG,
} from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'
import { CommonModule } from '@shared/common/common.module'
import { CustomFormModule } from '@shared/custom-form/custom-form.module'
import { InlineSVGModule } from 'ng-inline-svg'
import { environment } from 'src/environments/environment'
import { ErrorComponent } from './components/error/error.component'
import { AuthGuard, NotAuthGuard, RoleGuard } from './guards/auth.guard'
import { MainComponent } from './main.component'
import { AuthentRedirectComponent } from './pages/authent-redirect/authent-redirect.component'
import { LoginComponent } from './pages/login/login.component'
import { TournamentsListComponent } from './pages/tournament-list/tournaments-list.component'
import { AuthenticationService } from './services/authentication.service'
import { ErrorService } from './services/error.service'
import { HeaderService } from './services/header.service'
import { NotificationService } from './services/notification.service'
import { SettingsService } from './services/settings.service'
import { SidePanelService } from './services/side-panel.service'
import { TournamentService } from './services/tournament.service'
import { WindowVisibility } from './services/window-visibility.service'

export class CustomHammerGestureConfig extends HammerGestureConfig {
  overrides = {
    pan: {
      direction: 6,
    },
    pinch: {
      enable: false,
    },
    rotate: {
      enable: false,
    },
  }
}

@NgModule({
  declarations: [
    MainComponent,
    AuthentRedirectComponent,
    TournamentsListComponent,
    LoginComponent,
    ErrorComponent,
  ],
  entryComponents: [ErrorComponent],
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
    MatDialogModule,

    // Other libraries
    InlineSVGModule.forRoot(),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    //MatDialogModule,

    // App modules
    CustomFormModule,
    CommonModule,
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
          {
            path: 'settings',
            loadChildren: '@pages/settings/settings.module#SettingsModule',
          },
        ],
        canActivate: [AuthGuard],
      },
    ]),
  ],
  providers: [
    { provide: MOBILE_MEDIA_QUERY, useValue: '(max-width: 959px)' },
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: CustomHammerGestureConfig,
    },
    AuthenticationService,
    SidePanelService,
    AuthGuard,
    NotAuthGuard,
    RoleGuard,
    NotificationService,
    HeaderService,
    TournamentService,
    WindowVisibility,
    SettingsService,
    ErrorService,
  ],
})
export class CoreModule {}
