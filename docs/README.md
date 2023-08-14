# 计时打卡 app 文档

## Index

1. DevOps 相关
2. 版本信息

## Features

### Functional

#### FU01 Do a check-in

End user can do check-in by adding new check-in item with value and timestamp

#### FU02 New check-in type

End user can new a check-in type

#### FU03 New check-in scenario

End user can new a check-in scenario

### Non-Functional

#### NF0 Export import push pull all data

End user can export/import/push/pull all input data

#### NF02 Data Ppersistency

End user can persist records on broswer refresh on use remote odata

#### NF03 oData call queuing

[Performance] End user need client priori to server way of the best performance of calling oData. e.g. When click 3 times button, only need 1 time prompt success instead of 3 times.

## Dev

## Next Steps

### Backend service

- Open a new terminal and run `cds watch` for debug or `npm run start` for run.
- (in VS Code simply choose _**Terminal** > Run Task > cds watch_)

### Frontend app

- Open a new terminal, cd to `cd app/trecmgr` and run `npm run start`.
- (in VS Code simply choose _**Terminal** > Run Task > npm: start - app/trecmgr_)
