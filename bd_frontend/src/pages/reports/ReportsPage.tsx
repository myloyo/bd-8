import React, { useState, useCallback } from 'react';
import {
  Card, Tabs, Button, Form, Select, InputNumber,
  Table, Empty, Alert, Spin, Typography, Divider
} from 'antd';
import { dishApi, reportApi, seasonApi, countryApi, dishTypeApi, chiefApi } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import './ReportsPage.scss';

const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { Option } = Select;

const ReportsPage: React.FC = () => {
  const [seasonForm] = Form.useForm();
  const [ratingForm] = Form.useForm();

  const [activeTab, setActiveTab] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [seasonalDishes, setSeasonalDishes] = useState<any[]>([]);
  const [dishRatings, setDishRatings] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [dishTypes, setDishTypes] = useState<any[]>([]);
  const [chiefs, setChiefs] = useState<any[]>([]);
  const [refDataLoaded, setRefDataLoaded] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchColumns, setSearchColumns] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Load seasons for dropdown
  React.useEffect(() => {
    const loadSeasons = async () => {
      try {
        const data = await seasonApi.getAll();
        setSeasons(data);
      } catch (err) {
        console.error('Error loading seasons:', err);
      }
    };

    loadSeasons();
  }, []);

  // Load reference data for mapping names
  React.useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const [countryData, typeData, chiefData, seasonData] = await Promise.all([
          countryApi.getAll(),
          dishTypeApi.getAll(),
          chiefApi.getAll(),
          seasonApi.getAll(),
        ]);
        setCountries(countryData);
        setDishTypes(typeData);
        setChiefs(chiefData);
        setSeasons(seasonData);
        setRefDataLoaded(true);
      } catch (err) {
        setRefDataLoaded(false);
        console.error('Error loading reference data:', err);
      }
    };
    loadReferenceData();
  }, []);

  // enrich-функция
  const enrichDishData = useCallback((dishes: any[]) => {
    return dishes.map((dish) => ({
      ...dish,
      season_name: seasons.find(s => s.id_season === dish.id_season)?.name_season || dish.id_season,
      country_name: countries.find(c => c.id_country === dish.id_country)?.name_country || dish.id_country,
      chief_name: chiefs.find(c => c.id_chief === dish.id_chief)?.name_chief || dish.id_chief,
      dish_type: dishTypes.find(dt => dt.id_group === dish.id_group)?.type || dish.id_group,
    }));
  }, [seasons, countries, chiefs, dishTypes]);

  const handleGetSeasonalDishes = async (values: any) => {
    if (!refDataLoaded) return;
    setLoading(true);
    setError(null);
    try {
      const result: any[] = await dishApi.getSeasonalDishes(values.season);
      const mapped = enrichDishData(result);
      setSeasonalDishes(mapped);
    } catch (err) {
      console.error('Error getting seasonal dishes:', err);
      setError('An error occurred. Please try again.');
      setSeasonalDishes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGetDishRatings = async (values: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await reportApi.getDishRatings(values.minRating);
      setDishRatings(result);
    } catch (err) {
      console.error('Error getting dish ratings:', err);
      setError('An error occurred. Please try again.');
      setDishRatings([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Поиск блюд ---
  const handleSearch = async (searchParams: { country_id?: number; season_id?: number; group_id?: number }) => {
    if (!refDataLoaded) return;
    setSearchLoading(true);
    setSearchError(null);
    try {
      const response: any[] = await dishApi.search(searchParams);
      const mapped = enrichDishData(response);
      setSearchResults(mapped);
      // Динамические колонки
      if (mapped.length > 0) {
        const first = mapped[0];
        const cols = Object.keys(first).map(key => ({
          title: key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          dataIndex: key,
          key: key,
          render: (text: any) => text === null ? 'N/A' : text,
        }));
        setSearchColumns(cols);
      } else {
        setSearchColumns([]);
      }
    } catch (err) {
      setSearchError('Ошибка поиска');
      setSearchResults([]);
      setSearchColumns([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const seasonalDishColumns = [
    { title: 'ID', dataIndex: 'id_dish', key: 'id_dish' },
    { title: 'Name', dataIndex: 'name_dish', key: 'name_dish' },
    { title: 'Season', dataIndex: 'season_name', key: 'season_name' },
    { title: 'Country', dataIndex: 'country_name', key: 'country_name' },
    { title: 'Type', dataIndex: 'dish_type', key: 'dish_type' },
    { title: 'Chief', dataIndex: 'chief_name', key: 'chief_name' },
  ];

  const dishRatingColumns = [
    {
      title: 'Dish ID',
      dataIndex: 'dish_id',
      key: 'dish_id',
    },
    {
      title: 'Dish Name',
      dataIndex: 'dish_name',
      key: 'dish_name',
    },
    {
      title: 'Average Rating',
      dataIndex: 'avg_rating',
      key: 'avg_rating',
      render: (text: string) => Number(text).toFixed(1),
    },
    {
      title: 'Comments',
      dataIndex: 'comments',
      key: 'comments',
      ellipsis: true,
    },
  ];

  return (
    <div className="reports-page">
      <PageHeader
        title="Reports"
        subtitle="Generate reports based on database stored procedures"
      />

      <Card className="reports-card">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Seasonal Dishes" key="1">
            <Title level={4}>Seasonal Dishes Report</Title>
            <Text type="secondary">
              Find all dishes available in a specific season
            </Text>

            <Divider />

            <Form
              form={seasonForm}
              layout="inline"
              onFinish={handleGetSeasonalDishes}
              className="report-form"
            >
              <Form.Item
                name="season"
                label="Season"
                rules={[{ required: true, message: 'Please select a season' }]}
              >
                <Select style={{ width: 200 }}>
                  {seasons.map((season) => (
                    <Option key={season.id_season} value={season.id_season}>
                      {season.name_season}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading && activeTab === '1'}
                >
                  Generate Report
                </Button>
              </Form.Item>
            </Form>

            <div className="report-results">
              <Spin spinning={loading && activeTab === '1'}>
                {error && activeTab === '1' && (
                  <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                )}

                {seasonalDishes.length > 0 ? (
                  <Table
                    dataSource={seasonalDishes}
                    columns={seasonalDishColumns}
                    rowKey="id_dish"
                    pagination={{ pageSize: 10 }}
                  />
                ) : (
                  <Empty description="No data available. Please generate a report." />
                )}
              </Spin>
            </div>
          </TabPane>

          <TabPane tab="Dish Ratings" key="2">
            <Title level={4}>Dish Ratings Report</Title>
            <Text type="secondary">
              View dishes with their average ratings and comments
            </Text>

            <Divider />

            <Form
              form={ratingForm}
              layout="inline"
              onFinish={handleGetDishRatings}
              className="report-form"
              initialValues={{ minRating: 3 }}
            >
              <Form.Item
                name="minRating"
                label="Minimum Rating"
                rules={[{ required: true, message: 'Please enter a minimum rating' }]}
              >
                <InputNumber min={1} max={5} style={{ width: 120 }} />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading && activeTab === '2'}
                >
                  Generate Report
                </Button>
              </Form.Item>
            </Form>

            <div className="report-results">
              <Spin spinning={loading && activeTab === '2'}>
                {error && activeTab === '2' && (
                  <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                )}

                {dishRatings.length > 0 ? (
                  <Table
                    dataSource={dishRatings}
                    columns={dishRatingColumns}
                    rowKey="dish_id"
                    pagination={{ pageSize: 10 }}
                  />
                ) : (
                  <Empty description="No data available. Please generate a report." />
                )}
              </Spin>
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default ReportsPage;
