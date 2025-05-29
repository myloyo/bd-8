import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import api from '../../services/api';

const Login: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values: { email: string; password: string }) => {
        setLoading(true);
        try {
            const res = await api.post('/login', values);
            localStorage.setItem('token', res.data.access_token);
            localStorage.setItem('is_admin', res.data.is_admin ? '1' : '0');
            message.success('Вход выполнен!');
            navigate('/');
        } catch (e: any) {
            message.error(e.response?.data?.msg || 'Ошибка входа');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: '40px auto' }}>
            <h2>Вход</h2>
            <Form layout="vertical" onFinish={onFinish}>
                <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Введите email' }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="password" label="Пароль" rules={[{ required: true, message: 'Введите пароль' }]}>
                    <Input.Password />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        Войти
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default Login; 