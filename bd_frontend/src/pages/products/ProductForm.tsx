import React, { useState } from 'react';
import { Form, Input, InputNumber, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { productApi } from '../../services/api';

const ProductForm: React.FC = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [productForm, setProductForm] = useState({
        name_product: '',
        calories: '',
        cost_product: '',
    });

    const onFinish = async () => {
        try {
            const payload = {
                name_product: productForm.name_product.trim(),
                calories: Number(productForm.calories),
                cost_product: Number(productForm.cost_product),
            };
            await productApi.create(payload);
            message.success('Product created!');
            setProductForm({ name_product: '', calories: '', cost_product: '' });
            navigate('/products');
        } catch (e) {
            message.error('Failed to create product');
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: '40px auto' }}>
            <h2>Add Product</h2>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ name_product: '', calories: undefined, cost_product: undefined }}
            >
                <Form.Item
                    name="name_product"
                    label="Name"
                    rules={[
                        { required: true, message: 'Введите название продукта' },
                        { validator: (_, value) => value && value.trim() !== '' ? Promise.resolve() : Promise.reject('Введите название продукта') }
                    ]}
                >
                    <Input value={productForm.name_product} onChange={e => setProductForm(f => ({ ...f, name_product: e.target.value }))} autoComplete="off" />
                </Form.Item>
                <Form.Item
                    name="calories"
                    label="Calories"
                    rules={[{ required: true, message: 'Введите калорийность' }]}
                >
                    <InputNumber min={0} style={{ width: '100%' }} value={productForm.calories === '' ? undefined : Number(productForm.calories)} onChange={v => setProductForm(f => ({ ...f, calories: v === null ? '' : String(v) }))} />
                </Form.Item>
                <Form.Item
                    name="cost_product"
                    label="Cost"
                    rules={[{ required: true, message: 'Введите стоимость' }]}
                >
                    <InputNumber min={0} style={{ width: '100%' }} value={productForm.cost_product === '' ? undefined : Number(productForm.cost_product)} onChange={v => setProductForm(f => ({ ...f, cost_product: v === null ? '' : String(v) }))} />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" block> Add </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default ProductForm; 