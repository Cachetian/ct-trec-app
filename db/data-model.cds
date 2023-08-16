/**
 * Core domain models for ct-trec time recording app
 */
namespace ct.trec.db;

/**
 * 10 - Records, transaction data
 */
entity TypedCheckIns {
  key ID        : Integer;
      value     : String;
      comment   : String;
      timestamp : Timestamp;
      scenarios : Association to many CheckInScenarioAssigments
                    on scenarios.checkIn = $self;
}

// technical entity for many to many impl
entity CheckInScenarioAssigments {
  key scenario : Association to one CheckInScenarios;
  key checkIn  : Association to one TypedCheckIns;
}

/**
 * 20 - Types, master data
 */
entity CheckInTypes {
  key ID        : Integer;
      text      : String;
      scenarios : Association to many TypeScenarioAssigments
                    on scenarios.type = $self;
}

// technical entity for many to many impl
entity TypeScenarioAssigments {
  key scenario : Association to one CheckInScenarios;
  key type     : Association to one CheckInTypes;
}


/**
 * 30 - Tags (Scenarios), master data
 */
entity CheckInScenarios {
  key ID       : Integer;
      text     : String;
      types    : Association to many TypeScenarioAssigments
                   on types.scenario = $self;
      checkIns : Association to many CheckInScenarioAssigments
                   on checkIns.scenario = $self;
}
