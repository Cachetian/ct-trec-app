const cds = require("@sap/cds");

class PersistenceService extends cds.ApplicationService {
  /** register custom handlers */
  init() {
    const LOG = cds.log("srv.persistence");
    const { PersActions, PersRecords, PersScenarios } = this.entities;
    LOG.info("persistence service initialized, entity types: ");
    return super.init();
  }
}
module.exports = PersistenceService;
