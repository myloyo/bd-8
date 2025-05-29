import React, { useState, useEffect } from 'react';
import {
  Row, Col, Card, Statistic, List, Button,
  Typography, Spin, Empty, Divider
} from 'antd';
import {
  AppstoreOutlined, UserOutlined,
  StarOutlined, ShoppingOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  dishApi, humanApi, dishRatingApi,
  orderApi, reportApi
} from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import './DashboardPage.scss';

const { Title, Text } = Typography;

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDishes: 0,
    totalUsers: 0,
    totalRatings: 0,
    totalOrders: 0,
  });

  const [topRatedDishes, setTopRatedDishes] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch basic stats
        const [dishes, users, ratings, orders] = await Promise.all([
          dishApi.getAll(),
          humanApi.getAll(),
          dishRatingApi.getAll(),
          orderApi.getAll(),
        ]);

        setStats({
          totalDishes: dishes.length,
          totalUsers: users.length,
          totalRatings: ratings.length,
          totalOrders: orders.length,
        });

        // Fetch top rated dishes
        const ratingReport = await reportApi.getDishRatings(4);
        if (ratingReport.success) {
          setTopRatedDishes(ratingReport.data.slice(0, 5));
        }

        // Fetch recent orders
        // Normally we would fetch these with more details, 
        // but we'll simulate it with the basic order data
        const sortedOrders = [...orders].sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setRecentOrders(sortedOrders.slice(0, 5));

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard-page">
      <PageHeader
        title={isAdmin ? "Admin Dashboard" : "User Dashboard"}
        subtitle="Overview of restaurant database"
      />

      <Spin spinning={loading}>
        <Row gutter={[16, 16]} className="stat-cards">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Dishes"
                value={stats.totalDishes}
                prefix={<AppstoreOutlined />}
              />
              <Button
                type="link"
                onClick={() => navigate('/dishes')}
                className="stat-action"
              >
                View All
              </Button>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Users"
                value={stats.totalUsers}
                prefix={<UserOutlined />}
              />
              {isAdmin && (
                <Button
                  type="link"
                  onClick={() => navigate('/users')}
                  className="stat-action"
                >
                  View All
                </Button>
              )}
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Ratings"
                value={stats.totalRatings}
                prefix={<StarOutlined />}
              />
              {isAdmin && (
                <Button
                  type="link"
                  onClick={() => navigate('/ratings')}
                  className="stat-action"
                >
                  View All
                </Button>
              )}
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Orders"
                value={stats.totalOrders}
                prefix={<ShoppingOutlined />}
              />
              <Button
                type="link"
                onClick={() => navigate('/orders')}
                className="stat-action"
              >
                View All
              </Button>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="dashboard-lists">
          <Col xs={24} lg={12}>
            <Card
              title={
                <div className="card-title">
                  <StarOutlined /> Top Rated Dishes
                </div>
              }
              extra={
                <Button type="link" onClick={() => navigate('/reports')}>
                  View Report
                </Button>
              }
            >
              {topRatedDishes.length > 0 ? (
                <List
                  dataSource={topRatedDishes}
                  renderItem={item => (
                    <List.Item
                      actions={[
                        <Button
                          type="link"
                          onClick={() => navigate(`/dishes/${item.dish_id}`)}
                        >
                          View
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        title={item.dish_name}
                        description={
                          <div>
                            <Text strong>Rating: {Number(item.avg_rating).toFixed(1)}</Text>
                            <div className="dish-comment">
                              <Text type="secondary" ellipsis={{ tooltip: item.comments }}>
                                {item.comments}
                              </Text>
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="No rated dishes found" />
              )}
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title={
                <div className="card-title">
                  <ShoppingOutlined /> Recent Orders
                </div>
              }
              extra={
                <Button type="link" onClick={() => navigate('/orders')}>
                  View All
                </Button>
              }
            >
              {recentOrders.length > 0 ? (
                <List
                  dataSource={recentOrders}
                  renderItem={item => (
                    <List.Item
                      actions={[
                        <Button
                          type="link"
                          onClick={() => navigate(`/orders/${item.id_order}`)}
                        >
                          View
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        title={`Order #${item.id_order}`}
                        description={
                          <div>
                            <Text>User ID: {item.id_user}</Text>
                            <div>
                              <Text>Date: {new Date(item.date).toLocaleDateString()}</Text>
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="No recent orders found" />
              )}
            </Card>
          </Col>
        </Row>

        {isAdmin && (
          <Row gutter={[16, 16]} className="admin-actions">
            <Col span={24}>
              <Card>
                <Title level={4}>Administrative Actions</Title>
                <Divider />
                <div className="action-buttons-container">
                  <Button type="primary" onClick={() => navigate('/reports')}>
                    Generate Reports
                  </Button>
                  <Button onClick={() => navigate('/search')}>
                    Advanced Search
                  </Button>
                  <Button onClick={() => navigate('/dishes/create')}>
                    Add New Dish
                  </Button>
                  <Button onClick={() => navigate('/chiefs')}>
                    Manage Chiefs
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>
        )}
      </Spin>
    </div>
  );
};

export default DashboardPage;
