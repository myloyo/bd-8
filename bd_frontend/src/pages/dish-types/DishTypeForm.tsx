import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { dishTypeApi } from '../../services/api';

const DishTypeForm: React.FC = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [type, setType] = useState('');

    const onFinish = async () => {
        try {
            await dishTypeApi.create({ type: type.trim() });
            message.success('Dish type created!');
            setType('');
            navigate('/dish-types');
        } catch (e) {
            message.error('Failed to create dish type');
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: '40px auto' }}>
            <h2>Add Dish Type</h2>
            <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ type: '' }}>
                <Form.Item name="type" label="Type" rules={[{ required: true, message: 'Введите тип блюда' }, { validator: (_, value) => value && value.trim() !== '' ? Promise.resolve() : Promise.reject('Введите тип блюда') }]}>
                    <Input value={type} onChange={e => setType(e.target.value)} autoComplete="off" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" block> Add </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default DishTypeForm; 