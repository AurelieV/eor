import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatCardModule,
  MatDatepickerModule,
  MatDialogModule,
  MatExpansionModule,
  MatIconModule,
  MatInputModule,
  MatNativeDateModule,
  MatSelectModule,
} from '@angular/material'
import { RouterModule } from '@angular/router'
import { RoleGuard } from '@core/guards/auth.guard'
import { CustomFormModule } from '@shared/custom-form/custom-form.module'
import { AdministrationComponent } from './administration.component'
import { AdministrationService } from './services/administration.service'

@NgModule({
  declarations: [AdministrationComponent],
  imports: [
    // Angular
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    // Material
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatCardModule,
    MatExpansionModule,
    MatIconModule,
    MatDialogModule,
    MatAutocompleteModule,

    // App
    CustomFormModule,
    RouterModule.forChild([
      {
        path: 'create',
        component: AdministrationComponent,
        canActivate: [RoleGuard],
        data: {
          roles: {
            general: 'tournament-creation',
          },
        },
      },
      {
        path: 'edit/:tournamentId',
        component: AdministrationComponent,
        // canActivate: [IsTournamentAdminGuard],
        data: {
          roles: {
            tournament: 'tournamentAdmin',
          },
        },
      },
    ]),
  ],
  providers: [AdministrationService],
})
export class AdministrationModule {}
