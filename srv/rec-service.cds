using ct.trec.db as db from '../db/data-model';
using ct.trec.db.user as userdb from '../db/data-user';

@path: 'service/record'
service RecordService {
  entity UserDatas     as projection on userdb.UserDatas;
  entity CheckInTypes  as projection on db.CheckInTypes;
  entity TypedCheckIns as projection on db.TypedCheckIns;
  entity Scenarios     as projection on db.CheckInScenarios;

  @cds.persistence.exists
  entity AllDatas {
    key name  : String;
        value : String;
  }

  action restoreData() returns String;
  action saveAllData() returns String;
  action hello()       returns String;
}
