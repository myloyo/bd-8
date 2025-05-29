import React from 'react';
import { Descriptions, Card, Spin, Button, Divider, Space } from 'antd';
import { EditOutlined, DeleteOutlined, RollbackOutlined } from '@ant-design/icons';
import './DetailView.scss';

interface DetailViewProps {
  title: string;
  loading?: boolean;
  items: { label: string; value: React.ReactNode }[];
  onEdit?: () => void;
  onDelete?: () => void;
  onBack?: () => void;
  extra?: React.ReactNode;
  children?: React.ReactNode;
}

const DetailView: React.FC<DetailViewProps> = ({
  title,
  loading = false,
  items,
  onEdit,
  onDelete,
  onBack,
  extra,
  children,
}) => {
  return (
    <div className="detail-view-container">
      <Card
        title={title}
        className="detail-view-card"
        extra={
          <Space>
            {extra}
            {onEdit && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={onEdit}
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={onDelete}
              >
                Delete
              </Button>
            )}
            {onBack && (
              <Button 
                icon={<RollbackOutlined />}
                onClick={onBack}
              >
                Back
              </Button>
            )}
          </Space>
        }
      >
        <Spin spinning={loading}>
          <Descriptions
            bordered
            column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}
          >
            {items.map((item, index) => (
              <Descriptions.Item key={index} label={item.label}>
                {item.value || '-'}
              </Descriptions.Item>
            ))}
          </Descriptions>
          
          {children && (
            <>
              <Divider />
              {children}
            </>
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default DetailView;
