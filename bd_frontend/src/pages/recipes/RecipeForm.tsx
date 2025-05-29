import React, { useState } from 'react';
import { Form, InputNumber, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { recipeApi } from '../../services/api';

const RecipeForm: React.FC = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [recipeForm, setRecipeForm] = useState({
        id_dish: '',
        id_product: '',
        gramms: '',
    });

    const onFinish = async () => {
        try {
            const payload = {
                id_dish: Number(recipeForm.id_dish),
                id_product: Number(recipeForm.id_product),
                gramms: Number(recipeForm.gramms),
            };
            await recipeApi.create(payload);
            message.success('Recipe created!');
            setRecipeForm({ id_dish: '', id_product: '', gramms: '' });
            navigate('/recipes');
        } catch (e) {
            message.error('Failed to create recipe');
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: '40px auto' }}>
            <h2>Add Recipe</h2>
            <Form
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ id_dish: undefined, id_product: undefined, gramms: undefined }}
            >
                <Form.Item
                    name="id_dish"
                    label="Dish ID"
                    rules={[{ required: true, message: 'Введите ID блюда' }]}
                >
                    <InputNumber min={1} style={{ width: '100%' }} value={recipeForm.id_dish === '' ? undefined : Number(recipeForm.id_dish)} onChange={v => setRecipeForm(f => ({ ...f, id_dish: v === null ? '' : String(v) }))} />
                </Form.Item>
                <Form.Item
                    name="id_product"
                    label="Product ID"
                    rules={[{ required: true, message: 'Введите ID продукта' }]}
                >
                    <InputNumber min={1} style={{ width: '100%' }} value={recipeForm.id_product === '' ? undefined : Number(recipeForm.id_product)} onChange={v => setRecipeForm(f => ({ ...f, id_product: v === null ? '' : String(v) }))} />
                </Form.Item>
                <Form.Item
                    name="gramms"
                    label="Gramms"
                    rules={[{ required: true, message: 'Введите количество грамм' }]}
                >
                    <InputNumber min={1} style={{ width: '100%' }} value={recipeForm.gramms === '' ? undefined : Number(recipeForm.gramms)} onChange={v => setRecipeForm(f => ({ ...f, gramms: v === null ? '' : String(v) }))} />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        Add
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default RecipeForm; 