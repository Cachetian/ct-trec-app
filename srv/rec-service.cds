using ct.trec.db as db from '../db/data-model';
using ct.trec.db.user as userdb from '../db/data-user';

@path: 'service/record'
service RecordService {
  entity Users         as projection on userdb.UserIDs;
  entity UserDatas     as projection on userdb.UserDatas;
  entity CheckInTypes  as projection on db.CheckInTypes;
  entity TypedCheckIns as projection on db.TypedCheckIns;
  entity Scenarios     as projection on db.CheckInScenarios;

  @cds.redirection.target
  entity Items         as projection on db.TypedCheckIns;

  @cds.redirection.target
  entity Types         as projection on db.CheckInTypes;

  @cds.persistence.exists
  entity AllDatas {
    key name  : String;
        value : String;
  }

  action restoreData() returns String;
  action saveAllData() returns String;
  action hello()       returns String;
}
