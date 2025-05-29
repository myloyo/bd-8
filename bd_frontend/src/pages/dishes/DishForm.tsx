import React, { useState } from 'react';
import { Form, Input, InputNumber, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { dishApi } from '../../services/api';

const DishForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [dishForm, setDishForm] = useState({
    name_dish: '',
    id_season: '',
    id_country: '',
    id_group: '',
    id_chief: '',
  });

  const onFinish = async () => {
    try {
      const payload = {
        name_dish: dishForm.name_dish.trim(),
        id_season: Number(dishForm.id_season),
        id_country: Number(dishForm.id_country),
        id_group: Number(dishForm.id_group),
        id_chief: Number(dishForm.id_chief),
      };
      await dishApi.create(payload);
      message.success('Dish created!');
      setDishForm({ name_dish: '', id_season: '', id_country: '', id_group: '', id_chief: '' });
      navigate('/dishes');
    } catch (e) {
      message.error('Failed to create dish');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <h2>Add Dish</h2>
      <Form
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          name_dish: '',
          id_season: undefined,
          id_country: undefined,
          id_group: undefined,
          id_chief: undefined,
        }}
      >
        <Form.Item name="name_dish" label="Name" rules={[{ required: true, message: 'Введите название блюда' }, { validator: (_, value) => value && value.trim() !== '' ? Promise.resolve() : Promise.reject('Введите название блюда') }]}>
          <Input value={dishForm.name_dish} onChange={e => setDishForm(f => ({ ...f, name_dish: e.target.value }))} autoComplete="off" />
        </Form.Item>
        <Form.Item name="id_season" label="Season ID" rules={[{ required: true, message: 'Введите ID сезона' }]}>
          <InputNumber min={1} style={{ width: '100%' }} value={dishForm.id_season === '' ? undefined : Number(dishForm.id_season)} onChange={v => setDishForm(f => ({ ...f, id_season: v === null ? '' : String(v) }))} />
        </Form.Item>
        <Form.Item name="id_country" label="Country ID" rules={[{ required: true, message: 'Введите ID страны' }]}>
          <InputNumber min={1} style={{ width: '100%' }} value={dishForm.id_country === '' ? undefined : Number(dishForm.id_country)} onChange={v => setDishForm(f => ({ ...f, id_country: v === null ? '' : String(v) }))} />
        </Form.Item>
        <Form.Item name="id_group" label="Dish Type ID" rules={[{ required: true, message: 'Введите ID типа блюда' }]}>
          <InputNumber min={1} style={{ width: '100%' }} value={dishForm.id_group === '' ? undefined : Number(dishForm.id_group)} onChange={v => setDishForm(f => ({ ...f, id_group: v === null ? '' : String(v) }))} />
        </Form.Item>
        <Form.Item name="id_chief" label="Chief ID" rules={[{ required: true, message: 'Введите ID шефа' }]}>
          <InputNumber min={1} style={{ width: '100%' }} value={dishForm.id_chief === '' ? undefined : Number(dishForm.id_chief)} onChange={v => setDishForm(f => ({ ...f, id_chief: v === null ? '' : String(v) }))} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block> Add </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default DishForm;
