import { Settings, StatusOrder, TableStatus } from '@/app/models'
import { Injectable } from '@angular/core'
import { AngularFireDatabase } from '@angular/fire/database'
import { AuthenticationService } from '@core/services/authentication.service'
import { Observable } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { ErrorService } from './error.service'

const DEFAULT_SETTINGS: Settings = {
  statusOrder: {
    isGreenFirst: false,
    isUnknownHidden: false,
  },
}
@Injectable()
export class SettingsService {
  value$: Observable<Settings>
  statusOrder$: Observable<StatusOrder>

  constructor(
    private auth: AuthenticationService,
    private db: AngularFireDatabase,
    private errorService: ErrorService
  ) {
    this.value$ = this.auth.userId$.pipe(
      switchMap((userId) => this.db.object<Settings>(`settings/${userId}`).valueChanges()),
      map((settings) => ({ ...DEFAULT_SETTINGS, ...(settings || {}) }))
    )
    this.statusOrder$ = this.value$.pipe(
      map(({ statusOrder }) => {
        let order: TableStatus[]
        if (statusOrder.isGreenFirst) {
          order = ['done', 'playing', 'covered']
        } else {
          order = ['playing', 'covered', 'done']
        }
        if (!statusOrder.isUnknownHidden) {
          order = ['unknown', ...order]
        }

        return order
      })
    )
  }

  update(update: any): Promise<any> {
    try {
      return this.db.object(`/settings/${this.auth.uid}`).update(update)
    } catch (e) {
      this.errorService.raise(e.toString())
    }
  }

  updateStatusOrder(update: any): Promise<any> {
    try {
      return this.db.object(`/settings/${this.auth.uid}/statusOrder`).update(update)
    } catch (e) {
      this.errorService.raise(e.toString())
    }
  }
}
