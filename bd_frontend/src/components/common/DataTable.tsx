import React, { useState } from 'react';
import { Table, Button, Input, Select } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { type FilterValue, type SorterResult } from 'antd/es/table/interface';
import './DataTable.scss';

const { Option } = Select;

interface DataTableProps<T> {
  dataSource: T[];
  columns: ColumnsType<T>;
  loading?: boolean;
  rowKey: string;
  onRowClick?: (record: T) => void;
  pagination?: TablePaginationConfig;
  onChange?: (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<T> | SorterResult<T>[],
    extra: { currentDataSource: T[] }
  ) => void;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  extraActions?: React.ReactNode;
}

function DataTable<T extends Record<string, any>>({
  dataSource,
  columns,
  loading = false,
  rowKey,
  onRowClick,
  pagination = { pageSize: 10 },
  onChange,
  onSearch,
  searchPlaceholder = 'Search',
  filters,
  extraActions,
}: DataTableProps<T>) {
  const [searchText, setSearchText] = useState('');

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchText);
    }
  };

  const handleReset = () => {
    setSearchText('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <div className="data-table-container">
      <div className="data-table-header">
        {onSearch && (
          <div className="data-table-search">
            <Input
              placeholder={searchPlaceholder}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined />}
              allowClear
            />
            <Button type="primary" onClick={handleSearch}>
              Search
            </Button>
            <Button onClick={handleReset}>Reset</Button>
          </div>
        )}
        {filters && (
          <div className="data-table-filters">
            <span className="filter-label">
              <FilterOutlined /> Filters:
            </span>
            {filters}
          </div>
        )}
        {extraActions && (
          <div className="data-table-actions">
            {extraActions}
          </div>
        )}
      </div>
      <Table
        dataSource={dataSource}
        columns={columns}
        loading={loading}
        rowKey={rowKey}
        pagination={pagination}
        onChange={onChange}
        onRow={onRowClick ? record => ({
          onClick: () => onRowClick(record),
        }) : undefined}
        className="data-table"
        locale={{
          emptyText: loading ? 'Загрузка...' : 'Нет данных',
        }}
      />
    </div>
  );
}

export default DataTable;