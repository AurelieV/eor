import { Result } from '@/app/models'
import { Pipe, PipeTransform } from '@angular/core'

@Pipe({ name: 'result' })
export class ResultPipe implements PipeTransform {
  transform(value: Result): string {
    if (!value) return ''
    let result = ''
    result += `${value.player1.score}-${value.player2.score}`
    if (value.draw > 0) {
      result += `-${value.draw}`
    }
    if (value.player1.drop) {
      result += ' D1'
    }
    if (value.player2.drop) {
      result += ' D2'
    }

    return result
  }
}
