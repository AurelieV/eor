// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
/*
 * In development mode, for easier debugging, you can ignore zone related error
 * stack frames such as `zone.run`/`zoneDelegate.invokeTask` by importing the
 * below file. Don't forget to comment it out in production mode
 * because it will have a performance impact when errors are thrown
 */
import 'zone.js/dist/zone-error' // Included with Angular CLI.import
import { Environnement, LoginMethod, Software } from '../app/interfaces'

export const environment: Environnement = {
  production: false,
  configuration: {
    loginMethod: LoginMethod.JudgeApps,
    softwares: [Software.WER, Software.WLTR],
  },
  firebase: {
    apiKey: 'AIzaSyAEjaMLLL_VeuX9eyAqaLeMpll25Z7oTaE',
    authDomain: 'eor-beta-dev.firebaseapp.com',
    databaseURL: 'https://eor-beta-dev.firebaseio.com',
    projectId: 'eor-beta-dev',
    storageBucket: 'eor-beta-dev.appspot.com',
    messagingSenderId: '28941068774',
  },
  authenticateUrl: '/api/authenticate',
  authenticateSettings: {
    authority: 'https://apps.magicjudges.org/openid/',
    client_id: '495440',
    redirect_uri: 'http://localhost:4200/authent-redirect',
    post_logout_redirect_uri: 'http://localhost:4200',
    response_type: 'code',
    scope: 'openid profile dciprofile',
  },
}
