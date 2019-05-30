import { LayoutModule } from '@angular/cdk/layout'
import { ScrollDispatchModule } from '@angular/cdk/scrolling'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import {
  MatButtonModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatSelectModule,
  MatSidenavModule,
} from '@angular/material'
import { RouterModule } from '@angular/router'
import { CommonModule as MyCommonModule } from '../../shared/common/common.module'
import { HeaderComponent } from './components/header/header.component'
import { TableComponent } from './components/table/table.component'
import { ZoneInfoComponent } from './components/zone-info/zone-info.component'
import { ActionsPanelComponent } from './panels/actions/actions.component'
import { AddTimePanelComponent } from './panels/add-time/add-time.component'
import { ClockPanelComponent } from './panels/clock/clock.component'
import { FiltersPanelComponent } from './panels/filters/filters.component'
import { GoNextPanelComponent } from './panels/go-next/go-next.component'
import { ImportPairingsPanelComponent } from './panels/import-pairings/import-pairings.component'
import { ImportResultsPanelComponent } from './panels/import-results/import-results.component'
import { MarkAllEmptyPanelComponent } from './panels/mark-all-empty/mark-all-empty.component'
import { OutstandingsPanelComponent } from './panels/outstandings/outstandings.component'
import { TablePanelComponent } from './panels/table/table.component'
import { TableService } from './services/table.service'
import { TournamentStore } from './services/tournament-store.service'
import { TournamentComponent } from './tournament.component'

@NgModule({
  declarations: [
    TournamentComponent,
    TableComponent,
    HeaderComponent,
    ClockPanelComponent,
    ZoneInfoComponent,
    FiltersPanelComponent,
    ActionsPanelComponent,
    AddTimePanelComponent,
    TablePanelComponent,
    ImportPairingsPanelComponent,
    OutstandingsPanelComponent,
    ImportResultsPanelComponent,
    MarkAllEmptyPanelComponent,
    GoNextPanelComponent,
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
    ScrollDispatchModule,
    MatMenuModule,
    MatSelectModule,
    LayoutModule,

    // App
    MyCommonModule,
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
