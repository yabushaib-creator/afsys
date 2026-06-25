import { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input,
  Space, Popconfirm, message, Typography, Grid, Tabs, Alert, Card, Row, Col
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { countryApi } from '../services/api';
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

export default function CountryMaster() {
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
      const rows = await countryApi.getAll();
      setData(rows);
    } catch (err) {
      setError(err.message);
      message.error('Failed to load countries: ' + err.message);
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
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      country_code: record.country_code,
      country_name: record.country_name,
      country_uncode: record.country_uncode,
      country_cargo_centre: record.country_cargo_centre,
      country_lang_name: record.country_lang_name,
      country_arabic_name: record.country_arabic_name,
      country_filter_0: record.country_filter_0,
      country_filter_1: record.country_filter_1,
      country_filter_2: record.country_filter_2,
      country_filter_3: record.country_filter_3,
      country_filter_4: record.country_filter_4,
      country_filter_5: record.country_filter_5,
      country_filter_6: record.country_filter_6,
      country_filter_7: record.country_filter_7,
      country_filter_8: record.country_filter_8,
      country_filter_9: record.country_filter_9,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editing) {
        await countryApi.update(editing.country_code, values);
        message.success('Country updated successfully.');
      } else {
        await countryApi.create(values);
        message.success('Country created successfully.');
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
      await countryApi.remove(record.country_code);
      message.success('Country deleted successfully.');
      fetchData();
    } catch (err) {
      message.error(err.message);
    }
  };

  const filteredData = searchText
    ? data.filter(item =>
        (item.country_code || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (item.country_name || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (item.country_uncode || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (item.country_arabic_name || '').toLowerCase().includes(searchText.toLowerCase())
      )
    : data;

  const columns = [
    {
      title: 'Code',
      dataIndex: 'country_code',
      key: 'country_code',
      width: 100,
      fixed: 'left',
      sorter: (a, b) => (a.country_code || '').localeCompare(b.country_code || ''),
      render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>
    },
    {
      title: 'Country Name',
      dataIndex: 'country_name',
      key: 'country_name',
      width: 180,
      sorter: (a, b) => (a.country_name || '').localeCompare(b.country_name || ''),
    },
    {
      title: 'UN Code',
      dataIndex: 'country_uncode',
      key: 'country_uncode',
      width: 100,
      responsive: ['md'],
      render: (val) => val ? <span style={{ color: THEME.primary, fontWeight: 500 }}>{val}</span> : '—',
    },
    {
      title: 'Cargo Centre',
      dataIndex: 'country_cargo_centre',
      key: 'country_cargo_centre',
      width: 120,
      responsive: ['lg'],
      render: (val) => val || '—',
    },
    {
      title: 'Arabic Name',
      dataIndex: 'country_arabic_name',
      key: 'country_arabic_name',
      width: 150,
      responsive: ['lg'],
      render: (val) => val || '—',
    },
    {
      title: 'Lang Name',
      dataIndex: 'country_lang_name',
      key: 'country_lang_name',
      width: 150,
      responsive: ['xl'],
      render: (val) => val || '—',
    },
    ...(canEdit ? [{
      title: 'Actions',
      key: 'actions',
      width: 100,
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
            title="Delete Country"
            description="Are you sure you want to delete this country?"
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
                    background: `linear-gradient(135deg, #faad14, #ffc53d)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <EnvironmentOutlined style={{ fontSize: '24px', color: '#fff' }} />
                  </div>
                  <div>
                    <Title level={3} style={{ margin: 0, color: '#1f2937' }}>
                      Country Master
                    </Title>
                    <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '12px' }}>
                      Manage countries and regions
                    </p>
                  </div>
                </Space>
              </Col>
              <Col flex="auto" style={{ minWidth: '250px' }}>
                <Input
                  placeholder="🔍 Search code, name, UN code, Arabic name..."
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
                    Add Country
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
              rowKey={(r) => r.country_code}
              columns={columns}
              dataSource={filteredData}
              loading={loading}
              size={isMobile ? 'small' : 'large'}
              bordered={false}
              scroll={{ x: 'max-content' }}
              pagination={{
                pageSize: isMobile ? 10 : 20,
                showTotal: (total) => searchText ? `${total} of ${data.length} countries (filtered)` : `${total} countries`,
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
            <EnvironmentOutlined style={{ color: THEME.primary, fontSize: '20px' }} />
            <span>{editing ? 'Edit Country' : 'Add New Country'}</span>
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
        modalRender={(modal) => (
          <div style={{ borderRadius: '12px', overflow: 'hidden' }}>
            {modal}
          </div>
        )}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 12 }}>
          <Tabs
            defaultActiveKey="basic"
            items={[
              {
                key: 'basic',
                label: '📋 Basic Info',
                children: (
                  <>
                    <Form.Item
                      name="country_code"
                      label="Country Code"
                      rules={[{ required: true, message: 'Code is required' }]}
                    >
                      <Input
                        placeholder="Enter country code"
                        maxLength={10}
                        disabled={!!editing}
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="country_name"
                      label="Country Name"
                      rules={[{ required: true, message: 'Country name is required' }]}
                    >
                      <Input
                        placeholder="Enter country name"
                        maxLength={75}
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="country_uncode"
                      label="UN Code"
                      rules={[{ required: true, message: 'UN code is required' }]}
                    >
                      <Input
                        placeholder="Enter UN code"
                        maxLength={10}
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="country_cargo_centre"
                      label="Cargo Centre"
                      rules={[{ required: true, message: 'Cargo centre is required' }]}
                    >
                      <Input
                        placeholder="Enter cargo centre"
                        maxLength={10}
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: 'names',
                label: '🌐 Names & Languages',
                children: (
                  <>
                    <Form.Item name="country_lang_name" label="Language Name">
                      <Input
                        placeholder="Enter language name"
                        maxLength={240}
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                    <Form.Item name="country_arabic_name" label="Arabic Name">
                      <Input
                        placeholder="Enter Arabic name"
                        maxLength={75}
                        size="large"
                        style={{ borderRadius: '8px' }}
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
                      <Form.Item key={i} name={`country_filter_${i}`} label={`Filter ${i}`}>
                        <Input
                          placeholder={`Enter filter ${i}`}
                          maxLength={240}
                          size="large"
                          style={{ borderRadius: '8px' }}
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
