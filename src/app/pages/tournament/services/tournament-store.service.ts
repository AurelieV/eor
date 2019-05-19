import { Table, Tournament } from '@/app/models'
import { Injectable } from '@angular/core'
import { AngularFireDatabase } from '@angular/fire/database'
import { WindowVisibility } from '@core/services/window-visibility.service'
import { Zone } from '@pages/administration/administration.models'
import * as moment from 'moment'
import { BehaviorSubject, Observable, of, timer } from 'rxjs'
import { filter, map, switchMap } from 'rxjs/operators'

export type SectionsTables = Observable<Table[]>[]
export type ZonesTables = SectionsTables[]

@Injectable()
export class TournamentStore {
  private key$ = new BehaviorSubject<string>('')
  zones$: Observable<Zone[]>
  zonesTables$: Observable<ZonesTables>
  tournament$: Observable<Tournament>
  clock$: Observable<moment.Duration>

  constructor(private db: AngularFireDatabase, private windowVisibility: WindowVisibility) {
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
    this.clock$ = this.key$.pipe(
      switchMap((key) => this.db.object<number>(`endTime/${key}`).valueChanges()),
      switchMap((endTime) => {
        if (!endTime) return of(moment.duration(50, 'minute'))
        return windowVisibility.value$.pipe(
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
  }

  set key(key: string) {
    this.key$.next(key)
  }

  get key() {
    return this.key$.getValue()
  }
}
