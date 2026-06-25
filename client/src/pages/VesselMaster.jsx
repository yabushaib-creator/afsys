import { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, Checkbox,
  Space, Popconfirm, message, Typography, Grid, Tabs, Alert, Card, Row, Col, InputNumber
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { vesselApi, lineApi, countryApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import QuickAddSelect from '../components/QuickAddSelect';

const API_BASE = 'http://localhost:5000';

const { Title } = Typography;
const { useBreakpoint } = Grid;

const THEME = {
  primary: '#1890ff',
  success: '#52c41a',
  danger: '#ff4d4f',
  cardBg: '#ffffff',
  background: '#f8f9fa',
};

export default function VesselMaster() {
  const { canEdit } = useAuth();
  const [data, setData] = useState([]);
  const [lines, setLines] = useState([]);
  const [countries, setCountries] = useState([]);
  const [cargoTypes, setCargoTypes] = useState([]);
  const [vesselStatuses, setVesselStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [quickAddLine, setQuickAddLine] = useState(null);
  const [lineForm] = Form.useForm();
  const [savingLine, setSavingLine] = useState(false);
  const [quickAddCountry, setQuickAddCountry] = useState(null);
  const [countryQForm] = Form.useForm();
  const [savingCountry, setSavingCountry] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const fetchLines = async () => {
    try {
      const linesData = await lineApi.getAll();
      setLines(linesData);
    } catch (err) {
      console.error('Failed to load lines:', err);
    }
  };

  const fetchCountries = async () => {
    try {
      const countriesData = await countryApi.getAll();
      setCountries(countriesData);
    } catch (err) {
      console.error('Failed to load countries:', err);
    }
  };

  const fetchCargoTypes = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/cargo-types`);
      const data = await res.json();
      setCargoTypes(data);
    } catch (err) {
      console.error('Failed to load cargo types:', err);
    }
  };

  const fetchVesselStatuses = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/vessel-statuses`);
      const data = await res.json();
      setVesselStatuses(data);
    } catch (err) {
      console.error('Failed to load vessel statuses:', err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await vesselApi.getAll();
      setData(rows);
    } catch (err) {
      setError(err.message);
      message.error('Failed to load vessels: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchLines();
    fetchCountries();
    fetchCargoTypes();
    fetchVesselStatuses();
  }, []);

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      vessel_code: record.vessel_code,
      vessel_name: record.vessel_name,
      vessel_owned_line: record.vessel_owned_line,
      vessel_flag_country: record.vessel_flag_country,
      vessel_year_build: record.vessel_year_build,
      vessel_cargo: record.vessel_cargo,
      vessel_imco_allow: record.vessel_imco_allow,
      vessel_reefer_allow: record.vessel_reefer_allow,
      vessel_out_allow: record.vessel_out_allow,
      vessel_45_status: record.vessel_45_status,
      vessel_lifting_capacity: record.vessel_lifting_capacity,
      vessel_ramp_capacity: record.vessel_ramp_capacity,
      vessel_height_clearance: record.vessel_height_clearance,
      vessel_flex_1: record.vessel_flex_1,
      vessel_flex_2: record.vessel_flex_2,
      vessel_flex_3: record.vessel_flex_3,
      vessel_notes: record.vessel_notes,
      vessel_filter_0: record.vessel_filter_0,
      vessel_filter_1: record.vessel_filter_1,
      vessel_filter_2: record.vessel_filter_2,
      vessel_filter_3: record.vessel_filter_3,
      vessel_filter_4: record.vessel_filter_4,
      vessel_filter_5: record.vessel_filter_5,
      vessel_filter_6: record.vessel_filter_6,
      vessel_filter_7: record.vessel_filter_7,
      vessel_filter_8: record.vessel_filter_8,
      vessel_filter_9: record.vessel_filter_9,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      // All fields are already in correct format from dropdowns
      const payload = {
        ...values,
      };

      if (editing) {
        await vesselApi.update(editing.vessel_code, payload);
        message.success('Vessel updated successfully.');
      } else {
        await vesselApi.create(payload);
        message.success('Vessel created successfully.');
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
      await vesselApi.remove(record.vessel_code);
      message.success('Vessel deleted successfully.');
      fetchData();
    } catch (err) {
      message.error(err.message);
    }
  };

  const getCargoTypeLabel = (code) => {
    if (!code) return '—';
    const cargo = cargoTypes.find(c => c.value === code);
    return cargo ? cargo.label : code;
  };

  const getLineNameLabel = (code) => {
    if (!code) return '—';
    const line = lines.find(l => l.line_code === code);
    return line ? `${line.line_code} - ${line.line_name}` : code;
  };

  const getStatusLabel = (code) => {
    if (!code) return '—';
    const status = vesselStatuses.find(s => s.value === code);
    return status ? status.label : code;
  };

  const handleQuickAddLine = (searchText) => {
    lineForm.resetFields();
    lineForm.setFieldsValue({ line_code: searchText.toUpperCase() });
    setQuickAddLine(searchText);
  };

  const handleSaveQuickLine = async () => {
    try {
      const values = await lineForm.validateFields();
      setSavingLine(true);
      const newLine = await lineApi.create(values);
      await fetchLines();
      form.setFieldsValue({ vessel_owned_line: newLine.line_code });
      setQuickAddLine(null);
      message.success(`Line "${newLine.line_code}" added.`);
    } catch (err) {
      if (err.message) message.error(err.message);
    } finally {
      setSavingLine(false);
    }
  };

  const handleQuickAddCountry = (text) => {
    countryQForm.resetFields();
    countryQForm.setFieldsValue({ country_code: text.toUpperCase() });
    setQuickAddCountry(text);
  };

  const handleSaveQuickCountry = async () => {
    try {
      const values = await countryQForm.validateFields();
      setSavingCountry(true);
      const newCountry = await countryApi.create(values);
      const updated = await countryApi.getAll();
      setCountries(updated);
      form.setFieldsValue({ vessel_flag_country: newCountry.country_code });
      setQuickAddCountry(null);
      message.success(`Country "${newCountry.country_code}" added.`);
    } catch (err) {
      if (err.message) message.error(err.message);
    } finally {
      setSavingCountry(false);
    }
  };

  const filteredData = searchText
    ? data.filter(vessel =>
        (vessel.vessel_code || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (vessel.vessel_name || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (vessel.vessel_owned_line || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (vessel.vessel_flag_country || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (vessel.vessel_flex_1 || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (vessel.vessel_flex_2 || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (vessel.vessel_flex_3 || '').toLowerCase().includes(searchText.toLowerCase())
      )
    : data;

  const columns = [
    {
      title: 'Code',
      dataIndex: 'vessel_code',
      key: 'vessel_code',
      width: 110,
      fixed: 'left',
      sorter: (a, b) => (a.vessel_code || '').localeCompare(b.vessel_code || ''),
      render: (text) => <span style={{ fontWeight: 600, color: THEME.primary }}>{text}</span>
    },
    {
      title: 'Vessel Name',
      dataIndex: 'vessel_name',
      key: 'vessel_name',
      width: 200,
      sorter: (a, b) => (a.vessel_name || '').localeCompare(b.vessel_name || ''),
    },
    {
      title: 'Line/Carrier',
      dataIndex: 'vessel_owned_line',
      key: 'vessel_owned_line',
      width: 220,
      render: getLineNameLabel,
    },
    {
      title: 'Country',
      dataIndex: 'vessel_flag_country',
      key: 'vessel_flag_country',
      width: 100,
      render: (val) => val ? <span style={{ color: THEME.primary, fontWeight: 500 }}>{val}</span> : '—',
    },
    {
      title: 'Cargo Type',
      dataIndex: 'vessel_cargo',
      key: 'vessel_cargo',
      width: 140,
      render: getCargoTypeLabel,
    },
    {
      title: 'Year Built',
      dataIndex: 'vessel_year_build',
      key: 'vessel_year_build',
      width: 90,
      render: (val) => val || '—',
    },
    {
      title: 'Lifting Cap',
      dataIndex: 'vessel_lifting_capacity',
      key: 'vessel_lifting_capacity',
      width: 110,
      render: (val) => val ? `${val}T` : '—',
    },
    {
      title: 'Ramp Cap',
      dataIndex: 'vessel_ramp_capacity',
      key: 'vessel_ramp_capacity',
      width: 110,
      render: (val) => val ? `${val}T` : '—',
    },
    {
      title: 'Height',
      dataIndex: 'vessel_height_clearance',
      key: 'vessel_height_clearance',
      width: 90,
      render: (val) => val ? `${val}m` : '—',
    },
    {
      title: 'IMCO',
      dataIndex: 'vessel_imco_allow',
      key: 'vessel_imco_allow',
      width: 80,
      render: getStatusLabel,
    },
    {
      title: 'Reefer',
      dataIndex: 'vessel_reefer_allow',
      key: 'vessel_reefer_allow',
      width: 80,
      render: getStatusLabel,
    },
    {
      title: 'Out Gauge',
      dataIndex: 'vessel_out_allow',
      key: 'vessel_out_allow',
      width: 90,
      render: getStatusLabel,
    },
    {
      title: "45' Container",
      dataIndex: 'vessel_45_status',
      key: 'vessel_45_status',
      width: 110,
      render: getStatusLabel,
    },
    {
      title: 'Flex 1',
      dataIndex: 'vessel_flex_1',
      key: 'vessel_flex_1',
      width: 120,
      render: (val) => val || '—',
    },
    {
      title: 'Flex 2',
      dataIndex: 'vessel_flex_2',
      key: 'vessel_flex_2',
      width: 120,
      render: (val) => val || '—',
    },
    {
      title: 'Flex 3',
      dataIndex: 'vessel_flex_3',
      key: 'vessel_flex_3',
      width: 120,
      render: (val) => val || '—',
    },
    {
      title: 'Notes',
      dataIndex: 'vessel_notes',
      key: 'vessel_notes',
      width: 150,
      render: (val) => val ? <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px', display: 'block' }}>{val}</span> : '—',
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
            title="Delete Vessel"
            description="Are you sure you want to delete this vessel?"
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
    <div style={{ background: THEME.background, minHeight: '100vh', padding: isMobile ? '12px' : '20px' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            style={{
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              border: 'none',
              background: THEME.cardBg,
              height: 'calc(100vh - 60px)',
              display: 'flex',
              flexDirection: 'column',
            }}
            bodyStyle={{ padding: isMobile ? '16px' : '20px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          >
            <Row gutter={[16, 16]} align="middle" justify="space-between" style={{ marginBottom: 16 }}>
              <Col flex="auto">
                <Space>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '10px',
                    background: `linear-gradient(135deg, ${THEME.primary}, #69b1ff)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                  }}>
                    ⛴️
                  </div>
                  <div>
                    <Title level={3} style={{ margin: 0, color: '#1f2937' }}>
                      Vessel Master
                    </Title>
                    <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '12px' }}>
                      Manage your vessel fleet
                    </p>
                  </div>
                </Space>
              </Col>
              <Col flex="auto" style={{ minWidth: '250px' }}>
                <Input
                  placeholder="🔍 Search by code, name, line, country..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  size="large"
                  style={{
                    borderRadius: '8px',
                    width: '100%',
                  }}
                />
              </Col>
              {canEdit && (
                <Col>
                  <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={openAdd}
                    style={{
                      borderRadius: '8px',
                      height: '40px',
                      fontSize: '14px',
                      fontWeight: 600,
                    }}
                  >
                    {!isMobile && 'Add Vessel'}
                  </Button>
                </Col>
              )}
            </Row>

            {error && (
              <Alert
                type="error"
                message={error}
                closable
                style={{ marginBottom: 16, borderRadius: '8px' }}
              />
            )}

            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <Table
                rowKey={(r) => r.vessel_code}
                columns={columns}
                dataSource={filteredData}
                loading={loading}
                size={isMobile ? 'small' : 'middle'}
                bordered={false}
                scroll={{ x: 1800, y: 'calc(100vh - 280px)' }}
                pagination={{
                  pageSize: isMobile ? 15 : 30,
                  showTotal: (total) => searchText ? `${total} of ${data.length} vessels (filtered)` : `${total} vessels`,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  position: ['bottomRight'],
                }}
                style={{ borderRadius: '8px' }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '20px' }}>⛴️</span>
            <span>{editing ? 'Edit Vessel' : 'Add New Vessel'}</span>
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
                      name="vessel_code"
                      label="Vessel Code"
                      rules={[{ required: true, message: 'Code is required' }]}
                    >
                      <Input
                        placeholder="Enter vessel code"
                        maxLength={10}
                        disabled={!!editing}
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="vessel_name"
                      label="Vessel Name"
                      rules={[{ required: true, message: 'Vessel name is required' }]}
                    >
                      <Input
                        placeholder="Enter vessel name"
                        maxLength={75}
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="vessel_owned_line"
                      label="Line (Carrier)"
                    >
                      <QuickAddSelect
                        placeholder="Type line code or name..."
                        allowClear
                        size="large"
                        style={{ borderRadius: '8px' }}
                        options={lines.map(line => ({
                          value: line.line_code,
                          label: `${line.line_code} - ${line.line_name}`,
                        }))}
                        onQuickAdd={handleQuickAddLine}
                      />
                    </Form.Item>
                    <Form.Item
                      name="vessel_flag_country"
                      label="Flag Country"
                    >
                      <QuickAddSelect
                        placeholder="Type country code or name..."
                        allowClear
                        size="large"
                        style={{ borderRadius: '8px' }}
                        options={countries.map(country => ({
                          value: country.country_code,
                          label: `${country.country_code} - ${country.country_name}`,
                        }))}
                        onQuickAdd={handleQuickAddCountry}
                      />
                    </Form.Item>
                    <Form.Item
                      name="vessel_year_build"
                      label="Year Built"
                      rules={[{ required: true, message: 'Year is required' }]}
                    >
                      <InputNumber
                        min={1900}
                        max={new Date().getFullYear()}
                        placeholder="Enter year"
                        size="large"
                        style={{ width: '100%', borderRadius: '8px' }}
                      />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: 'capabilities',
                label: '✅ Capabilities',
                children: (
                  <>
                    <Form.Item
                      name="vessel_cargo"
                      label="Allowed Cargo Type"
                    >
                      <Select
                        placeholder="Select cargo type..."
                        allowClear
                        size="large"
                        options={cargoTypes}
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="vessel_imco_allow"
                      label="IMCO Status"
                    >
                      <Select
                        placeholder="Select status..."
                        allowClear
                        size="large"
                        options={vesselStatuses}
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="vessel_reefer_allow"
                      label="Reefer Status"
                    >
                      <Select
                        placeholder="Select status..."
                        allowClear
                        size="large"
                        options={vesselStatuses}
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="vessel_out_allow"
                      label="Out of Gauge Status"
                    >
                      <Select
                        placeholder="Select status..."
                        allowClear
                        size="large"
                        options={vesselStatuses}
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="vessel_45_status"
                      label="45' Container Status"
                    >
                      <Select
                        placeholder="Select status..."
                        allowClear
                        size="large"
                        options={vesselStatuses}
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: 'capacity',
                label: '📏 Capacity & Clearance',
                children: (
                  <>
                    <Form.Item
                      name="vessel_lifting_capacity"
                      label="Lifting Capacity (tons)"
                    >
                      <InputNumber
                        placeholder="Enter lifting capacity"
                        min={0}
                        size="large"
                        style={{ width: '100%', borderRadius: '8px' }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="vessel_ramp_capacity"
                      label="Ramp Capacity (tons)"
                    >
                      <InputNumber
                        placeholder="Enter ramp capacity"
                        min={0}
                        size="large"
                        style={{ width: '100%', borderRadius: '8px' }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="vessel_height_clearance"
                      label="Height Clearance (meters)"
                    >
                      <InputNumber
                        placeholder="Enter height clearance"
                        min={0}
                        precision={2}
                        size="large"
                        style={{ width: '100%', borderRadius: '8px' }}
                      />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: 'flex',
                label: '⚙️ Flex Fields',
                children: (
                  <>
                    <Form.Item name="vessel_flex_1" label="Flex 1">
                      <Input
                        placeholder="Enter flex 1"
                        maxLength={240}
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                    <Form.Item name="vessel_flex_2" label="Flex 2">
                      <Input
                        placeholder="Enter flex 2"
                        maxLength={240}
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                    <Form.Item name="vessel_flex_3" label="Flex 3">
                      <Input
                        placeholder="Enter flex 3"
                        maxLength={240}
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: 'notes',
                label: '📝 Notes',
                children: (
                  <>
                    <Form.Item name="vessel_notes" label="Notes">
                      <Input.TextArea
                        placeholder="Enter notes"
                        maxLength={2000}
                        rows={6}
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
                      <Form.Item key={i} name={`vessel_filter_${i}`} label={`Filter ${i}`}>
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

      {/* Quick Add Country Modal */}
      <Modal
        title={<Space><PlusOutlined /><span>Add New Country</span></Space>}
        open={quickAddCountry !== null}
        onOk={handleSaveQuickCountry}
        onCancel={() => setQuickAddCountry(null)}
        okText="Save" cancelText="Cancel"
        confirmLoading={savingCountry}
        destroyOnHidden width={480}
      >
        <Form form={countryQForm} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item name="country_code" label="Country Code" rules={[{ required: true, message: 'Required' }]}>
            <Input maxLength={10} size="large" style={{ textTransform: 'uppercase' }} />
          </Form.Item>
          <Form.Item name="country_name" label="Country Name" rules={[{ required: true, message: 'Required' }]}>
            <Input maxLength={75} size="large" />
          </Form.Item>
          <Form.Item name="country_uncode" label="UN Code" rules={[{ required: true, message: 'Required' }]}>
            <Input maxLength={10} size="large" />
          </Form.Item>
          <Form.Item name="country_cargo_centre" label="Cargo Centre" rules={[{ required: true, message: 'Required' }]}>
            <Input maxLength={10} size="large" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Quick Add Line Modal */}
      <Modal
        title={<Space><PlusOutlined /><span>Add New Line (Carrier)</span></Space>}
        open={quickAddLine !== null}
        onOk={handleSaveQuickLine}
        onCancel={() => setQuickAddLine(null)}
        okText="Save"
        cancelText="Cancel"
        confirmLoading={savingLine}
        destroyOnHidden
        width={480}
      >
        <Form form={lineForm} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item name="line_code" label="Line Code" rules={[{ required: true, message: 'Required' }]}>
            <Input maxLength={10} size="large" style={{ textTransform: 'uppercase' }} />
          </Form.Item>
          <Form.Item name="line_name" label="Line Name" rules={[{ required: true, message: 'Required' }]}>
            <Input maxLength={50} size="large" />
          </Form.Item>
          <Form.Item name="line_address_1" label="Address" rules={[{ required: true, message: 'Required' }]}>
            <Input maxLength={75} size="large" />
          </Form.Item>
          <Form.Item name="line_telephone" label="Telephone" rules={[{ required: true, message: 'Required' }]}>
            <Input maxLength={20} size="large" />
          </Form.Item>
          <Form.Item name="line_fax" label="Fax" rules={[{ required: true, message: 'Required' }]}>
            <Input maxLength={20} size="large" />
          </Form.Item>
          <Form.Item name="line_email" label="Email" rules={[{ required: true, message: 'Required' }, { type: 'email', message: 'Invalid email' }]}>
            <Input maxLength={75} size="large" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
