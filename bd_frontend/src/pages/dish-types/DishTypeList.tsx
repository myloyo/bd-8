import React, { useState, useEffect } from 'react';
import { Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { dishTypeApi } from '../../services/api';
import { type DishType } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';

const DishTypeList: React.FC = () => {
  const [dishTypes, setDishTypes] = useState<DishType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await dishTypeApi.getAll();
      setDishTypes(data);
    } catch (error) {
      console.error('Error loading dish types:', error);
      message.error('Failed to load dish types');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id_group',
      key: 'id_group',
      sorter: (a: DishType, b: DishType) => a.id_group - b.id_group,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      sorter: (a: DishType, b: DishType) => a.type.localeCompare(b.type),
    },
  ];

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const filteredDishTypes = searchText
    ? dishTypes.filter(dt => dt.type.toLowerCase().includes(searchText.toLowerCase()))
    : dishTypes;

  return (
    <div className="dish-type-list-page">
      <PageHeader
        title="Dish Types"
        subtitle="Manage dish type records"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/dish-types/create')}
          >
            Add Dish Type
          </Button>
        }
      />

      <DataTable
        dataSource={filteredDishTypes}
        columns={columns}
        loading={loading}
        rowKey="id_group"
        onSearch={handleSearch}
        searchPlaceholder="Search dish types..."
      />
    </div>
  );
};

export default DishTypeList;
