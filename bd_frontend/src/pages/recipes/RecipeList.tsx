import React, { useState, useEffect } from 'react';
import { Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { recipeApi } from '../../services/api';
import { type Recipe } from '../../types/index';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';

const RecipeList: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await recipeApi.getAll();
      const dataWithKey = data.map(item => ({
        ...item,
        uniqueKey: `${item.id_dish}-${item.id_product}`
      }));
      setRecipes(dataWithKey);
    } catch (error) {
      console.error('Error loading recipes:', error);
      message.error('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const filteredRecipes = searchText
    ? recipes.filter(recipe =>
      recipe.id_dish.toString().includes(searchText) ||
      recipe.id_product.toString().includes(searchText)
    )
    : recipes;

  const columns = [
    {
      title: 'Dish ID',
      dataIndex: 'id_dish',
      key: 'id_dish',
      sorter: (a: Recipe, b: Recipe) => a.id_dish - b.id_dish,
    },
    {
      title: 'Product ID',
      dataIndex: 'id_product',
      key: 'id_product',
      sorter: (a: Recipe, b: Recipe) => a.id_product - b.id_product,
    },
    {
      title: 'Grams',
      dataIndex: 'gramms',
      key: 'gramms',
      sorter: (a: Recipe, b: Recipe) => a.gramms - b.gramms,
    },
  ];

  return (
    <div className="recipe-list-page">
      <PageHeader
        title="Recipes"
        subtitle="Manage recipe records"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/recipes/create')}
          >
            Add Recipe
          </Button>
        }
      />

      <DataTable
        dataSource={filteredRecipes}
        columns={columns}
        loading={loading}
        rowKey="uniqueKey"
        onSearch={handleSearch}
        searchPlaceholder="Search recipes by Dish/Product ID..."
      />
    </div>
  );
};

export default RecipeList;
