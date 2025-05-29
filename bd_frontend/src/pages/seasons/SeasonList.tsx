import React, { useState, useEffect } from 'react';
import { Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { seasonApi } from '../../services/api';
import { type Season } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';

const SeasonList: React.FC = () => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await seasonApi.getAll();
      setSeasons(data);
    } catch (error) {
      console.error('Error loading seasons:', error);
      message.error('Failed to load seasons');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const filteredSeasons = searchText
    ? seasons.filter(season => season.name_season.toLowerCase().includes(searchText.toLowerCase()))
    : seasons;

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id_season',
      key: 'id_season',
      sorter: (a: Season, b: Season) => a.id_season - b.id_season,
    },
    {
      title: 'Name',
      dataIndex: 'name_season',
      key: 'name_season',
      sorter: (a: Season, b: Season) => a.name_season.localeCompare(b.name_season),
    },
  ];

  return (
    <div className="season-list-page">
      <PageHeader
        title="Seasons"
        subtitle="Manage season records"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/seasons/create')}
          >
            Add Season
          </Button>
        }
      />

      <DataTable
        dataSource={filteredSeasons}
        columns={columns}
        loading={loading}
        rowKey="id_season"
        onSearch={handleSearch}
        searchPlaceholder="Search seasons..."
      />
    </div>
  );
};

export default SeasonList;
