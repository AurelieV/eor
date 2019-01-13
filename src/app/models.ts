export class Table {
  id: string
  status: TableStatus
  isFeatured: boolean
  time?: number
  team?: {
    time: TeamTime
    status: TeamTablesStatus
  }
  doneTime: number
  result: Result
  isPaperOnStage: boolean
  assignated: string
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
