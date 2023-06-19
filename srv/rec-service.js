const cds = require('@sap/cds')
class RecordService extends cds.ApplicationService {

  /** register custom handlers */
  init() {

    const { CheckInTypes, TypedCheckIns } = this.entities

    const memDB = {
      CheckInTypes: [{ ID: 0, "text": "Do" }],
      TypedCheckIns: [{ "value": "Do", "timestamp": new Date('2023-06-18T22:11:00.000Z') }]
    }

    this.on('CREATE', CheckInTypes, (req) => {
      memDB.CheckInTypes.push(req.data)
      req.data.ID = memDB.CheckInTypes.length
      return req.data
    })

    this.on('READ', CheckInTypes, (req) => {
      return memDB.CheckInTypes;
    })

    this.on('CREATE', TypedCheckIns, (req) => {
      memDB.TypedCheckIns.push(req.data)
      req.data.ID = memDB.TypedCheckIns.length
      return req.data
    })

    this.on('READ', TypedCheckIns, (req) => {
      return memDB.TypedCheckIns;
    })

    return super.init()
  }

}
module.exports = RecordService