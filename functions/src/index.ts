import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'

admin.initializeApp(functions.config().firebase)

const tournamentFields = ['zones', 'staff', 'zoneTables', 'log', 'endTime']
exports.deleteTournament = functions.database
  .ref('/tournaments/{id}')
  .onDelete((snapshot, { params }) => {
    const id = params.id
    return Promise.all(
      tournamentFields.map((field) =>
        admin
          .database()
          .ref(`/${field}/${id}`)
          .remove()
      )
    )
  })
