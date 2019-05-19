import { Table, TimeLog } from '@/app/models'
import { Injectable } from '@angular/core'
import { AngularFireDatabase } from '@angular/fire/database'
import { AuthenticationService } from '@core/services/authentication.service'
import { ErrorService } from '@core/services/error.service'
import { NotificationService } from '@core/services/notification.service'
import { SettingsService } from '@core/services/settings.service'
import * as moment from 'moment'
import { Observable, of } from 'rxjs'
import { map, switchMap, take } from 'rxjs/operators'
import { TournamentStore } from './tournament-store.service'

@Injectable()
export class TableService {
  private allTables$: Observable<Table[]>

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
      return this.db.object(this.tablePath(table)).update(update)
    } catch (e) {
      this.errorService.raise(e.toString())
      return Promise.reject()
    }
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

  private tablePath(table: Table) {
    return `/zoneTables/${this.store.key}/${table.zoneIndex}/${table.sectionIndex}/${table.id}`
  }
}
