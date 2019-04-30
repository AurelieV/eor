import { Table } from '@/app/models'
import { Injectable } from '@angular/core'
import { AngularFireDatabase } from '@angular/fire/database'
import { ErrorService } from '@core/services/error.service'
import { SettingsService } from '@core/services/settings.service'
import * as moment from 'moment'
import { take } from 'rxjs/operators'
import { TournamentStore } from './tournament-store.service'

@Injectable()
export class TableService {
  constructor(
    private store: TournamentStore,
    private db: AngularFireDatabase,
    private settings: SettingsService,
    private errorService: ErrorService
  ) {}

  changeStatus(table: Table) {
    this.settings.value$.pipe(take(1)).subscribe(({ statusOrder }) => {
      const currentIndex = statusOrder.findIndex((status) => status === table.status)
      const newStatus = statusOrder[(currentIndex + 1) % statusOrder.length]
      const update = { status: newStatus, updateStatusTime: moment.utc().valueOf() }

      this.update(table, update)
    })
  }

  update(table: Table, update: any): Promise<any> {
    try {
      console.log(update, this.tablePath(table))
      return this.db.object(this.tablePath(table)).update(update)
    } catch (e) {
      this.errorService.raise(e.toString())
    }
  }

  private tablePath(table: Table) {
    return `/zoneTables/${this.store.key}/${table.zoneIndex}/${table.sectionIndex}/${table.id}`
  }
}
