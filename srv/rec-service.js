const cds = require("@sap/cds");
const crypto = require("crypto");

/**
 * Record service, the default service, also memory db service
 */
class RecordService extends cds.ApplicationService {
  /** register custom handlers */
  async init() {
    const LOG = cds.log("srv.record");
    const { CheckInTypes, TypedCheckIns, Scenarios, AllDatas, UserDatas } =
      this.entities;
    const PersistenceService = await cds.connect.to("PersistenceService");
    const memDB = {
      CheckInTypes: [{ ID: 0, text: "Do" }],
      TypedCheckIns: [
        { value: "Do", timestamp: new Date("2023-06-18T22:11:00.000Z") }
      ],
      Scenarios: [{ ID: 0, text: "Day" }]
    };

    this.on("CREATE", CheckInTypes, (req) => {
      memDB.CheckInTypes.push(req.data);
      req.data.ID = memDB.CheckInTypes.length;
      return req.data;
    });

    this.on("READ", CheckInTypes, (req) => {
      return memDB.CheckInTypes;
    });

    this.on("CREATE", TypedCheckIns, (req) => {
      memDB.TypedCheckIns.push(req.data);
      req.data.ID = memDB.TypedCheckIns.length;
      return req.data;
    });

    this.on("READ", TypedCheckIns, (req) => {
      return memDB.TypedCheckIns;
    });

    this.on("CREATE", AllDatas, (req) => {
      if (req.data.name === "pushAllData") {
        const data = JSON.parse(req.data.value);
        memDB.CheckInTypes = data.CheckInTypes.map((it) => {
          return { ID: it.ID, text: it.text };
        });
        memDB.TypedCheckIns = data.TypedCheckIns.map((it) => {
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
          CheckInTypes: memDB.CheckInTypes,
          TypedCheckIns: memDB.TypedCheckIns
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
      LOG.info("Read user data with ID: ", ID);
      // req.data.ID = ID;
      req.query.SELECT.from.ref[0].where[2].val = ID;
    });

    this.on("CREATE", UserDatas, async (req) => {
      let clientIP = req.res.socket.remoteAddress;
      let userAgent = req.headers["user-agent"];
      let ID = crypto
        .createHash("md5")
        .update(clientIP + userAgent)
        .digest("hex");
      LOG.info("Push to user data with ID: ", ID);
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
      // req.data.ID = ID;
      req.query.DELETE.from.ref[0].where[2].val = ID;
    });

    this.on("restoreData", async (req) => {
      LOG.info("restoring data from db");
      memDB.CheckInTypes = await SELECT.from(CheckInTypes);
      memDB.TypedCheckIns = await SELECT.from(TypedCheckIns);
      return "200";
    });

    this.on("saveAllData", async (req) => {
      LOG.info("saving all data");
      await UPSERT.into(CheckInTypes, memDB.CheckInTypes);
      await UPSERT.into(TypedCheckIns, memDB.TypedCheckIns);
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
