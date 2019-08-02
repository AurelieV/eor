import { Action, Filters, Table, Tournament, TournamentStaff, ZoneInfo } from '@/app/models'
import { flat } from '@/app/utils/flat'
import { createEmptyTable } from '@/app/utils/helpers'
import { Injectable } from '@angular/core'
import { AngularFireDatabase } from '@angular/fire/database'
import { AuthenticationService } from '@core/services/authentication.service'
import { NotificationService } from '@core/services/notification.service'
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
  featureTables$: Observable<Table[]>
  tournament$: Observable<Tournament | { type: string; key: string }>
  clock$: Observable<moment.Duration>
  roles$: Observable<Array<String>>
  staff$: Observable<TournamentStaff>
  zoneInfos$: Observable<Observable<ZoneInfo>[]>
  featureInfos$: Observable<ZoneInfo>
  allInfo$: Observable<ZoneInfo>
  filters$ = new BehaviorSubject<Filters>({
    displayUnknown: true,
    displayCovered: true,
    displayPlaying: true,
    displayDone: true,
    onlyExtraTimed: false,
    onlyStageHasNotPaper: false,
  })
  // sortBy$ = new BehaviorSubject<SortBy>('zone')
  // sortedTables$: Observable<Table[]>
  actions$: Observable<Action[]>
  isOutstandings$: Observable<boolean>
  zoneInfoSelected$ = new BehaviorSubject<string>('all')

  private subscriptions: Subscription[] = []

  constructor(
    private db: AngularFireDatabase,
    private windowVisibility: WindowVisibility,
    private auth: AuthenticationService,
    private authentication: AuthenticationService,
    private notifier: NotificationService
  ) {
    this.tournament$ = this.key$.pipe(
      switchMap((key) =>
        this.db
          .object<Tournament>(`tournaments/${key}`)
          .valueChanges()
          .pipe(
            map((tournament) => {
              return tournament || { type: 'unknown', key }
            })
          )
      )
    )
    this.isOutstandings$ = this.key$.pipe(
      switchMap((key) => this.db.object<boolean>(`isOutstandings/${key}`).valueChanges())
    )
    this.zones$ = this.key$.pipe(
      switchMap((key) => this.db.list<Zone>(`/zones/${key}`).valueChanges())
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
        const isFloorJudge =
          staff.floorJudges && staff.floorJudges.findIndex(({ id }) => id === userId) > -1
        const isTmpFloorJudge =
          staff.tmpFloorJudges && staff.tmpFloorJudges.findIndex(({ id }) => id === userId) > -1
        const isCoverage =
          staff.coverage && staff.coverage.findIndex(({ id }) => id === userId) > -1
        if (isLeader) {
          allRoles.push('zoneLeader')
        }
        if (isAdmin) {
          allRoles.push('tournamentAdmin')
        }
        if (isScorekeeper) {
          allRoles.push('scorekeeper')
        }
        if (isFloorJudge) {
          allRoles.push('floorJudge')
        }
        if (isTmpFloorJudge) {
          allRoles.push('tmpFloorJudge')
        }
        if (isCoverage) {
          allRoles.push('coverage')
        }
        return allRoles
      })
    )
    this.subscriptions.push(this.zones$.subscribe((zones) => (this.zones = zones)))
    const filterFunc$: Observable<(table: Table) => boolean> = this.filters$.pipe(
      combineLatest(this.isOutstandings$, this.roles$),
      map(([filters, isOutstandings, roles]) => {
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
          if (filters.onlyStageHasNotPaper || (isOutstandings && !roles.includes('coverage'))) {
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
    const allFeatureTables$ = this.zones$.pipe(
      combineLatest(this.key$),
      switchMap(([zones, key]) => this.getFeatures(zones, key))
    )
    this.featureTables$ = allFeatureTables$.pipe(
      combineLatest(filterFunc$),
      map(([tables, fn]) => {
        return tables.filter(fn)
      })
    )
    this.featureInfos$ = allFeatureTables$.pipe(
      combineLatest(this.isOutstandings$),
      map(([tables, isOutstandings]) => {
        return {
          id: 'feature',
          name: 'Feature',
          sections: [],
          ...this.getTablesInfo(tables, isOutstandings),
        }
      })
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
              return {
                id: '' + zoneIndex,
                name: zone.name,
                sections: zone.sections,
                ...this.getTablesInfo(
                  flat(sections.map((sections) => Object.values(sections))),
                  isOutstandings
                ),
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
            id: 'all',
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
    this.actions$ = this.roles$.pipe(
      combineLatest(
        this.isOutstandings$,
        this.tournament$.pipe(map((t: Tournament) => t.software))
      ),
      map(([roles, isOutstandings, software]) => {
        let actions: Action[] = []
        if (
          roles.findIndex((r) => r === 'coverage') === -1 ||
          roles.filter((r) => r !== 'coverage').length > 1
        ) {
          actions.push({ label: 'Add time', key: 'add-time', role: 'all', color: 'primary' })
        }
        if (roles.includes('coverage')) {
          actions = actions.concat({
            label: 'Set Feature',
            key: 'set-feature',
            role: 'teamlead',
            color: 'primary',
          })
        }
        if (roles.includes('scorekeeper')) {
          actions = actions.concat(
            {
              label: 'Import Pairings',
              key: 'import-pairings',
              role: 'scorekeeper',
              color: 'primary',
            },
            {
              label: 'Import Results',
              key: 'import-results',
              role: 'scorekeeper',
              color: 'primary',
            },
            {
              label: 'Set Feature',
              key: 'set-feature',
              role: 'scorekeeper',
              color: 'primary',
            },
            {
              label: isOutstandings ? 'Set outstandings' : 'Go to outstanding',
              key: 'go-outstanding',
              role: 'teamlead',
              color: 'warn',
            },
            { label: 'Go to next round', key: 'end-round', role: 'teamlead', color: 'warn' }
          )
        }
        if (roles.includes('zoneLeader') || roles.includes('tournamentAdmin')) {
          actions = actions.concat(
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
            {
              label: 'Nominate floor judge',
              key: 'nominate-floor',
              role: 'zonelead',
              color: 'primary',
            },
            { label: 'Assign judge', key: 'assign-judge', role: 'zonelead', color: 'primary' }
          )
        }
        if (roles.includes('tournamentAdmin')) {
          actions = actions.concat(
            {
              label: 'Set Feature',
              key: 'set-feature',
              role: 'teamlead',
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
            { label: 'Edit tournament', key: 'edit', role: 'teamlead', color: 'warn' }
          )
        }

        return actions
      })
    )
    // const allTables$ = this.key$.pipe(
    //   switchMap((key) => this.db.list<Table[][]>(`/zoneTables/${key}`).valueChanges()),
    //   map((zones) => zones.reduce((sections, zone) => sections.concat(zone), [])),
    //   map((sections) =>
    //     sections
    //       .reduce((tables, section) => tables.concat(Object.values(section)), [])
    //       .filter((table) => Boolean(table))
    //   )
    // )
    // this.sortedTables$ = this.sortBy$.pipe(
    //   switchMap((sortBy) => {
    //     if (sortBy === 'zone') return of([]) // refer to other observable in this case
    //     return allTables$
    //   }),
    //   combineLatest(filterFunc$, this.zoneInfoSelected$),
    //   map(([tables, fn, zoneInfoSelected]) => {
    //     // TODO: distinct filters
    //     let filterFn = fn
    //     if (zoneInfoSelected === 'all') {
    //       filterFn = fn
    //     } else if (zoneInfoSelected === 'feature') {
    //       filterFn = (table) => fn(table) && table.isFeatured
    //     } else {
    //       filterFn = (table) => fn(table) && table.zoneIndex === zoneInfoSelected
    //     }
    //     return tables.filter(filterFn).sort((a, b) => (b.time || 0) - (a.time || 0))
    //   })
    // )
    this.subscriptions.push(
      this.isOutstandings$.pipe(filter((v) => v)).subscribe((_) => {
        this.notifier.notify('Going to outstandings')
        this.filters$.next({
          displayUnknown: true,
          displayCovered: true,
          displayPlaying: true,
          displayDone: true,
          onlyExtraTimed: false,
          onlyStageHasNotPaper: false,
        })
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

  set zoneInfoSelected(value: string) {
    this.zoneInfoSelected$.next(value)
  }

  get zoneInfoSelected() {
    return this.zoneInfoSelected$.getValue()
  }

  setClock(value: number): Promise<any> {
    return this.db.object<number>(`endTime/${this.key}`).set(value)
  }

  setFilters(filters: Filters) {
    this.filters$.next(filters)
  }

  // setSortBy(sortBy: SortBy) {
  //   this.sortBy$.next(sortBy)
  // }

  async restart() {
    const key = this.key
    const zones = this.zones
    await Promise.all(
      zones
        .map((zone, zoneIndex) => this.recreateZone(zone, zoneIndex, key))
        .concat(
          this.resetLogs(),
          this.setIsOutstandings(false),
          this.setClock(null),
          this.db.object(`staff/${key}/tmpFloorJudges`).set(null)
        )
    )
  }

  setIsOutstandings(value: boolean): Promise<any> {
    return this.db.object(`isOutstandings/${this.key}`).set(value)
  }

  setStaff(staff: TournamentStaff): Promise<any> {
    const currentUser = this.authentication.user
    if (staff.admins.findIndex(({ id }) => id === currentUser.id) === -1) {
      staff.admins.push(currentUser)
    }
    return this.db.object(`staff/${this.key}`).set(staff)
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

  private getFeaturesFromSection(
    zoneIndex: number,
    sectionIndex: number,
    key: string
  ): Observable<Table[]> {
    return this.db
      .list<Table>(`/zoneTables/${key}/${zoneIndex}/${sectionIndex}`, (ref) =>
        ref.orderByChild('isFeatured').equalTo(true)
      )
      .valueChanges()
  }

  private getFeaturesFromZone(zone: Zone, zoneIndex: number, key: string): Observable<Table[]>[] {
    return zone.sections.map((section, sectionIndex) =>
      this.getFeaturesFromSection(zoneIndex, sectionIndex, key)
    )
  }

  private getFeatures(zones: Zone[], key: string): Observable<Table[]> {
    return combine(
      flat(zones.map((zone, zoneIndex) => this.getFeaturesFromZone(zone, zoneIndex, key)))
    ).pipe(map((tables) => flat(tables)))
  }

  private getTablesInfo(tables: Table[], isOutstandings) {
    if (isOutstandings) {
      tables = tables.filter((table) => !table.stageHasPaper)
    }
    const notDoneTables = tables.filter(({ status }) => status !== 'done')
    const extraTimesTables = notDoneTables.filter((table) => table.time > 0)

    return {
      nbExtraTimed: extraTimesTables.length,
      maxTimeExtension: Math.max(...extraTimesTables.map((table) => table.time)),
      nbStillPlaying: notDoneTables.length,
      nbStageHasNotPaper: tables.filter((table) => !table.stageHasPaper).length,
      nbTotal: tables.length,
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }
}
