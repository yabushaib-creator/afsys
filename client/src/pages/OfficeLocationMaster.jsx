import { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, InputNumber, Select,
  Space, Popconfirm, message, Typography, Grid, Tabs, Alert, Card, Row, Col
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { officeApi } from '../services/api';
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

export default function OfficeLocationMaster() {
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
      const rows = await officeApi.getAll();
      setData(rows);
    } catch (err) {
      setError(err.message);
      message.error('Failed to load offices: ' + err.message);
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
    form.setFieldsValue({
      off_company: DEFAULT_COMPANY,
      off_report_head: 'L',
      off_office_short: '1'
    });
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      off_office: record.off_office,
      off_office_name: record.off_office_name,
      off_location: record.off_location,
      off_location_name: record.off_location_name,
      off_notes: record.off_notes,
      off_filter_0: record.off_filter_0,
      off_filter_1: record.off_filter_1,
      off_filter_2: record.off_filter_2,
      off_filter_3: record.off_filter_3,
      off_filter_4: record.off_filter_4,
      off_filter_5: record.off_filter_5,
      off_filter_6: record.off_filter_6,
      off_filter_7: record.off_filter_7,
      off_filter_8: record.off_filter_8,
      off_filter_9: record.off_filter_9,
      off_address_1: record.off_address_1,
      off_address_2: record.off_address_2,
      off_address_3: record.off_address_3,
      off_address_4: record.off_address_4,
      off_phone: record.off_phone,
      off_fax: record.off_fax,
      off_telex: record.off_telex,
      off_email: record.off_email,
      off_contact: record.off_contact,
      off_operation_map_line: record.off_operation_map_line,
      off_report_head: record.off_report_head,
      off_office_short: record.off_office_short,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editing) {
        await officeApi.update(editing.off_company, editing.off_serial, values);
        message.success('Office location updated successfully.');
      } else {
        await officeApi.create({ ...values, off_company: DEFAULT_COMPANY });
        message.success('Office location created successfully.');
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
      await officeApi.remove(record.off_company, record.off_serial);
      message.success('Office location deleted successfully.');
      fetchData();
    } catch (err) {
      message.error(err.message);
    }
  };

  const filteredData = searchText
    ? data.filter(item =>
        (item.off_office || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (item.off_office_name || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (item.off_location || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (item.off_email || '').toLowerCase().includes(searchText.toLowerCase())
      )
    : data;

  const columns = [
    {
      title: 'Office Code',
      dataIndex: 'off_office',
      key: 'off_office',
      width: 110,
      fixed: 'left',
      sorter: (a, b) => (a.off_office || '').localeCompare(b.off_office || ''),
      render: (text) => <span style={{ fontWeight: 600, color: THEME.primary }}>{text}</span>
    },
    {
      title: 'Office Name',
      dataIndex: 'off_office_name',
      key: 'off_office_name',
      width: 150,
      sorter: (a, b) => (a.off_office_name || '').localeCompare(b.off_office_name || ''),
    },
    {
      title: 'Location',
      dataIndex: 'off_location',
      key: 'off_location',
      width: 120,
      render: (val) => val ? <span style={{ color: THEME.primary, fontWeight: 500 }}>{val}</span> : '—',
    },
    {
      title: 'Location Name',
      dataIndex: 'off_location_name',
      key: 'off_location_name',
      width: 150,
      render: (val) => val || '—',
    },
    {
      title: 'Address',
      dataIndex: 'off_address_1',
      key: 'off_address_1',
      width: 150,
      responsive: ['md'],
      render: (val) => val || '—',
    },
    {
      title: 'Phone',
      dataIndex: 'off_phone',
      key: 'off_phone',
      width: 130,
      responsive: ['md'],
      render: (val) => val || '—',
    },
    {
      title: 'Email',
      dataIndex: 'off_email',
      key: 'off_email',
      width: 150,
      responsive: ['lg'],
      render: (val) => val ? <a href={`mailto:${val}`}>{val}</a> : '—',
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
            title="Delete Office Location"
            description="Are you sure you want to delete this office location?"
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
                    background: `linear-gradient(135deg, #ff7a45, #ffa940)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <EnvironmentOutlined style={{ fontSize: '24px', color: '#fff' }} />
                  </div>
                  <div>
                    <Title level={3} style={{ margin: 0, color: '#1f2937' }}>
                      Office Location Master
                    </Title>
                    <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '12px' }}>
                      Manage office locations and details
                    </p>
                  </div>
                </Space>
              </Col>
              <Col flex="auto" style={{ minWidth: '250px' }}>
                <Input
                  placeholder="🔍 Search code, name, location, email..."
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
                    Add Office
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
              rowKey={(r) => `${r.off_company}-${r.off_serial}`}
              columns={columns}
              dataSource={filteredData}
              loading={loading}
              size={isMobile ? 'small' : 'large'}
              bordered={false}
              scroll={{ x: 'max-content' }}
              pagination={{
                pageSize: isMobile ? 10 : 20,
                showTotal: (total) => searchText ? `${total} of ${data.length} offices (filtered)` : `${total} offices`,
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
            <span>{editing ? 'Edit Office Location' : 'Add New Office Location'}</span>
          </div>
        }
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="Save"
        cancelText="Cancel"
        confirmLoading={saving}
        destroyOnClose
        width={isMobile ? '95vw' : 800}
        style={isMobile ? { top: 20 } : {}}
        bodyStyle={{ padding: '24px', maxHeight: '80vh', overflowY: 'auto' }}
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
                      name="off_office"
                      label="Office Code"
                      rules={[{ required: true, message: 'Office code is required' }]}
                    >
                      <Input
                        placeholder="Enter office code"
                        maxLength={10}
                        disabled={!!editing}
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="off_office_name"
                      label="Office Name"
                      rules={[{ required: true, message: 'Office name is required' }]}
                    >
                      <Input
                        placeholder="Enter office name"
                        maxLength={75}
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                    <Form.Item name="off_location" label="Location Code">
                      <Input
                        placeholder="Enter location code"
                        maxLength={10}
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                    <Form.Item name="off_location_name" label="Location Name">
                      <Input
                        placeholder="Enter location name"
                        maxLength={75}
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: 'address',
                label: '📍 Address & Contact',
                children: (
                  <>
                    <Form.Item name="off_address_1" label="Address 1">
                      <Input
                        placeholder="Enter address line 1"
                        maxLength={50}
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                    <Form.Item name="off_address_2" label="Address 2">
                      <Input
                        placeholder="Enter address line 2"
                        maxLength={50}
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                    <Form.Item name="off_address_3" label="Address 3">
                      <Input
                        placeholder="Enter address line 3"
                        maxLength={50}
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                    <Form.Item name="off_address_4" label="Address 4">
                      <Input
                        placeholder="Enter address line 4"
                        maxLength={50}
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                    <Form.Item name="off_phone" label="Phone">
                      <Input
                        placeholder="Enter phone number"
                        maxLength={50}
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                    <Form.Item name="off_fax" label="Fax">
                      <Input
                        placeholder="Enter fax number"
                        maxLength={50}
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                    <Form.Item name="off_telex" label="Telex">
                      <Input
                        placeholder="Enter telex number"
                        maxLength={50}
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                    <Form.Item name="off_email" label="Email">
                      <Input
                        placeholder="Enter email address"
                        maxLength={50}
                        type="email"
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                    <Form.Item name="off_contact" label="Contact Person">
                      <Input
                        placeholder="Enter contact person name"
                        maxLength={50}
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: 'settings',
                label: '⚙️ Settings & Options',
                children: (
                  <>
                    <Form.Item name="off_operation_map_line" label="Operation Map Line">
                      <Input
                        placeholder="Enter operation map line"
                        maxLength={10}
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                    <Form.Item name="off_report_head" label="Report Head">
                      <Select
                        placeholder="Select report head..."
                        options={[
                          { value: 'L', label: 'L - Local' },
                          { value: 'H', label: 'H - Head Office' },
                          { value: 'R', label: 'R - Regional' },
                        ]}
                      />
                    </Form.Item>
                    <Form.Item name="off_office_short" label="Office Short Code">
                      <Select
                        placeholder="Select office short code..."
                        options={[
                          { value: '1', label: '1 - Main' },
                          { value: '2', label: '2 - Branch' },
                          { value: '3', label: '3 - Sub-branch' },
                        ]}
                      />
                    </Form.Item>
                    <Form.Item name="off_notes" label="Notes">
                      <Input.TextArea
                        placeholder="Enter notes"
                        maxLength={240}
                        rows={4}
                        showCount
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
                      <Form.Item key={i} name={`off_filter_${i}`} label={`Filter ${i}`}>
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
