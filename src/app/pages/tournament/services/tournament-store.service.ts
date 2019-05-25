import { Action, Filters, SortBy, Table, Tournament, TournamentStaff, ZoneInfo } from '@/app/models'
import { createEmptyTable } from '@/app/utils/helpers'
import { Injectable } from '@angular/core'
import { AngularFireDatabase } from '@angular/fire/database'
import { AuthenticationService } from '@core/services/authentication.service'
import { WindowVisibility } from '@core/services/window-visibility.service'
import { Zone } from '@pages/administration/administration.models'
import * as moment from 'moment'
import {
  BehaviorSubject,
  combineLatest as combine,
  Observable,
  of,
  Subscription,
  timer,
} from 'rxjs'
import { combineLatest, filter, map, switchMap } from 'rxjs/operators'

export type SectionsTables = Observable<Table[]>[]
export type ZonesTables = SectionsTables[]

@Injectable()
export class TournamentStore {
  private key$ = new BehaviorSubject<string>('')
  zones$: Observable<Zone[]>
  zones: Zone[]
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
  sortBy$ = new BehaviorSubject<SortBy>('zone')
  sortedTables$: Observable<Table[]>
  actions$: Observable<Action[]>
  isOutstandings$: Observable<boolean>

  private subscriptions: Subscription[] = []

  constructor(
    private db: AngularFireDatabase,
    private windowVisibility: WindowVisibility,
    private auth: AuthenticationService
  ) {
    this.tournament$ = this.key$.pipe(
      switchMap((key) => this.db.object<Tournament>(`tournaments/${key}`).valueChanges())
    )
    this.isOutstandings$ = this.key$.pipe(
      switchMap((key) => this.db.object<boolean>(`isOutstandings/${key}`).valueChanges())
    )
    this.zones$ = this.key$.pipe(
      switchMap((key) => this.db.list<Zone>(`/zones/${key}`).valueChanges())
    )
    this.subscriptions.push(this.zones$.subscribe((zones) => (this.zones = zones)))
    const filterFunc$: Observable<(table: Table) => boolean> = this.filters$.pipe(
      combineLatest(this.isOutstandings$),
      map(([filters, isOutstandings]) => {
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
          if (filters.onlyStageHasNotPaper || isOutstandings) {
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
            combineLatest(this.isOutstandings$),
            map(([sections, isOutstandings]) => {
              let tables = sections.reduce(
                (tables, sectionTables) => tables.concat(Object.values(sectionTables)),
                []
              )
              if (isOutstandings) {
                tables = tables.filter((table) => !table.stageHasPaper)
              }
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
                const now = moment.utc().valueOf()
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
      combineLatest(this.isOutstandings$),
      map(([roles, isOutstandings]) => {
        const actions: Action[] = [
          { label: 'Add time', key: 'add-time', role: 'all', color: 'primary' },
          {
            label: 'Mark all empty as green',
            key: 'mark-all-empty-green',
            role: 'zonelead',
            color: 'warn',
          },
          {
            label: 'Mark all empty as red',
            key: 'mark-all-empty-red',
            role: 'zonelead',
            color: 'warn',
          },
          { label: 'Assign judge', key: 'assign', role: 'zonelead', color: 'primary' },
          {
            label: 'Nominate floor judge',
            key: 'nominate-floor',
            role: 'zonelead',
            color: 'primary',
          },
          {
            label: isOutstandings ? 'Set outstandings' : 'Go to outstanding',
            key: 'go-outstanding',
            role: 'teamlead',
            color: 'warn',
          },
          { label: 'Go to next round', key: 'end-round', role: 'teamlead', color: 'warn' },
          { label: 'Change user roles', key: 'change-roles', role: 'teamlead', color: 'primary' },
          {
            label: 'Import Pairings',
            key: 'import-pairings',
            role: 'scorekeeper',
            color: 'primary',
          },
          { label: 'Import Results', key: 'import-results', role: 'scorekeeper', color: 'primary' },
        ]

        return actions
      })
    )
    const allTables$ = this.key$.pipe(
      switchMap((key) => this.db.list<Table[][]>(`/zoneTables/${key}`).valueChanges()),
      map((zones) => zones.reduce((sections, zone) => sections.concat(zone), [])),
      map((sections) =>
        sections
          .reduce((tables, section) => tables.concat(Object.values(section)), [])
          .filter((table) => Boolean(table))
      )
    )
    this.sortedTables$ = this.sortBy$.pipe(
      switchMap((sortBy) => {
        if (sortBy === 'zone') return of([]) // refer to other observable in this case
        return allTables$
      }),
      combineLatest(filterFunc$),
      map(([tables, fn]) => {
        // TODO: distinct filters
        return tables.filter(fn).sort((a, b) => (b.time || 0) - (a.time || 0))
      })
    )
  }

  set key(key: string) {
    this.key$.next(key)
  }

  get key() {
    return this.key$.getValue()
  }

  get k$() {
    return this.key$.asObservable()
  }

  setClock(value: number): Promise<any> {
    return this.db.object<number>(`endTime/${this.key}`).set(value)
  }

  setFilters(filters: Filters) {
    this.filters$.next(filters)
  }

  setSortBy(sortBy: SortBy) {
    this.sortBy$.next(sortBy)
  }

  async restart() {
    const key = this.key
    const zones = this.zones
    await Promise.all(
      zones
        .map((zone, zoneIndex) => this.recreateZone(zone, zoneIndex, key))
        .concat(this.resetLogs(), this.setIsOutstandings(false))
    )
  }

  setIsOutstandings(value: boolean): Promise<any> {
    return this.db.object(`isOutstandings/${this.key}`).set(value)
  }

  private resetLogs(): Promise<any> {
    return this.db.object(`log/${this.key}`).set([])
  }

  private async recreateZone(zone, zoneIndex, tournamentKey, isTeam = false) {
    await Promise.all(
      zone.sections.map((section, sectionIndex) => {
        let tables = {}
        Array(section.end - section.start + 1)
          .fill({})
          .forEach((_, i) => {
            const index = (section.start + i).toString()
            tables[index] = createEmptyTable(
              index,
              zoneIndex.toString(),
              sectionIndex.toString(),
              isTeam
            )
          })
        return this.db
          .object(`zoneTables/${tournamentKey}/${zoneIndex}/${sectionIndex}`)
          .set(tables)
      })
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }
}
