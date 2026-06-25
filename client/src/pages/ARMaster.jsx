import { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input,
  Space, Popconfirm, message, Typography, Grid, Alert, Card, Row, Col
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined } from '@ant-design/icons';
import { arMasterApi } from '../services/api';
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

export default function ARMaster() {
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
      const rows = await arMasterApi.getAll();
      setData(rows);
    } catch (err) {
      setError(err.message);
      message.error('Failed to load AR values: ' + err.message);
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
      ar_code: record.ar_code,
      ar_name: record.ar_name,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editing) {
        await arMasterApi.update(editing.ar_code, values);
        message.success('AR value updated successfully.');
      } else {
        await arMasterApi.create(values);
        message.success('AR value created successfully.');
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
      await arMasterApi.remove(record.ar_code);
      message.success('AR value deleted successfully.');
      fetchData();
    } catch (err) {
      message.error(err.message);
    }
  };

  const filteredData = searchText
    ? data.filter(item =>
        (item.ar_code || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (item.ar_name || '').toLowerCase().includes(searchText.toLowerCase())
      )
    : data;

  const columns = [
    {
      title: 'Code',
      dataIndex: 'ar_code',
      key: 'ar_code',
      width: 120,
      fixed: 'left',
      sorter: (a, b) => (a.ar_code || '').localeCompare(b.ar_code || ''),
      render: (text) => <span style={{ fontWeight: 600, color: THEME.primary }}>{text}</span>
    },
    {
      title: 'Name',
      dataIndex: 'ar_name',
      key: 'ar_name',
      width: 250,
      sorter: (a, b) => (a.ar_name || '').localeCompare(b.ar_name || ''),
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
            title="Delete AR Value"
            description="Are you sure you want to delete this AR value?"
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
            styles={{ body: { padding: isMobile ? '20px' : '28px' } }}
          >
            <Row gutter={[16, 16]} align="middle" justify="space-between" style={{ marginBottom: 16 }}>
              <Col flex="auto">
                <Space>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '10px',
                    background: `linear-gradient(135deg, #52c41a, #95de64)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <FileTextOutlined style={{ fontSize: '24px', color: '#fff' }} />
                  </div>
                  <div>
                    <Title level={3} style={{ margin: 0, color: '#1f2937' }}>
                      AR Master
                    </Title>
                    <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '12px' }}>
                      Manage AR (Account Receivable) codes and names
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
                    Add AR
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
              rowKey={(r) => r.ar_code}
              columns={columns}
              dataSource={filteredData}
              loading={loading}
              size={isMobile ? 'small' : 'large'}
              bordered={false}
              scroll={{ x: 'max-content' }}
              pagination={{
                pageSize: isMobile ? 10 : 20,
                showTotal: (total) => searchText ? `${total} of ${data.length} values (filtered)` : `${total} values`,
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
            <FileTextOutlined style={{ color: THEME.primary, fontSize: '20px' }} />
            <span>{editing ? 'Edit AR Value' : 'Add New AR Value'}</span>
          </div>
        }
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="Save"
        cancelText="Cancel"
        confirmLoading={saving}
        destroyOnHidden
        width={isMobile ? '95vw' : 500}
        style={isMobile ? { top: 20 } : {}}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="ar_code"
            label="AR Code"
            rules={[{ required: true, message: 'AR code is required' }]}
          >
            <Input
              placeholder="Enter AR code"
              maxLength={10}
              disabled={!!editing}
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>
          <Form.Item
            name="ar_name"
            label="AR Name"
            rules={[{ required: true, message: 'AR name is required' }]}
          >
            <Input
              placeholder="Enter AR name"
              maxLength={240}
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
