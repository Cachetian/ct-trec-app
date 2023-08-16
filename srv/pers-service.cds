using ct.trec.db as db from '../db/data-model';
using ct.trec.db.user as userdb from '../db/data-user';

@path: 'service/persistence'
service PersistenceService {
  entity PersCheckInTypes  as projection on db.CheckInTypes;
  entity PersTypedCheckIns as projection on db.TypedCheckIns;
  entity PersScenarios     as projection on db.CheckInScenarios;
  entity PersUserIDs       as projection on userdb.UserIDs;
  entity PersUserDatas     as projection on userdb.UserDatas;
}
