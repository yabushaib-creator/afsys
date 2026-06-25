import { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, Checkbox, DatePicker,
  Space, Popconfirm, message, Typography, Grid, Tabs, Alert, Card, Row, Col
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { userApi, officeApi } from '../services/api';
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

// Available screens/modules
const AVAILABLE_SCREENS = [
  { value: 'tariff', label: 'Tariff Master' },
  { value: 'currencies', label: 'Currency Master' },
  { value: 'lines', label: 'Line Master' },
  { value: 'countries', label: 'Country Master' },
  { value: 'offices', label: 'Office Location Master' },
  { value: 'vessels', label: 'Vessel Master' },
  { value: 'users', label: 'User Master' },
];

export default function UserMaster() {
  const { canEdit } = useAuth();
  const [data, setData] = useState([]);
  const [offices, setOffices] = useState([]);
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
      const [users, officesList] = await Promise.all([
        userApi.getAll(),
        officeApi.getAll()
      ]);
      setData(users);
      setOffices(officesList);
    } catch (err) {
      setError(err.message);
      message.error('Failed to load data: ' + err.message);
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
      user_status: 'A',
      user_admin_allow: 'N',
      user_default_company: 'MILAHA'
    });
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    const screensArray = record.user_allowed_screens
      ? record.user_allowed_screens.split(',').filter(s => s)
      : [];

    form.setFieldsValue({
      user_code: record.user_code,
      user_name: record.user_name,
      user_password: record.user_password,
      user_primary_group: record.user_primary_group,
      user_status: record.user_status,
      user_admin_allow: record.user_admin_allow,
      user_default_company: record.user_default_company,
      user_default_location: record.user_default_location,
      user_allowed_screens: screensArray,
      user_last_password_changed_on: record.user_last_password_changed_on ? new Date(record.user_last_password_changed_on) : null,
      user_next_password_change_on: record.user_next_password_change_on ? new Date(record.user_next_password_change_on) : null,
      user_filter_0: record.user_filter_0,
      user_filter_1: record.user_filter_1,
      user_filter_2: record.user_filter_2,
      user_filter_3: record.user_filter_3,
      user_filter_4: record.user_filter_4,
      user_filter_5: record.user_filter_5,
      user_filter_6: record.user_filter_6,
      user_filter_7: record.user_filter_7,
      user_filter_8: record.user_filter_8,
      user_filter_9: record.user_filter_9,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      // Convert allowed screens array to comma-separated string
      const formatDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        return d.toISOString().split('T')[0];
      };

      const payload = {
        ...values,
        user_allowed_screens: values.user_allowed_screens?.join(',') || '',
        user_last_password_changed_on: formatDate(values.user_last_password_changed_on),
        user_next_password_change_on: formatDate(values.user_next_password_change_on),
      };

      if (editing) {
        await userApi.update(editing.user_code, payload);
        message.success('User updated successfully.');
      } else {
        await userApi.create(payload);
        message.success('User created successfully.');
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
      await userApi.remove(record.user_code);
      message.success('User deleted successfully.');
      fetchData();
    } catch (err) {
      message.error(err.message);
    }
  };

  const filteredData = searchText
    ? data.filter(item =>
        (item.user_code || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (item.user_name || '').toLowerCase().includes(searchText.toLowerCase())
      )
    : data;

  const getOfficeLocation = (code) => {
    if (!code) return '—';
    const office = offices.find(o => o.off_office === code);
    return office ? `${office.off_office} - ${office.off_office_name}` : code;
  };

  const columns = [
    {
      title: 'User Code',
      dataIndex: 'user_code',
      key: 'user_code',
      width: 100,
      fixed: 'left',
      sorter: (a, b) => (a.user_code || '').localeCompare(b.user_code || ''),
      render: (text) => <span style={{ fontWeight: 600, color: THEME.primary }}>{text}</span>
    },
    {
      title: 'User Name',
      dataIndex: 'user_name',
      key: 'user_name',
      width: 150,
      sorter: (a, b) => (a.user_name || '').localeCompare(b.user_name || ''),
    },
    {
      title: 'Group',
      dataIndex: 'user_primary_group',
      key: 'user_primary_group',
      width: 120,
      render: (val) => val ? <span style={{ color: THEME.primary, fontWeight: 500 }}>{val}</span> : '—',
    },
    {
      title: 'Default Location',
      dataIndex: 'user_default_location',
      key: 'user_default_location',
      width: 200,
      render: getOfficeLocation,
    },
    {
      title: 'Status',
      dataIndex: 'user_status',
      key: 'user_status',
      width: 80,
      render: (val) => {
        const statusMap = { 'A': 'Active', 'I': 'Inactive' };
        return val === 'A' ?
          <span style={{ color: THEME.success, fontWeight: 500 }}>●{statusMap[val]}</span> :
          <span style={{ color: THEME.danger, fontWeight: 500 }}>●{statusMap[val]}</span>;
      }
    },
    {
      title: 'Admin',
      dataIndex: 'user_admin_allow',
      key: 'user_admin_allow',
      width: 70,
      render: (val) => val === 'Y' ? <span style={{ color: THEME.danger }}>✓ Yes</span> : <span>— No</span>,
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
            title="Delete User"
            description="Are you sure you want to delete this user?"
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
                    <UserOutlined style={{ fontSize: '24px', color: '#fff' }} />
                  </div>
                  <div>
                    <Title level={3} style={{ margin: 0, color: '#1f2937' }}>
                      User Master
                    </Title>
                    <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '12px' }}>
                      Manage users and access control
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
                    Add User
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
              rowKey={(r) => r.user_code}
              columns={columns}
              dataSource={filteredData}
              loading={loading}
              size={isMobile ? 'small' : 'large'}
              bordered={false}
              scroll={{ x: 'max-content' }}
              pagination={{
                pageSize: isMobile ? 10 : 20,
                showTotal: (total) => searchText ? `${total} of ${data.length} users (filtered)` : `${total} users`,
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
            <UserOutlined style={{ color: THEME.primary, fontSize: '20px' }} />
            <span>{editing ? 'Edit User' : 'Add New User'}</span>
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
                label: '👤 Basic Info',
                children: (
                  <>
                    <Form.Item
                      name="user_code"
                      label="User Code"
                      rules={[{ required: true, message: 'User code is required' }]}
                    >
                      <Input
                        placeholder="Enter user code"
                        maxLength={10}
                        disabled={!!editing}
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="user_name"
                      label="User Name"
                      rules={[{ required: true, message: 'User name is required' }]}
                    >
                      <Input
                        placeholder="Enter full user name"
                        maxLength={75}
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="user_password"
                      label="Password"
                      rules={[{ required: true, message: 'Password is required' }]}
                    >
                      <Input.Password
                        placeholder="Enter password"
                        maxLength={15}
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="user_primary_group"
                      label="Primary Group"
                      rules={[{ required: true, message: 'Primary group is required' }]}
                    >
                      <Input
                        placeholder="Enter primary group code"
                        maxLength={10}
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: 'access',
                label: '🔐 Access & Location',
                children: (
                  <>
                    <Form.Item
                      name="user_status"
                      label="Status"
                      rules={[{ required: true, message: 'Status is required' }]}
                    >
                      <Select
                        placeholder="Select status..."
                        options={[
                          { value: 'A', label: 'A - Active' },
                          { value: 'I', label: 'I - Inactive' },
                        ]}
                      />
                    </Form.Item>
                    <Form.Item
                      name="user_admin_allow"
                      label="Admin Access"
                      rules={[{ required: true, message: 'Admin access is required' }]}
                    >
                      <Select
                        placeholder="Select admin access..."
                        options={[
                          { value: 'Y', label: 'Y - Yes (Admin)' },
                          { value: 'N', label: 'N - No (Regular User)' },
                        ]}
                      />
                    </Form.Item>
                    <Form.Item
                      name="user_default_company"
                      label="Default Company"
                      rules={[{ required: true, message: 'Default company is required' }]}
                    >
                      <Input
                        placeholder="Enter default company"
                        maxLength={10}
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="user_default_location"
                      label="Default Location/Office"
                    >
                      <Select
                        placeholder="Select default office location..."
                        allowClear
                        showSearch
                        filterOption={(input, option) => {
                          const label = (option?.label ?? '').toLowerCase();
                          return label.includes(input.toLowerCase());
                        }}
                        options={offices.map(office => ({
                          value: office.off_office,
                          label: `${office.off_office} - ${office.off_office_name}`,
                        }))}
                      />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: 'screens',
                label: '📺 Allowed Screens',
                children: (
                  <>
                    <Form.Item
                      name="user_allowed_screens"
                      label="Select Screens/Modules User Can Access"
                    >
                      <Checkbox.Group
                        options={AVAILABLE_SCREENS}
                        style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                      />
                    </Form.Item>
                    <Alert
                      type="info"
                      message="Select which screens the user can access from the main menu"
                      showIcon
                      style={{ marginTop: 16 }}
                    />
                  </>
                ),
              },
              {
                key: 'dates',
                label: '📅 Password Dates',
                children: (
                  <>
                    <Form.Item
                      name="user_last_password_changed_on"
                      label="Last Password Changed On"
                    >
                      <DatePicker
                        placeholder="Select date"
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="user_next_password_change_on"
                      label="Next Password Change On"
                    >
                      <DatePicker
                        placeholder="Select date"
                        style={{ width: '100%' }}
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
                      <Form.Item key={i} name={`user_filter_${i}`} label={`Filter ${i}`}>
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
