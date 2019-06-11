import { createEmptyTable } from '@/app/utils/helpers'
import { Injectable } from '@angular/core'
import { AngularFireDatabase } from '@angular/fire/database'
import { AuthenticationService } from '@core/services/authentication.service'
import { forkJoin } from 'rxjs'
import { take } from 'rxjs/operators'
import { TournamentStaff } from 'src/app/models'
import { TournamentSettings, Zone } from '../administration.models'

@Injectable()
export class AdministrationService {
  constructor(private db: AngularFireDatabase, private authentification: AuthenticationService) {}

  async createTournament(
    settings: TournamentSettings,
    zones: Zone[],
    staff: TournamentStaff,
    key: string
  ): Promise<string> {
    try {
      if (!key) {
        key = await this.db.list('tournaments').push(settings).key
      } else {
        await this.db.list('tournaments').set(key, settings)
      }
      const currentUser = this.authentification.user
      if (staff.admins.findIndex(({ id }) => id === currentUser.id) === -1) {
        staff.admins.push(currentUser)
      }
      await this.db.object(`staff/${key}`).set(staff)
      await this.db.object(`zones/${key}`).remove()
      await this.db.object(`zoneTables/${key}`).remove()
      await this.db.object(`log/${key}`).remove()
      await this.db.object(`endTime/${key}`).remove()
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

  getTournamentById(tournamentId: string) {
    const zones$ = this.db
      .object<Zone[]>(`zones/${tournamentId}`)
      .valueChanges()
      .pipe(take(1))
    const staff$ = this.db
      .object<TournamentStaff>(`staff/${tournamentId}`)
      .valueChanges()
      .pipe(take(1))
    const settings$ = this.db
      .object<TournamentSettings>(`tournaments/${tournamentId}`)
      .valueChanges()
      .pipe(take(1))

    return forkJoin(settings$, zones$, staff$)
  }
}
