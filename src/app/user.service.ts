import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { AngularFireAuth } from '@angular/fire/auth'
import * as firebase from 'firebase'
import jwt_decode from 'jwt-decode'
import * as Oidc from 'oidc-client'
import { Observable, of } from 'rxjs'
import { map, shareReplay, switchMap } from 'rxjs/operators'
import { environment } from '../environments/environment'

export interface AccountData {
  pseudo: string
  email: string
  password: string
}

export type User = firebase.User
export interface UserInfo {
  sub: number
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

@Injectable()
export class UserService {
  get user(): Observable<firebase.User> {
    return this.afAuth.authState
  }

  get userInfo(): Observable<UserInfo> {
    return this.user.pipe(
      switchMap((user) => (user ? user.getIdToken() : of(null))),
      map((token) => (token ? jwt_decode(token) : null))
    )
  }

  constructor(private afAuth: AngularFireAuth, private http: HttpClient) {}

  logout(): Promise<any> {
    return this.afAuth.auth.signOut()
  }

  get login(): string {
    if (!this.afAuth.auth.currentUser) return null
    return this.afAuth.auth.currentUser.displayName
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
    const result = this.http
      .post(environment.authenticateUrl, {
        code,
      })
      .pipe(
        map((res: any) => res.token),
        shareReplay(1)
      )

    result.subscribe((token) => this.afAuth.auth.signInWithCustomToken(token))

    return result
  }
}
