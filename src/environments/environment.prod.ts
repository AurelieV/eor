import { Environnement, LoginMethod, Software } from '../app/interfaces'

export const environment: Environnement = {
  production: true,
  configuration: {
    loginMethod: LoginMethod.JudgeApps,
    softwares: [Software.WER, Software.WLTR],
  },
  firebase: {
    apiKey: 'AIzaSyCkLTzy-75yAl71VPUrT_TZHmRZXwH3sn0',
    authDomain: 'eor-beta.firebaseapp.com',
    databaseURL: 'https://eor-beta.firebaseio.com',
    projectId: 'eor-beta',
    storageBucket: 'eor-beta.appspot.com',
    messagingSenderId: '380456374612',
  },
  authenticateUrl: '/api/authenticate',
  authenticateSettings: {
    authority: 'https://apps.magicjudges.org/openid/',
    client_id: '495440',
    redirect_uri: 'http://eor-beta.purple-fox.fr/authent-redirect',
    post_logout_redirect_uri: 'http://eor-beta.purple-fox.fr',
    response_type: 'code',
    scope: 'openid profile dciprofile',
  },
}
