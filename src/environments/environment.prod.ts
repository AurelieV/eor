export const environment = {
  production: true,
  configuration: {
    loginMethod: 'JUDGE_APPS',
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
    redirect_uri: 'http://localhost:4200/authent-redirect',
    post_logout_redirect_uri: 'http://localhost:4200',
    response_type: 'code',
    scope: 'openid profile dciprofile',
  },
}
