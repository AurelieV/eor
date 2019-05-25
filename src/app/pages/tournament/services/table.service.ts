import { Table, TimeLog } from '@/app/models'
import { Injectable } from '@angular/core'
import { AngularFireDatabase } from '@angular/fire/database'
import { AuthenticationService } from '@core/services/authentication.service'
import { ErrorService } from '@core/services/error.service'
import { NotificationService } from '@core/services/notification.service'
import { SettingsService } from '@core/services/settings.service'
import * as moment from 'moment'
import { Observable, of, Subscription } from 'rxjs'
import { map, switchMap, take } from 'rxjs/operators'
import { TournamentStore } from './tournament-store.service'

export const INVALID_ID = 'Table does not exist'

@Injectable()
export class TableService {
  private allTables$: Observable<Table[]>
  private allTables: Table[]

  private subscriptions: Subscription[] = []

  constructor(
    private store: TournamentStore,
    private db: AngularFireDatabase,
    private settings: SettingsService,
    private errorService: ErrorService,
    private notificationService: NotificationService,
    private authentication: AuthenticationService
  ) {
    this.allTables$ = this.store.k$.pipe(
      switchMap((key) => this.db.list<Table[][]>(`/zoneTables/${key}`).valueChanges()),
      map((zones) => zones.reduce((sections, zone) => sections.concat(zone), [])),
      map((sections) =>
        sections
          .reduce((tables, section) => tables.concat(Object.values(section)), [])
          .filter((table) => Boolean(table))
      )
    )
    this.subscriptions.push(this.allTables$.subscribe((tables) => (this.allTables = tables)))
  }

  changeStatus(table: Table) {
    this.settings.statusOrder$.pipe(take(1)).subscribe((statusOrder) => {
      const currentIndex = statusOrder.findIndex((status) => status === table.status)
      const newStatus = statusOrder[(currentIndex + 1) % statusOrder.length]
      const update = { status: newStatus, updateStatusTime: moment.utc().valueOf() }

      this.update(table, update)
    })
  }

  update(table: Table, update: any): Promise<any> {
    try {
      if (!table) {
        return Promise.reject(INVALID_ID)
      }
      return this.db.object(this.tablePath(table)).update(update)
    } catch (e) {
      this.errorService.raise(e.toString())
      return Promise.reject()
    }
  }

  updateById(tableId: string, update: any): Promise<any> {
    const table = this.allTables.find(({ id }) => tableId === id)
    return this.update(table, update)
  }

  getById(tableId: number): Observable<Table> {
    return this.allTables$.pipe(
      take(1),
      switchMap((tables) => {
        const table = tables.find(({ id }) => id === String(tableId))
        if (!table) {
          return of(null)
        }
        return this.db.object<Table>(this.tablePath(table)).valueChanges()
      })
    )
  }

  addTime(table: Table, time: number, replace: boolean = false): Promise<any> {
    let promise
    const log: TimeLog = {
      user: this.authentication.user,
      time,
      date: moment.utc().valueOf(),
      addOrUpdate: replace ? 'update' : 'add',
    }
    if (replace) {
      promise = this.update(table, { time })
    } else {
      promise = this.update(table, { time: (table.time || 0) + time })
    }
    promise.then(() => {
      this.db.list<TimeLog>(`log/${this.store.key}/${table.id}`).push(log)
      this.notificationService.notify(`Table ${table.id} updated`)
    })

    return promise
  }

  getLogs(table: Table): Observable<TimeLog[]> {
    return this.db.list<TimeLog>(`log/${this.store.key}/${table.id}`).valueChanges()
  }

  setMissingPaper(tableIds: string[]): Promise<any> {
    return Promise.all(
      this.allTables.map((table) =>
        this.update(table, { stageHasPaper: !tableIds.includes(table.id) }).catch((err) => err)
      )
    )
  }

  private tablePath(table: Table) {
    return `/zoneTables/${this.store.key}/${table.zoneIndex}/${table.sectionIndex}/${table.id}`
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }
}
