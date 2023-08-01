const cds = require('@sap/cds')

class RecordService extends cds.ApplicationService {

  /** register custom handlers */
  init() {

    const { CheckInTypes, TypedCheckIns, AllDatas } = this.entities

    const memDB = {
      CheckInTypes: [{ ID: 0, text: "Do" }],
      TypedCheckIns: [{ value: "Do", timestamp: new Date('2023-06-18T22:11:00.000Z') }]
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

    this.on('CREATE', AllDatas, (req) => {
      if (req.data.name === "pushAllData") {
        const data = JSON.parse(req.data.value)
        memDB.CheckInTypes = data.CheckInTypes.map((it) => {
          return ({ ID: it.ID, text: it.text });
        });
        memDB.TypedCheckIns = data.TypedCheckIns.map((it) => {
          return { ID: it.ID, text: it.text };
        });
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

    this.on('restoreData', (req) => {
      return "200"
    })

    this.on('saveAllData', async (req) => {
      await UPSERT.into (CheckInTypes, memDB.CheckInTypes);
      await UPSERT.into (TypedCheckIns, memDB.TypedCheckIns);
      return "200"
    })

    return super.init()
  }

}
module.exports = RecordService