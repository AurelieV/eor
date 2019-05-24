import { NgModule } from '@angular/core'
import { UserPipe } from './pipes/user.pipe'

@NgModule({
  declarations: [UserPipe],
  exports: [UserPipe],
})
export class CommonModule {}
