import { Result, Table, TableStatus, TimeLog } from '@/app/models'
import { Component, EventEmitter, Input, Output } from '@angular/core'
import { AuthenticationService } from '@core/services/authentication.service'
import { TableService } from '@pages/tournament/services/table.service'
import { TournamentStore } from '@pages/tournament/services/tournament-store.service'
import * as moment from 'moment'
import { Observable, Subscription } from 'rxjs'
import { map, switchMap, take } from 'rxjs/operators'

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
  isEditingSlip: boolean = false
  result: Result
  isLead$: Observable<boolean>

  canUpdate: boolean
  private subscriptions: Subscription[] = []

  constructor(
    private tableService: TableService,
    private authent: AuthenticationService,
    private store: TournamentStore
  ) {}

  updateStatus(table, status) {
    if (table.status === status) {
      return
    }
    this.tableService.update(table, { status, updateStatusTime: moment.utc().valueOf() })
  }

  ngOnInit() {
    this.table$ = this.tableService.getById(Number(this.table.id))
    this.logs$ = this.table$.pipe(
      take(1),
      switchMap((table) => this.tableService.getLogs(table))
    )
    this.subscriptions.push(
      this.store.roles$.subscribe((roles) => {
        this.canUpdate =
          ['scorekeeper', 'tournamentAdmin', 'zoneLeader', 'floorJudge', 'tmpFloorJudge'].findIndex(
            (role) => roles.indexOf(role) > -1
          ) > -1
      })
    )
    this.isLead$ = this.store.roles$.pipe(
      map((roles) => roles.indexOf('zoneLeader') > -1 || roles.indexOf('tournamentAdmin') > -1)
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

  enterResult() {
    this.table$.pipe(take(1)).subscribe((table) => {
      this.result = table.result
        ? { ...table.result }
        : {
            player1: {
              score: 0,
              drop: false,
            },
            player2: {
              score: 0,
              drop: false,
            },
            draw: 0,
          }
      this.isEditingSlip = true
    })
  }

  editResult() {
    this.isLoading = true
    this.tableService.update(this.table, { result: this.result }).then(() => {
      this.isLoading = false
      this.isEditingSlip = false
    })
  }

  increasePlayer1() {
    this.result.player1.score = (this.result.player1.score + 1) % 4
  }

  increasePlayer2() {
    this.result.player2.score = (this.result.player2.score + 1) % 4
  }

  increaseDraw() {
    this.result.draw = (this.result.draw + 1) % 4
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

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }
}
