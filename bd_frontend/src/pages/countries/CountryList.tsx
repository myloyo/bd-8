import React, { useState, useEffect } from 'react';
import { Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { countryApi } from '../../services/api';
import { type Country } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';

const CountryList: React.FC = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await countryApi.getAll();
      setCountries(data);
    } catch (error) {
      console.error('Error loading countries:', error);
      message.error('Failed to load countries');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const filteredCountries = searchText
    ? countries.filter(country => country.name_country.toLowerCase().includes(searchText.toLowerCase()))
    : countries;

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id_country',
      key: 'id_country',
      sorter: (a: Country, b: Country) => a.id_country - b.id_country,
    },
    {
      title: 'Name',
      dataIndex: 'name_country',
      key: 'name_country',
      sorter: (a: Country, b: Country) => a.name_country.localeCompare(b.name_country),
    },
  ];

  return (
    <div className="country-list-page">
      <PageHeader
        title="Countries"
        subtitle="Manage country records"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/countries/create')}
          >
            Add Country
          </Button>
        }
      />

      <DataTable
        dataSource={filteredCountries}
        columns={columns}
        loading={loading}
        rowKey="id_country"
        onSearch={handleSearch}
        searchPlaceholder="Search countries..."
      />
    </div>
  );
};

export default CountryList;

