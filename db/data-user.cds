using ct.trec.db as db from '../db/data-model';

namespace ct.trec.db.user;

entity UserDatas {
  key ID   : String(255);
      data : LargeString;
}
