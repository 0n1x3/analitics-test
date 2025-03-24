-- Заполнение таблицы сотрудников
INSERT INTO Employees (ID, FirstName, LastName) VALUES 
(1, 'Иван', 'Иванов'),
(2, 'Анна', 'Смирнова'),
(3, 'Александр', 'Кузнецов'),
(4, 'Мария', 'Петрова');

-- Проверка, что сотрудники добавлены
SELECT * FROM Employees;

-- Заполнение таблицы проектов
INSERT INTO Projects (ID, Name) VALUES 
(1, 'Проект A'),
(2, 'Проект B'),
(3, 'Проект C');

-- Проверка, что проекты добавлены
SELECT * FROM Projects;

-- Теперь заполняем документы
-- Для Ивана Иванова (сметы)
INSERT INTO Documents (DateCreated, Type, ResponsibleEmployee, Project)
VALUES 
('2025-01-11', 'Estimate', 1, 1),
('2025-01-12', 'Estimate', 1, 1),
('2025-01-13', 'Estimate', 1, 1),
('2025-01-14', 'Estimate', 1, 1),
('2025-01-15', 'Estimate', 1, 1),
('2025-01-16', 'Estimate', 1, 1),
('2025-01-17', 'Estimate', 1, 1),
('2025-01-18', 'Estimate', 1, 1),
('2025-01-19', 'Estimate', 1, 1),
('2025-01-20', 'Estimate', 1, 1);

-- Для Ивана Иванова (договоры)
INSERT INTO Documents (DateCreated, Type, ResponsibleEmployee, Project)
VALUES 
('2025-01-21', 'Contract', 1, 1),
('2025-01-22', 'Contract', 1, 1),
('2025-01-23', 'Contract', 1, 1),
('2025-01-24', 'Contract', 1, 1),
('2025-01-25', 'Contract', 1, 1);

-- Для Анны Смирновой (сметы)
INSERT INTO Documents (DateCreated, Type, ResponsibleEmployee, Project)
VALUES 
('2025-02-11', 'Estimate', 2, 2),
('2025-02-12', 'Estimate', 2, 2),
('2025-02-13', 'Estimate', 2, 2),
('2025-02-14', 'Estimate', 2, 2),
('2025-02-15', 'Estimate', 2, 2),
('2025-02-16', 'Estimate', 2, 2),
('2025-02-17', 'Estimate', 2, 2),
('2025-02-18', 'Estimate', 2, 2);

-- Для Анны Смирновой (договоры)
INSERT INTO Documents (DateCreated, Type, ResponsibleEmployee, Project)
VALUES 
('2025-02-21', 'Contract', 2, 2),
('2025-02-22', 'Contract', 2, 2),
('2025-02-23', 'Contract', 2, 2),
('2025-02-24', 'Contract', 2, 2);

-- Для Александра Кузнецова (сметы)
INSERT INTO Documents (DateCreated, Type, ResponsibleEmployee, Project)
VALUES 
('2025-03-11', 'Estimate', 3, 3),
('2025-03-12', 'Estimate', 3, 3),
('2025-03-13', 'Estimate', 3, 3),
('2025-03-14', 'Estimate', 3, 3),
('2025-03-15', 'Estimate', 3, 3),
('2025-03-16', 'Estimate', 3, 3);

-- Для Александра Кузнецова (договоры)
INSERT INTO Documents (DateCreated, Type, ResponsibleEmployee, Project)
VALUES 
('2025-03-21', 'Contract', 3, 3),
('2025-03-22', 'Contract', 3, 3),
('2025-03-23', 'Contract', 3, 3);

-- Для Марии Петровой (сметы)
INSERT INTO Documents (DateCreated, Type, ResponsibleEmployee, Project)
VALUES 
('2025-04-11', 'Estimate', 4, 1),
('2025-04-12', 'Estimate', 4, 1),
('2025-04-13', 'Estimate', 4, 1),
('2025-04-14', 'Estimate', 4, 1),
('2025-04-15', 'Estimate', 4, 1);

-- Для Марии Петровой (договоры)
INSERT INTO Documents (DateCreated, Type, ResponsibleEmployee, Project)
VALUES 
('2025-04-21', 'Contract', 4, 1),
('2025-04-22', 'Contract', 4, 1);

-- Проверка данных
SELECT COUNT(*) FROM Documents;