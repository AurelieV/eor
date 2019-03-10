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
