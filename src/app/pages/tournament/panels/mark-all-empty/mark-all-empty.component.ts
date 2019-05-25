import { TableStatus } from '@/app/models'
import { Component, EventEmitter, Input, Output } from '@angular/core'
import { Zone } from '@pages/administration/administration.models'
import { TableService } from '@pages/tournament/services/table.service'

@Component({
  selector: 'mark-all-empty-panel',
  templateUrl: './mark-all-empty.component.html',
  styleUrls: ['./mark-all-empty.component.scss'],
})
export class MarkAllEmptyPanelComponent {
  @Input() status: TableStatus
  @Input() zones: Zone[]
  @Output() allEmptyMarked = new EventEmitter()

  isLoading: boolean = false
  zoneIndex: number = 0

  constructor(private tableService: TableService) {}

  markAllEmpty() {
    this.isLoading = true
    this.tableService.markAllEmpty(String(this.zoneIndex), this.status).then(() => {
      this.isLoading = false
      this.allEmptyMarked.emit()
    })
  }
}
