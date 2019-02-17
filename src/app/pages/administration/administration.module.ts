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
import { AdministrationComponent } from './administration.component'
import { SelectUsersComponent } from './components/select-users.component'
import { AdministrationService } from './services/administration.service'

@NgModule({
  declarations: [AdministrationComponent, SelectUsersComponent],
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
    RouterModule.forChild([
      {
        path: '',
        component: AdministrationComponent,
      },
    ]),
  ],
  providers: [AdministrationService],
})
export class AdministrationModule {}
