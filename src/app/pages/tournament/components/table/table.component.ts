import { Table, ViewMode } from '@/app/models'
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core'
import { TableService } from '@pages/tournament/services/table.service'
import { TournamentStore } from '@pages/tournament/services/tournament-store.service'
import * as moment from 'moment'
import { Observable, Subscription } from 'rxjs'
import { map } from 'rxjs/operators'

@Component({
  selector: 'table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent {
  @Input() table: Table
  @Input() canInteractWithFeaturedTables: boolean = true
  @Input() viewMode: ViewMode
  @Input() isOutstandings: boolean
  @Input() displayFeatured: boolean = false
  @Output() openTable = new EventEmitter()

  updateTimeout: number
  canUpdateReceived$: Observable<boolean>
  canUpdate: boolean

  private subscriptions: Subscription[] = []

  @HostBinding('class.warn') warn: boolean

  @HostBinding('class')
  get status() {
    let status = `block ${this.viewMode}`
    if (this.table) {
      if (this.displayFeatured || !this.table.isFeatured) {
        status += ` ${this.table.status}`
      } else {
        status += ` featured`
      }
    }
    return status
  }

  constructor(private tableService: TableService, private store: TournamentStore) {
    this.subscriptions.push(
      this.store.roles$.subscribe((roles) => {
        this.canUpdate =
          ['scorekeeper', 'tournamentAdmin', 'zoneLeader', 'floorJudge', 'tmpFloorJudge'].findIndex(
            (role) => roles.indexOf(role) > -1
          ) > -1
      })
    )
  }

  @HostListener('tap', ['$event.target.tagName'])
  mainAction(tag) {
    if (this.displayFeatured || !this.table.isFeatured) {
      if (this.viewMode === 'large' || !this.canUpdate) {
        if (tag === 'MAT-ICON' || tag === 'BUTTON') {
          return
        }
        this.openTable.emit()
      } else {
        if (this.canUpdate) {
          this.tableService.changeStatus(this.table)
        }
      }
    }
  }

  @HostListener('press')
  secondaryAction() {
    if (this.displayFeatured || !this.table.isFeatured) {
      this.openTable.emit()
    }
  }

  ngOnInit() {
    this.canUpdateReceived$ = this.store.roles$.pipe(
      map((roles) => {
        return roles.includes('tournamentAdmin') || roles.includes('scorekeeper')
      })
    )
    this.checkWarn()
  }

  receivedPaper(e: MouseEvent) {
    this.tableService.update(this.table, { stageHasPaper: true })
  }

  checkWarn() {
    this.warn =
      this.table &&
      this.isOutstandings &&
      !this.table.stageHasPaper &&
      this.table.status === 'done' &&
      moment.utc().diff(moment.utc(this.table.updateStatusTime), 'minute') > 3
  }

  ngOnChanges(changes: SimpleChanges) {
    this.checkWarn()
    if (this.warn) {
      this.cancelTimeout()
    }
    if (changes.table) {
      const current = changes.table.currentValue
      const previous = changes.table.previousValue
      if ((!previous || current.updateStatusTime !== previous.updateStatusTime) && !this.warn) {
        this.setTimeout()
      }
    }
  }

  setTimeout() {
    const timeToWait = 20 * 1000
    setTimeout(() => {
      this.checkWarn()
      if (!this.warn) this.setTimeout()
    }, timeToWait)
  }

  cancelTimeout() {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout)
      this.updateTimeout = null
    }
  }

  ngOnDestroy() {
    this.cancelTimeout()
    this.subscriptions.forEach((s) => s.unsubscribe())
  }
}
