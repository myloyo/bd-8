import React from 'react';
import { Layout, Menu, Button, theme, Dropdown } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  UserOutlined, DatabaseOutlined, 
  HomeOutlined, TeamOutlined, 
  AppstoreOutlined, ShoppingOutlined,
  FileTextOutlined, SettingOutlined,
  SearchOutlined, LogoutOutlined,
  MenuUnfoldOutlined, MenuFoldOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import './AppLayout.scss';

const { Header, Content, Sider } = Layout;

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const { role, setRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = theme.useToken();

  const toggleRole = () => {
    setRole(role === 'admin' ? 'user' : 'admin');
  };

  const userMenu = [
    { key: '/', icon: <HomeOutlined />, label: 'Home' },
    { key: '/dishes', icon: <AppstoreOutlined />, label: 'Dishes' },
    { key: '/orders', icon: <ShoppingOutlined />, label: 'Orders' },
    { key: '/search', icon: <SearchOutlined />, label: 'Search' },
  ];

  const adminMenu = [
    { key: '/', icon: <HomeOutlined />, label: 'Dashboard' },
    {
      key: 'data',
      icon: <DatabaseOutlined />,
      label: 'Data Management',
      children: [
        { key: '/dishes', icon: <AppstoreOutlined />, label: 'Dishes' },
        { key: '/dish-types', icon: <AppstoreOutlined />, label: 'Dish Types' },
        { key: '/countries', icon: <AppstoreOutlined />, label: 'Countries' },
        { key: '/seasons', icon: <AppstoreOutlined />, label: 'Seasons' },
        { key: '/products', icon: <ShoppingOutlined />, label: 'Products' },
        { key: '/recipes', icon: <FileTextOutlined />, label: 'Recipes' },
      ]
    },
    { key: '/users', icon: <UserOutlined />, label: 'Users' },
    { key: '/chiefs', icon: <TeamOutlined />, label: 'Chiefs' },
    { key: '/ratings', icon: <AppstoreOutlined />, label: 'Ratings' },
    { key: '/orders', icon: <ShoppingOutlined />, label: 'Orders' },
    { key: '/reports', icon: <FileTextOutlined />, label: 'Reports' },
    { key: '/search', icon: <SearchOutlined />, label: 'Search' },
    { key: '/settings', icon: <SettingOutlined />, label: 'Settings' },
  ];

  const items = role === 'admin' ? adminMenu : userMenu;

  const profileItems = [
    {
      key: '1',
      label: 'Profile',
      icon: <UserOutlined />,
    },
    {
      key: '2',
      label: 'Toggle Role',
      icon: <SettingOutlined />,
      onClick: toggleRole,
    },
    {
      key: '3',
      label: 'Logout',
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        width={220} 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        className="app-sider"
        trigger={null}
      >
        <div className="logo">
          <h2>{collapsed ? 'RDB' : 'Restaurant DB'}</h2>
        </div>
        <Menu
          theme="dark"
          defaultSelectedKeys={['/']}
          selectedKeys={[location.pathname]}
          mode="inline"
          items={items}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header className="app-header" style={{ background: token.colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="toggle-button"
          />
          
          <div className="header-right">
            <span className="role-badge">
              {role === 'admin' ? 'Administrator' : 'User'}
            </span>
            <Dropdown menu={{ items: profileItems }} placement="bottomRight">
              <Button shape="circle" icon={<UserOutlined />} />
            </Dropdown>
          </div>
        </Header>
        <Content className="app-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
