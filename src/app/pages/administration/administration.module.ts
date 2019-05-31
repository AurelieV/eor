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
        path: '',
        component: AdministrationComponent,
      },
    ]),
  ],
  providers: [AdministrationService],
})
export class AdministrationModule {}
