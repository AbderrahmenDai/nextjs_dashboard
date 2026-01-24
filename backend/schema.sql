CREATE TABLE IF NOT EXISTS Site (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    budget DECIMAL(15, 2) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS Department (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    head VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    employeeCount INT DEFAULT 0,
    budget DECIMAL(15, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Active',
    colorCallback VARCHAR(50),
    siteId VARCHAR(50),
    FOREIGN KEY (siteId) REFERENCES Site(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS User (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'Active',
    avatarGradient VARCHAR(255),
    departmentId VARCHAR(50),
    FOREIGN KEY (departmentId) REFERENCES Department(id) ON DELETE SET NULL
);

-- Seed Initial Sites
INSERT IGNORE INTO Site (id, name, budget, description) VALUES 
('TT', 'TT', 5000000.00, 'Main Manufacturing Site'),
('TTG', 'TTG', 3500000.00, 'Global Distribution Center');
