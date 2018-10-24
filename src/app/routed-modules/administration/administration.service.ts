import { Injectable } from '@angular/core'
import { AngularFireDatabase } from '@angular/fire/database'
import { JudgeAppsInfo, StoredUser } from '@appModule/services/user.service'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export type UserWithId = JudgeAppsInfo & { id: string }
@Injectable()
export class AdministrationService {
  constructor(private db: AngularFireDatabase) {}

  getUsers(): Observable<UserWithId[]> {
    return this.db
      .list<StoredUser>(`users`)
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((action) => ({
            ...action.payload.val().judgeapps,
            id: action.payload.key,
          }))
        )
      )
  }
}
