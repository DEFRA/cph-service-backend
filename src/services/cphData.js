export function findAllCPHs(db) {
  const cphs = db
    .collection('example-data')
    .find({}, { projection: { _id: 0 } })

  return cphs.toArray()
}

export function insertCPH(db, cph) {
  return db
    .collection('example-data')
    .insertOne(cph)
}

export function deleteAllCPHs(db) {
  return db
    .collection('example-data')
    .deleteMany({})
}
