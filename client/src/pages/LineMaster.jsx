import { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input,
  Space, Popconfirm, message, Typography, Grid, Tabs, Alert, Card, Row, Col
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, GlobalOutlined } from '@ant-design/icons';
import { lineApi } from '../services/api';
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

export default function LineMaster() {
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
      const rows = await lineApi.getAll();
      setData(rows);
    } catch (err) {
      setError(err.message);
      message.error('Failed to load lines: ' + err.message);
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
      line_code: record.line_code,
      line_name: record.line_name,
      line_address_1: record.line_address_1,
      line_address_2: record.line_address_2,
      line_address_3: record.line_address_3,
      line_telephone: record.line_telephone,
      line_fax: record.line_fax,
      line_email: record.line_email,
      line_bl_print: record.line_bl_print,
      line_local_port_code: record.line_local_port_code,
      line_local_custom_code: record.line_local_custom_code,
      line_name_others: record.line_name_others,
      line_filter_0: record.line_filter_0,
      line_filter_1: record.line_filter_1,
      line_filter_2: record.line_filter_2,
      line_filter_3: record.line_filter_3,
      line_filter_4: record.line_filter_4,
      line_filter_5: record.line_filter_5,
      line_filter_6: record.line_filter_6,
      line_filter_7: record.line_filter_7,
      line_filter_8: record.line_filter_8,
      line_filter_9: record.line_filter_9,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editing) {
        await lineApi.update(editing.line_code, values);
        message.success('Line updated successfully.');
      } else {
        await lineApi.create(values);
        message.success('Line created successfully.');
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
      await lineApi.remove(record.line_code);
      message.success('Line deleted successfully.');
      fetchData();
    } catch (err) {
      message.error(err.message);
    }
  };

  const filteredData = searchText
    ? data.filter(item =>
        (item.line_code || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (item.line_name || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (item.line_address_1 || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (item.line_telephone || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (item.line_email || '').toLowerCase().includes(searchText.toLowerCase())
      )
    : data;

  const columns = [
    {
      title: 'Code',
      dataIndex: 'line_code',
      key: 'line_code',
      width: 100,
      fixed: 'left',
      sorter: (a, b) => (a.line_code || '').localeCompare(b.line_code || ''),
      render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>
    },
    {
      title: 'Line Name',
      dataIndex: 'line_name',
      key: 'line_name',
      width: 180,
      sorter: (a, b) => (a.line_name || '').localeCompare(b.line_name || ''),
    },
    {
      title: 'Address',
      dataIndex: 'line_address_1',
      key: 'line_address_1',
      width: 150,
      responsive: ['md'],
      render: (val) => val || '—',
    },
    {
      title: 'Telephone',
      dataIndex: 'line_telephone',
      key: 'line_telephone',
      width: 130,
      responsive: ['lg'],
      render: (val) => val || '—',
    },
    {
      title: 'Email',
      dataIndex: 'line_email',
      key: 'line_email',
      width: 150,
      responsive: ['lg'],
      render: (val) => val ? <a href={`mailto:${val}`}>{val}</a> : '—',
    },
    {
      title: 'Port Code',
      dataIndex: 'line_local_port_code',
      key: 'line_local_port_code',
      width: 100,
      responsive: ['xl'],
      render: (val) => val ? <span style={{ color: THEME.primary, fontWeight: 500 }}>{val}</span> : '—',
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
            title="Delete Line"
            description="Are you sure you want to delete this line?"
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
                    background: `linear-gradient(135deg, #722ed1, #b37feb)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <GlobalOutlined style={{ fontSize: '24px', color: '#fff' }} />
                  </div>
                  <div>
                    <Title level={3} style={{ margin: 0, color: '#1f2937' }}>
                      Line Master
                    </Title>
                    <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '12px' }}>
                      Manage shipping lines and carriers
                    </p>
                  </div>
                </Space>
              </Col>
              <Col flex="auto" style={{ minWidth: '250px' }}>
                <Input
                  placeholder="🔍 Search code, name, address, phone, email..."
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
                    Add Line
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
              rowKey={(r) => r.line_code}
              columns={columns}
              dataSource={filteredData}
              loading={loading}
              size={isMobile ? 'small' : 'large'}
              bordered={false}
              scroll={{ x: 'max-content' }}
              pagination={{
                pageSize: isMobile ? 10 : 20,
                showTotal: (total) => searchText ? `${total} of ${data.length} lines (filtered)` : `${total} lines`,
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
            <GlobalOutlined style={{ color: THEME.primary, fontSize: '20px' }} />
            <span>{editing ? 'Edit Line' : 'Add New Line'}</span>
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
                      name="line_code"
                      label="Line Code"
                      rules={[{ required: true, message: 'Code is required' }]}
                    >
                      <Input
                        placeholder="Enter line code"
                        maxLength={10}
                        disabled={!!editing}
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="line_name"
                      label="Line Name"
                      rules={[{ required: true, message: 'Line name is required' }]}
                    >
                      <Input
                        placeholder="Enter line name"
                        maxLength={50}
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="line_address_1"
                      label="Address 1"
                      rules={[{ required: true, message: 'Address 1 is required' }]}
                    >
                      <Input
                        placeholder="Enter address line 1"
                        maxLength={75}
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                    <Form.Item name="line_address_2" label="Address 2">
                      <Input
                        placeholder="Enter address line 2"
                        maxLength={75}
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                    <Form.Item name="line_address_3" label="Address 3">
                      <Input
                        placeholder="Enter address line 3"
                        maxLength={75}
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: 'contact',
                label: '📞 Contact Info',
                children: (
                  <>
                    <Form.Item
                      name="line_telephone"
                      label="Telephone"
                      rules={[{ required: true, message: 'Telephone is required' }]}
                    >
                      <Input
                        placeholder="Enter telephone"
                        maxLength={20}
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="line_fax"
                      label="Fax"
                      rules={[{ required: true, message: 'Fax is required' }]}
                    >
                      <Input
                        placeholder="Enter fax"
                        maxLength={20}
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="line_email"
                      label="Email"
                      rules={[{ required: true, message: 'Email is required' }]}
                    >
                      <Input
                        placeholder="Enter email"
                        maxLength={75}
                        type="email"
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                    <Form.Item name="line_bl_print" label="BL Print">
                      <Input
                        placeholder="Enter BL print info"
                        maxLength={75}
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: 'codes',
                label: '🔑 Codes & References',
                children: (
                  <>
                    <Form.Item name="line_local_port_code" label="Local Port Code">
                      <Input
                        placeholder="Enter port code"
                        maxLength={25}
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                    <Form.Item name="line_local_custom_code" label="Local Custom Code">
                      <Input
                        placeholder="Enter custom code"
                        maxLength={25}
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                    <Form.Item name="line_name_others" label="Name (Others)">
                      <Input
                        placeholder="Enter alternate name"
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
                      <Form.Item key={i} name={`line_filter_${i}`} label={`Filter ${i}`}>
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
