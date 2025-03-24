import React, { useState } from 'react';
import { useCubeQuery } from '@cubejs-client/react';
import { CubeApi } from '@cubejs-client/core';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// Определение типа данных для строк
interface RowData {
  Month: string;
  Employee: string;
  Estimates: number;
  Contracts: number;
  ConversionPercent: number;
}

interface CubeAnalyticsProps {
  cubejsApi: CubeApi;
}

function CubeAnalytics({ cubejsApi }: CubeAnalyticsProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Определяем запрос к Cube.js, аналогичный нашему SQL-запросу
  const { resultSet, isLoading: cubeLoading, error: cubeError } = useCubeQuery({
    measures: ['analytics.estimates', 'analytics.contracts', 'analytics.conversion_percent'],
    dimensions: ['analytics.month', 'analytics.employee'],
    order: {
      'analytics.month': 'asc',
      'analytics.employee': 'asc'
    }
  }, { cubeApi: cubejsApi });

  // Обработка состояний загрузки и ошибок
  React.useEffect(() => {
    setIsLoading(cubeLoading);
    if (cubeError) {
      setError(`Произошла ошибка: ${cubeError.toString()}`);
    } else {
      setError("");
    }
  }, [cubeLoading, cubeError]);

  // Преобразование данных для AG-Grid
  const getRowData = (): RowData[] => {
    if (!resultSet) return [];
    return resultSet.tablePivot().map(row => ({
      Month: row['analytics.month'] as string,
      Employee: row['analytics.employee'] as string,
      Estimates: Number(row['analytics.estimates']),
      Contracts: Number(row['analytics.contracts']),
      ConversionPercent: Number(row['analytics.conversion_percent'])
    }));
  };

  // Определение колонок для AG-Grid с правильной типизацией
  const getColumnDefs = () => {
    return [
      { 
        headerName: 'Месяц', 
        field: 'Month' as keyof RowData, 
        sortable: true, 
        filter: true,
        width: 120
      },
      { 
        headerName: 'Сотрудник', 
        field: 'Employee' as keyof RowData, 
        sortable: true, 
        filter: true,
        width: 180,
        flex: 2
      },
      { 
        headerName: 'Количество смет', 
        field: 'Estimates' as keyof RowData, 
        sortable: true, 
        filter: true,
        width: 150,
        type: 'numericColumn'
      },
      { 
        headerName: 'Количество договоров', 
        field: 'Contracts' as keyof RowData, 
        sortable: true,
        filter: true,
        width: 150,
        type: 'numericColumn'
      },
      { 
        headerName: 'Конверсия (%)', 
        field: 'ConversionPercent' as keyof RowData, 
        sortable: true, 
        filter: true,
        width: 150,
        type: 'numericColumn',
        valueFormatter: (params: any) => `${params.value}%`
      }
    ];
  };

  const rowData = getRowData();
  const columnDefs = getColumnDefs();

  return (
    <div className="flex flex-col lg:flex-row w-full gap-6">
      {/* Карточка с описанием запроса */}
      <div className="lg:w-1/2 flex flex-col bg-white rounded-lg shadow-md p-4 border border-gray-200">
        <h1 className="text-2xl font-semibold mb-4 text-left text-gray-700">
          <span className="mr-2">📊</span>Аналитика через Cube.js
        </h1>
        <div className="p-4 bg-gray-50 rounded-md mb-4 border border-gray-200">
          <p className="mb-2 font-medium">Запрос к Cube.js:</p>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {JSON.stringify({
              measures: ['analytics.estimates', 'analytics.contracts', 'analytics.conversion_percent'],
              dimensions: ['analytics.month', 'analytics.employee'],
              order: {
                'analytics.month': 'asc',
                'analytics.employee': 'asc'
              }
            }, null, 2)}
          </pre>
        </div>
        {error.length > 0 && (
          <div className="text-white bg-red-500 p-3 rounded-md mb-3 shadow-sm">
            {error}
          </div>
        )}
      </div>

      {/* Карточка с результатами запроса */}
      <div className="lg:w-1/2 flex flex-col bg-white rounded-lg shadow-md p-4 border border-gray-200">
        <h2 className="text-2xl font-semibold mb-4 text-left text-gray-700">
          <span className="mr-2">📊</span>Результаты запроса
        </h2>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[50vh] bg-gray-50 rounded-md border border-gray-200">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-500">Загрузка данных...</p>
          </div>
        ) : rowData.length > 0 ? (
          <div className="ag-theme-alpine rounded-md overflow-hidden border border-gray-200" 
               style={{ height: '50vh', width: '100%' }}>
            <AgGridReact<RowData>
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
            <p>Нет данных для отображения</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CubeAnalytics; 