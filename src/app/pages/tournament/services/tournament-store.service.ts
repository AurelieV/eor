import { Action, Filters, Table, Tournament, TournamentStaff, ZoneInfo } from '@/app/models'
import { Injectable } from '@angular/core'
import { AngularFireDatabase } from '@angular/fire/database'
import { AuthenticationService } from '@core/services/authentication.service'
import { WindowVisibility } from '@core/services/window-visibility.service'
import { Zone } from '@pages/administration/administration.models'
import * as moment from 'moment'
import { BehaviorSubject, combineLatest as combine, Observable, of, timer } from 'rxjs'
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
  allInfo$: Observable<ZoneInfo>
  filters$ = new BehaviorSubject<Filters>({
    displayUnknown: true,
    displayCovered: true,
    displayPlaying: true,
    displayDone: true,
    onlyExtraTimed: false,
    onlyStageHasNotPaper: false,
  })
  actions$: Observable<Action[]>

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
    const filterFunc$: Observable<(table: Table) => boolean> = this.filters$.pipe(
      map((filters) => {
        return (table) => {
          let result = true
          if (!filters.displayCovered) {
            result = result && table.status !== 'covered'
          }
          if (!filters.displayUnknown) {
            result = result && table.status !== 'unknown'
          }
          if (!filters.displayDone) {
            result = result && table.status !== 'done'
          }
          if (!filters.displayPlaying) {
            result = result && table.status !== 'playing'
          }
          if (filters.onlyExtraTimed) {
            result = result && table.time > 0
          }
          if (!filters.onlyStageHasNotPaper) {
            result = result && !table.stageHasPaper
          }

          return result
        }
      })
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
              ),
              combineLatest(filterFunc$),
              map(([tables, fn]) => {
                return tables.filter(fn)
              })
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
                (tables, sectionTables) => tables.concat(Object.values(sectionTables)),
                []
              )
              const notDoneTables = tables.filter(({ status }) => status !== 'done')
              const extraTimesTables = notDoneTables.filter((table) => table.time > 0)

              return {
                id: zoneIndex,
                name: zone.name,
                sections: zone.sections,
                nbExtraTimed: extraTimesTables.length,
                maxTimeExtension: Math.max(...extraTimesTables.map((table) => table.time)),
                nbStillPlaying: notDoneTables.length,
                nbStageHasNotPaper: tables.filter((table) => !table.stageHasPaper).length,
                nbTotal: tables.length,
              }
            })
          )
        )
      )
    )
    this.allInfo$ = this.zoneInfos$.pipe(
      switchMap((zoneInfos) => combine(...zoneInfos)),
      map((zoneInfos) =>
        zoneInfos.reduce(
          (allInfo, zoneInfo) => ({
            id: null,
            name: 'All',
            sections: [
              {
                start: Math.min(
                  allInfo.sections[0].start,
                  Math.min(...zoneInfo.sections.map((s) => s.start))
                ),
                end: Math.max(
                  allInfo.sections[0].end,
                  Math.max(...zoneInfo.sections.map((s) => s.end))
                ),
              },
            ],
            nbExtraTimed: allInfo.nbExtraTimed + zoneInfo.nbExtraTimed,
            maxTimeExtension: Math.max(allInfo.maxTimeExtension, zoneInfo.maxTimeExtension),
            nbStillPlaying: allInfo.nbStillPlaying + zoneInfo.nbStillPlaying,
            nbStageHasNotPaper: allInfo.nbStageHasNotPaper + zoneInfo.nbStageHasNotPaper,
            nbTotal: allInfo.nbTotal + zoneInfo.nbTotal,
          }),
          {
            id: null,
            name: 'All',
            sections: [{ start: Infinity, end: -Infinity }],
            nbExtraTimed: 0,
            maxTimeExtension: 0,
            nbStillPlaying: 0,
            nbStageHasNotPaper: 0,
            nbTotal: 0,
          }
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
    this.actions$ = this.roles$.pipe(
      map((roles) => {
        const actions: Action[] = [
          { label: 'Add time', key: 'time', role: 'all', color: 'primary' },
          { label: 'Go to outstanding', key: 'go-outstanding', role: 'teamlead', color: 'warn' },
          { label: 'Go to next round', key: 'end-round', role: 'teamlead', color: 'warn' },
          { label: 'Assign judge', key: 'assign', role: 'all', color: 'primary' },
        ]

        return actions
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

  setFilters(filters: Filters) {
    this.filters$.next(filters)
  }
}
