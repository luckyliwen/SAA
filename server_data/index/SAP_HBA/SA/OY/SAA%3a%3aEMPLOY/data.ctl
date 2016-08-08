import data
into table "SAP_HBA"."SAA::EMPLOY"
from 'data.csv'
    record delimited by '\n'
    field delimited by ','
    optionally enclosed by '"'
error log 'data.err'
