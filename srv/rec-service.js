const cds = require("@sap/cds");
const crypto = require("crypto");

/**
 * Record service, the default service, also memory db service
 */
class RecordService extends cds.ApplicationService {
  /** register custom handlers */
  async init() {
    const LOG = cds.log("srv.record");
    const { Actions, Records, Scenarios, AllDatas, UserDatas } = this.entities;
    const PersistenceService = await cds.connect.to("PersistenceService");
    const memDB = {
      Actions: [{ ID: 0, text: "Do" }],
      Records: [
        { value: "Do", timestamp: new Date("2023-06-18T22:11:00.000Z") }
      ],
      Scenarios: [{ ID: 0, text: "Day" }]
    };

    this.on("CREATE", Actions, (req) => {
      memDB.Actions.push(req.data);
      req.data.ID = memDB.Actions.length;
      return req.data;
    });

    this.on("READ", Actions, (req) => {
      return memDB.Actions;
    });

    this.on("CREATE", Records, (req) => {
      memDB.Records.push(req.data);
      req.data.ID = memDB.Records.length;
      return req.data;
    });

    this.on("READ", Records, (req) => {
      return memDB.Records;
    });

    this.on("CREATE", AllDatas, (req) => {
      if (req.data.name === "pushAllData") {
        const data = JSON.parse(req.data.value);
        memDB.Actions = data.Actions.map((it) => {
          return { ID: it.ID, text: it.text };
        });
        memDB.Records = data.Records.map((it) => {
          return {
            ID: it.ID,
            value: it.value,
            timestamp: it.timestamp,
            comment: it.comment
          };
        });
      }
      return req.data;
    });

    this.on("READ", AllDatas, (req) => {
      return {
        name: "pullAllData",
        value: JSON.stringify({
          Actions: memDB.Actions,
          Records: memDB.Records
        })
      };
    });

    this.before("READ", UserDatas, async (req) => {
      let clientIP = req.res.socket.remoteAddress;
      let userAgent = req.headers["user-agent"];
      let ID = crypto
        .createHash("md5")
        .update(clientIP + userAgent)
        .digest("hex");
      // use customized ID
      let userId = req.data.ID;
      const DUMMY = "0";
      if (userId !== DUMMY) {
        ID = crypto.createHash("md5").update(userId).digest("hex");
      }
      LOG.info("Read user data with ID:", ID);
      req.query.SELECT.from.ref[0].where[2].val = ID;
    });

    this.on("CREATE", UserDatas, async (req) => {
      let clientIP = req.res.socket.remoteAddress;
      let userAgent = req.headers["user-agent"];
      let ID = crypto
        .createHash("md5")
        .update(clientIP + userAgent)
        .digest("hex");
      // use customized ID
      let userId = req.data.ID;
      if (userId) {
        ID = crypto.createHash("md5").update(userId).digest("hex");
      }
      LOG.info("Push to user data with ID:", ID);
      req.data.ID = ID;
      await UPSERT.into(UserDatas, req.data);
      return req.data;
    });

    this.before("DELETE", UserDatas, async (req) => {
      let clientIP = req.res.socket.remoteAddress;
      let userAgent = req.headers["user-agent"];
      let ID = crypto
        .createHash("md5")
        .update(clientIP + userAgent)
        .digest("hex");
      LOG.info("Remove user data with ID: ", ID);
      req.query.DELETE.from.ref[0].where[2].val = ID;
    });

    this.on("restoreData", async (req) => {
      LOG.info("restoring data from db");
      memDB.Actions = await SELECT.from(Actions);
      memDB.Records = await SELECT.from(Records);
      return "200";
    });

    this.on("saveAllData", async (req) => {
      LOG.info("saving all data");
      await UPSERT.into(Actions, memDB.Actions);
      await UPSERT.into(Records, memDB.Records);
      return "200";
    });

    this.on("hello", async () => {
      LOG.info("hello");
      return "200";
    });

    this.on("getDeviceId", (req) => {
      let clientIP = req.res.socket.remoteAddress;
      let userAgent = req.headers["user-agent"];
      let ID = crypto
        .createHash("md5")
        .update(clientIP + userAgent)
        .digest("hex");
      return ID;
    });

    LOG.info("record service initialized");

    this.emit("restoreData");

    return super.init();
  }
}
module.exports = RecordService;
