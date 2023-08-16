using ct.trec.db as db from '../db/data-model';

@path: 'service/persistence'
service PersistenceService {
  entity PersCheckInTypes  as projection on db.CheckInTypes;
  entity PersTypedCheckIns as projection on db.TypedCheckIns;
  entity PersScenarios     as projection on db.CheckInScenarios;
}
