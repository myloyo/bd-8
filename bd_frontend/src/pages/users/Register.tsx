import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Checkbox, message } from 'antd';
import api from '../../services/api';

const Register: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values: { email: string; password: string; name_user: string; is_admin: boolean }) => {
        setLoading(true);
        try {
            await api.post('/register', values);
            message.success('Регистрация успешна! Теперь войдите.');
            navigate('/login');
        } catch (e: any) {
            message.error(e.response?.data?.message || 'Ошибка регистрации');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: '40px auto' }}>
            <h2>Регистрация</h2>
            <Form layout="vertical" onFinish={onFinish} initialValues={{ is_admin: false }}>
                <Form.Item name="name_user" label="Имя" rules={[{ required: true, message: 'Введите имя' }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Введите email' }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="password" label="Пароль" rules={[{ required: true, message: 'Введите пароль' }]}>
                    <Input.Password />
                </Form.Item>
                <Form.Item name="is_admin" valuePropName="checked">
                    <Checkbox>Администратор</Checkbox>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        Зарегистрироваться
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default Register; 