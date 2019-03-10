import { Configuration } from '@/app/interfaces'
import { environment } from '@/environments/environment'
import { Component } from '@angular/core'
import { AuthenticationService } from '@core/services/authentication.service'

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  config: Configuration = environment.configuration
  isLoading: boolean = false

  constructor(private authent: AuthenticationService) {}

  get isUsingJudgeApps() {
    return this.config.loginMethod === 'JUDGE_APPS'
  }

  login() {
    this.isLoading = true
    if (this.isUsingJudgeApps) {
      this.authent.loginWithJudgeApps()
    }
  }
}
