import { JudgeAppsInfo } from '@core/services/user.service'

export interface Zone {
  name: string
  sections: Section[]
}

export interface Section {
  start: number
  end: number
}

export interface TournamentSettings {
  name: string
  endDate: Date
  isTeam: boolean
  software: string
}

export interface TournamentStaff {
  admins: UserWithId[]
  scorekeepers: UserWithId[]
  zoneLeaders: UserWithId[]
}

export type UserWithId = JudgeAppsInfo & { id: string }
