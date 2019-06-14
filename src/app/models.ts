import { Section } from '@pages/administration/administration.models'

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
  stageHasPaper: boolean
  assignated: string
  sectionIndex: string
  zoneIndex: string
  player1: Player
  player2: Player
}

export interface Player {
  name: string
  currentPoints: number
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
  admins: User[]
  scorekeepers: User[]
  zoneLeaders: User[]
  floorJudges: User[]
  tmpFloorJudges: User[]
}

export interface User {
  name: string
  given_name: string
  family_name: string
  nickname: string
  preferred_username: string
  level: number
  dci_number: number
  region: string
  picture: string
  id: string
}

// TODO: handle when not judgeApps
export interface StoredUser {
  roles: { [role: string]: boolean }
  judgeapps: User
}

export interface Settings {
  statusOrder: {
    isGreenFirst: boolean
    isUnknownHidden: boolean
  }
}

export type StatusOrder = Array<TableStatus>

export interface ZoneInfo {
  id: string
  name: string
  sections: Section[]
  nbExtraTimed: number
  maxTimeExtension: number
  nbStillPlaying: number
  nbStageHasNotPaper: number
  nbTotal: number
}

export interface Filters {
  displayUnknown: boolean
  displayCovered: boolean
  displayPlaying: boolean
  displayDone: boolean
  onlyExtraTimed: boolean
  onlyStageHasNotPaper: boolean
}

export type SortBy = 'time' | 'number' | 'zone' | 'status'

export interface Action {
  label: string
  key: string
  role: 'scorekeeper' | 'zonelead' | 'teamlead' | 'all'
  color: 'primary' | 'accent' | 'warn'
}

export interface TimeLog {
  user: User
  time: number
  date: number
  addOrUpdate: 'add' | 'update'
}

export type ViewMode = 'small' | 'actions' | 'large'
