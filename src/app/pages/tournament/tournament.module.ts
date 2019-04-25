import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import {
  MatButtonModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatSidenavModule,
} from '@angular/material'
import { RouterModule } from '@angular/router'
import { ClockComponent } from './components/clock/clock.component'
import { HeaderComponent } from './components/header/header.component'
import { TableComponent } from './components/table/table.component'
import { TournamentStore } from './services/tournament-store.service'
import { TournamentComponent } from './tournament.component'

@NgModule({
  declarations: [TournamentComponent, TableComponent, HeaderComponent, ClockComponent],
  imports: [
    // Angular
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    // Material
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,

    // App
    RouterModule.forChild([
      {
        path: '',
        component: TournamentComponent,
      },
    ]),
  ],
  providers: [TournamentStore],
})
export class TournamentModule {}
