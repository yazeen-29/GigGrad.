-- Faculty/staff accounts post directly; student posting remains administrator-approved.
UPDATE "User" SET "posterStatus" = 'approved', "posterType" = COALESCE("posterType", 'faculty') WHERE "role" = 'TEACHER';
