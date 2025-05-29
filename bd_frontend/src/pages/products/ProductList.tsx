import React, { useState, useEffect } from 'react';
import { Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { productApi } from '../../services/api';
import { type Product } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await productApi.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      message.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const filteredProducts = searchText
    ? products.filter(product => product.name_product.toLowerCase().includes(searchText.toLowerCase()))
    : products;

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id_prod',
      key: 'id_prod',
      sorter: (a: Product, b: Product) => a.id_prod - b.id_prod,
    },
    {
      title: 'Name',
      dataIndex: 'name_product',
      key: 'name_product',
      sorter: (a: Product, b: Product) => a.name_product.localeCompare(b.name_product),
    },
    {
      title: 'Calories',
      dataIndex: 'calories',
      key: 'calories',
      sorter: (a: Product, b: Product) => a.calories - b.calories,
    },
    {
      title: 'Cost',
      dataIndex: 'cost_product',
      key: 'cost_product',
      sorter: (a: Product, b: Product) => a.cost_product - b.cost_product,
      render: (cost: number) => `$${cost}`,
    },
  ];

  return (
    <div className="product-list-page">
      <PageHeader
        title="Products"
        subtitle="Manage product records"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/products/create')}
          >
            Add Product
          </Button>
        }
      />

      <DataTable
        dataSource={filteredProducts}
        columns={columns}
        loading={loading}
        rowKey="id_prod"
        onSearch={handleSearch}
        searchPlaceholder="Search products..."
      />
    </div>
  );
};

export default ProductList;
