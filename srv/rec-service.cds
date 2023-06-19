using ct.trec.db as db from '../db/data-model';

@path: 'service/record'
service RecordService {
    entity CheckInTypes  as projection on db.CheckInTypes;
    entity TypedCheckIns as projection on db.TypedCheckIns;

    @cds.persistence.exists
    entity AllDatas {
        key name  : String;
            value : String;
    }
}
