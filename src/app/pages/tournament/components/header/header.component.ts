import { ViewMode } from '@/app/models'
import { Component, EventEmitter, Input, Output } from '@angular/core'
import { TournamentStore } from '@pages/tournament/services/tournament-store.service'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

@Component({
  selector: 'tournament-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Output() editClock = new EventEmitter()
  @Output() editFilters = new EventEmitter()
  @Output() openActions = new EventEmitter()
  @Output() toggleViewMode = new EventEmitter()
  @Output() openChat = new EventEmitter()
  @Input() disabled: boolean
  @Input() viewMode: ViewMode

  clock$: Observable<string>
  canEditClock$: Observable<boolean>
  isFiltersActive$: Observable<boolean>

  constructor(private store: TournamentStore) {}

  ngOnInit() {
    this.clock$ = this.store.clock$.pipe(
      map((duration) => {
        const negative = duration.asMinutes() < 0
        const minutes = Math.abs(duration.minutes())
        const seconds = Math.abs(duration.seconds())
        return `${negative ? '-' : ''}${minutes < 10 ? '0' : ''}${minutes}:${
          seconds < 10 ? '0' : ''
        }${seconds}`
      })
    )
    this.canEditClock$ = this.store.roles$.pipe(
      map((roles) => {
        return roles.includes('admin') || roles.includes('tournamentAdmin')
      })
    )
    this.isFiltersActive$ = this.store.filters$.pipe(
      map((filters) => {
        return (
          !filters.displayCovered ||
          !filters.displayDone ||
          !filters.displayPlaying ||
          !filters.displayUnknown ||
          filters.onlyExtraTimed ||
          filters.onlyStageHasNotPaper
        )
      })
    )
  }

  onClockClick() {
    if (!this.disabled) {
      this.editClock.emit()
    }
  }

  onFiltersClick() {
    if (!this.disabled) {
      this.editFilters.emit()
    }
  }

  onActionsClick() {
    if (!this.disabled) {
      this.openActions.emit()
    }
  }

  onDisplayClick() {
    if (!this.disabled) {
      this.toggleViewMode.emit()
    }
  }

  onChatClick() {
    this.openChat.emit()
  }
}
