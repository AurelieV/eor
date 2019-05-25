import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core'
import { NotificationService } from '@core/services/notification.service'
import { TableService } from '@pages/tournament/services/table.service'
import { TournamentStore } from '@pages/tournament/services/tournament-store.service'

@Component({
  selector: 'outstandings-panel',
  templateUrl: './outstandings.component.html',
  styleUrls: ['./outstandings.component.scss'],
})
export class OutstandingsPanelComponent {
  defineLastTables: boolean = false
  isLoading: boolean = false
  textInput: string = ''

  @Input() isOutstandings: boolean
  @Output() outstandingsDefined = new EventEmitter()

  @ViewChild('input') inputRef: ElementRef

  constructor(
    private store: TournamentStore,
    private notificationService: NotificationService,
    private tableService: TableService
  ) {}

  goOutstandings() {
    this.store
      .setIsOutstandings(true)
      .then(() => {
        this.notificationService.notify('Go to outstandings')
        this.outstandingsDefined.emit()
        this.isLoading = false
      })
      .catch(() => (this.isLoading = false))
  }

  goToDefine() {
    this.defineLastTables = true
  }

  defineAndGo() {
    this.isLoading = true
    const tableIds = this.textInput.match(/(\d+)/g) || []
    this.tableService.setMissingPaper(tableIds).then(() => this.goOutstandings())
  }
}
