import { Pipe, PipeTransform } from '@angular/core'

@Pipe({ name: 'user' })
export class UserPipe implements PipeTransform {
  transform(user: any) {
    return `${user.given_name} ${((user.family_name as string) || '').toUpperCase()}`
  }
}
