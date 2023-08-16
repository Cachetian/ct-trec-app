using ct.trec.db as db from '../db/data-model';

namespace ct.trec.db.user;

/**
 * All clustered User IDs
 */
entity UserIDs {
  key ID   : Integer;
      text : String;
      data : Association to UserDatas
               on data.userID = $self.ID;
}

/**
 * User data storeage e.g. time records transactional data and
 * check-in types, scenarios tags master data.
 */
entity UserDatas {
  key userID    : Integer;
      allData   : LargeString;
      records   : Association to many db.TypedCheckIns;
      types     : Association to many db.CheckInTypes;
      scenarios : Association to many db.CheckInScenarios;
}
