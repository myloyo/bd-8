import React, { useState, useEffect } from 'react';
import { Button, message, Form, Input, InputNumber, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { chiefApi } from '../../services/api';
import { type Chief } from '../../types/index';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';

const ChiefList: React.FC = () => {
  const [chiefs, setChiefs] = useState<Chief[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [form] = Form.useForm();
  const [chiefForm, setChiefForm] = useState({
    name_chief: '',
    exp_years: '',
    id_country: '',
  });
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await chiefApi.getAll();
      setChiefs(data);
    } catch (error) {
      console.error('Error loading chiefs:', error);
      message.error('Failed to load chiefs');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id_chief',
      key: 'id_chief',
      sorter: (a: Chief, b: Chief) => a.id_chief - b.id_chief,
    },
    {
      title: 'Name',
      dataIndex: 'name_chief',
      key: 'name_chief',
      sorter: (a: Chief, b: Chief) => a.name_chief.localeCompare(b.name_chief),
    },
    {
      title: 'Experience (Years)',
      dataIndex: 'exp_years',
      key: 'exp_years',
      sorter: (a: Chief, b: Chief) => a.exp_years - b.exp_years,
    },
  ];

  const onFinish = async () => {
    try {
      const payload = {
        name_chief: chiefForm.name_chief.trim(),
        exp_years: Number(chiefForm.exp_years),
        id_country: Number(chiefForm.id_country),
      };
      await chiefApi.create(payload);
      message.success('Chief created!');
      loadData();
      setChiefForm({ name_chief: '', exp_years: '', id_country: '' });
      setShowForm(false);
    } catch (e: any) {
      if (e.response && e.response.data && e.response.data.message) {
        message.error(e.response.data.message);
      } else {
        message.error('Failed to create chief');
      }
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const filteredChiefs = searchText
    ? chiefs.filter(chief => chief.name_chief.toLowerCase().includes(searchText.toLowerCase()))
    : chiefs;

  return (
    <div className="chief-list-page">
      <PageHeader
        title="Chiefs"
        subtitle="Manage chief records"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Add Chief'}
          </Button>
        }
      />

      {showForm && (
        <Form
          layout="vertical"
          onFinish={onFinish}
          style={{ maxWidth: 400, margin: '20px auto' }}
        >
          <Form.Item name="name_chief" label="Chief Name" rules={[{ required: true, message: 'Введите имя шефа' }, { validator: (_, value) => value && value.trim() !== '' ? Promise.resolve() : Promise.reject('Введите имя шефа') }]}>
            <Input
              value={chiefForm.name_chief}
              onChange={e => setChiefForm(f => ({ ...f, name_chief: e.target.value }))}
              autoComplete="off"
            />
          </Form.Item>
          <Form.Item name="exp_years" label="Experience (Years)" rules={[{ required: true, message: 'Введите стаж' }]}>
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              value={chiefForm.exp_years === '' ? undefined : Number(chiefForm.exp_years)}
              onChange={v => setChiefForm(f => ({ ...f, exp_years: v === null ? '' : String(v) }))}
            />
          </Form.Item>
          <Form.Item name="id_country" label="Country ID" rules={[{ required: true, message: 'Введите ID страны' }]}>
            <InputNumber
              min={1}
              style={{ width: '100%' }}
              value={chiefForm.id_country === '' ? undefined : Number(chiefForm.id_country)}
              onChange={v => setChiefForm(f => ({ ...f, id_country: v === null ? '' : String(v) }))}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block> Add </Button>
          </Form.Item>
        </Form>
      )}

      <DataTable
        dataSource={filteredChiefs}
        columns={columns}
        loading={loading}
        rowKey="id_chief"
        onSearch={handleSearch}
        searchPlaceholder="Search chiefs..."
      />
    </div>
  );
};

export default ChiefList;
