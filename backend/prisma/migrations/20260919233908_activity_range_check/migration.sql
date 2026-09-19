-- Minutes of motion in one 15-minute bucket can only be between 0 and 15. The app validates this too;
-- the constraint means a bug or a direct write cannot store an impossible value.
ALTER TABLE "activities" ADD CONSTRAINT "activities_activity_range_check" CHECK ("activity" >= 0 AND "activity" <= 15);
