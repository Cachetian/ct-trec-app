/**
 * Core domain models for ct-trec time recording app
 */
namespace ct.trec.db;

/**
 * 10 - Records, transaction data
 */
entity Records {
  key ID        : Integer;
      value     : String;
      comment   : String;
      timestamp : Timestamp;
      scenarios : Association to many RecordScenarioAssigments
                    on scenarios.checkIn = $self;
}

// technical entity for many to many impl
entity RecordScenarioAssigments {
  key scenario : Association to one Scenarios;
  key checkIn  : Association to one Records;
}

/**
 * 20 - Types, master data
 */
entity Actions {
  key ID        : Integer;
      text      : String;
      scenarios : Association to many ActionScenarioAssigments
                    on scenarios.type = $self;
}

// technical entity for many to many impl
entity ActionScenarioAssigments {
  key scenario : Association to one Scenarios;
  key type     : Association to one Actions;
}


/**
 * 30 - Tags (Scenarios), master data
 */
entity Scenarios {
  key ID       : Integer;
      text     : String;
      types    : Association to many ActionScenarioAssigments
                   on types.scenario = $self;
      checkIns : Association to many RecordScenarioAssigments
                   on checkIns.scenario = $self;
}
