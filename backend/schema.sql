-- PETORA Help — MySQL schema (Phase 2A).
-- Run once: mysql -u root -p < backend/schema.sql
-- (Admin dashboard in Phase 2B will read from this same `reports` table.)

CREATE DATABASE IF NOT EXISTS petora_help
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE petora_help;

CREATE TABLE IF NOT EXISTS reports (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  report_id        VARCHAR(30)  NOT NULL UNIQUE,
  animal_type      VARCHAR(60)  NOT NULL,
  animal_condition VARCHAR(60)  NOT NULL,
  location         VARCHAR(300) NOT NULL,
  description      VARCHAR(2000) NOT NULL DEFAULT '',
  contact_number   VARCHAR(15)  NOT NULL,
  priority         ENUM('Normal','Urgent') NOT NULL DEFAULT 'Normal',
  status           VARCHAR(40)  NOT NULL DEFAULT 'Report Received',
  media_url        VARCHAR(500) NOT NULL DEFAULT '',
  media_path       VARCHAR(500) NOT NULL DEFAULT '',
  media_type       VARCHAR(100) NOT NULL DEFAULT '',
  created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_report_id (report_id),
  INDEX idx_status_created (status, created_at)
) ENGINE=InnoDB;
