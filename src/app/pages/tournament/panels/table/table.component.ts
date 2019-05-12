import { Table, TableStatus } from '@/app/models'
import { Component, EventEmitter, Input, Output } from '@angular/core'
import { TableService } from '@pages/tournament/services/table.service'
import { Observable } from 'rxjs'

@Component({
  selector: 'table-panel',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TablePanelComponent {
  @Input() table: Table
  @Output() addTime = new EventEmitter()
  table$: Observable<Table>
  status: TableStatus[] = ['unknown', 'covered', 'playing', 'done']

  constructor(private tableService: TableService) {}

  updateStatus(table, status) {
    if (table.status === status) {
      return
    }
    this.tableService.update(table, { status })
  }

  ngOnInit() {
    this.table$ = this.tableService.getById(Number(this.table.id))
  }

  ngOnChanges() {
    this.table$ = this.tableService.getById(Number(this.table.id))
  }

  onTimeClick() {
    this.addTime.emit()
  }
}
