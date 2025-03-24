ALTER DATABASE calc CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SET NAMES utf8mb4;
SET character_set_client = utf8mb4;
SET character_set_connection = utf8mb4;
SET character_set_results = utf8mb4;

-- Создание таблиц (если они не существуют)
CREATE TABLE IF NOT EXISTS Employees (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    FirstName VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    SecondName VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    LastName VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Projects (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Documents (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    DateCreated DATE NOT NULL,
    Type ENUM('Estimate', 'Contract') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    ResponsibleEmployee INT,
    Project INT,
    FOREIGN KEY (ResponsibleEmployee) REFERENCES Employees(ID),
    FOREIGN KEY (Project) REFERENCES Projects(ID)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
