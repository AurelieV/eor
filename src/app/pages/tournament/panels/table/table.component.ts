import { Table, TableStatus, TimeLog } from '@/app/models'
import { Component, EventEmitter, Input, Output } from '@angular/core'
import { AuthenticationService } from '@core/services/authentication.service'
import { TableService } from '@pages/tournament/services/table.service'
import * as moment from 'moment'
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
  @Output() assignJudge = new EventEmitter()
  table$: Observable<Table>
  logs$: Observable<TimeLog[]>
  status: TableStatus[] = ['unknown', 'covered', 'playing', 'done']
  isLoading: boolean = false

  constructor(private tableService: TableService, private authent: AuthenticationService) {}

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

  assign() {
    this.assignJudge.emit()
  }

  sit() {
    this.isLoading = true
    this.tableService
      .update(this.table, {
        assignated: this.authent.user.name,
        status: 'covered',
        updateStatusTime: moment.utc().valueOf(),
      })
      .then(() => (this.isLoading = false))
  }
}
