import { NgModule } from '@angular/core'
import { MatIconRegistry } from '@angular/material'
import { DomSanitizer } from '@angular/platform-browser'
import { RouterModule } from '@angular/router'
import { AppComponent } from './app.component'
import { CoreModule } from './core/core.module'

@NgModule({
  declarations: [AppComponent],
  imports: [CoreModule, RouterModule],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
    this.matIconRegistry.addSvgIcon(
      `chat`,
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/comment-black.svg')
    )
  }
}
