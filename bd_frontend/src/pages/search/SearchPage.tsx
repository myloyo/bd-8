import React, { useState } from 'react';
import {
  Input, Button, Select, Form, Card,
  Table, Alert, Spin, Empty, Divider
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { dishApi } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import './SearchPage.scss';

const { Option } = Select;

const SearchPage: React.FC = () => {
  const [form] = Form.useForm();
  const [results, setResults] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const tables = [
    { value: 'dish', label: 'Dishes', fields: ['name_dish', 'id_season', 'id_country', 'id_chief'] },
    { value: 'human', label: 'Users', fields: ['name_user', 'email', 'sex', 'id_country'] },
    { value: 'chief', label: 'Chiefs', fields: ['name_chief', 'exp_years', 'id_country'] },
    { value: 'dish_rating', label: 'Ratings', fields: ['rate', 'comment', 'id_user', 'id_dish'] },
    { value: 'product', label: 'Products', fields: ['name_product', 'calories', 'cost_product'] },
    { value: 'recipe', label: 'Recipes', fields: ['id_dish', 'id_product', 'gramms'] },
    { value: 'order_of_dishes', label: 'Orders', fields: ['id_user', 'id_dish', 'date'] },
  ];

  const handleSearch = async (values: any) => {
    setLoading(true);
    setError(null);
    setSearchPerformed(true);

    try {
      // Получаем все данные выбранной таблицы
      let response: any[] = [];
      switch (values.table) {
        case 'dish':
          response = await dishApi.getAll(); break;
        case 'human':
          response = await (await import('../../services/api')).humanApi.getAll(); break;
        case 'chief':
          response = await (await import('../../services/api')).chiefApi.getAll(); break;
        case 'dish_rating':
          response = await (await import('../../services/api')).dishRatingApi.getAll(); break;
        case 'product':
          response = await (await import('../../services/api')).productApi.getAll(); break;
        case 'recipe':
          response = await (await import('../../services/api')).recipeApi.getAll(); break;
        case 'order_of_dishes':
          response = await (await import('../../services/api')).orderApi.getAll(); break;
        default:
          setError('Unknown table');
          setResults([]);
          setLoading(false);
          return;
      }
      // Фильтрация по выбранным полям
      const { fields, query } = values;
      const q = query.toLowerCase();
      const filtered = response.filter(item =>
        fields.some((field: string) => {
          const val = item[field];
          if (val == null) return false;
          if (typeof val === 'string') return val.toLowerCase().includes(q);
          if (typeof val === 'number') return val.toString().includes(q);
          return false;
        })
      );
      setResults(filtered);
      if (filtered.length > 0) {
        const firstResult = filtered[0];
        const dynamicColumns = Object.keys(firstResult).map(key => ({
          title: key,
          dataIndex: key,
          key: key,
          render: (text: any) => {
            if (text === null) return 'N/A';
            if (typeof text === 'boolean') return text ? 'Yes' : 'No';
            return text;
          },
        }));
        setColumns(dynamicColumns);
      } else {
        setColumns([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('An error occurred while searching. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (value: string) => {
    // Reset fields when table changes
    form.setFieldsValue({ fields: undefined });
  };

  const renderFieldOptions = () => {
    const selectedTable = form.getFieldValue('table');
    const tableInfo = tables.find(t => t.value === selectedTable);

    if (!tableInfo) return null;

    return tableInfo.fields.map(field => (
      <Option key={field} value={field}>{field}</Option>
    ));
  };

  return (
    <div className="search-page">
      <PageHeader
        title="Advanced Search"
        subtitle="Search across database tables with complex queries"
      />

      <Card className="search-card">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSearch}
          initialValues={{ table: 'dish' }}
        >
          <div className="search-form-layout">
            <Form.Item
              name="table"
              label="Select Table"
              rules={[{ required: true, message: 'Please select a table' }]}
            >
              <Select onChange={handleTableChange}>
                {tables.map(table => (
                  <Option key={table.value} value={table.value}>{table.label}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="fields"
              label="Search Fields"
              rules={[{ required: true, message: 'Please select fields to search' }]}
            >
              <Select mode="multiple" placeholder="Select fields to search">
                {renderFieldOptions()}
              </Select>
            </Form.Item>

            <Form.Item
              name="query"
              label="Search Query"
              rules={[{ required: true, message: 'Please enter a search query' }]}
            >
              <Input placeholder="Enter search terms" />
            </Form.Item>

            <Form.Item className="search-button-container">
              <Button
                type="primary"
                htmlType="submit"
                icon={<SearchOutlined />}
                loading={loading}
              >
                Search
              </Button>
            </Form.Item>
          </div>
        </Form>

        <Divider />

        <div className="search-results">
          <Spin spinning={loading}>
            {error && (
              <Alert
                message="Error"
                description={error}
                type="error"
                showIcon
              />
            )}

            {searchPerformed && !loading && !error && (
              results.length > 0 ? (
                <Table
                  dataSource={results}
                  columns={columns}
                  rowKey={(record) => record.id?.toString() || Math.random().toString()}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 'max-content' }}
                />
              ) : (
                <Empty description="No results found" />
              )
            )}
          </Spin>
        </div>
      </Card>
    </div>
  );
};

export default SearchPage;
