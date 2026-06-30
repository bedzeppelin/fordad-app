-- Adds water_reminder to the push_notification_log type constraint.
-- Run this in the Supabase SQL Editor.
ALTER TABLE push_notification_log
  DROP CONSTRAINT IF EXISTS push_notification_log_notification_type_check;

ALTER TABLE push_notification_log
  ADD CONSTRAINT push_notification_log_notification_type_check
  CHECK (notification_type IN (
    'reminder', 'escalation_1', 'escalation_2', 'admin_alert',
    'mood_reminder', 'checkin_reminder', 'water_reminder'
  ));
