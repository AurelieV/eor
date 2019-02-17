import { Injectable } from '@angular/core'
import { AngularFireDatabase } from '@angular/fire/database'
import { StoredUser } from '@core/services/user.service'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { Table } from 'src/app/models'
import { TournamentSettings, TournamentStaff, UserWithId, Zone } from '../administration.models'

@Injectable()
export class AdministrationService {
  constructor(private db: AngularFireDatabase) {}

  getUsers(): Observable<UserWithId[]> {
    return this.db
      .list<StoredUser>(`users`)
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((action) => ({
            ...action.payload.val().judgeapps,
            id: action.payload.key,
          }))
        )
      )
  }

  async createTournament(
    settings: TournamentSettings,
    zones: Zone[],
    staff: TournamentStaff
  ): Promise<string> {
    try {
      const { key } = await this.db.list('tournaments').push(settings)
      await this.db.object(`staff/${key}`).set(staff)
      zones.forEach(async (zone, zoneIndex) => {
        let tables = {}
        zone.sections.forEach((section) => {
          Array(section.end - section.start + 1)
            .fill({})
            .forEach((_, i) => {
              const index = (section.start + i).toString()
              tables[index] = this.createEmptyTable(index, settings.isTeam)
            })
        })
        await Promise.all([
          this.db.object(`zones/${key}/${zoneIndex}`).set(zone),
          this.db.object(`zoneTables/${key}/${zoneIndex}`).set(tables),
        ])
      })

      return key
    } catch (err) {
      return Promise.reject(err)
    }
  }

  private createEmptyTable(index: string, isTeam: boolean) {
    const table: Table = {
      id: index.toString(),
      status: 'unknown',
      isFeatured: false,
      time: null,
      doneTime: null,
      result: null,
      isPaperOnStage: false,
      assignated: '',
    }
    if (isTeam) {
      table.team = {
        time: {
          A: null,
          B: null,
          C: null,
        },
        status: {
          A: 'unknown',
          B: 'unknown',
          C: 'unknown',
        },
      }
    }

    return table
  }
}
