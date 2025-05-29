import React, { useState, useEffect } from 'react';
import { Button, message, Tag, Form, Input, InputNumber, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { humanApi } from '../../services/api';
import { type Human } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';

const UserList: React.FC = () => {
  const [users, setUsers] = useState<Human[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [userForm, setUserForm] = useState({
    name_user: '',
    email: '',
    age: '',
    id_country: '',
    sex: '',
  });
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await humanApi.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id_user',
      key: 'id_user',
      sorter: (a: Human, b: Human) => a.id_user - b.id_user,
    },
    {
      title: 'Name',
      dataIndex: 'name_user',
      key: 'name_user',
      sorter: (a: Human, b: Human) => a.name_user.localeCompare(b.name_user),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
      render: (age: string) => new Date(age).toLocaleDateString(),
    },
    {
      title: 'Sex',
      dataIndex: 'sex',
      key: 'sex',
      render: (sex: string) => (
        <Tag color={sex === 'female' ? 'pink' : 'blue'}>
          {sex}
        </Tag>
      ),
    },
  ];

  const onFinish = async () => {
    try {
      const payload = {
        ...userForm,
        name_user: userForm.name_user.trim(),
        email: userForm.email.trim(),
        age: userForm.age.trim(),
        id_country: Number(userForm.id_country),
        sex: userForm.sex,
      };
      await humanApi.create(payload);
      message.success('User created!');
      loadData();
      setUserForm({ name_user: '', email: '', age: '', id_country: '', sex: '' });
      setShowForm(false);
    } catch (e) {
      message.error('Failed to create user');
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const filteredUsers = searchText
    ? users.filter(user =>
      user.name_user.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase())
    )
    : users;

  return (
    <div className="user-list-page">
      <div style={{ marginBottom: 16 }}>
        <Link to="/register">Регистрация</Link> | <Link to="/login">Вход</Link>
      </div>
      <PageHeader
        title="Users"
        subtitle="Manage user records"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Add User'}
          </Button>
        }
      />

      {showForm && (
        <Form
          layout="vertical"
          onFinish={onFinish}
          style={{ maxWidth: 400, margin: '20px auto' }}
        >
          <Form.Item name="name_user" label="Name" rules={[{ required: true, message: 'Введите имя' }, { validator: (_, value) => value && value.trim() !== '' ? Promise.resolve() : Promise.reject('Введите имя') }]}>
            <Input value={userForm.name_user} onChange={e => setUserForm(f => ({ ...f, name_user: e.target.value }))} autoComplete="off" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Введите email' }, { type: 'email', message: 'Некорректный email' }]}>
            <Input value={userForm.email} onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))} autoComplete="off" />
          </Form.Item>
          <Form.Item name="age" label="Age (YYYY-MM-DD)" rules={[{ required: true, message: 'Введите дату рождения' }, { validator: (_, value) => value && value.trim() !== '' ? Promise.resolve() : Promise.reject('Введите дату рождения') }]}>
            <Input value={userForm.age} onChange={e => setUserForm(f => ({ ...f, age: e.target.value }))} autoComplete="off" />
          </Form.Item>
          <Form.Item name="id_country" label="Country ID" rules={[{ required: true, message: 'Введите ID страны' }]}>
            <InputNumber min={1} style={{ width: '100%' }} value={userForm.id_country === '' ? undefined : Number(userForm.id_country)} onChange={v => setUserForm(f => ({ ...f, id_country: v === null ? '' : String(v) }))} />
          </Form.Item>
          <Form.Item name="sex" label="Sex" rules={[{ required: true, message: 'Выберите пол' }]}>
            <Select value={userForm.sex} onChange={v => setUserForm(f => ({ ...f, sex: v }))}>
              <Select.Option value="male">male</Select.Option>
              <Select.Option value="female">female</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block> Add </Button>
          </Form.Item>
        </Form>
      )}

      <DataTable
        dataSource={filteredUsers}
        columns={columns}
        loading={loading}
        rowKey="id_user"
        onSearch={handleSearch}
        searchPlaceholder="Search users by name or email..."
      />
    </div>
  );
};

export default UserList;
