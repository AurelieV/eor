import { Tournament, TournamentStaff } from '@/app/models'
import { Injectable } from '@angular/core'
import { AngularFireDatabase } from '@angular/fire/database'
import { Observable } from 'rxjs'
import { combineLatest, map } from 'rxjs/operators'

@Injectable()
export class TournamentService {
  constructor(private db: AngularFireDatabase) {}

  getAll(): Observable<Tournament[]> {
    return this.db
      .list<Tournament>('tournaments')
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions
            .map(({ payload }) => ({ key: payload.key, ...payload.val() }))
            .map((tournament) => {
              tournament.endDate = new Date(tournament.endDate)
              return tournament
            })
        ),
        combineLatest(this.getAllStaff()),
        map(([tournaments, staff]) => {
          tournaments.forEach(
            (tournament) =>
              (tournament.staff = {
                admins: [],
                scorekeepers: [],
                zoneLeaders: [],
                ...(staff[tournament.key] || {}),
              })
          )
          return tournaments
        })
      )
  }

  getAllStaff(): Observable<{ [key: string]: TournamentStaff }> {
    return this.db.object<{ [key: string]: TournamentStaff }>('staff').valueChanges()
  }
}
