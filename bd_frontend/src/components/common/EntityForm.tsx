import React from 'react';
import { Form, Button, Spin, Space, Card, Alert, Divider } from 'antd';
import './EntityForm.scss';

interface EntityFormProps {
  title: string;
  loading?: boolean;
  error?: string;
  onFinish: (values: any) => void;
  onCancel?: () => void;
  form?: any;
  initialValues?: any;
  children: React.ReactNode;
  extraActions?: React.ReactNode;
}

const EntityForm: React.FC<EntityFormProps> = ({
  title,
  loading = false,
  error,
  onFinish,
  onCancel,
  form,
  initialValues,
  children,
  extraActions,
}) => {
  return (
    <div className="entity-form-container">
      <Card 
        title={title} 
        className="entity-form-card"
        extra={extraActions}
      >
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            className="form-error"
          />
        )}
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={initialValues}
            className="entity-form"
          >
            {children}
            <Divider />
            <Form.Item className="form-actions">
              <Space>
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
                {onCancel && (
                  <Button onClick={onCancel}>
                    Cancel
                  </Button>
                )}
              </Space>
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default EntityForm;
