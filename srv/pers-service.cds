using ct.trec.db as db from '../db/data-model';
using ct.trec.db.user as userdb from '../db/data-user';

@path: 'service/persistence'
service PersistenceService {
  entity PersActions  as projection on db.Actions;
  entity PersRecords as projection on db.Records;
  entity PersScenarios     as projection on db.Scenarios;
  entity PersUserDatas     as projection on userdb.UserDatas;
}
