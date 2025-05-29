import React from 'react';
import { Card, Form, Switch, Select, Button, message } from 'antd';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/common/PageHeader';

const { Option } = Select;

const SettingsPage: React.FC = () => {
  const [form] = Form.useForm();
  const { role } = useAuth();

  const handleSubmit = (values: any) => {
    console.log('Settings updated:', values);
    message.success('Settings saved successfully');
  };

  return (
    <div className="settings-page">
      <PageHeader
        title="Settings"
        subtitle="Configure application settings"
      />
      
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            notifications: true,
            language: 'en',
            theme: 'light',
          }}
        >
          <Form.Item
            name="notifications"
            label="Enable Notifications"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="language"
            label="Language"
          >
            <Select>
              <Option value="en">English</Option>
              <Option value="ru">Russian</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="theme"
            label="Theme"
          >
            <Select>
              <Option value="light">Light</Option>
              <Option value="dark">Dark</Option>
            </Select>
          </Form.Item>

          {role === 'admin' && (
            <>
              <Form.Item
                name="debugMode"
                label="Debug Mode"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="maintenanceMode"
                label="Maintenance Mode"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save Settings
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SettingsPage;
