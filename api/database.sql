CREATE SCHEMA IF NOT EXISTS `FRE_COUNTER` DEFAULT CHARACTER SET utf8 ;
USE `FRE_COUNTER` ;

-- -----------------------------------------------------
-- Table `FRE_COUNTER`.`USER`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FRE_COUNTER`.`USER` (
  `USR_ID` BIGINT NOT NULL AUTO_INCREMENT,
  `USR_PROFILE` LONGTEXT NULL DEFAULT NULL,
  `USR_NAME` VARCHAR(80) NOT NULL,
  `USR_EMAIL` VARCHAR(80) NOT NULL,
  `USR_PASSWORD` VARCHAR(255) NOT NULL,
  `USR_STATUS` ENUM('A', 'I', 'B') NOT NULL,
  `USR_NOTES` LONGTEXT NULL DEFAULT NULL,
  `USR_DT_CREATE` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `USR_DT_UPDATE` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `USR_PRIVILEGE` ENUM('M', 'C', 'U') NOT NULL,
  `USR_COMPANY_ID` BIGINT NULL,
  PRIMARY KEY (`USR_ID`),
  UNIQUE INDEX `USR_EMAIL_UNIQUE` (`USR_EMAIL` ASC) )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FRE_COUNTER`.`CLIENT`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FRE_COUNTER`.`CLIENT` (
  `CLI_ID` BIGINT NOT NULL AUTO_INCREMENT,
  `CLI_DESCRIPTION` VARCHAR(80) NOT NULL,
  `CLI_CNPJ` VARCHAR(25) NULL,
  `CLI_STATUS` ENUM('A', 'I', 'B') NOT NULL,
  `CLI_NOTES` LONGTEXT NULL DEFAULT NULL,
  `CLI_DT_CREATE` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CLI_DT_UPDATE` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`CLI_ID`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FRE_COUNTER`.`UNITY`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FRE_COUNTER`.`UNITY` (
  `UNI_ID` BIGINT NOT NULL AUTO_INCREMENT,
  `UNI_DESCRIPTION` VARCHAR(80) NOT NULL,
  `UNI_CNPJ` VARCHAR(25) NULL,
  `UNI_STATUS` ENUM('A', 'I', 'B') NOT NULL,
  `UNI_CODE` VARCHAR(20) NULL,
  `UNI_NOTES` LONGTEXT NULL DEFAULT NULL,
  `UNI_CLI_ID` BIGINT NOT NULL,
  `UNI_DEVICE_CODE` VARCHAR(20) NOT NULL,
  `UNI_DT_CREATE` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UNI_DT_UPDATE` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`UNI_ID`),
  INDEX `fk_UNITY_CLIENT_idx` (`UNI_CLI_ID` ASC) ,
  UNIQUE INDEX `UNI_DEVICE_CODE_UNIQUE` (`UNI_DEVICE_CODE` ASC) ,
  CONSTRAINT `fk_UNITY_CLIENT`
    FOREIGN KEY (`UNI_CLI_ID`)
    REFERENCES `FRE_COUNTER`.`CLIENT` (`CLI_ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FRE_COUNTER`.`EVENT`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FRE_COUNTER`.`EVENT` (
  `EVE_ID` INT NOT NULL AUTO_INCREMENT,
  `EVE_DEVICE_CODE` VARCHAR(20) NOT NULL,
  `EVE_MEAL` VARCHAR(100) NOT NULL,
  `EVE_DATETIME` DATETIME NOT NULL,
  `EVE_AMOUNT` BIGINT NOT NULL DEFAULT 0,
  `EVE_CLI_ID` BIGINT NOT NULL,
  `EVE_UNI_ID` BIGINT NOT NULL,
  PRIMARY KEY (`EVE_ID`),
  INDEX `fk_EVENT_CLIENT1_idx` (`EVE_CLI_ID` ASC) ,
  INDEX `fk_EVENT_UNITY1_idx` (`EVE_UNI_ID` ASC) ,
  CONSTRAINT `fk_EVENT_CLIENT1`
    FOREIGN KEY (`EVE_CLI_ID`)
    REFERENCES `FRE_COUNTER`.`CLIENT` (`CLI_ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_EVENT_UNITY1`
    FOREIGN KEY (`EVE_UNI_ID`)
    REFERENCES `FRE_COUNTER`.`UNITY` (`UNI_ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FRE_COUNTER`.`USER_LOG`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FRE_COUNTER`.`USER_LOG` (
  `ULC_DESCRIPTION` VARCHAR(80) NOT NULL,
  `ULC_LOG` LONGTEXT NULL DEFAULT NULL,
  `ULC_USR_ID` BIGINT NOT NULL,
  `ULC_DATETIME` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ULC_STATUS` ENUM('SUCCESS', 'WARNING', 'ERROR', 'DEVELOP') NOT NULL,
  INDEX `fk_USER_LOG_USER1_idx` (`ULC_USR_ID` ASC) ,
  CONSTRAINT `fk_USER_LOG_USER1`
    FOREIGN KEY (`ULC_USR_ID`)
    REFERENCES `FRE_COUNTER`.`USER` (`USR_ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FRE_COUNTER`.`SYSTEM_LOG`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FRE_COUNTER`.`SYSTEM_LOG` (
  `SLC_DESCRIPTION` VARCHAR(80) NOT NULL,
  `SLC_LOG` LONGTEXT NULL DEFAULT NULL,
  `SLC_DATETIME` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `SLC_STATUS` ENUM('SUCCESS', 'WARNING', 'ERROR', 'DEVELOP') NOT NULL)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Late Updates to Table `FRE_COUNTER`.`USER`
-- -----------------------------------------------------

ALTER TABLE `USER`
  ADD `ISRESETPASS` BOOLEAN NOT NULL DEFAULT FALSE AFTER `USR_COMPANY_ID`,
  ADD `RESETPASSCODE` CHAR(5) NULL DEFAULT NULL AFTER `ISRESETPASS`,
  ADD `DT_RESETPASSLIMIT` DATETIME NULL DEFAULT NULL AFTER `RESETPASSCODE`;

ALTER TABLE `USER`
  ADD `IS2AUTH` BOOLEAN NOT NULL DEFAULT FALSE AFTER `DT_RESETPASSLIMIT`;