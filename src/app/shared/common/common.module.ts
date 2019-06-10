import { NgModule } from '@angular/core'
import { ResultPipe } from './pipes/result.pipe'
import { UserPipe } from './pipes/user.pipe'

@NgModule({
  declarations: [UserPipe, ResultPipe],
  exports: [UserPipe, ResultPipe],
})
export class CommonModule {}
