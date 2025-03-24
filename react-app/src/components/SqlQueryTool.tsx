import { useCallback, useState } from "react";
import { Database, QueryExecResult } from "sql.js";
import Editor from '@monaco-editor/react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useCubeQuery } from '@cubejs-client/react';
import { CubeApi } from '@cubejs-client/core';

// Импортируем все модули и provideGlobalGridOptions
import { ModuleRegistry, AllCommunityModule, provideGlobalGridOptions } from 'ag-grid-community';

// Регистрируем все модули
ModuleRegistry.registerModules([AllCommunityModule]);

// Устанавливаем глобальные настройки для использования legacy тем
provideGlobalGridOptions({ theme: "legacy" });

interface SqlQueryToolProps {
  db: Database;
  cubejsApi: CubeApi;
}

function SqlQueryTool(props: SqlQueryToolProps) {
  const { db, cubejsApi } = props;
  const [query, setQuery] = useState(`SELECT
    strftime('%Y-%m', Documents.DateCreated) AS Month,
    Employees.FirstName || ' ' || Employees.LastName AS Employee,
    SUM(CASE WHEN Documents.Type = 'Estimate' THEN 1 ELSE 0 END) AS Estimates,
    SUM(CASE WHEN Documents.Type = 'Contract' THEN 1 ELSE 0 END) AS Contracts,
    CASE
        WHEN SUM(CASE WHEN Documents.Type = 'Contract' THEN 1 ELSE 0 END) > 0
        THEN ROUND((SUM(CASE WHEN Documents.Type = 'Estimate' THEN 1 ELSE 0 END) * 100.0 / 
              SUM(CASE WHEN Documents.Type = 'Contract' THEN 1 ELSE 0 END)), 2)
        ELSE 0
    END AS ConversionPercent
FROM
    Documents
JOIN
    Employees ON Documents.ResponsibleEmployee = Employees.ID
GROUP BY
    Month, Employee
ORDER BY
    Month, Employee;`);
  const [error, setError] = useState<string>("");
  const [results, setResults] = useState<QueryExecResult[]>([]);
  const [dataSource, setDataSource] = useState<'sql' | 'cube'>('sql');

  // Запрос к Cube.js
  const { resultSet, isLoading: cubeLoading, error: cubeError } = useCubeQuery({
    measures: ['analytics.estimates', 'analytics.contracts', 'analytics.conversion_percent'],
    dimensions: ['analytics.month', 'analytics.employee'],
    order: {
      'analytics.month': 'asc',
      'analytics.employee': 'asc'
    },
    timeDimensions: [],
    filters: []
  }, { cubeApi: cubejsApi });

  // Преобразование данных Cube.js для AG-Grid
  const getCubeRowData = () => {
    if (!resultSet) return [];
    
    // Добавим отладочный вывод
    console.log("Cube.js resultSet:", resultSet.tablePivot());
    
    return resultSet.tablePivot().map(row => {
      console.log("Row data:", row);
      return {
        Month: row['analytics.month'] || '',
        Employee: row['analytics.employee'] || 'Неизвестный сотрудник',
        Estimates: Number(row['analytics.estimates'] || 0),
        Contracts: Number(row['analytics.contracts'] || 0),
        ConversionPercent: Number(row['analytics.conversion_percent'] || 0)
      };
    });
  };

  // Определение колонок для AG-Grid на основе результатов запроса
  const getColumnDefs = (results: QueryExecResult[]) => {
    if (dataSource === 'cube' && resultSet) {
      return [
        { 
          headerName: 'Месяц', 
          field: 'Month', 
          sortable: true, 
          filter: true,
          width: 120
        },
        { 
          headerName: 'Сотрудник', 
          field: 'Employee', 
          sortable: true, 
          filter: true,
          width: 180,
          flex: 2
        },
        { 
          headerName: 'Количество смет', 
          field: 'Estimates', 
          sortable: true, 
          filter: true,
          width: 150,
          type: 'numericColumn'
        },
        { 
          headerName: 'Количество договоров', 
          field: 'Contracts', 
          sortable: true,
          filter: true,
          width: 150,
          type: 'numericColumn'
        },
        { 
          headerName: 'Конверсия (%)', 
          field: 'ConversionPercent', 
          sortable: true, 
          filter: true,
          width: 150,
          type: 'numericColumn',
          valueFormatter: (params: any) => `${params.value}%`
        }
      ];
    }

    if (results.length === 0 || !results[0].columns) return [];
    
    return results[0].columns.map(column => {
      // Определяем настройки для разных типов колонок
      let colDef: any = {
        headerName: getColumnDisplayName(column),
        field: column,
        sortable: true,
        filter: true,
        resizable: true,
        wrapHeaderText: true,
        autoHeaderHeight: true
      };
      
      // Настройки для конкретных столбцов
      switch(column) {
        case 'Month':
          colDef.width = 120;
          break;
        case 'Employee':
          colDef.width = 180;
          colDef.flex = 2;
          break;
        case 'Estimates':
        case 'Contracts':
          colDef.width = 150;
          colDef.type = 'numericColumn';
          break;
        case 'ConversionPercent':
          colDef.width = 150;
          colDef.type = 'numericColumn';
          colDef.valueFormatter = (params: any) => `${params.value}%`;
          break;
      }
      
      return colDef;
    });
  };

  // Функция для преобразования названий столбцов в удобочитаемый формат
  const getColumnDisplayName = (columnName: string) => {
    switch(columnName) {
      case 'Month': return 'Месяц';
      case 'Employee': return 'Сотрудник';
      case 'Estimates': return 'Количество смет';
      case 'Contracts': return 'Количество договоров';
      case 'ConversionPercent': return 'Конверсия (%)';
      default: return columnName;
    }
  };

  // Преобразование результатов запроса в формат для AG-Grid
  const getRowData = (results: QueryExecResult[]) => {
    if (dataSource === 'cube') {
      return getCubeRowData();
    }

    if (results.length === 0 || !results[0].values) return [];
    
    return results[0].values.map(row => {
      const rowData: Record<string, any> = {};
      results[0].columns.forEach((column, index) => {
        rowData[column] = row[index];
      });
      return rowData;
    });
  };

  const executeQuery = useCallback(() => {
    try {
      setResults(db.exec(query));
      setError("");
      setDataSource('sql');
    } catch (error) {
      if (error instanceof Error) {
        setError(`Произошла ошибка: ${error.message}`);
      } else if (typeof error === "string") {
        setError(error);
      } else {
        setError("Произошла неизвестная ошибка");
      }
      setResults([]);
    }
  }, [db, query]);

  const switchToCube = () => {
    setDataSource('cube');
    if (cubeError) {
      setError(`Ошибка Cube.js: ${cubeError.toString()}`);
    } else {
      setError("");
    }
  };

  const columnDefs = getColumnDefs(results);
  const rowData = getRowData(results);
  const isLoadingCube = dataSource === 'cube' && cubeLoading;

  return (
    // Переходим на flex layout вместо grid для лучшей адаптивности
    <div className="flex flex-col lg:flex-row w-full gap-6">
      {/* Карточка с SQL-запросом */}
      <div className="lg:w-1/2 flex flex-col bg-white rounded-lg shadow-md p-4 border border-gray-200">
        <h1 className="text-2xl font-semibold mb-4 text-left text-gray-700">
          <span className="mr-2">🔍</span>SQL-запрос
        </h1>
        <div className="w-full mb-4 border rounded-md overflow-hidden">
          <Editor
            value={query}
            onChange={(text) => setQuery(text!)}
            width="100%"
            height="50vh"
            defaultLanguage="sql"
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
            }}
          />
        </div>
        {error.length > 0 && (
          <div className="text-white bg-red-500 p-3 rounded-md mb-3 shadow-sm">
            {error}
          </div>
        )}
        <div className="flex gap-3">
          <button
            className="bg-blue-600 text-white px-6 py-2.5 rounded-md hover:bg-blue-700 transition-colors shadow-sm self-start flex items-center"
            onClick={executeQuery}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Выполнить SQL-запрос
          </button>
          <button
            className="bg-green-600 text-white px-6 py-2.5 rounded-md hover:bg-green-700 transition-colors shadow-sm self-start flex items-center"
            onClick={switchToCube}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clipRule="evenodd" />
            </svg>
            Использовать Cube.js
          </button>
        </div>
      </div>

      {/* Карточка с результатами запроса */}
      <div className="lg:w-1/2 flex flex-col bg-white rounded-lg shadow-md p-4 border border-gray-200">
        <h2 className="text-2xl font-semibold mb-4 text-left text-gray-700">
          <span className="mr-2">📊</span>Результаты запроса
          {dataSource === 'cube' && <span className="ml-2 text-sm font-normal text-gray-500">(Источник: Cube.js)</span>}
        </h2>
        {isLoadingCube ? (
          <div className="flex flex-col items-center justify-center h-[50vh] bg-gray-50 rounded-md border border-gray-200">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-500">Загрузка данных из Cube.js...</p>
          </div>
        ) : rowData.length > 0 ? (
          <div className="ag-theme-alpine rounded-md overflow-hidden border border-gray-200" 
               style={{ height: '50vh', width: '100%' }}>
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              pagination={true}
              paginationPageSize={20}
              paginationPageSizeSelector={[10, 20, 50, 100]}
              suppressColumnVirtualisation={true}
              suppressRowVirtualisation={true}
              defaultColDef={{
                flex: 1,
                minWidth: 100,
                cellStyle: { whiteSpace: 'normal' }
              }}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[50vh] bg-gray-50 rounded-md border border-gray-200 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p>Выполните запрос, чтобы увидеть результаты</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SqlQueryTool;
