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

-- Organizations directory (Find NGO / Rescuer phase).
-- Rows are added ONLY with real verified organization details.
-- NEVER seed dummy/fake data here. Public reads see active rows only.
CREATE TABLE IF NOT EXISTS organizations (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name        VARCHAR(120) NOT NULL,
  type        ENUM('NGO','Rescuer') NOT NULL,
  location    VARCHAR(300) NOT NULL DEFAULT '',
  area        VARCHAR(120) NOT NULL DEFAULT '',
  description VARCHAR(1000) NOT NULL DEFAULT '',
  phone       VARCHAR(15)  NOT NULL DEFAULT '',
  instagram   VARCHAR(300) NOT NULL DEFAULT '',
  verified    TINYINT(1)   NOT NULL DEFAULT 0,
  active      TINYINT(1)   NOT NULL DEFAULT 1,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_org_active_verified (active, verified),
  INDEX idx_org_search (name, area, location)
) ENGINE=InnoDB;

-- Help requirements (Donate / Help phase).
-- Rows reference organizations.id and are added ONLY with real verified
-- NGO requirements. NEVER seed dummy/fake data here.
-- Public reads see non-Fulfilled requests from active orgs only.
CREATE TABLE IF NOT EXISTS help_requests (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  org_id      INT UNSIGNED NOT NULL,
  title       VARCHAR(150) NOT NULL,
  category    VARCHAR(40)  NOT NULL,
  description VARCHAR(1000) NOT NULL DEFAULT '',
  quantity    VARCHAR(100) NOT NULL DEFAULT '',
  status      ENUM('Needed','Partially Fulfilled','Fulfilled') NOT NULL DEFAULT 'Needed',
  location    VARCHAR(300) NOT NULL DEFAULT '',
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_hr_status (status),
  INDEX idx_hr_org (org_id),
  CONSTRAINT fk_hr_org FOREIGN KEY (org_id) REFERENCES organizations(id)
) ENGINE=InnoDB;
