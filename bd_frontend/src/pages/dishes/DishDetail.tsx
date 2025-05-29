import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Tabs, Button, Rate, List, message,
  Table, Typography, Empty, Space, Card, Select
} from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import {
  dishApi, dishRatingApi, recipeApi,
  chiefApi, seasonApi
} from '../../services/api';
import {
  type RecipeWithDetails, type Chief, type Season,
  type DishRatingWithDetails, type DishWithDetails
} from '../../types/index';
import DetailView from '../../components/common/DetailView';
import PageHeader from '../../components/common/PageHeader';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const DishDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dishId = Number(id);
  const navigate = useNavigate();
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  const [dish, setDish] = useState<DishWithDetails | null>(null);
  const [ratings, setRatings] = useState<DishRatingWithDetails[]>([]);
  const [recipes, setRecipes] = useState<RecipeWithDetails[]>([]);
  const [dishCost, setDishCost] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('1');
  const [chiefs, setChiefs] = useState<Chief[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch dish details
        const dishData = await dishApi.getById(dishId);

        // Fetch reference data
        const [chiefsData, seasonsData] = await Promise.all([
          chiefApi.getAll(),
          seasonApi.getAll()
        ]);
        setChiefs(chiefsData);
        setSeasons(seasonsData);

        // Add details to dish
        const seasonName = seasonsData.find(s => s.id_season === dishData.id_season)?.name_season || '';
        const chiefName = chiefsData.find(c => c.id_chief === dishData.id_chief)?.name_chief || '';
        // Для countryName и typeName нужны справочники стран и типов блюд, если они есть в props или context
        // Здесь оставим пустыми, если нет
        const dishWithDetails: DishWithDetails = {
          ...dishData,
          seasonName,
          chiefName,
        };
        setDish(dishWithDetails);

        // Fetch all ratings and filter by dishId
        const allRatings = await dishRatingApi.getAll();
        const ratingsData = allRatings.filter(r => r.id_dish === dishId);
        setRatings(ratingsData as DishRatingWithDetails[]);

        // Fetch all recipes and filter by dishId
        const allRecipes = await recipeApi.getAll();
        const recipesData = allRecipes.filter(r => r.id_dish === dishId);
        setRecipes(recipesData as RecipeWithDetails[]);

        // Calculate dish cost
        const costResult = await dishApi.getCost(dishId);
        if (costResult && typeof costResult.cost === 'number') {
          setDishCost(costResult.cost);
        }
      } catch (error) {
        console.error('Error fetching dish details:', error);
        message.error('Failed to load dish details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dishId]);

  const handleEdit = () => {
    navigate(`/dishes/${dishId}/edit`);
  };

  const handleDelete = () => {
    // Implement delete functionality
  };

  const handleBack = () => {
    navigate('/dishes');
  };

  const handleChangeChef = async (newChiefId: number) => {
    try {
      const result = await dishApi.changeChef(dishId, newChiefId);
      if (result.success) {
        message.success('Chef changed successfully');
        // Reload dish data
        const dishData = await dishApi.getById(dishId);
        const seasonName = seasons.find(s => s.id_season === dishData.id_season)?.name_season || '';
        const chiefName = chiefs.find(c => c.id_chief === dishData.id_chief)?.name_chief || '';
        const dishWithDetails: DishWithDetails = {
          ...dishData,
          seasonName,
          chiefName,
        };
        setDish(dishWithDetails);
      } else {
        message.error(result.message || 'Failed to change chef');
      }
    } catch (error) {
      console.error('Error changing chef:', error);
      message.error('Failed to change chef');
    }
  };

  if (!dish) {
    return loading ? <div>Loading...</div> : <div>Dish not found</div>;
  }

  const detailItems = [
    { label: 'ID', value: dish.id_dish },
    { label: 'Name', value: dish.name_dish },
    { label: 'Season', value: dish.seasonName },
    { label: 'Country', value: dish.countryName },
    { label: 'Type', value: dish.typeName },
    { label: 'Chief', value: dish.chiefName },
    {
      label: 'Average Rating', value: dish.avgRating ?
        <Rate disabled defaultValue={Math.round(dish.avgRating)} /> : 'Not rated'
    },
    { label: 'Estimated Cost', value: dishCost ? `$${dishCost.toFixed(2)}` : 'Calculating...' },
  ];

  const recipeColumns = [
    {
      title: 'Product',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Amount (g)',
      dataIndex: 'gramms',
      key: 'gramms',
    },
    {
      title: 'Calories',
      dataIndex: 'calories',
      key: 'calories',
    },
    {
      title: 'Cost',
      dataIndex: 'cost_product',
      key: 'cost_product',
      render: (cost: number) => `$${cost}`,
    },
  ];

  return (
    <div className="dish-detail-page">
      <PageHeader
        title={`Dish: ${dish.name_dish}`}
        subtitle={`ID: ${dish.id_dish}`}
        extra={
          <Space>
            <Button type="primary" onClick={handleBack}>
              Back to List
            </Button>
            {isAdmin && (
              <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
                Edit
              </Button>
            )}
          </Space>
        }
      />

      <DetailView
        title="Dish Details"
        loading={loading}
        items={detailItems}
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Recipe" key="1">
            <div className="recipe-section">
              <Title level={4}>Ingredients</Title>
              {recipes.length > 0 ? (
                <Table
                  dataSource={recipes}
                  columns={recipeColumns}
                  rowKey={(record) => `${record.id_dish}-${record.id_product}`}
                  pagination={false}
                />
              ) : (
                <Empty description="No recipe information available" />
              )}
            </div>
          </TabPane>

          <TabPane tab="Ratings" key="2">
            <div className="ratings-section">
              <Title level={4}>Customer Ratings</Title>
              {ratings.length > 0 ? (
                <List
                  itemLayout="horizontal"
                  dataSource={ratings}
                  renderItem={item => (
                    <List.Item>
                      <Card style={{ width: '100%' }}>
                        <div className="rating-header">
                          <div>
                            <Rate disabled value={item.rate} />
                            <Text style={{ marginLeft: 8 }}>
                              by {item.userName} on {new Date(item.date).toLocaleDateString()}
                            </Text>
                          </div>
                          {isAdmin && (
                            <Button
                              danger
                              icon={<DeleteOutlined />}
                              size="small"
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                        <div className="rating-comment">
                          {item.comment}
                        </div>
                      </Card>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="No ratings yet" />
              )}
            </div>
          </TabPane>

          {isAdmin && (
            <TabPane tab="Administration" key="3">
              <div className="admin-section">
                <Title level={4}>Change Chef</Title>
                <div className="chef-change-section">
                  <Text>Current Chef: {dish.chiefName}</Text>
                  <div className="chief-select">
                    <Select
                      placeholder="Select new chef"
                      style={{ width: 200 }}
                      onChange={handleChangeChef}
                    >
                      {chiefs.map(chief => (
                        <Select.Option
                          key={chief.id_chief}
                          value={chief.id_chief}
                          disabled={chief.id_chief === dish.id_chief}
                        >
                          {chief.name_chief} ({chief.exp_years} years exp.)
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>
            </TabPane>
          )}
        </Tabs>
      </DetailView>
    </div>
  );
};

export default DishDetail;
