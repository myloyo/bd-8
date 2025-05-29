// src/pages/orders/index.tsx
import React, { useState, useEffect } from 'react';
import { Button, message, Form, InputNumber } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { orderApi } from '../../services/api';
import { type OrderWithDetails } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';

const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { role } = useAuth();
  const isAdmin = role === 'admin';
  const [showForm, setShowForm] = useState(false);
  const [form] = Form.useForm();
  const [orderForm, setOrderForm] = useState({
    id_user: '',
    id_dish: '',
  });
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await orderApi.getAll();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
      message.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id_order',
      key: 'id_order',
      sorter: (a: OrderWithDetails, b: OrderWithDetails) => a.id_order - b.id_order,
    },
    {
      title: 'Dish',
      dataIndex: 'dishName',
      key: 'dishName',
    },
    {
      title: 'User',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  const onFinish = async () => {
    try {
      const payload = {
        id_user: Number(orderForm.id_user),
        id_dish: Number(orderForm.id_dish),
      };
      await orderApi.create(payload);
      message.success('Order created!');
      loadData();
      setOrderForm({ id_user: '', id_dish: '' });
      setShowForm(false);
    } catch (e) {
      message.error('Failed to create order');
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const filteredOrders = searchText
    ? orders.filter(order =>
      (order.userName && order.userName.toLowerCase().includes(searchText.toLowerCase())) ||
      (order.dishName && order.dishName.toLowerCase().includes(searchText.toLowerCase())) ||
      (order.date && new Date(order.date).toLocaleDateString().includes(searchText))
    )
    : orders;

  return (
    <div className="order-list-page">
      <PageHeader
        title="Orders"
        subtitle="Manage order records"
        extra={
          isAdmin && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Cancel' : 'Add Order'}
            </Button>
          )
        }
      />

      {showForm && (
        <Form
          layout="vertical"
          onFinish={onFinish}
          style={{ maxWidth: 400, margin: '20px auto' }}
        >
          <Form.Item name="id_user" label="User ID" rules={[{ required: true, message: 'Введите ID пользователя' }]}>
            <InputNumber min={1} style={{ width: '100%' }} value={orderForm.id_user === '' ? undefined : Number(orderForm.id_user)} onChange={v => setOrderForm(f => ({ ...f, id_user: v === null ? '' : String(v) }))} />
          </Form.Item>
          <Form.Item name="id_dish" label="Dish ID" rules={[{ required: true, message: 'Введите ID блюда' }]}>
            <InputNumber min={1} style={{ width: '100%' }} value={orderForm.id_dish === '' ? undefined : Number(orderForm.id_dish)} onChange={v => setOrderForm(f => ({ ...f, id_dish: v === null ? '' : String(v) }))} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block> Add </Button>
          </Form.Item>
        </Form>
      )}

      <DataTable
        dataSource={filteredOrders}
        columns={columns}
        loading={loading}
        rowKey="id_order"
        onSearch={handleSearch}
        searchPlaceholder="Search orders by user, dish or date..."
      />
    </div>
  );
};

export default OrderList;
