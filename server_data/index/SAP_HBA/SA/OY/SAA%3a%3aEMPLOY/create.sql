CREATE COLUMN TABLE "SAP_HBA"."SAA::EMPLOY" ("ID" VARCHAR(10) NOT NULL , "NAME" VARCHAR(30), "EMAIL" VARCHAR(50), "ADDRESS" VARCHAR(200), "COUNTRY" VARCHAR(100), "CITY" VARCHAR(100), "OFFICE" VARCHAR(100), "MANAGER_ID" VARCHAR(10), "NAME2" VARCHAR(50), "LAST_NAME" VARCHAR(50), "FIRST_NAME" VARCHAR(50), "EXPERTISE" VARCHAR(500), "HOBBY" VARCHAR(500), "INTEREST" VARCHAR(500), "IMAGE" VARCHAR(300), "HOMETOWN" VARCHAR(300), "CLUBS" VARCHAR(300), "ORGANIZATION" VARCHAR(100), "ROLE" VARCHAR(200), "LATLNG" VARCHAR(100), "MOBILE" VARCHAR(100), "PHONE" VARCHAR(100), "COMPANY" VARCHAR(200), "PROFILE" VARCHAR(5000), PRIMARY KEY ("ID"));
COMMENT ON COLUMN "SAP_HBA"."SAA::EMPLOY"."ADDRESS" is 'now only use this address';
COMMENT ON COLUMN "SAP_HBA"."SAA::EMPLOY"."OFFICE" is 'office address';
COMMENT ON COLUMN "SAP_HBA"."SAA::EMPLOY"."MANAGER_ID" is 'find manager ';
COMMENT ON COLUMN "SAP_HBA"."SAA::EMPLOY"."NAME2" is 'chinese name'