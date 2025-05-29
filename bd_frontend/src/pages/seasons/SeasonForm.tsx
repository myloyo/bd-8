import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { seasonApi } from '../../services/api';

const SeasonForm: React.FC = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const onFinish = async (values: any) => {
        try {
            await seasonApi.create(values);
            message.success('Season created!');
            form.resetFields();
            navigate('/seasons');
        } catch (e) {
            message.error('Failed to create season');
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: '40px auto' }}>
            <h2>Add Season</h2>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ name_season: '' }}
            >
                <Form.Item
                    name="name_season"
                    label="Season Name"
                    rules={[
                        { required: true, message: 'Введите название сезона' },
                        {
                            validator: (_, value) =>
                                value && value.trim() !== ''
                                    ? Promise.resolve()
                                    : Promise.reject('Введите название сезона')
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

export default SeasonForm;
