import React, { useState, useEffect } from 'react';
import { Button, message, Rate, Form, Input, InputNumber } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { dishRatingApi } from '../../services/api';
import { type DishRating } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';

const RatingList: React.FC = () => {
  const [ratings, setRatings] = useState<DishRating[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [ratingForm, setRatingForm] = useState({
    id_user: '',
    id_dish: '',
    rate: '',
    comment: '',
  });
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await dishRatingApi.getAll();
      setRatings(data);
    } catch (error) {
      console.error('Error loading ratings:', error);
      message.error('Failed to load ratings');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id_rate',
      key: 'id_rate',
      sorter: (a: DishRating, b: DishRating) => a.id_rate - b.id_rate,
    },
    {
      title: 'User ID',
      dataIndex: 'id_user',
      key: 'id_user',
    },
    {
      title: 'Dish ID',
      dataIndex: 'id_dish',
      key: 'id_dish',
    },
    {
      title: 'Rating',
      dataIndex: 'rate',
      key: 'rate',
      render: (rate: number) => <Rate disabled defaultValue={rate} />,
    },
    {
      title: 'Comment',
      dataIndex: 'comment',
      key: 'comment',
      ellipsis: true,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: DishRating, b: DishRating) =>
        new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
  ];

  const onFinish = async () => {
    try {
      const payload = {
        user_id: Number(ratingForm.id_user),
        dish_id: Number(ratingForm.id_dish),
        rate: Number(ratingForm.rate),
        comment: ratingForm.comment.trim(),
      };
      await dishRatingApi.create(payload);
      message.success('Rating created!');
      loadData();
      setRatingForm({ id_user: '', id_dish: '', rate: '', comment: '' });
      setShowForm(false);
    } catch (e) {
      message.error('Failed to create rating');
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const filteredRatings = searchText
    ? ratings.filter(rating =>
      rating.id_user.toString().includes(searchText) ||
      rating.id_dish.toString().includes(searchText) ||
      (rating.comment && rating.comment.toLowerCase().includes(searchText.toLowerCase()))
    )
    : ratings;

  return (
    <div className="rating-list-page">
      <PageHeader
        title="Ratings"
        subtitle="Manage rating records"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Add Rating'}
          </Button>
        }
      />

      {showForm && (
        <Form
          layout="vertical"
          onFinish={onFinish}
          style={{ maxWidth: 400, margin: '20px auto' }}
        >
          <Form.Item name="id_user" label="User ID" rules={[{ required: true, message: 'Введите ID пользователя' }]}>
            <InputNumber min={1} style={{ width: '100%' }} value={ratingForm.id_user === '' ? undefined : Number(ratingForm.id_user)} onChange={v => setRatingForm(f => ({ ...f, id_user: v === null ? '' : String(v) }))} />
          </Form.Item>
          <Form.Item name="id_dish" label="Dish ID" rules={[{ required: true, message: 'Введите ID блюда' }]}>
            <InputNumber min={1} style={{ width: '100%' }} value={ratingForm.id_dish === '' ? undefined : Number(ratingForm.id_dish)} onChange={v => setRatingForm(f => ({ ...f, id_dish: v === null ? '' : String(v) }))} />
          </Form.Item>
          <Form.Item name="rate" label="Rating" rules={[{ required: true, message: 'Введите рейтинг' }]}>
            <InputNumber min={1} max={5} style={{ width: '100%' }} value={ratingForm.rate === '' ? undefined : Number(ratingForm.rate)} onChange={v => setRatingForm(f => ({ ...f, rate: v === null ? '' : String(v) }))} />
          </Form.Item>
          <Form.Item name="comment" label="Comment" rules={[{ validator: (_, value) => !value || value.trim() !== '' ? Promise.resolve() : Promise.reject('Введите комментарий') }]}>
            <Input.TextArea value={ratingForm.comment} onChange={e => setRatingForm(f => ({ ...f, comment: e.target.value }))} autoComplete="off" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block> Add </Button>
          </Form.Item>
        </Form>
      )}

      <DataTable
        dataSource={filteredRatings}
        columns={columns}
        loading={loading}
        rowKey="id_rate"
        onSearch={handleSearch}
        searchPlaceholder="Search ratings by user, dish or comment..."
      />
    </div>
  );
};

export default RatingList;
