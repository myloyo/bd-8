import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { countryApi } from '../../services/api';

const CountryForm: React.FC = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const onFinish = async (values: any) => {
        try {
            await countryApi.create(values);
            message.success('Country created!');
            form.resetFields();
            navigate('/countries');
        } catch (e) {
            message.error('Failed to create country');
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: '40px auto' }}>
            <h2>Add Country</h2>
            <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ name_country: '' }}>
                <Form.Item
                    name="name_country"
                    label="Country Name"
                    rules={[
                        { required: true, message: 'Введите название страны' },
                        {
                            validator: (_, value) =>
                                value && value.trim() !== ''
                                    ? Promise.resolve()
                                    : Promise.reject('Введите название страны')
                        }
                    ]}
                >
                    <Input autoComplete="off" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" block> Add </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default CountryForm; 