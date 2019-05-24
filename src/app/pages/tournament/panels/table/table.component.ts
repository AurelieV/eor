import { Table, TableStatus, TimeLog } from '@/app/models'
import { Component, EventEmitter, Input, Output } from '@angular/core'
import { TableService } from '@pages/tournament/services/table.service'
import { Observable } from 'rxjs'
import { switchMap, take } from 'rxjs/operators'

@Component({
  selector: 'table-panel',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TablePanelComponent {
  @Input() table: Table
  @Output() addTime = new EventEmitter()
  table$: Observable<Table>
  logs$: Observable<TimeLog[]>
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
    this.logs$ = this.table$.pipe(
      take(1),
      switchMap((table) => this.tableService.getLogs(table))
    )
  }

  ngOnChanges() {
    this.table$ = this.tableService.getById(Number(this.table.id))
  }

  onTimeClick() {
    this.addTime.emit()
  }
}
