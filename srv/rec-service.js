const cds = require('@sap/cds')

class RecordService extends cds.ApplicationService {

  /** register custom handlers */
  init() {

    const { CheckInScenarios, CheckInTypes, TypedCheckIns, AllDatas } = this.entities

    const memDB = {
      CheckInScenarios: [{ ID: 0, text: "Day" }],
      CheckInTypes: [{ ID: 0, text: "Do" }],
      TypedCheckIns: [{ value: "Do", timestamp: new Date('2023-06-18T22:11:00.000Z') }]
    }

    this.on('CREATE', CheckInScenarios, (req) => {
      memDB.CheckInScenarios.push(req.data)
      req.data.ID = memDB.CheckInTypes.length
      return req.data
    })

    this.on('READ', CheckInScenarios, (req) => {
      return memDB.CheckInScenarios;
    })

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

    this.on('CREATE', AllDatas, (req) => {
      if (req.data.name === "pushAllData") {
        const data = JSON.parse(req.data.value)
        memDB.CheckInTypes = data.CheckInTypes
        memDB.TypedCheckIns = data.TypedCheckIns
      }
      return req.data
    })

    this.on('READ', AllDatas, (req) => {
      return {
        name: "pullAllData", value: JSON.stringify(
          {
            CheckInTypes: memDB.CheckInTypes,
            TypedCheckIns: memDB.TypedCheckIns
          }
        )
      }
    })

    return super.init()
  }

}
module.exports = RecordService