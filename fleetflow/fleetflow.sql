-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: fleetflow
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `action` varchar(200) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `drivers`
--

DROP TABLE IF EXISTS `drivers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `drivers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `license_number` varchar(100) NOT NULL,
  `license_category` varchar(50) NOT NULL,
  `license_expiry_date` date NOT NULL,
  `status` enum('on_duty','off_duty','suspended','on_trip') DEFAULT 'off_duty',
  `safety_score` int DEFAULT '100',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `license_number` (`license_number`),
  CONSTRAINT `drivers_chk_1` CHECK ((`safety_score` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `drivers`
--

LOCK TABLES `drivers` WRITE;
/*!40000 ALTER TABLE `drivers` DISABLE KEYS */;
/*!40000 ALTER TABLE `drivers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fuel_logs`
--

DROP TABLE IF EXISTS `fuel_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fuel_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vehicle_id` int NOT NULL,
  `trip_id` int DEFAULT NULL,
  `liters` decimal(10,2) NOT NULL,
  `cost` decimal(12,2) NOT NULL,
  `fuel_date` date DEFAULT (curdate()),
  PRIMARY KEY (`id`),
  KEY `trip_id` (`trip_id`),
  KEY `idx_fuel_vehicle` (`vehicle_id`),
  CONSTRAINT `fuel_logs_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fuel_logs_ibfk_2` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fuel_logs_chk_1` CHECK ((`liters` > 0)),
  CONSTRAINT `fuel_logs_chk_2` CHECK ((`cost` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fuel_logs`
--

LOCK TABLES `fuel_logs` WRITE;
/*!40000 ALTER TABLE `fuel_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `fuel_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `maintenance_logs`
--

DROP TABLE IF EXISTS `maintenance_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `maintenance_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vehicle_id` int NOT NULL,
  `service_type` varchar(100) NOT NULL,
  `description` text,
  `cost` decimal(12,2) DEFAULT '0.00',
  `service_date` date DEFAULT (curdate()),
  PRIMARY KEY (`id`),
  KEY `idx_maintenance_vehicle` (`vehicle_id`),
  CONSTRAINT `maintenance_logs_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `maintenance_logs_chk_1` CHECK ((`cost` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maintenance_logs`
--

LOCK TABLES `maintenance_logs` WRITE;
/*!40000 ALTER TABLE `maintenance_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `maintenance_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trips`
--

DROP TABLE IF EXISTS `trips`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trips` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vehicle_id` int NOT NULL,
  `driver_id` int NOT NULL,
  `cargo_weight` int NOT NULL,
  `origin` varchar(200) NOT NULL,
  `destination` varchar(200) NOT NULL,
  `start_odometer` int DEFAULT NULL,
  `end_odometer` int DEFAULT NULL,
  `status` enum('draft','dispatched','completed','cancelled') DEFAULT 'draft',
  `revenue` decimal(12,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_trips_vehicle` (`vehicle_id`),
  KEY `idx_trips_driver` (`driver_id`),
  CONSTRAINT `trips_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `trips_ibfk_2` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `trips_chk_1` CHECK ((`cargo_weight` > 0)),
  CONSTRAINT `trips_chk_2` CHECK ((`revenue` >= 0)),
  CONSTRAINT `trips_chk_3` CHECK (((`end_odometer` is null) or (`end_odometer` >= `start_odometer`)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trips`
--

LOCK TABLES `trips` WRITE;
/*!40000 ALTER TABLE `trips` DISABLE KEYS */;
/*!40000 ALTER TABLE `trips` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` text NOT NULL,
  `role` enum('manager','dispatcher','safety','analyst') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicles`
--

DROP TABLE IF EXISTS `vehicles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `model_name` varchar(100) NOT NULL,
  `license_plate` varchar(50) NOT NULL,
  `vehicle_type` enum('truck','van','bike') NOT NULL,
  `required_license_category` varchar(50) NOT NULL,
  `max_capacity_kg` int NOT NULL,
  `odometer_reading` int DEFAULT '0',
  `status` enum('available','on_trip','in_shop','retired') DEFAULT 'available',
  `acquisition_cost` decimal(12,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `license_plate` (`license_plate`),
  CONSTRAINT `vehicles_chk_1` CHECK ((`max_capacity_kg` > 0)),
  CONSTRAINT `vehicles_chk_2` CHECK ((`odometer_reading` >= 0)),
  CONSTRAINT `vehicles_chk_3` CHECK ((`acquisition_cost` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicles`
--

LOCK TABLES `vehicles` WRITE;
/*!40000 ALTER TABLE `vehicles` DISABLE KEYS */;
/*!40000 ALTER TABLE `vehicles` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-21 12:54:11
