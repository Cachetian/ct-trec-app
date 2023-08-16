namespace ct.trec.db;

/**
 * Scenarios
 */
entity CheckInScenarios {
  key ID       : Integer;
      text     : String;
      types    : Association to many TypeScenarioAssigments
                   on types.scenarios = $self;
      checkIns : Association to many CheckInScenarioAssigments
                   on types.scenarios = $self;
}

/**
 * Types
 */
entity CheckInTypes {
  key ID        : Integer;
      text      : String;
      scenarios : Association to many TypeScenarioAssigments
                    on scenarios.types = $self;
}

entity TypeScenarioAssigments {
  key scenarios : Association to one CheckInScenarios;
  key types     : Association to one CheckInTypes;
}

/**
 * Records
 */
entity TypedCheckIns {
  key ID        : Integer;
      value     : String;
      comment   : String;
      timestamp : Timestamp;
      scenarios : Association to many CheckInScenarioAssigments
                    on scenarios.checkIn = $self;
}

entity CheckInScenarioAssigments {
  key scenario : Association to one CheckInScenarios;
  key checkIn  : Association to one TypedCheckIns;
}
