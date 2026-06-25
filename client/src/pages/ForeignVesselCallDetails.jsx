import { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber,
  Space, Popconfirm, message, Typography, Grid, Alert, Card, Row, Col
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { vesselCallApi, vesselApi, arMasterApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import QuickAddSelect from '../components/QuickAddSelect';

const { Title } = Typography;
const { useBreakpoint } = Grid;

const THEME = {
  primary: '#1890ff',
  success: '#52c41a',
  danger: '#ff4d4f',
  cardBg: '#ffffff',
  background: '#f8f9fa',
};

const PARTY_OPTIONS = [
  { value: 'OWNER', label: 'Owner' },
  { value: 'OPERATOR', label: 'Operator' },
  { value: 'CHARTERER', label: 'Charterer' },
  { value: 'AGENT', label: 'Agent' },
  { value: 'BROKER', label: 'Broker' },
  // kept for legacy display only
];

const STATUS_OPTIONS = [
  { value: 'A', label: 'A - Active' },
  { value: 'I', label: 'I - Inactive' },
];

export default function ForeignVesselCallDetails() {
  const { canEdit } = useAuth();
  const [data, setData] = useState([]);
  const [vessels, setVessels] = useState([]);
  const [arCodes, setArCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const [vesselQForm] = Form.useForm();
  const [quickAddVessel, setQuickAddVessel] = useState(null);
  const [savingVessel, setSavingVessel] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  useEffect(() => {
    Promise.all([vesselApi.getAll(), arMasterApi.getAll()])
      .then(([vesselsList, ars]) => { setVessels(vesselsList); setArCodes(ars); })
      .catch(() => {});
  }, []);

  const fetchData = async (activeFilters) => {
    setLoading(true);
    setError(null);
    try {
      const calls = await vesselCallApi.getAll(activeFilters ?? filters);
      setData(calls);
      setSearched(true);
    } catch (err) {
      setError(err.message);
      message.error('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => fetchData(filters);

  const handleClearFilters = () => {
    setFilters({});
    setData([]);
    setSearched(false);
  };

  const openAdd = async () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ qfvc_status: 'A' });
    setModalOpen(true);
    try {
      const latest = await vesselCallApi.getAll({ refno: '' });
      const maxRefno = latest.length > 0 ? Math.max(...latest.map(d => Number(d.qfvc_refno) || 0)) + 1 : 1;
      form.setFieldsValue({ qfvc_refno: maxRefno });
    } catch (_) {}
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      qfvc_refno: record.qfvc_refno,
      qfvc_vessel: record.qfvc_vessel,
      qfvc_name: record.qfvc_name,
      qfvc_party: record.qfvc_party != null ? String(record.qfvc_party) : undefined,
      qfvc_eta: record.qfvc_eta ? dayjs(record.qfvc_eta) : null,
      qfvc_etd: record.qfvc_etd ? dayjs(record.qfvc_etd) : null,
      qfvc_l_date: record.qfvc_l_date ? dayjs(record.qfvc_l_date) : null,
      qfvc_captain: record.qfvc_captain,
      qfvc_remarks: record.qfvc_remarks,
      qfvc_status: record.qfvc_status,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const formatDate = (date) => {
        if (!date) return null;
        if (typeof date === 'string') return date;
        return dayjs(date).format('YYYY-MM-DD');
      };

      const payload = {
        ...values,
        qfvc_eta: formatDate(values.qfvc_eta),
        qfvc_etd: formatDate(values.qfvc_etd),
        qfvc_l_date: formatDate(values.qfvc_l_date),
      };

      if (editing) {
        await vesselCallApi.update(editing.qfvc_company, editing.qfvc_refno, payload);
        message.success('Vessel call updated successfully.');
      } else {
        await vesselCallApi.create(payload);
        message.success('Vessel call created successfully.');
      }
      setModalOpen(false);
      if (searched) fetchData();
    } catch (err) {
      if (err.message) message.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (record) => {
    try {
      await vesselCallApi.remove(record.qfvc_company, record.qfvc_refno);
      message.success('Vessel call deleted successfully.');
      if (searched) fetchData();
    } catch (err) {
      message.error(err.message);
    }
  };

  const fetchVessels = async () => {
    const list = await vesselApi.getAll();
    setVessels(list);
    return list;
  };

  const handleQuickAddVessel = (text) => {
    vesselQForm.resetFields();
    vesselQForm.setFieldsValue({ vessel_code: text.toUpperCase() });
    setQuickAddVessel(text);
  };

  const handleSaveQuickVessel = async () => {
    try {
      const values = await vesselQForm.validateFields();
      setSavingVessel(true);
      const newVessel = await vesselApi.create(values);
      const list = await fetchVessels();
      const found = list.find(v => v.vessel_code === newVessel.vessel_code);
      form.setFieldsValue({
        qfvc_vessel: newVessel.vessel_code,
        qfvc_name: newVessel.vessel_name,
      });
      setQuickAddVessel(null);
      message.success(`Vessel "${newVessel.vessel_code}" added.`);
    } catch (err) {
      if (err.message) message.error(err.message);
    } finally {
      setSavingVessel(false);
    }
  };

  const getVesselLabel = (code) => {
    if (!code) return '—';
    const vessel = vessels.find(v => v.vessel_code === code);
    return vessel ? `${vessel.vessel_code} - ${vessel.vessel_name}` : code;
  };

  const getPartyLabel = (code) => {
    const ar = arCodes.find(a => String(a.ar_code) === String(code));
    return ar ? `${ar.ar_code} — ${ar.ar_name}` : code;
  };

  const getStatusLabel = (status) => {
    const stat = STATUS_OPTIONS.find(s => s.value === status);
    return stat ? stat.label : status;
  };

  const columns = [
    {
      title: 'Ref No',
      dataIndex: 'qfvc_refno',
      key: 'qfvc_refno',
      width: 80,
      sorter: (a, b) => a.qfvc_refno - b.qfvc_refno,
      render: (text) => <span style={{ fontWeight: 600, color: THEME.primary }}>{text}</span>
    },
    {
      title: 'Vessel',
      dataIndex: 'qfvc_vessel',
      key: 'qfvc_vessel',
      width: 180,
      render: getVesselLabel,
    },
    {
      title: 'Vessel Name',
      dataIndex: 'qfvc_name',
      key: 'qfvc_name',
      width: 150,
    },
    {
      title: 'Party',
      dataIndex: 'qfvc_party',
      key: 'qfvc_party',
      width: 100,
      render: getPartyLabel,
    },
    {
      title: 'Captain',
      dataIndex: 'qfvc_captain',
      key: 'qfvc_captain',
      width: 150,
      responsive: ['md'],
    },
    {
      title: 'ETA',
      dataIndex: 'qfvc_eta',
      key: 'qfvc_eta',
      width: 110,
      render: (date) => date ? new Date(date).toLocaleDateString() : '—',
    },
    {
      title: 'ETD',
      dataIndex: 'qfvc_etd',
      key: 'qfvc_etd',
      width: 110,
      render: (date) => date ? new Date(date).toLocaleDateString() : '—',
    },
    {
      title: 'Status',
      dataIndex: 'qfvc_status',
      key: 'qfvc_status',
      width: 100,
      render: (status) => {
        const colors = { 'A': THEME.success, 'I': THEME.danger };
        return <span style={{ color: colors[status] || '#999', fontWeight: 500 }}>● {getStatusLabel(status)}</span>;
      }
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
            title="Delete Vessel Call"
            description="Are you sure you want to delete this vessel call?"
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
                  <div style={{ width: 48, height: 48, borderRadius: '10px', background: 'linear-gradient(135deg, #1890ff, #69b1ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                    ⛴️
                  </div>
                  <div>
                    <Title level={3} style={{ margin: 0, color: '#1f2937' }}>Foreign Vessel Call Details</Title>
                    <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '12px' }}>Manage vessel call information and schedules</p>
                  </div>
                </Space>
              </Col>
              <Col>
                <Space>
                  <Button size="large" loading={loading} onClick={handleSearch}
                    style={{ borderRadius: 8, height: 40, fontWeight: 600, background: '#1890ff', color: '#fff', border: 'none' }}>
                    Search
                  </Button>
                  <Button size="large" onClick={handleClearFilters} style={{ borderRadius: 8, height: 40 }}>Clear</Button>
                  {canEdit && (
                    <Button type="primary" size="large" icon={<PlusOutlined />} onClick={openAdd}
                      style={{ borderRadius: 8, height: 40, fontWeight: 600 }}>
                      Add Call
                    </Button>
                  )}
                </Space>
              </Col>
            </Row>

            <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={12} md={4}>
                <Input size="large" placeholder="Ref #" allowClear
                  value={filters.refno || ''}
                  onChange={e => setFilters(f => ({ ...f, refno: e.target.value }))}
                  onPressEnter={handleSearch} />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Input size="large" placeholder="Vessel" allowClear
                  value={filters.vessel || ''}
                  onChange={e => setFilters(f => ({ ...f, vessel: e.target.value }))}
                  onPressEnter={handleSearch} />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Select allowClear showSearch size="large" style={{ width: '100%' }} placeholder="Party (AR Code)"
                  filterOption={(input, opt) => (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                  options={arCodes.map(a => ({ value: String(a.ar_code), label: `${a.ar_code} — ${a.ar_name || ''}` }))}
                  value={filters.party || undefined}
                  onChange={v => setFilters(f => ({ ...f, party: v }))} />
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Select allowClear size="large" style={{ width: '100%' }} placeholder="Status"
                  options={STATUS_OPTIONS}
                  value={filters.status || undefined}
                  onChange={v => setFilters(f => ({ ...f, status: v }))} />
              </Col>
            </Row>

            {error && (
              <Alert type="error" message={error} closable style={{ marginBottom: 20, borderRadius: '8px' }} />
            )}

            {!searched ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>⛴️</div>
                <p style={{ margin: 0, fontSize: 15 }}>Click <strong>Search</strong> to load vessel calls</p>
              </div>
            ) : (
              <Table
                rowKey={(r) => `${r.qfvc_company}-${r.qfvc_refno}`}
                columns={columns}
                dataSource={data}
                loading={loading}
                size={isMobile ? 'small' : 'large'}
                bordered={false}
                scroll={{ x: 'max-content' }}
                pagination={{ pageSize: isMobile ? 10 : 20, showTotal: t => `${t} calls`, showSizeChanger: !isMobile, style: { marginTop: 20 } }}
                style={{ borderRadius: '8px' }}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '20px' }}>⛴️</span>
            <span>{editing ? 'Edit Vessel Call' : 'Add New Vessel Call'}</span>
          </div>
        }
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="Save"
        cancelText="Cancel"
        confirmLoading={saving}
        destroyOnHidden
        width={isMobile ? '95vw' : 750}
        style={isMobile ? { top: 20 } : {}}
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item name="qfvc_refno" label="Ref #">
            <InputNumber style={{ width: '100%' }} size="large" disabled />
          </Form.Item>

          <Form.Item
            name="qfvc_vessel"
            label="Vessel"
            rules={[{ required: true, message: 'Vessel is required' }]}
          >
            <QuickAddSelect
              placeholder="Select vessel..."
              size="large"
              options={vessels.map(vessel => ({
                value: vessel.vessel_code,
                label: `${vessel.vessel_code} - ${vessel.vessel_name}`,
              }))}
              onChange={(value) => {
                const vessel = vessels.find(v => v.vessel_code === value);
                form.setFieldsValue({ qfvc_name: vessel ? vessel.vessel_name : '' });
              }}
              onQuickAdd={handleQuickAddVessel}
            />
          </Form.Item>

          <Form.Item
            name="qfvc_name"
            label="Vessel Name"
            rules={[{ required: true, message: 'Vessel name is required' }]}
          >
            <Input
              placeholder="Auto-filled from vessel selection"
              maxLength={50}
              size="large"
              readOnly
              style={{ borderRadius: '8px', background: '#f5f5f5', cursor: 'not-allowed' }}
            />
          </Form.Item>

          <Form.Item
            name="qfvc_party"
            label="Party"
            rules={[{ required: true, message: 'Party is required' }]}
          >
            <Select
              showSearch allowClear size="large"
              placeholder="Select party (AR code)..."
              filterOption={(input, opt) => (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              options={arCodes.map(a => ({ value: String(a.ar_code), label: `${a.ar_code} — ${a.ar_name || ''}` }))}
            />
          </Form.Item>

          <Form.Item
            name="qfvc_captain"
            label="Captain Name"
            rules={[{ required: true, message: 'Captain name is required' }]}
          >
            <Input
              placeholder="Enter captain name"
              maxLength={75}
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="qfvc_remarks"
            label="Remarks"
            rules={[{ required: true, message: 'Remarks are required' }]}
          >
            <Input.TextArea
              placeholder="Enter remarks"
              maxLength={240}
              rows={3}
              showCount
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item name="qfvc_eta" label="ETA (Estimated Time of Arrival)">
            <DatePicker placeholder="Select ETA date" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="qfvc_etd" label="ETD (Estimated Time of Departure)">
            <DatePicker placeholder="Select ETD date" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="qfvc_l_date" label="Loading Date">
            <DatePicker placeholder="Select loading date" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="qfvc_status"
            label="Status"
            rules={[{ required: true, message: 'Status is required' }]}
          >
            <Select
              placeholder="Select status..."
              options={STATUS_OPTIONS}
              size="large"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={<Space><PlusOutlined /><span>Add New Vessel</span></Space>}
        open={quickAddVessel !== null}
        onOk={handleSaveQuickVessel}
        onCancel={() => setQuickAddVessel(null)}
        okText="Save" cancelText="Cancel"
        confirmLoading={savingVessel}
        destroyOnHidden width={400}
      >
        <Form form={vesselQForm} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item name="vessel_code" label="Vessel Code" rules={[{ required: true, message: 'Required' }]}>
            <Input maxLength={10} size="large" style={{ textTransform: 'uppercase' }} />
          </Form.Item>
          <Form.Item name="vessel_name" label="Vessel Name" rules={[{ required: true, message: 'Required' }]}>
            <Input maxLength={75} size="large" />
          </Form.Item>
          <Form.Item name="vessel_year_build" label="Year Built" rules={[{ required: true, message: 'Required' }]}>
            <InputNumber min={1900} max={new Date().getFullYear()} style={{ width: '100%' }} size="large" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
