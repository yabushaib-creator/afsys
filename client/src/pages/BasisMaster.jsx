import { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Select,
  Space, Popconfirm, message, Typography, Grid, Alert, Card, Row, Col, Tag
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { basisMasterApi } from '../services/api';
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

const FLAG_OPTIONS = [
  { value: 'Y', label: 'Y - Active' },
  { value: 'N', label: 'N - Inactive' },
];

export default function BasisMaster() {
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
      setData(await basisMasterApi.getAll());
    } catch (err) {
      setError(err.message);
      message.error('Failed to load basis codes: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ basis_flag: 'Y' });
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      basis_code: record.basis_code,
      basis_name: record.basis_name,
      basis_flag: record.basis_flag,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editing) {
        await basisMasterApi.update(editing.basis_code, values);
        message.success('Basis code updated.');
      } else {
        await basisMasterApi.create(values);
        message.success('Basis code created.');
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
      await basisMasterApi.remove(record.basis_code);
      message.success('Basis code deleted.');
      fetchData();
    } catch (err) {
      message.error(err.message);
    }
  };

  const filteredData = searchText
    ? data.filter(item =>
        (item.basis_code || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (item.basis_name || '').toLowerCase().includes(searchText.toLowerCase())
      )
    : data;

  const columns = [
    {
      title: 'Code',
      dataIndex: 'basis_code',
      key: 'basis_code',
      width: 120,
      sorter: (a, b) => (a.basis_code || '').localeCompare(b.basis_code || ''),
      render: t => <span style={{ fontWeight: 600, color: THEME.primary }}>{t}</span>,
    },
    {
      title: 'Name',
      dataIndex: 'basis_name',
      key: 'basis_name',
      sorter: (a, b) => (a.basis_name || '').localeCompare(b.basis_name || ''),
    },
    {
      title: 'Flag',
      dataIndex: 'basis_flag',
      key: 'basis_flag',
      width: 100,
      render: f => <Tag color={f === 'Y' ? 'success' : 'default'}>{f === 'Y' ? 'Active' : 'Inactive'}</Tag>,
    },
    ...(canEdit ? [{
      title: 'Actions',
      key: 'actions',
      width: 90,
      fixed: 'right',
      render: (_, record) => (
        <Space size={8}>
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} style={{ color: THEME.primary }} title="Edit" />
          <Popconfirm
            title="Delete Basis Code"
            description="Are you sure you want to delete this basis code?"
            onConfirm={() => handleDelete(record)}
            okText="Yes" cancelText="No" okButtonProps={{ danger: true }}
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
            style={{ borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: 'none', background: THEME.cardBg }}
            styles={{ body: { padding: isMobile ? '20px' : '28px' } }}
          >
            <Row gutter={[16, 16]} align="middle" justify="space-between" style={{ marginBottom: 16 }}>
              <Col flex="auto">
                <Space>
                  <div style={{
                    width: 48, height: 48, borderRadius: '10px',
                    background: 'linear-gradient(135deg, #722ed1, #b37feb)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                  }}>📐</div>
                  <div>
                    <Title level={3} style={{ margin: 0, color: '#1f2937' }}>Basis Master</Title>
                    <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 12 }}>Manage basis codes used in supply details</p>
                  </div>
                </Space>
              </Col>
              <Col flex="auto" style={{ minWidth: '250px' }}>
                <Input
                  placeholder="🔍 Search code or name..."
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  allowClear size="large"
                  style={{ borderRadius: '8px' }}
                />
              </Col>
              {canEdit && (
                <Col>
                  <Button type="primary" size="large" icon={<PlusOutlined />} onClick={openAdd}
                    style={{ borderRadius: '8px', height: '40px', fontWeight: 600 }}>
                    Add Basis
                  </Button>
                </Col>
              )}
            </Row>

            {error && <Alert type="error" message={error} closable style={{ marginBottom: 20, borderRadius: '8px' }} />}

            <Table
              rowKey="basis_code"
              columns={columns}
              dataSource={filteredData}
              loading={loading}
              size={isMobile ? 'small' : 'large'}
              bordered={false}
              scroll={{ x: 'max-content' }}
              pagination={{
                pageSize: isMobile ? 10 : 20,
                showTotal: total => searchText ? `${total} of ${data.length} (filtered)` : `${total} basis codes`,
                showSizeChanger: !isMobile,
                style: { marginTop: 20 },
              }}
              style={{ borderRadius: '8px' }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title={
          <Space>
            <span style={{ fontSize: 20 }}>📐</span>
            <span>{editing ? 'Edit Basis Code' : 'Add New Basis Code'}</span>
          </Space>
        }
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="Save" cancelText="Cancel"
        confirmLoading={saving}
        destroyOnHidden
        width={isMobile ? '95vw' : 480}
        style={isMobile ? { top: 20 } : {}}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="basis_code" label="Basis Code" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="Enter basis code" maxLength={10} disabled={!!editing} size="large" style={{ borderRadius: '8px' }} />
          </Form.Item>
          <Form.Item name="basis_name" label="Basis Name" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="Enter basis name" maxLength={50} size="large" style={{ borderRadius: '8px' }} />
          </Form.Item>
          <Form.Item name="basis_flag" label="Flag" rules={[{ required: true, message: 'Required' }]}>
            <Select options={FLAG_OPTIONS} size="large" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
