import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { AppComponent } from './app.component'
import { CoreModule } from './core/core.module'

@NgModule({
  declarations: [AppComponent],
  imports: [CoreModule, RouterModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
