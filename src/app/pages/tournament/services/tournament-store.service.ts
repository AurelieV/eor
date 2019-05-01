import { Table, Tournament, TournamentStaff, ZoneInfo } from '@/app/models'
import { Injectable } from '@angular/core'
import { AngularFireDatabase } from '@angular/fire/database'
import { AuthenticationService } from '@core/services/authentication.service'
import { WindowVisibility } from '@core/services/window-visibility.service'
import { Zone } from '@pages/administration/administration.models'
import * as moment from 'moment'
import { BehaviorSubject, Observable, of, timer } from 'rxjs'
import { combineLatest, filter, map, switchMap } from 'rxjs/operators'

export type SectionsTables = Observable<Table[]>[]
export type ZonesTables = SectionsTables[]

@Injectable()
export class TournamentStore {
  private key$ = new BehaviorSubject<string>('')
  zones$: Observable<Zone[]>
  zonesTables$: Observable<ZonesTables>
  tournament$: Observable<Tournament>
  clock$: Observable<moment.Duration>
  roles$: Observable<Array<String>>
  staff$: Observable<TournamentStaff>
  zoneInfos$: Observable<Observable<ZoneInfo>[]>

  constructor(
    private db: AngularFireDatabase,
    private windowVisibility: WindowVisibility,
    private auth: AuthenticationService
  ) {
    this.tournament$ = this.key$.pipe(
      switchMap((key) => this.db.object<Tournament>(`tournaments/${key}`).valueChanges())
    )
    this.zones$ = this.key$.pipe(
      switchMap((key) => this.db.list<Zone>(`/zones/${key}`).valueChanges())
    )
    this.zonesTables$ = this.zones$.pipe(
      map((zones) =>
        zones.map((zone, zoneIndex) =>
          zone.sections.map((section, sectionIndex) =>
            this.key$.pipe(
              switchMap((key) =>
                this.db
                  .list<Table>(`/zoneTables/${key}/${zoneIndex}/${sectionIndex}`)
                  .valueChanges()
              )
            )
          )
        )
      )
    )
    this.zoneInfos$ = this.zones$.pipe(
      map((zones) =>
        zones.map((zone, zoneIndex) =>
          this.key$.pipe(
            switchMap((key) =>
              this.db.list<Table[]>(`/zoneTables/${key}/${zoneIndex}`).valueChanges()
            ),
            map((sections) => {
              const tables = sections.reduce(
                (tables, sectionTables) => tables.concat(sectionTables),
                []
              )
              return {
                nbPlaying: 10,
                nbExtraTimed: 10,
                nbCovered: 10,
                nbStillPlaying: 10,
                maxTimeExtension: 10,
                nbDone: 10,
                nbTotal: 10,
                name: zone.name,
                id: zoneIndex,
              }
            })
          )
        )
      )
    )
    this.clock$ = this.key$.pipe(
      switchMap((key) => this.db.object<number>(`endTime/${key}`).valueChanges()),
      switchMap((endTime) => {
        if (!endTime) return of(moment.duration(50, 'minute'))
        return this.windowVisibility.value$.pipe(
          filter((val) => val),
          switchMap((visibility) => {
            return timer(1, 1000).pipe(
              map((tick) => {
                const now = new Date().getTime()
                return moment.duration(endTime - now)
              })
            )
          })
        )
      })
    )
    this.staff$ = this.key$.pipe(
      switchMap((key) => db.object<TournamentStaff>(`staff/${key}`).valueChanges())
    )
    this.roles$ = this.auth.roles$.pipe(
      combineLatest(this.staff$, this.auth.userId$),
      map(([roles, staff, userId]) => {
        const allRoles = [...roles]
        if (!staff) {
          return allRoles
        }
        const isLeader =
          staff.zoneLeaders && staff.zoneLeaders.findIndex(({ id }) => id === userId) > -1
        const isAdmin = staff.admins && staff.admins.findIndex(({ id }) => id === userId) > -1
        const isScorekeeper =
          staff.scorekeepers && staff.scorekeepers.findIndex(({ id }) => id === userId) > -1
        if (isLeader) {
          allRoles.push('zoneLeader')
        }
        if (isAdmin) {
          allRoles.push('tournamentAdmin')
        }
        if (isScorekeeper) {
          allRoles.push('scorekeeper')
        }
        return allRoles
      })
    )
  }

  set key(key: string) {
    this.key$.next(key)
  }

  get key() {
    return this.key$.getValue()
  }

  setClock(value: number): Promise<any> {
    return this.db.object<number>(`endTime/${this.key}`).set(value)
  }
}
