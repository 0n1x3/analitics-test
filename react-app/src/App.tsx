import { useEffect, useState } from 'react';
import './App.css'
import SqlQueryTool from './components/SqlQueryTool';
import LoadingIndicator from './components/LoadingIndicator';
import ErrorDisplay from './components/ErrorDisplay';
// Импортируем типы и библиотеки
import type { Database } from 'sql.js';
import cubejs from '@cubejs-client/core';
import { CubeProvider } from '@cubejs-client/react';

// Объявляем глобальную переменную initSqlJs
declare global {
  interface Window {
    initSqlJs: any;
  }
}

// Создаем экземпляр API Cube.js
const cubejsApi = cubejs(
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.K9PiJkjegbhnw4Ca5pPlkTmZihoOm42w8bja9Qs2qJg', 
  { apiUrl: 'http://localhost:4002/cubejs-api/v1' }
);

function App() {
  const [db, setDb] = useState<Database | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Инициализация базы данных при загрузке приложения
  useEffect(() => {
    // Функция для загрузки SQL.js через CDN
    const loadSqlJs = async () => {
      // Загружаем скрипт SQL.js
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/sql.js@1.8.0/dist/sql-wasm.js';
      script.async = true;
      document.body.appendChild(script);
      
      return new Promise<void>((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Не удалось загрузить SQL.js'));
      });
    };

    const initDb = async () => {
      try {
        // Загружаем SQL.js
        await loadSqlJs();
        
        // Инициализируем SQL.js
        const SQL = await window.initSqlJs({
          locateFile: () => 'https://cdn.jsdelivr.net/npm/sql.js@1.8.0/dist/sql-wasm.wasm'
        });
        
        const database = new SQL.Database();
        
        // Создание структуры базы данных
        database.run(`
          CREATE TABLE IF NOT EXISTS Projects (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            Name TEXT NOT NULL
          );
        `);

        database.run(`
          CREATE TABLE IF NOT EXISTS Employees (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            FirstName TEXT NOT NULL,
            SecondName TEXT,
            LastName TEXT NOT NULL
          );
        `);

        database.run(`
          CREATE TABLE IF NOT EXISTS Documents (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            DateCreated TEXT NOT NULL,
            Type TEXT CHECK(Type IN ('Estimate', 'Contract')) NOT NULL,
            ResponsibleEmployee INTEGER,
            Project INTEGER,
            FOREIGN KEY (ResponsibleEmployee) REFERENCES Employees(ID),
            FOREIGN KEY (Project) REFERENCES Projects(ID)
          );
        `);

        // Заполнение тестовыми данными
        // Проекты
        database.run(`INSERT INTO Projects (Name) VALUES ('Проект A')`);
        database.run(`INSERT INTO Projects (Name) VALUES ('Проект B')`);
        database.run(`INSERT INTO Projects (Name) VALUES ('Проект C')`);

        // Сотрудники
        database.run(`INSERT INTO Employees (FirstName, LastName) VALUES ('Иван', 'Иванов')`);
        database.run(`INSERT INTO Employees (FirstName, LastName) VALUES ('Анна', 'Смирнова')`);
        database.run(`INSERT INTO Employees (FirstName, LastName) VALUES ('Александр', 'Кузнецов')`);
        database.run(`INSERT INTO Employees (FirstName, LastName) VALUES ('Мария', 'Петрова')`);

        // Документы для разных месяцев и сотрудников
        // Данные для Ивана Иванова
        for (let i = 0; i < 10; i++) {
          database.run(`
            INSERT INTO Documents (DateCreated, Type, ResponsibleEmployee, Project) 
            VALUES ('2025-01-${10+i}', 'Estimate', 1, 1)
          `);
        }
        for (let i = 0; i < 5; i++) {
          database.run(`
            INSERT INTO Documents (DateCreated, Type, ResponsibleEmployee, Project) 
            VALUES ('2025-01-${20+i}', 'Contract', 1, 1)
          `);
        }

        // Данные для Анны Смирновой
        for (let i = 0; i < 8; i++) {
          database.run(`
            INSERT INTO Documents (DateCreated, Type, ResponsibleEmployee, Project) 
            VALUES ('2025-02-${10+i}', 'Estimate', 2, 2)
          `);
        }
        for (let i = 0; i < 4; i++) {
          database.run(`
            INSERT INTO Documents (DateCreated, Type, ResponsibleEmployee, Project) 
            VALUES ('2025-02-${20+i}', 'Contract', 2, 2)
          `);
        }

        // Данные для Александра Кузнецова
        for (let i = 0; i < 6; i++) {
          database.run(`
            INSERT INTO Documents (DateCreated, Type, ResponsibleEmployee, Project) 
            VALUES ('2025-03-${10+i}', 'Estimate', 3, 3)
          `);
        }
        for (let i = 0; i < 3; i++) {
          database.run(`
            INSERT INTO Documents (DateCreated, Type, ResponsibleEmployee, Project) 
            VALUES ('2025-03-${20+i}', 'Contract', 3, 3)
          `);
        }

        // Документы для Марии Петровой
        for (let i = 0; i < 5; i++) {
          database.run(`
            INSERT INTO Documents (DateCreated, Type, ResponsibleEmployee, Project) 
            VALUES ('2025-04-${10+i}', 'Estimate', 4, 1)
          `);
        }
        for (let i = 0; i < 2; i++) {
          database.run(`
            INSERT INTO Documents (DateCreated, Type, ResponsibleEmployee, Project) 
            VALUES ('2025-04-${20+i}', 'Contract', 4, 1)
          `);
        }

        setDb(database);
        setLoading(false);
      } catch (err) {
        console.error('Ошибка при инициализации базы данных:', err);
        setError(`Ошибка при инициализации базы данных: ${err instanceof Error ? err.message : String(err)}`);
        setLoading(false);
      }
    };

    initDb();
  }, []);

  if (loading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  return (
    <CubeProvider cubeApi={cubejsApi}>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Аналитический инструмент</h1>
        {db && <SqlQueryTool db={db} cubejsApi={cubejsApi} />}
      </div>
    </CubeProvider>
  )
}

export default App
