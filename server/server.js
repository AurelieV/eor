const admin = require('firebase-admin')
const cors = require('cors')({ origin: true })
const express = require('express')
const Issuer = require('openid-client').Issuer
const bodyParser = require('body-parser')
const config = require('./server.config')

admin.initializeApp({
  credential: admin.credential.cert(config.firebaseKey),
  databaseURL: config.databaseURL,
})

const app = express()
app.use(cors)
app.use(bodyParser.json())

app.post('/authenticate', async function(req, res) {
  const code = req.body.code
  if (!code) {
    return res.status('400').json({ error: 'Fields missing' })
  }
  try {
    const issuer = await Issuer.discover(config.judgeAppCredential.issuer)
    Issuer.defaultHttpOptions = { timeout: 250000 }
    const client = new issuer.Client({
      client_id: config.judgeAppCredential.client_id,
      client_secret: config.judgeAppCredential.client_secret,
    })
    client.CLOCK_TOLERANCE = 5
    const tokenSet = await client.authorizationCallback(config.authentRedirectUrl, { code })
    const info = await client.userinfo(tokenSet.access_token)
    const uid = info.sub
    delete info.sub
    try {
      await admin.auth().getUser(uid)
    } catch (e) {
      await admin.auth().createUser({ uid })
    }
    await admin.auth().setCustomUserClaims(uid, info)
    await admin
      .database()
      .ref(`users/${uid}/judgeapps`)
      .set({
        ...info,
        id: uid,
      })
    const token = await admin.auth().createCustomToken(uid)

    return res.json({ token })
  } catch (e) {
    console.log('err', e)
    res.status('500').json({ err: 'Something wrong happen' })
  }
})

app.listen(3003)
