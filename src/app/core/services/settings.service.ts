import { Settings } from '@/app/models'
import { Injectable } from '@angular/core'
import { AngularFireDatabase } from '@angular/fire/database'
import { AuthenticationService } from '@core/services/authentication.service'
import { Observable } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

const DEFAULT_SETTINGS: Settings = {
  statusOrder: ['unknown', 'playing', 'covered', 'done'],
}
@Injectable()
export class SettingsService {
  value$: Observable<Settings>

  constructor(private auth: AuthenticationService, private db: AngularFireDatabase) {
    this.value$ = this.auth.userId$.pipe(
      switchMap((userId) => this.db.object<Settings>(`settings/${userId}`).valueChanges()),
      map((settings) => ({ ...DEFAULT_SETTINGS, ...(settings || {}) }))
    )
  }
}
