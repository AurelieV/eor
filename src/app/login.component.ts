import { Component } from '@angular/core'
import { environment } from '../environments/environment'
import { Configuration } from './interfaces'

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  config: Configuration = environment.configuration

  get isUsingJudgeApps() {
    return this.config.loginMethod === 'JUDGE_APPS'
  }
}
