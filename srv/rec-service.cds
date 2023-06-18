using ct.trec.db as db from '../db/data-model';

@path: 'service/record'
@impl: 'srv/rec-service.js'
service RecordService {
    entity CheckInTypes  as projection on db.CheckInTypes;
    entity TypedCheckIns as projection on db.TypedCheckIns;
}
