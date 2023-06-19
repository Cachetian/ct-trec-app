namespace ct.trec.db;

entity CheckInTypes {
  key ID   : Integer;
      text : String;
}

entity TypedCheckIns {
  key ID        : Integer;
      value     : String;
      comment   : String;
      timestamp : Timestamp;
}
