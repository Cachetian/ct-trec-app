namespace ct.trec.db;

/**
 * Scenarios
 */
entity CheckInScenarios {
  key ID    : Integer;
      text  : String;
      types : Association to many ScenarioTypeAssigments
                on types.scenarios = $self;
}

entity ScenarioTypeAssigments {
  key scenarios : Association to one CheckInScenarios;
  key types     : Association to one CheckInTypes;
}

/**
 * Types
 */
entity CheckInTypes {
  key ID   : Integer;
      text : String;
      scenarios : Association to many ScenarioTypeAssigments
                    on scenarios.types = $self;
}

/**
 * Records
 */
entity TypedCheckIns {
  key ID        : Integer;
      value     : String;
      comment   : String;
      timestamp : Timestamp;
}
