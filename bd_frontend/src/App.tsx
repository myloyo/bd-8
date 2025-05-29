import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/dashboard/DashboardPage';
import DishList from './pages/dishes/DishList';
import DishDetail from './pages/dishes/DishDetail';
import DishForm from './pages/dishes/DishForm';
import SearchPage from './pages/search/SearchPage';
import ReportsPage from './pages/reports/ReportsPage';
import './styles/main.scss';

// Admin routes
import CountryList from '../src/pages/countries/CountryList';
import UserList from '../src/pages/users/UserList';
import ChiefList from '../src/pages/chiefs/ChiefList';
import OrderList from '../src/pages/orders/OrdersPage';
import ProductList from '../src/pages/products/ProductList';
import RecipeList from '../src/pages/recipes/RecipeList';
import SeasonList from '../src/pages/seasons/SeasonList';
import DishTypeList from '../src/pages/dish-types/DishTypeList';
import RatingList from '../src/pages/ratings/RatingList';
import SettingsPage from '../src/pages/settings/SettingsPage';

// Импортируем страницы логина и регистрации
import Login from './pages/users/Login';
import Register from './pages/users/Register';

import ProductForm from './pages/products/ProductForm';
import DishTypeForm from './pages/dish-types/DishTypeForm';
import CountryForm from './pages/countries/CountryForm';
import RecipeForm from './pages/recipes/RecipeForm';
import SeasonForm from './pages/seasons/SeasonForm';

const theme = {
  token: {
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#f5222d',
    colorInfo: '#1890ff',
    borderRadius: 4,
  },
};

function App() {
  return (
    <ConfigProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<AppLayout />}>
              {/* Common routes */}
              <Route index element={<DashboardPage />} />
              <Route path="dishes" element={<DishList />} />
              <Route path="dishes/:id" element={<DishDetail />} />
              <Route path="dishes/create" element={<DishForm />} />
              <Route path="dishes/:id/edit" element={<DishForm />} />
              <Route path="orders" element={<OrderList />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="reports" element={<ReportsPage />} />

              {/* Admin routes */}
              <Route path="countries" element={<CountryList />} />
              <Route path="users" element={<UserList />} />
              <Route path="chiefs" element={<ChiefList />} />
              <Route path="products" element={<ProductList />} />
              <Route path="recipes" element={<RecipeList />} />
              <Route path="seasons" element={<SeasonList />} />
              <Route path="dish-types" element={<DishTypeList />} />
              <Route path="ratings" element={<RatingList />} />
              <Route path="settings" element={<SettingsPage />} />

              <Route path="products/create" element={<ProductForm />} />
              <Route path="dish-types/create" element={<DishTypeForm />} />
              <Route path="countries/create" element={<CountryForm />} />
              <Route path="recipes/create" element={<RecipeForm />} />
              <Route path="seasons/create" element={<SeasonForm />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
