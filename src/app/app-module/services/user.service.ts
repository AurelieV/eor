import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { AngularFireAuth } from '@angular/fire/auth'
import { AngularFireDatabase } from '@angular/fire/database'
import * as firebase from 'firebase'
import * as Oidc from 'oidc-client'
import { from, Observable, of } from 'rxjs'
import { map, shareReplay, switchMap } from 'rxjs/operators'
import { environment } from '../../../environments/environment'

export type User = firebase.User
export interface JudgeAppsInfo {
  name: string
  given_name: string
  family_name: string
  nickname: string
  preferred_username: string
  level: number
  dci_number: number
  region: string
  picture: string
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
      switchMap(
        (user) =>
          user ? this.db.object(`/users/${user.uid}/`).valueChanges() : of(null)
      ),
      /// TODO: handle other way to connect
      map(
        (user) =>
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
        switchMap((token) =>
          from(this.afAuth.auth.signInWithCustomToken(token))
        )
      )
  }
}
