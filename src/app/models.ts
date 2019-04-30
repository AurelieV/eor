export class Table {
  id: string
  status: TableStatus
  isFeatured: boolean
  time?: number
  team?: {
    time: TeamTime
    status: TeamTablesStatus
  }
  updateStatusTime: number
  result: Result
  isPaperOnStage: boolean
  assignated: string
  sectionIndex: string
  zoneIndex: string
}

export interface TeamTime {
  A?: number
  B?: number
  C?: number
}
export interface TeamTablesStatus {
  A: TableStatus
  B: TableStatus
  C: TableStatus
}

export type TableStatus = 'playing' | 'covered' | 'done' | 'unknown'
export interface Result {
  player1: {
    score: number
    drop: boolean
  }
  player2: {
    score: number
    drop: boolean
  }
  draw: number
}

export interface Tournament {
  key: string
  name: string
  endDate: Date
  isTeam: boolean
  software: string
  staff: TournamentStaff
}

export interface TournamentStaff {
  admins: UserWithId[]
  scorekeepers: UserWithId[]
  zoneLeaders: UserWithId[]
}

export type UserWithId = JudgeAppsInfo & { id: string }

export interface JudgeAppsInfo {
  name: string
  given_name: string
  family_name: string
  nickname: string
  preferred_username: string
  level: number
  dci_number: number
  region: string
  picture: string
}

// TODO: handle when not judgeApps
export interface StoredUser {
  roles: { [role: string]: boolean }
  judgeapps: JudgeAppsInfo
}

export interface Settings {
  statusOrder: TableStatus[]
}
