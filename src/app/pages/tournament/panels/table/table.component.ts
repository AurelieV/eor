import { Table } from '@/app/models'
import { Component, EventEmitter, Input, Output } from '@angular/core'
import { TableService } from '@pages/tournament/services/table.service'

@Component({
  selector: 'table-panel',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TablePanelComponent {
  @Input() table: Table
  @Output() addTime = new EventEmitter()

  constructor(private tableService: TableService) {}

  changeStatus() {
    this.tableService.changeStatus(this.table)
  }

  onTimeClick() {
    this.addTime.emit()
  }
}
