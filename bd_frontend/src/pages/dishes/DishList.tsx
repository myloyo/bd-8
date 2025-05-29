import React, { useState, useEffect } from 'react';
import { Button, message, Select, Tooltip, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dishApi, seasonApi, countryApi, dishTypeApi, chiefApi } from '../../services/api';
import { type Dish, type Season, type Country, type DishType, type Chief, type DishWithDetails } from '../../types/index';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';

const DishList: React.FC = () => {
  const [dishes, setDishes] = useState<DishWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [dishTypes, setDishTypes] = useState<DishType[]>([]);
  const [chiefs, setChiefs] = useState<Chief[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number | undefined>(undefined);
  const [selectedCountry, setSelectedCountry] = useState<number | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<number | undefined>(undefined);
  const [searchText, setSearchText] = useState('');

  const navigate = useNavigate();
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  useEffect(() => {
    loadData();
    // Load reference data
    const loadReferenceData = async () => {
      try {
        const [seasonData, countryData, typeData, chiefData] = await Promise.all([
          seasonApi.getAll(),
          countryApi.getAll(),
          dishTypeApi.getAll(),
          chiefApi.getAll()
        ]);
        setSeasons(seasonData);
        setCountries(countryData);
        setDishTypes(typeData);
        setChiefs(chiefData);
      } catch (error) {
        console.error('Error loading reference data:', error);
        message.error('Failed to load reference data');
      }
    };

    loadReferenceData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Получаем блюда
      const dishesData = await dishApi.getAll({
        season: selectedSeason,
        country: selectedCountry,
        type: selectedType
      });
      // Сопоставляем имена через справочники
      const dishesWithDetails = dishesData.map((dish: Dish) => ({
        ...dish,
        seasonName: seasons.find(s => s.id_season === dish.id_season)?.name_season || '',
        countryName: countries.find(c => c.id_country === dish.id_country)?.name_country || '',
        typeName: dishTypes.find(dt => dt.id_group === dish.id_group)?.type || '',
        chiefName: chiefs.find(ch => ch.id_chief === dish.id_chief)?.name_chief || '',
      }));
      setDishes(dishesWithDetails);
    } catch (error) {
      console.error('Error loading dishes:', error);
      message.error('Failed to load dishes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedSeason, selectedCountry, selectedType]);

  const handleView = (id: number) => {
    navigate(`/dishes/${id}`);
  };

  const handleEdit = (id: number) => {
    navigate(`/dishes/${id}/edit`);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Confirm Deletion',
      content: 'Are you sure you want to delete this dish?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await dishApi.delete(id);
          message.success('Dish deleted successfully');
          loadData();
        } catch (error) {
          console.error('Error deleting dish:', error);
          message.error('Failed to delete dish');
        }
      },
    });
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const filteredDishes = searchText
    ? dishes.filter(dish => dish.name_dish.toLowerCase().includes(searchText.toLowerCase()))
    : dishes;

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id_dish',
      key: 'id_dish',
      sorter: (a: Dish, b: Dish) => a.id_dish - b.id_dish,
    },
    {
      title: 'Name',
      dataIndex: 'name_dish',
      key: 'name_dish',
      sorter: (a: Dish, b: Dish) => a.name_dish.localeCompare(b.name_dish),
    },
    {
      title: 'Season',
      dataIndex: 'seasonName',
      key: 'seasonName',
    },
    {
      title: 'Country',
      dataIndex: 'countryName',
      key: 'countryName',
    },
    {
      title: 'Type',
      dataIndex: 'typeName',
      key: 'typeName',
    },
    {
      title: 'Chief',
      dataIndex: 'chiefName',
      key: 'chiefName',
    },
    {
      title: 'Avg Rating',
      dataIndex: 'avgRating',
      key: 'avgRating',
      render: (value: number) => value ? value.toFixed(1) : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Dish) => (
        <div className="action-buttons">
          <Tooltip title="View">
            <Button
              icon={<EyeOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleView(record.id_dish);
              }}
            />
          </Tooltip>

          {isAdmin && (
            <>
              <Tooltip title="Edit">
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(record.id_dish);
                  }}
                />
              </Tooltip>
              <Tooltip title="Delete">
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(record.id_dish);
                  }}
                />
              </Tooltip>
            </>
          )}
        </div>
      ),
    },
  ];

  const filterComponents = (
    <>
      <Select
        placeholder="Season"
        allowClear
        style={{ width: 150 }}
        onChange={(value) => setSelectedSeason(value)}
      >
        {seasons.map((season) => (
          <Select.Option key={season.id_season} value={season.id_season}>
            {season.name_season}
          </Select.Option>
        ))}
      </Select>

      <Select
        placeholder="Country"
        allowClear
        style={{ width: 150 }}
        onChange={(value) => setSelectedCountry(value)}
      >
        {countries.map((country) => (
          <Select.Option key={country.id_country} value={country.id_country}>
            {country.name_country}
          </Select.Option>
        ))}
      </Select>

      <Select
        placeholder="Type"
        allowClear
        style={{ width: 150 }}
        onChange={(value) => setSelectedType(value)}
      >
        {dishTypes.map((type) => (
          <Select.Option key={type.id_group} value={type.id_group}>
            {type.type}
          </Select.Option>
        ))}
      </Select>
    </>
  );

  return (
    <div className="dish-list-page">
      <PageHeader
        title="Dishes"
        subtitle="Browse and manage dishes"
        extra={
          isAdmin && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/dishes/create')}
            >
              Add Dish
            </Button>
          )
        }
      />

      <DataTable
        dataSource={filteredDishes}
        columns={columns}
        loading={loading}
        rowKey="id_dish"
        onRowClick={(record) => handleView(record.id_dish)}
        onSearch={handleSearch}
        searchPlaceholder="Search dishes..."
        filters={filterComponents}
      />
    </div>
  );
};

export default DishList;
