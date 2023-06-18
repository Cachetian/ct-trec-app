namespace ct.trec.db;

entity CheckInTypes {
  key ID   : UUID;
      text : String;
}

entity TypedCheckIns {
  key ID        : UUID;
      value     : String;
      timestamp : Timestamp;
}
