import { JudgeAppsInfo, StoredUser } from '@/app/models'
import { environment } from '@/environments/environment'
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { AngularFireAuth } from '@angular/fire/auth'
import { AngularFireDatabase } from '@angular/fire/database'
import * as Oidc from 'oidc-client'
import { from, Observable, of } from 'rxjs'
import { map, shareReplay, switchMap } from 'rxjs/operators'

// TODO: handle when no judgeapps
export type ConnectedUser = JudgeAppsInfo

@Injectable()
export class AuthenticationService {
  user$: Observable<ConnectedUser>
  roles$: Observable<string[]>
  userId$: Observable<string>

  constructor(
    private afAuth: AngularFireAuth,
    private http: HttpClient,
    private db: AngularFireDatabase
  ) {
    const storedUser$: Observable<StoredUser> = this.afAuth.authState.pipe(
      switchMap((user) =>
        user ? this.db.object<StoredUser>(`/users/${user.uid}/`).valueChanges() : of(null)
      )
    )
    this.user$ = storedUser$.pipe(map((user) => user && user.judgeapps))
    this.roles$ = storedUser$.pipe(
      /// TODO: handle other way to connect
      map((user) => (user ? (user.roles ? Object.keys(user.roles) : []) : []))
    )
    this.userId$ = this.afAuth.authState.pipe(map(({ uid }) => uid))
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
    return this.roles$.pipe(map((roles) => roles.includes(role)))
  }
}
