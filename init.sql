-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: refx
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `achievements`
--

--
-- Table structure for table `achievements2`
--

DROP TABLE IF EXISTS `achievements2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `achievements2` (
  `id` int NOT NULL,
  `file` varchar(128) NOT NULL,
  `name` varchar(128) NOT NULL,
  `desc` varchar(256) NOT NULL,
  `cond` json NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `file` (`file`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `channels`
--

DROP TABLE IF EXISTS `channels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `channels` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(32) NOT NULL,
  `topic` varchar(256) NOT NULL,
  `read_priv` int NOT NULL DEFAULT '1',
  `write_priv` int NOT NULL DEFAULT '2',
  `auto_join` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `channels_name_uindex` (`name`),
  KEY `channels_auto_join_index` (`auto_join`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `clan_invites`
--

DROP TABLE IF EXISTS `clan_invites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clan_invites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `clan_id` int NOT NULL,
  `user_id` int NOT NULL,
  `status` enum('pending','accepted','rejected','request_pending') NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `clans`
--

DROP TABLE IF EXISTS `clans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(16) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `tag` varchar(6) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `owner` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clans_name_uindex` (`name`),
  UNIQUE KEY `clans_owner_uindex` (`owner`),
  UNIQUE KEY `clans_tag_uindex` (`tag`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `client_errors`
--

DROP TABLE IF EXISTS `client_errors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `client_errors` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL DEFAULT '0',
  `username` varchar(64) NOT NULL DEFAULT 'Offline user',
  `feedback` text,
  `exception` varchar(512) DEFAULT NULL,
  `stacktrace` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=391 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `client_hashes`
--

DROP TABLE IF EXISTS `client_hashes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `client_hashes` (
  `userid` int NOT NULL,
  `osupath` char(32) NOT NULL,
  `adapters` char(32) NOT NULL,
  `uninstall_id` char(32) NOT NULL,
  `disk_serial` char(32) NOT NULL,
  `latest_time` datetime NOT NULL,
  `occurrences` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`userid`,`osupath`,`adapters`,`uninstall_id`,`disk_serial`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `target_id` int NOT NULL COMMENT 'replay, map, or set id',
  `target_type` enum('replay','map','song') NOT NULL,
  `userid` int NOT NULL,
  `time` int NOT NULL,
  `comment` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `colour` char(6) DEFAULT NULL COMMENT 'rgb hex string',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `favourites`
--

DROP TABLE IF EXISTS `favourites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favourites` (
  `userid` int NOT NULL,
  `setid` int NOT NULL,
  `created_at` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`userid`,`setid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ingame_logins`
--

DROP TABLE IF EXISTS `ingame_logins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ingame_logins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userid` int NOT NULL,
  `ip` varchar(45) NOT NULL COMMENT 'maxlen for ipv6',
  `osu_ver` date DEFAULT NULL,
  `osu_stream` varchar(11) DEFAULT NULL,
  `datetime` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4278 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lazer_scores`
--

DROP TABLE IF EXISTS `lazer_scores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lazer_scores` (
  `score_id` bigint NOT NULL,
  `has_replay` tinyint(1) NOT NULL DEFAULT '0',
  `started_at` datetime NOT NULL,
  `ended_at` datetime NOT NULL,
  `build_id` bigint NOT NULL,
  `is_legacy_score` tinyint(1) NOT NULL,
  `statistics_json` json NOT NULL,
  `mods_json` json NOT NULL,
  PRIMARY KEY (`score_id`),
  KEY `lazer_scores_score_id_index` (`score_id`),
  KEY `lazer_scores_build_id_index` (`build_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `logs`
--

DROP TABLE IF EXISTS `logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `from` int NOT NULL COMMENT 'both from and to are playerids',
  `to` int NOT NULL,
  `action` varchar(32) NOT NULL,
  `msg` varchar(2048) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `time` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mail`
--

DROP TABLE IF EXISTS `mail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mail` (
  `id` int NOT NULL AUTO_INCREMENT,
  `from_id` int NOT NULL,
  `to_id` int NOT NULL,
  `msg` varchar(2048) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `time` int DEFAULT NULL,
  `read` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1420 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `map_requests`
--

DROP TABLE IF EXISTS `map_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `map_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `map_id` int NOT NULL,
  `player_id` int NOT NULL,
  `datetime` datetime NOT NULL,
  `active` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `maps`
--

DROP TABLE IF EXISTS `maps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `maps` (
  `server` enum('osu!','private') NOT NULL DEFAULT 'osu!',
  `id` int NOT NULL,
  `set_id` int NOT NULL,
  `status` int NOT NULL,
  `md5` char(32) NOT NULL,
  `artist` varchar(128) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `title` varchar(128) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `version` varchar(128) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `creator` varchar(19) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `filename` varchar(256) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `last_update` datetime NOT NULL,
  `total_length` int NOT NULL,
  `max_combo` int NOT NULL,
  `frozen` tinyint(1) NOT NULL DEFAULT '0',
  `plays` int NOT NULL DEFAULT '0',
  `passes` int NOT NULL DEFAULT '0',
  `mode` tinyint(1) NOT NULL DEFAULT '0',
  `bpm` float(12,2) NOT NULL DEFAULT '0.00',
  `cs` float(4,2) NOT NULL DEFAULT '0.00',
  `ar` float(4,2) NOT NULL DEFAULT '0.00',
  `od` float(4,2) NOT NULL DEFAULT '0.00',
  `hp` float(4,2) NOT NULL DEFAULT '0.00',
  `diff` float(6,3) NOT NULL DEFAULT '0.000',
  PRIMARY KEY (`server`,`id`),
  UNIQUE KEY `maps_id_uindex` (`id`),
  UNIQUE KEY `maps_md5_uindex` (`md5`),
  KEY `maps_set_id_index` (`set_id`),
  KEY `maps_status_index` (`status`),
  KEY `maps_filename_index` (`filename`),
  KEY `maps_plays_index` (`plays`),
  KEY `maps_mode_index` (`mode`),
  KEY `maps_frozen_index` (`frozen`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mapsets`
--

DROP TABLE IF EXISTS `mapsets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mapsets` (
  `server` enum('osu!','private') NOT NULL DEFAULT 'osu!',
  `id` int NOT NULL,
  `last_osuapi_check` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`server`,`id`),
  UNIQUE KEY `nmapsets_id_uindex` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `multiplayer_playlist_items`
--

DROP TABLE IF EXISTS `multiplayer_playlist_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `multiplayer_playlist_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `owner_id` int NOT NULL,
  `room_id` bigint NOT NULL,
  `beatmap_id` int NOT NULL,
  `ruleset_id` smallint NOT NULL,
  `playlist_order` smallint unsigned DEFAULT NULL,
  `allowed_mods` text,
  `required_mods` text,
  `freestyle` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `expired` tinyint(1) NOT NULL DEFAULT '0',
  `played_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_room_id` (`room_id`),
  KEY `idx_beatmap_id` (`beatmap_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `multiplayer_realtime_room_events`
--

DROP TABLE IF EXISTS `multiplayer_realtime_room_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `multiplayer_realtime_room_events` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `room_id` bigint unsigned NOT NULL,
  `event_type` varchar(64) NOT NULL,
  `playlist_item_id` bigint unsigned DEFAULT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `event_detail` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `room_id` (`room_id`),
  KEY `user_id` (`user_id`),
  KEY `playlist_item_id` (`playlist_item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `multiplayer_room`
--

DROP TABLE IF EXISTS `multiplayer_room`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `multiplayer_room` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `channel_id` int NOT NULL,
  `starts_at` datetime(6) NOT NULL,
  `ends_at` datetime(6) DEFAULT NULL,
  `max_attempts` tinyint unsigned NOT NULL,
  `participant_count` int NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `category` int NOT NULL,
  `status` int NOT NULL,
  `type` int NOT NULL,
  `queue_mode` int NOT NULL,
  `auto_start_duration` smallint unsigned NOT NULL,
  `auto_skip` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `multiplayer_rooms_high`
--

DROP TABLE IF EXISTS `multiplayer_rooms_high`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `multiplayer_rooms_high` (
  `room_id` bigint NOT NULL,
  `user_id` int NOT NULL,
  `in_room` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`room_id`,`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `multiplayer_score_links`
--

DROP TABLE IF EXISTS `multiplayer_score_links`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `multiplayer_score_links` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `score_id` bigint unsigned NOT NULL,
  `playlist_item_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_score_id` (`score_id`),
  KEY `idx_playlist_item_id` (`playlist_item_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `oauth_tokens`
--

DROP TABLE IF EXISTS `oauth_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `oauth_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `access_token` varchar(1024) NOT NULL,
  `refresh_token` varchar(512) NOT NULL,
  `expires_in` int NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `refresh_token` (`refresh_token`)
) ENGINE=InnoDB AUTO_INCREMENT=261 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `performance_reports`
--

DROP TABLE IF EXISTS `performance_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `performance_reports` (
  `scoreid` bigint unsigned NOT NULL,
  `mod_mode` enum('vanilla','relax','autopilot') NOT NULL DEFAULT 'vanilla',
  `os` varchar(64) NOT NULL,
  `fullscreen` tinyint(1) NOT NULL,
  `fps_cap` varchar(16) NOT NULL,
  `compatibility` tinyint(1) NOT NULL,
  `version` varchar(16) NOT NULL,
  `start_time` int NOT NULL,
  `end_time` int NOT NULL,
  `frame_count` int NOT NULL,
  `spike_frames` int NOT NULL,
  `aim_rate` int NOT NULL,
  `completion` tinyint(1) NOT NULL,
  `identifier` varchar(128) DEFAULT NULL COMMENT 'really don''t know much about this yet',
  `average_frametime` int NOT NULL,
  PRIMARY KEY (`scoreid`,`mod_mode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `player_badges`
--

DROP TABLE IF EXISTS `player_badges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `player_badges` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userid` int NOT NULL,
  `badge_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_badge` (`userid`,`badge_id`),
  KEY `idx_userid` (`userid`),
  KEY `idx_badge_id` (`badge_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `profile_comments`
--

DROP TABLE IF EXISTS `profile_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profile_comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `from_id` int NOT NULL,
  `comment` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_from_id` (`from_id`),
  CONSTRAINT `profile_comments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `profile_comments_ibfk_2` FOREIGN KEY (`from_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ratings`
--

DROP TABLE IF EXISTS `ratings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ratings` (
  `userid` int NOT NULL,
  `map_md5` char(32) NOT NULL,
  `rating` tinyint NOT NULL,
  PRIMARY KEY (`userid`,`map_md5`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `relationships`
--

DROP TABLE IF EXISTS `relationships`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `relationships` (
  `user1` int NOT NULL,
  `user2` int NOT NULL,
  `type` enum('friend','block') NOT NULL,
  PRIMARY KEY (`user1`,`user2`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `score_tokens`
--

DROP TABLE IF EXISTS `score_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `score_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `beatmap_id` int NOT NULL,
  `ruleset_id` int NOT NULL,
  `score_id` bigint unsigned DEFAULT NULL,
  `verification_key` varchar(64) NOT NULL,
  `created_at` datetime NOT NULL,
  `expires_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `score_tokens_user_id_index` (`user_id`),
  KEY `score_tokens_beatmap_id_index` (`beatmap_id`),
  KEY `score_tokens_ruleset_id_index` (`ruleset_id`),
  KEY `idx_score_id` (`score_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1526 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `scores`
--

DROP TABLE IF EXISTS `scores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scores` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `map_md5` char(32) NOT NULL,
  `map_status` tinyint NOT NULL DEFAULT '0',
  `score` int NOT NULL,
  `xp_gained` float(10,3) DEFAULT NULL,
  `pp` float(10,3) NOT NULL,
  `acc` float(6,3) NOT NULL,
  `max_combo` int NOT NULL,
  `mods` int NOT NULL,
  `n300` int NOT NULL,
  `n100` int NOT NULL,
  `n50` int NOT NULL,
  `nmiss` int NOT NULL,
  `ngeki` int NOT NULL,
  `nkatu` int NOT NULL,
  `grade` varchar(10) DEFAULT NULL,
  `status` tinyint NOT NULL,
  `mode` tinyint NOT NULL,
  `play_time` datetime NOT NULL,
  `time_elapsed` int NOT NULL,
  `client_flags` int NOT NULL,
  `userid` int NOT NULL,
  `perfect` tinyint(1) NOT NULL,
  `online_checksum` char(32) NOT NULL,
  `aim_assist_type` tinyint NOT NULL DEFAULT '0',
  `maple_values` json DEFAULT NULL,
  `aim_value` int NOT NULL,
  `ar_value` float(4,2) NOT NULL,
  `aim` tinyint(1) NOT NULL,
  `arc` tinyint(1) NOT NULL,
  `cs` tinyint(1) NOT NULL,
  `tw` tinyint(1) NOT NULL,
  `twval` float(6,2) DEFAULT NULL,
  `hdr` tinyint(1) NOT NULL,
  `pinned` tinyint(1) NOT NULL,
  `clock_rate` double DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_scores_map_mode_status_pp` (`map_md5`,`mode`,`status`,`pp` DESC),
  KEY `idx_scores_user_map_mode_status` (`userid`,`map_md5`,`mode`,`status`),
  KEY `tmp_idx_checksum` (`online_checksum`),
  KEY `idx_scores_checksum` (`online_checksum`)
) ENGINE=InnoDB AUTO_INCREMENT=42348 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `scores_flag`
--

DROP TABLE IF EXISTS `scores_flag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scores_flag` (
  `user_id` int NOT NULL,
  `score_id` bigint NOT NULL,
  `kind` varchar(255) NOT NULL,
  `reason` varchar(128) NOT NULL,
  `det` json DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`score_id`,`kind`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `cond` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `settings_name_uindex` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `startups`
--

DROP TABLE IF EXISTS `startups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `startups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ver_major` tinyint NOT NULL,
  `ver_minor` tinyint NOT NULL,
  `ver_micro` tinyint NOT NULL,
  `datetime` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `stats`
--

DROP TABLE IF EXISTS `stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mode` tinyint(1) NOT NULL,
  `tscore` bigint unsigned NOT NULL DEFAULT '0',
  `rscore` bigint unsigned NOT NULL DEFAULT '0',
  `pp` int unsigned NOT NULL DEFAULT '0',
  `plays` int unsigned NOT NULL DEFAULT '0',
  `playtime` int unsigned NOT NULL DEFAULT '0',
  `acc` float(6,3) NOT NULL DEFAULT '0.000',
  `max_combo` int unsigned NOT NULL DEFAULT '0',
  `total_hits` int unsigned NOT NULL DEFAULT '0',
  `replay_views` int unsigned NOT NULL DEFAULT '0',
  `xh_count` int unsigned NOT NULL DEFAULT '0',
  `x_count` int unsigned NOT NULL DEFAULT '0',
  `sh_count` int unsigned NOT NULL DEFAULT '0',
  `s_count` int unsigned NOT NULL DEFAULT '0',
  `a_count` int unsigned NOT NULL DEFAULT '0',
  `xp` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`,`mode`),
  KEY `stats_mode_index` (`mode`),
  KEY `stats_pp_index` (`pp`),
  KEY `stats_tscore_index` (`tscore`),
  KEY `stats_rscore_index` (`rscore`)
) ENGINE=InnoDB AUTO_INCREMENT=185 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tourney_pool_maps`
--

DROP TABLE IF EXISTS `tourney_pool_maps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tourney_pool_maps` (
  `map_id` int NOT NULL,
  `pool_id` int NOT NULL,
  `mods` int NOT NULL,
  `slot` tinyint NOT NULL,
  PRIMARY KEY (`map_id`,`pool_id`),
  KEY `tourney_pool_maps_mods_slot_index` (`mods`,`slot`),
  KEY `tourney_pool_maps_tourney_pools_id_fk` (`pool_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tourney_pools`
--

DROP TABLE IF EXISTS `tourney_pools`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tourney_pools` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(16) NOT NULL,
  `created_at` datetime NOT NULL,
  `created_by` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `tourney_pools_users_id_fk` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_achievements`
--

DROP TABLE IF EXISTS `user_achievements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_achievements` (
  `userid` int NOT NULL,
  `achid` int NOT NULL,
  PRIMARY KEY (`userid`,`achid`),
  KEY `user_achievements_achid_index` (`achid`),
  KEY `user_achievements_userid_index` (`userid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_profile_history`
--

DROP TABLE IF EXISTS `user_profile_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_profile_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `mode` tinyint NOT NULL,
  `pp` int NOT NULL DEFAULT '0',
  `rank` int NOT NULL DEFAULT '0',
  `country_rank` int NOT NULL DEFAULT '0',
  `captured_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id_mode` (`user_id`,`mode`),
  KEY `idx_captured_at` (`captured_at`),
  CONSTRAINT `user_profile_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21725 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `username_log`
--

DROP TABLE IF EXISTS `username_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `username_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `old_username` varchar(32) NOT NULL,
  `time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_old_username` (`old_username`)
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(32) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `safe_name` varchar(32) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `priv` int NOT NULL DEFAULT '1',
  `pw_bcrypt` char(60) NOT NULL,
  `country` char(2) NOT NULL DEFAULT 'xx',
  `silence_end` int NOT NULL DEFAULT '0',
  `donor_end` int NOT NULL DEFAULT '0',
  `creation_time` int NOT NULL DEFAULT '0',
  `latest_activity` int NOT NULL DEFAULT '0',
  `clan_id` int NOT NULL DEFAULT '0',
  `clan_priv` tinyint(1) NOT NULL DEFAULT '0',
  `preferred_mode` int NOT NULL DEFAULT '0',
  `play_style` int NOT NULL DEFAULT '0',
  `custom_badge_name` varchar(16) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `custom_badge_icon` varchar(64) DEFAULT NULL,
  `userpage_content` varchar(2048) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `api_key` char(36) DEFAULT NULL,
  `whitelist` int NOT NULL DEFAULT '0',
  `last_namechange` bigint NOT NULL DEFAULT '0',
  `preferred_metric` enum('pp','score') NOT NULL DEFAULT 'pp',
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_name_uindex` (`name`),
  UNIQUE KEY `users_safe_name_uindex` (`safe_name`),
  UNIQUE KEY `users_api_key_uindex` (`api_key`),
  KEY `users_priv_index` (`priv`),
  KEY `users_clan_id_index` (`clan_id`),
  KEY `users_clan_priv_index` (`clan_priv`),
  KEY `users_country_index` (`country`)
) ENGINE=InnoDB AUTO_INCREMENT=185 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `achievements`
--

DROP TABLE IF EXISTS `achievements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `achievements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `file` varchar(128) NOT NULL,
  `name` varchar(128) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `desc` varchar(256) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `cond` varchar(64) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `achievements_desc_uindex` (`desc`),
  UNIQUE KEY `achievements_file_uindex` (`file`),
  UNIQUE KEY `achievements_name_uindex` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=84 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

insert into users (id, name, safe_name, priv, country, silence_end, email, pw_bcrypt, creation_time, latest_activity)
values (1, 'BanchoBot', 'banchobot', 1, 'ca', 0, 'bot@akatsuki.pw',
        '_______________________my_cool_bcrypt_______________________', UNIX_TIMESTAMP(), UNIX_TIMESTAMP());

INSERT INTO stats (id, mode) VALUES (1, 0); # vn!std
INSERT INTO stats (id, mode) VALUES (1, 1); # vn!taiko
INSERT INTO stats (id, mode) VALUES (1, 2); # vn!catch
INSERT INTO stats (id, mode) VALUES (1, 3); # vn!mania
INSERT INTO stats (id, mode) VALUES (1, 4); # rx!std
INSERT INTO stats (id, mode) VALUES (1, 5); # rx!taiko
INSERT INTO stats (id, mode) VALUES (1, 6); # rx!catch
INSERT INTO stats (id, mode) VALUES (1, 8); # ap!std


# userid 2 is reserved for ppy in osu!, and the
# client will not allow users to pm this id.
# If you want this, simply remove these two lines.
alter table users auto_increment = 3;
alter table stats auto_increment = 3;

insert into channels (name, topic, read_priv, write_priv, auto_join)
values ('#osu', 'General discussion.', 1, 2, true),
	   ('#announce', 'Exemplary performance and public announcements.', 1, 24576, true),
	   ('#lobby', 'Multiplayer lobby discussion room.', 1, 2, false),
	   ('#supporter', 'General discussion for supporters.', 48, 48, false),
	   ('#staff', 'General discussion for staff members.', 28672, 28672, true),
	   ('#admin', 'General discussion for administrators.', 24576, 24576, true),
	   ('#dev', 'General discussion for developers.', 16384, 16384, true);

---
--- Use forlorn/migrations/achievements
---

insert into achievements (id, file, name, `desc`, cond) values (1, 'osu-skill-pass-1', 'Rising Star', 'Can''t go forward without the first steps.', '(score.mods & 1 == 0) and 1 <= score.sr < 2 and mode_vn == 0');
insert into achievements (id, file, name, `desc`, cond) values (2, 'osu-skill-pass-2', 'Constellation Prize', 'Definitely not a consolation prize. Now things start getting hard!', '(score.mods & 1 == 0) and 2 <= score.sr < 3 and mode_vn == 0');
insert into achievements (id, file, name, `desc`, cond) values (3, 'osu-skill-pass-3', 'Building Confidence', 'Oh, you''ve SO got this.', '(score.mods & 1 == 0) and 3 <= score.sr < 4 and mode_vn == 0');
insert into achievements (id, file, name, `desc`, cond) values (4, 'osu-skill-pass-4', 'Insanity Approaches', 'You''re not twitching, you''re just ready.', '(score.mods & 1 == 0) and 4 <= score.sr < 5 and mode_vn == 0');
insert into achievements (id, file, name, `desc`, cond) values (5, 'osu-skill-pass-5', 'These Clarion Skies', 'Everything seems so clear now.', '(score.mods & 1 == 0) and 5 <= score.sr < 6 and mode_vn == 0');
insert into achievements (id, file, name, `desc`, cond) values (6, 'osu-skill-pass-6', 'Above and Beyond', 'A cut above the rest.', '(score.mods & 1 == 0) and 6 <= score.sr < 7 and mode_vn == 0');
insert into achievements (id, file, name, `desc`, cond) values (7, 'osu-skill-pass-7', 'Supremacy', 'All marvel before your prowess.', '(score.mods & 1 == 0) and 7 <= score.sr < 8 and mode_vn == 0');
insert into achievements (id, file, name, `desc`, cond) values (8, 'osu-skill-pass-8', 'Absolution', 'My god, you''re full of stars!', '(score.mods & 1 == 0) and 8 <= score.sr < 9 and mode_vn == 0');
insert into achievements (id, file, name, `desc`, cond) values (9, 'osu-skill-pass-9', 'Event Horizon', 'No force dares to pull you under.', '(score.mods & 1 == 0) and 9 <= score.sr < 10 and mode_vn == 0');
insert into achievements (id, file, name, `desc`, cond) values (10, 'osu-skill-pass-10', 'Phantasm', 'Fevered is your passion, extraordinary is your skill.', '(score.mods & 1 == 0) and 10 <= score.sr < 11 and mode_vn == 0');
insert into achievements (id, file, name, `desc`, cond) values (11, 'osu-skill-fc-1', 'Totality', 'All the notes. Every single one.', 'score.perfect and 1 <= score.sr < 2 and mode_vn == 0');
insert into achievements (id, file, name, `desc`, cond) values (12, 'osu-skill-fc-2', 'Business As Usual', 'Two to go, please.', 'score.perfect and 2 <= score.sr < 3 and mode_vn == 0');
insert into achievements (id, file, name, `desc`, cond) values (13, 'osu-skill-fc-3', 'Building Steam', 'Hey, this isn''t so bad.', 'score.perfect and 3 <= score.sr < 4 and mode_vn == 0');
insert into achievements (id, file, name, `desc`, cond) values (14, 'osu-skill-fc-4', 'Moving Forward', 'Bet you feel good about that.', 'score.perfect and 4 <= score.sr < 5 and mode_vn == 0');
insert into achievements (id, file, name, `desc`, cond) values (15, 'osu-skill-fc-5', 'Paradigm Shift', 'Surprisingly difficult.', 'score.perfect and 5 <= score.sr < 6 and mode_vn == 0');
insert into achievements (id, file, name, `desc`, cond) values (16, 'osu-skill-fc-6', 'Anguish Quelled', 'Don''t choke.', 'score.perfect and 6 <= score.sr < 7 and mode_vn == 0');
insert into achievements (id, file, name, `desc`, cond) values (17, 'osu-skill-fc-7', 'Never Give Up', 'Excellence is its own reward.', 'score.perfect and 7 <= score.sr < 8 and mode_vn == 0');
insert into achievements (id, file, name, `desc`, cond) values (18, 'osu-skill-fc-8', 'Aberration', 'They said it couldn''t be done. They were wrong.', 'score.perfect and 8 <= score.sr < 9 and mode_vn == 0');
insert into achievements (id, file, name, `desc`, cond) values (19, 'osu-skill-fc-9', 'Chosen', 'Reign among the Prometheans, where you belong.', 'score.perfect and 9 <= score.sr < 10 and mode_vn == 0');
insert into achievements (id, file, name, `desc`, cond) values (20, 'osu-skill-fc-10', 'Unfathomable', 'You have no equal.', 'score.perfect and 10 <= score.sr < 11 and mode_vn == 0');
insert into achievements (id, file, name, `desc`, cond) values (21, 'osu-combo-500', '500 Combo', '500 big ones! You''re moving up in the world!', '500 <= score.max_combo < 750 and mode_vn == 0');
insert into achievements (id, file, name, `desc`, cond) values (22, 'osu-combo-750', '750 Combo', '750 notes back to back? Woah.', '750 <= score.max_combo < 1000 and mode_vn == 0');
insert into achievements (id, file, name, `desc`, cond) values (23, 'osu-combo-1000', '1000 Combo', 'A thousand reasons why you rock at this game.', '1000 <= score.max_combo < 2000 and mode_vn == 0');
insert into achievements (id, file, name, `desc`, cond) values (24, 'osu-combo-2000', '2000 Combo', 'Nothing can stop you now.', '2000 <= score.max_combo and mode_vn == 0');
insert into achievements (id, file, name, `desc`, cond) values (25, 'taiko-skill-pass-1', 'My First Don', 'Marching to the beat of your own drum. Literally.', '(score.mods & 1 == 0) and 1 <= score.sr < 2 and mode_vn == 1');
insert into achievements (id, file, name, `desc`, cond) values (26, 'taiko-skill-pass-2', 'Katsu Katsu Katsu', 'Hora! Izuko!', '(score.mods & 1 == 0) and 2 <= score.sr < 3 and mode_vn == 1');
insert into achievements (id, file, name, `desc`, cond) values (27, 'taiko-skill-pass-3', 'Not Even Trying', 'Muzukashii? Not even.', '(score.mods & 1 == 0) and 3 <= score.sr < 4 and mode_vn == 1');
insert into achievements (id, file, name, `desc`, cond) values (28, 'taiko-skill-pass-4', 'Face Your Demons', 'The first trials are now behind you, but are you a match for the Oni?', '(score.mods & 1 == 0) and 4 <= score.sr < 5 and mode_vn == 1');
insert into achievements (id, file, name, `desc`, cond) values (29, 'taiko-skill-pass-5', 'The Demon Within', 'No rest for the wicked.', '(score.mods & 1 == 0) and 5 <= score.sr < 6 and mode_vn == 1');
insert into achievements (id, file, name, `desc`, cond) values (30, 'taiko-skill-pass-6', 'Drumbreaker', 'Too strong.', '(score.mods & 1 == 0) and 6 <= score.sr < 7 and mode_vn == 1');
insert into achievements (id, file, name, `desc`, cond) values (31, 'taiko-skill-pass-7', 'The Godfather', 'You are the Don of Dons.', '(score.mods & 1 == 0) and 7 <= score.sr < 8 and mode_vn == 1');
insert into achievements (id, file, name, `desc`, cond) values (32, 'taiko-skill-pass-8', 'Rhythm Incarnate', 'Feel the beat. Become the beat.', '(score.mods & 1 == 0) and 8 <= score.sr < 9 and mode_vn == 1');
insert into achievements (id, file, name, `desc`, cond) values (33, 'taiko-skill-fc-1', 'Keeping Time', 'Don, then katsu. Don, then katsu..', 'score.perfect and 1 <= score.sr < 2 and mode_vn == 1');
insert into achievements (id, file, name, `desc`, cond) values (34, 'taiko-skill-fc-2', 'To Your Own Beat', 'Straight and steady.', 'score.perfect and 2 <= score.sr < 3 and mode_vn == 1');
insert into achievements (id, file, name, `desc`, cond) values (35, 'taiko-skill-fc-3', 'Big Drums', 'Bigger scores to match.', 'score.perfect and 3 <= score.sr < 4 and mode_vn == 1');
insert into achievements (id, file, name, `desc`, cond) values (36, 'taiko-skill-fc-4', 'Adversity Overcome', 'Difficult? Not for you.', 'score.perfect and 4 <= score.sr < 5 and mode_vn == 1');
insert into achievements (id, file, name, `desc`, cond) values (37, 'taiko-skill-fc-5', 'Demonslayer', 'An Oni felled forevermore.', 'score.perfect and 5 <= score.sr < 6 and mode_vn == 1');
insert into achievements (id, file, name, `desc`, cond) values (38, 'taiko-skill-fc-6', 'Rhythm''s Call', 'Heralding true skill.', 'score.perfect and 6 <= score.sr < 7 and mode_vn == 1');
insert into achievements (id, file, name, `desc`, cond) values (39, 'taiko-skill-fc-7', 'Time Everlasting', 'Not a single beat escapes you.', 'score.perfect and 7 <= score.sr < 8 and mode_vn == 1');
insert into achievements (id, file, name, `desc`, cond) values (40, 'taiko-skill-fc-8', 'The Drummer''s Throne', 'Percussive brilliance befitting royalty alone.', 'score.perfect and 8 <= score.sr < 9 and mode_vn == 1');
insert into achievements (id, file, name, `desc`, cond) values (41, 'fruits-skill-pass-1', 'A Slice Of Life', 'Hey, this fruit catching business isn''t bad.', '(score.mods & 1 == 0) and 1 <= score.sr < 2 and mode_vn == 2');
insert into achievements (id, file, name, `desc`, cond) values (42, 'fruits-skill-pass-2', 'Dashing Ever Forward', 'Fast is how you do it.', '(score.mods & 1 == 0) and 2 <= score.sr < 3 and mode_vn == 2');
insert into achievements (id, file, name, `desc`, cond) values (43, 'fruits-skill-pass-3', 'Zesty Disposition', 'No scurvy for you, not with that much fruit.', '(score.mods & 1 == 0) and 3 <= score.sr < 4 and mode_vn == 2');
insert into achievements (id, file, name, `desc`, cond) values (44, 'fruits-skill-pass-4', 'Hyperdash ON!', 'Time and distance is no obstacle to you.', '(score.mods & 1 == 0) and 4 <= score.sr < 5 and mode_vn == 2');
insert into achievements (id, file, name, `desc`, cond) values (45, 'fruits-skill-pass-5', 'It''s Raining Fruit', 'And you can catch them all.', '(score.mods & 1 == 0) and 5 <= score.sr < 6 and mode_vn == 2');
insert into achievements (id, file, name, `desc`, cond) values (46, 'fruits-skill-pass-6', 'Fruit Ninja', 'Legendary techniques.', '(score.mods & 1 == 0) and 6 <= score.sr < 7 and mode_vn == 2');
insert into achievements (id, file, name, `desc`, cond) values (47, 'fruits-skill-pass-7', 'Dreamcatcher', 'No fruit, only dreams now.', '(score.mods & 1 == 0) and 7 <= score.sr < 8 and mode_vn == 2');
insert into achievements (id, file, name, `desc`, cond) values (48, 'fruits-skill-pass-8', 'Lord of the Catch', 'Your kingdom kneels before you.', '(score.mods & 1 == 0) and 8 <= score.sr < 9 and mode_vn == 2');
insert into achievements (id, file, name, `desc`, cond) values (49, 'fruits-skill-fc-1', 'Sweet And Sour', 'Apples and oranges, literally.', 'score.perfect and 1 <= score.sr < 2 and mode_vn == 2');
insert into achievements (id, file, name, `desc`, cond) values (50, 'fruits-skill-fc-2', 'Reaching The Core', 'The seeds of future success.', 'score.perfect and 2 <= score.sr < 3 and mode_vn == 2');
insert into achievements (id, file, name, `desc`, cond) values (51, 'fruits-skill-fc-3', 'Clean Platter', 'Clean only of failure. It is completely full, otherwise.', 'score.perfect and 3 <= score.sr < 4 and mode_vn == 2');
insert into achievements (id, file, name, `desc`, cond) values (52, 'fruits-skill-fc-4', 'Between The Rain', 'No umbrella needed.', 'score.perfect and 4 <= score.sr < 5 and mode_vn == 2');
insert into achievements (id, file, name, `desc`, cond) values (53, 'fruits-skill-fc-5', 'Addicted', 'That was an overdose?', 'score.perfect and 5 <= score.sr < 6 and mode_vn == 2');
insert into achievements (id, file, name, `desc`, cond) values (54, 'fruits-skill-fc-6', 'Quickening', 'A dash above normal limits.', 'score.perfect and 6 <= score.sr < 7 and mode_vn == 2');
insert into achievements (id, file, name, `desc`, cond) values (55, 'fruits-skill-fc-7', 'Supersonic', 'Faster than is reasonably necessary.', 'score.perfect and 7 <= score.sr < 8 and mode_vn == 2');
insert into achievements (id, file, name, `desc`, cond) values (56, 'fruits-skill-fc-8', 'Dashing Scarlet', 'Speed beyond mortal reckoning.', 'score.perfect and 8 <= score.sr < 9 and mode_vn == 2');
insert into achievements (id, file, name, `desc`, cond) values (57, 'mania-skill-pass-1', 'First Steps', 'It isn''t 9-to-5, but 1-to-9. Keys, that is.', '(score.mods & 1 == 0) and 1 <= score.sr < 2 and mode_vn == 3');
insert into achievements (id, file, name, `desc`, cond) values (58, 'mania-skill-pass-2', 'No Normal Player', 'Not anymore, at least.', '(score.mods & 1 == 0) and 2 <= score.sr < 3 and mode_vn == 3');
insert into achievements (id, file, name, `desc`, cond) values (59, 'mania-skill-pass-3', 'Impulse Drive', 'Not quite hyperspeed, but getting close.', '(score.mods & 1 == 0) and 3 <= score.sr < 4 and mode_vn == 3');
insert into achievements (id, file, name, `desc`, cond) values (60, 'mania-skill-pass-4', 'Hyperspeed', 'Woah.', '(score.mods & 1 == 0) and 4 <= score.sr < 5 and mode_vn == 3');
insert into achievements (id, file, name, `desc`, cond) values (61, 'mania-skill-pass-5', 'Ever Onwards', 'Another challenge is just around the corner.', '(score.mods & 1 == 0) and 5 <= score.sr < 6 and mode_vn == 3');
insert into achievements (id, file, name, `desc`, cond) values (62, 'mania-skill-pass-6', 'Another Surpassed', 'Is there no limit to your skills?', '(score.mods & 1 == 0) and 6 <= score.sr < 7 and mode_vn == 3');
insert into achievements (id, file, name, `desc`, cond) values (63, 'mania-skill-pass-7', 'Extra Credit', 'See me after class.', '(score.mods & 1 == 0) and 7 <= score.sr < 8 and mode_vn == 3');
insert into achievements (id, file, name, `desc`, cond) values (64, 'mania-skill-pass-8', 'Maniac', 'There''s just no stopping you.', '(score.mods & 1 == 0) and 8 <= score.sr < 9 and mode_vn == 3');
insert into achievements (id, file, name, `desc`, cond) values (65, 'mania-skill-fc-1', 'Keystruck', 'The beginning of a new story', 'score.perfect and 1 <= score.sr < 2 and mode_vn == 3');
insert into achievements (id, file, name, `desc`, cond) values (66, 'mania-skill-fc-2', 'Keying In', 'Finding your groove.', 'score.perfect and 2 <= score.sr < 3 and mode_vn == 3');
insert into achievements (id, file, name, `desc`, cond) values (67, 'mania-skill-fc-3', 'Hyperflow', 'You can *feel* the rhythm.', 'score.perfect and 3 <= score.sr < 4 and mode_vn == 3');
insert into achievements (id, file, name, `desc`, cond) values (68, 'mania-skill-fc-4', 'Breakthrough', 'Many skills mastered, rolled into one.', 'score.perfect and 4 <= score.sr < 5 and mode_vn == 3');
insert into achievements (id, file, name, `desc`, cond) values (69, 'mania-skill-fc-5', 'Everything Extra', 'Giving your all is giving everything you have.', 'score.perfect and 5 <= score.sr < 6 and mode_vn == 3');
insert into achievements (id, file, name, `desc`, cond) values (70, 'mania-skill-fc-6', 'Level Breaker', 'Finesse beyond reason', 'score.perfect and 6 <= score.sr < 7 and mode_vn == 3');
insert into achievements (id, file, name, `desc`, cond) values (71, 'mania-skill-fc-7', 'Step Up', 'A precipice rarely seen.', 'score.perfect and 7 <= score.sr < 8 and mode_vn == 3');
insert into achievements (id, file, name, `desc`, cond) values (72, 'mania-skill-fc-8', 'Behind The Veil', 'Supernatural!', 'score.perfect and 8 <= score.sr < 9 and mode_vn == 3');
insert into achievements (id, file, name, `desc`, cond) values (73, 'all-intro-suddendeath', 'Finality', 'High stakes, no regrets.', 'score.mods == 32');
insert into achievements (id, file, name, `desc`, cond) values (74, 'all-intro-hidden', 'Blindsight', 'I can see just perfectly', 'score.mods & 8');
insert into achievements (id, file, name, `desc`, cond) values (75, 'all-intro-perfect', 'Perfectionist', 'Accept nothing but the best.', 'score.mods & 16384');
insert into achievements (id, file, name, `desc`, cond) values (76, 'all-intro-hardrock', 'Rock Around The Clock', "You can\'t stop the rock.", 'score.mods & 16');
insert into achievements (id, file, name, `desc`, cond) values (77, 'all-intro-doubletime', 'Time And A Half', "Having a right ol\' time. One and a half of them, almost.", 'score.mods & 64');
insert into achievements (id, file, name, `desc`, cond) values (78, 'all-intro-flashlight', 'Are You Afraid Of The Dark?', "Harder than it looks, probably because it\'s hard to look.", 'score.mods & 1024');
insert into achievements (id, file, name, `desc`, cond) values (79, 'all-intro-easy', 'Dial It Right Back', 'Sometimes you just want to take it easy.', 'score.mods & 2');
insert into achievements (id, file, name, `desc`, cond) values (80, 'all-intro-nofail', 'Risk Averse', 'Safety nets are fun!', 'score.mods & 1');
insert into achievements (id, file, name, `desc`, cond) values (81, 'all-intro-nightcore', 'Sweet Rave Party', 'Founded in the fine tradition of changing things that were just fine as they were.', 'score.mods & 512');
insert into achievements (id, file, name, `desc`, cond) values (82, 'all-intro-halftime', 'Slowboat', 'You got there. Eventually.', 'score.mods & 256');
insert into achievements (id, file, name, `desc`, cond) values (83, 'all-intro-spunout', 'Burned Out', 'One cannot always spin to win.', 'score.mods & 4096');
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-21 17:31:48
