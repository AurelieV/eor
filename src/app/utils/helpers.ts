import { Table } from '../models'

export function createEmptyTable(
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
    player1: {
      name: 'Player 1',
      currentPoints: 0,
    },
    player2: {
      name: 'Player 2',
      currentPoints: 0,
    },
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
