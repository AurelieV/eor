import { NgModule } from '@angular/core'
import { AgoPipe } from './pipes/ago.pipe'
import { ResultPipe } from './pipes/result.pipe'
import { UserPipe } from './pipes/user.pipe'

@NgModule({
  declarations: [UserPipe, ResultPipe, AgoPipe],
  exports: [UserPipe, ResultPipe, AgoPipe],
})
export class CommonModule {}
