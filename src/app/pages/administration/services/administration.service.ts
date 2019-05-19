import { Injectable } from '@angular/core'
import { AngularFireDatabase } from '@angular/fire/database'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { StoredUser, Table, TournamentStaff, User } from 'src/app/models'
import { TournamentSettings, Zone } from '../administration.models'

@Injectable()
export class AdministrationService {
  constructor(private db: AngularFireDatabase) {}

  getUsers(): Observable<User[]> {
    return this.db
      .list<StoredUser>(`users`)
      .valueChanges()
      .pipe(map((users) => users.map((u) => u.judgeapps)))
  }

  async createTournament(
    settings: TournamentSettings,
    zones: Zone[],
    staff: TournamentStaff
  ): Promise<string> {
    try {
      const { key } = await this.db.list('tournaments').push(settings)
      await this.db.object(`staff/${key}`).set(staff)
      await Promise.all(
        zones.map((zone, zoneIndex) => this.createZone(zone, zoneIndex, key, settings.isTeam))
      )
      return key
    } catch (err) {
      return Promise.reject(err)
    }
  }

  private async createZone(zone, zoneIndex, tournamentKey, isTeam) {
    await this.db.object(`zones/${tournamentKey}/${zoneIndex}`).set(zone)
    await Promise.all(
      zone.sections.map((section, sectionIndex) => {
        let tables = {}
        Array(section.end - section.start + 1)
          .fill({})
          .forEach((_, i) => {
            const index = (section.start + i).toString()
            tables[index] = this.createEmptyTable(
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

  private createEmptyTable(
    index: string,
    zoneIndex: string,
    sectionIndex: string,
    isTeam: boolean
  ) {
    const table: Table = {
      id: index.toString(),
      status: 'unknown',
      isFeatured: false,
      time: null,
      updateStatusTime: null,
      result: null,
      stageHasPaper: false,
      assignated: '',
      zoneIndex,
      sectionIndex,
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
