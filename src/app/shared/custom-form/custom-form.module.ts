import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatProgressSpinnerModule,
} from '@angular/material'
import { SelectUserComponent } from './select-user/select-user.component'
import { SelectUsersComponent } from './select-users/select-users.component'
import { CustomSubmitButton } from './submit-button.component'

@NgModule({
  imports: [
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatIconModule,
  ],
  declarations: [CustomSubmitButton, SelectUsersComponent, SelectUserComponent],
  exports: [CustomSubmitButton, SelectUsersComponent, SelectUserComponent],
})
export class CustomFormModule {}
