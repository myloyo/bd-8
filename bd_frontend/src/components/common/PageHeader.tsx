import React from 'react';
import { Typography } from 'antd';
import './PageHeader.scss';

const { Title } = Typography;

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  extra?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle, 
  extra 
}) => {
  return (
    <div className="page-header">
      <div>
        <Title level={2} className="page-title">{title}</Title>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {extra && <div className="page-extra">{extra}</div>}
    </div>
  );
};

export default PageHeader;
