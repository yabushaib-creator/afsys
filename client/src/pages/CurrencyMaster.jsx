import { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, InputNumber,
  Space, Popconfirm, message, Typography, Grid, Tabs, Alert, Card, Row, Col
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DollarOutlined } from '@ant-design/icons';
import { currencyApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;
const { useBreakpoint } = Grid;

const THEME = {
  primary: '#1890ff',
  success: '#52c41a',
  danger: '#ff4d4f',
  cardBg: '#ffffff',
  background: '#f8f9fa',
};
const DEFAULT_COMPANY = 'MILAHA';

export default function CurrencyMaster() {
  const { canEdit } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await currencyApi.getAll();
      setData(rows);
    } catch (err) {
      setError(err.message);
      message.error('Failed to load currencies: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ currency_company: DEFAULT_COMPANY });
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      currency_company: record.currency_company,
      currency_code: record.currency_code,
      currency_name: record.currency_name,
      currency_corporate_rate: parseFloat(record.currency_corporate_rate),
      currency_customer_rate: parseFloat(record.currency_customer_rate),
      currency_market_rate: parseFloat(record.currency_market_rate),
      currency_other_rate: parseFloat(record.currency_other_rate),
      currency_filter_0: record.currency_filter_0,
      currency_filter_1: record.currency_filter_1,
      currency_filter_2: record.currency_filter_2,
      currency_filter_3: record.currency_filter_3,
      currency_filter_4: record.currency_filter_4,
      currency_filter_5: record.currency_filter_5,
      currency_filter_6: record.currency_filter_6,
      currency_filter_7: record.currency_filter_7,
      currency_filter_8: record.currency_filter_8,
      currency_filter_9: record.currency_filter_9,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editing) {
        await currencyApi.update(editing.currency_company, editing.currency_code, values);
        message.success('Currency updated successfully.');
      } else {
        await currencyApi.create({ ...values, currency_company: DEFAULT_COMPANY });
        message.success('Currency created successfully.');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      if (err.message) message.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (record) => {
    try {
      await currencyApi.remove(record.currency_company, record.currency_code);
      message.success('Currency deleted successfully.');
      fetchData();
    } catch (err) {
      message.error(err.message);
    }
  };

  const filteredData = searchText
    ? data.filter(item =>
        (item.currency_code || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (item.currency_name || '').toLowerCase().includes(searchText.toLowerCase())
      )
    : data;

  const columns = [
    {
      title: 'Code',
      dataIndex: 'currency_code',
      key: 'currency_code',
      width: 100,
      fixed: 'left',
      sorter: (a, b) => (a.currency_code || '').localeCompare(b.currency_code || ''),
      render: (text) => <span style={{ fontWeight: 600, color: THEME.primary }}>{text}</span>
    },
    {
      title: 'Currency Name',
      dataIndex: 'currency_name',
      key: 'currency_name',
      width: 150,
      sorter: (a, b) => (a.currency_name || '').localeCompare(b.currency_name || ''),
    },
    {
      title: 'Corporate Rate',
      dataIndex: 'currency_corporate_rate',
      key: 'currency_corporate_rate',
      width: 120,
      align: 'right',
      render: (val) => Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 }),
    },
    {
      title: 'Customer Rate',
      dataIndex: 'currency_customer_rate',
      key: 'currency_customer_rate',
      width: 120,
      align: 'right',
      render: (val) => Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 }),
    },
    {
      title: 'Market Rate',
      dataIndex: 'currency_market_rate',
      key: 'currency_market_rate',
      width: 120,
      align: 'right',
      render: (val) => Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 }),
    },
    {
      title: 'Other Rate',
      dataIndex: 'currency_other_rate',
      key: 'currency_other_rate',
      width: 120,
      align: 'right',
      render: (val) => Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 }),
    },
    ...(canEdit ? [{
      title: 'Actions',
      key: 'actions',
      width: 90,
      fixed: 'right',
      render: (_, record) => (
        <Space size={8}>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
            style={{ color: THEME.primary }}
            title="Edit"
          />
          <Popconfirm
            title="Delete Currency"
            description="Are you sure you want to delete this currency?"
            onConfirm={() => handleDelete(record)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />} title="Delete" />
          </Popconfirm>
        </Space>
      ),
    }] : []),
  ];

  return (
    <div style={{ background: THEME.background, minHeight: '100vh', padding: isMobile ? '16px' : '32px' }}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card
            style={{
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              border: 'none',
              background: THEME.cardBg,
            }}
            bodyStyle={{ padding: isMobile ? '20px' : '28px' }}
          >
            <Row gutter={[16, 16]} align="middle" justify="space-between" style={{ marginBottom: 16 }}>
              <Col flex="auto">
                <Space>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '10px',
                    background: `linear-gradient(135deg, #13c2c2, #87d068)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <DollarOutlined style={{ fontSize: '24px', color: '#fff' }} />
                  </div>
                  <div>
                    <Title level={3} style={{ margin: 0, color: '#1f2937' }}>
                      Currency Master
                    </Title>
                    <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '12px' }}>
                      Manage exchange rates and currency data
                    </p>
                  </div>
                </Space>
              </Col>
              <Col flex="auto" style={{ minWidth: '250px' }}>
                <Input
                  placeholder="🔍 Search code or name..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  size="large"
                  style={{ borderRadius: '8px' }}
                />
              </Col>
              {canEdit && (
                <Col>
                  <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={openAdd}
                    block={isMobile}
                    style={{
                      borderRadius: '8px',
                      height: '40px',
                      fontSize: '14px',
                      fontWeight: 600,
                    }}
                  >
                    Add Currency
                  </Button>
                </Col>
              )}
            </Row>

            {error && (
              <Alert
                type="error"
                message={error}
                closable
                style={{ marginBottom: 20, borderRadius: '8px' }}
              />
            )}

            <Table
              rowKey={(r) => `${r.currency_company}-${r.currency_code}`}
              columns={columns}
              dataSource={filteredData}
              loading={loading}
              size={isMobile ? 'small' : 'large'}
              bordered={false}
              scroll={{ x: 'max-content' }}
              pagination={{
                pageSize: isMobile ? 10 : 20,
                showTotal: (total) => searchText ? `${total} of ${data.length} currencies (filtered)` : `${total} currencies`,
                showSizeChanger: !isMobile,
                style: { marginTop: 20 }
              }}
              style={{ borderRadius: '8px' }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <DollarOutlined style={{ color: THEME.primary, fontSize: '20px' }} />
            <span>{editing ? 'Edit Currency' : 'Add New Currency'}</span>
          </div>
        }
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="Save"
        cancelText="Cancel"
        confirmLoading={saving}
        destroyOnClose
        width={isMobile ? '95vw' : 700}
        style={isMobile ? { top: 20 } : {}}
        bodyStyle={{ padding: '24px' }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Tabs
            defaultActiveKey="basic"
            items={[
              {
                key: 'basic',
                label: '💱 Basic Info',
                children: (
                  <>
                    <Form.Item
                      name="currency_code"
                      label="Currency Code"
                      rules={[{ required: true, message: 'Code is required' }]}
                    >
                      <Input maxLength={10} disabled={!!editing} placeholder="e.g., USD, EUR, AED" />
                    </Form.Item>
                    <Form.Item
                      name="currency_name"
                      label="Currency Name"
                      rules={[{ required: true, message: 'Currency name is required' }]}
                    >
                      <Input maxLength={50} placeholder="e.g., US Dollar, Euro" />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: 'rates',
                label: '📊 Exchange Rates',
                children: (
                  <>
                    <Form.Item
                      name="currency_corporate_rate"
                      label="Corporate Rate"
                      rules={[{ required: true, message: 'Corporate rate is required' }]}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        precision={4}
                        step={0.01}
                        placeholder="Enter corporate rate"
                      />
                    </Form.Item>
                    <Form.Item
                      name="currency_customer_rate"
                      label="Customer Rate"
                      rules={[{ required: true, message: 'Customer rate is required' }]}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        precision={4}
                        step={0.01}
                        placeholder="Enter customer rate"
                      />
                    </Form.Item>
                    <Form.Item
                      name="currency_market_rate"
                      label="Market Rate"
                      rules={[{ required: true, message: 'Market rate is required' }]}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        precision={4}
                        step={0.01}
                        placeholder="Enter market rate"
                      />
                    </Form.Item>
                    <Form.Item
                      name="currency_other_rate"
                      label="Other Rate"
                      rules={[{ required: true, message: 'Other rate is required' }]}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        precision={4}
                        step={0.01}
                        placeholder="Enter other rate"
                      />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: 'filters',
                label: '🔍 Filter Fields',
                children: (
                  <>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                      <Form.Item key={i} name={`currency_filter_${i}`} label={`Filter ${i}`}>
                        <Input
                          placeholder={`Enter filter ${i}`}
                          maxLength={240}
                        />
                      </Form.Item>
                    ))}
                  </>
                ),
              },
            ]}
          />
        </Form>
      </Modal>
    </div>
  );
}
