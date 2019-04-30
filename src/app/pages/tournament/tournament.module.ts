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
import { HeaderComponent } from './components/header/header.component'
import { TableComponent } from './components/table/table.component'
import { ClockPanelComponent } from './panels/clock/clock.component'
import { SettingsPanelComponent } from './panels/settings/settings.component'
import { TableService } from './services/table.service'
import { TournamentStore } from './services/tournament-store.service'
import { TournamentComponent } from './tournament.component'

@NgModule({
  declarations: [
    TournamentComponent,
    TableComponent,
    HeaderComponent,
    ClockPanelComponent,
    SettingsPanelComponent,
  ],
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
  providers: [TournamentStore, TableService],
})
export class TournamentModule {}
