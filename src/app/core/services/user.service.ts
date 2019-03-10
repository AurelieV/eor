import { JudgeAppsInfo } from '@/app/models'
import { environment } from '@/environments/environment'
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { AngularFireAuth } from '@angular/fire/auth'
import { AngularFireDatabase } from '@angular/fire/database'
import * as firebase from 'firebase'
import * as Oidc from 'oidc-client'
import { from, Observable, of } from 'rxjs'
import { map, shareReplay, switchMap } from 'rxjs/operators'

export type User = firebase.User

export interface StoredUser {
  roles: Array<string>
  judgeapps: JudgeAppsInfo
}

export interface UserInfo {
  name: string
  roles: Array<string>
}

@Injectable()
export class UserService {
  userInfo$: Observable<UserInfo>
  user$: Observable<User>

  constructor(
    private afAuth: AngularFireAuth,
    private http: HttpClient,
    private db: AngularFireDatabase
  ) {
    this.user$ = this.afAuth.authState
    this.userInfo$ = this.user$.pipe(
      switchMap((user) =>
        user ? this.db.object<StoredUser>(`/users/${user.uid}/`).valueChanges() : of(null)
      ),
      /// TODO: handle other way to connect
      map((user) =>
        user
          ? {
              name: user.judgeapps.name,
              roles: user.roles ? Object.keys(user.roles) : [],
            }
          : null
      )
    )
  }

  logout(): Promise<any> {
    return this.afAuth.auth.signOut()
  }

  get uid(): string {
    if (!this.afAuth.auth.currentUser) return null
    return this.afAuth.auth.currentUser.uid
  }

  loginWithJudgeApps() {
    const client = new Oidc.UserManager(environment.authenticateSettings)
    client.signinRedirect()
  }

  processJudgeAppsToken(code: string): Observable<any> {
    return this.http
      .post(environment.authenticateUrl, {
        code,
      })
      .pipe(
        map((res: any) => res.token),
        shareReplay(1),
        switchMap((token) => from(this.afAuth.auth.signInWithCustomToken(token)))
      )
  }

  hasRole(role: string) {
    // TODO: handle hierarchy
    return this.userInfo$.pipe(map((info) => info.roles.includes(role)))
  }
}
