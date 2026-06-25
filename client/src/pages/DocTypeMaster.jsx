import { useEffect, useState } from 'react';
import {
  Table, Button, Form, Input, Select, InputNumber,
  Space, Popconfirm, message, Typography, Grid, Card, Row, Col,
  Drawer, Tag, Switch
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { docTypeMasterApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;
const { useBreakpoint } = Grid;

const YN_OPTIONS = [
  { value: 'Y', label: 'Yes' },
  { value: 'N', label: 'No' },
];

export default function DocTypeMaster() {
  const { canEdit } = useAuth();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [rows, setRows]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [searchText, setSearchText] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing]       = useState(null);
  const [saving, setSaving]         = useState(false);
  const [form] = Form.useForm();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try { setRows(await docTypeMasterApi.getAll()); }
    catch (err) { message.error(err.message); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    form.resetFields();
    form.setFieldsValue({
      doc_approval_required: 'N',
      doc_approval_numbers: 0,
      doc_starting_number: 1,
      doc_print_call_1: 'N',
      doc_print_call_2: 'N',
      doc_print_call_3: 'N',
      doc_print_call_4: 'Y',
      doc_printer: 'LPT1',
      doc_printing: 'N',
      doc_online_posting: 'N',
    });
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({ ...record });
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editing) {
        await docTypeMasterApi.update(editing.doc_company, editing.doc_type, values);
        message.success('Document type updated.');
      } else {
        await docTypeMasterApi.create(values);
        message.success('Document type created.');
      }
      setDrawerOpen(false);
      fetchAll();
    } catch (err) {
      if (err.message) message.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (record) => {
    try {
      await docTypeMasterApi.remove(record.doc_company, record.doc_type);
      message.success('Deleted.');
      fetchAll();
    } catch (err) {
      message.error(err.message);
    }
  };

  const columns = [
    { title: 'Type', dataIndex: 'doc_type', key: 'type', width: 90, render: v => <span style={{ fontWeight: 700, color: '#1890ff' }}>{v}</span> },
    { title: 'Name', dataIndex: 'doc_name', key: 'name', ellipsis: true },
    { title: 'Prefix', dataIndex: 'doc_prefix', key: 'prefix', width: 80 },
    { title: 'Short', dataIndex: 'doc_short_name', key: 'short', width: 80, responsive: ['md'] },
    { title: 'Module', dataIndex: 'doc_module', key: 'module', width: 120, responsive: ['lg'] },
    { title: 'Base', dataIndex: 'doc_base', key: 'base', width: 80, responsive: ['md'] },
    { title: 'Posting Module', dataIndex: 'doc_posting_module', key: 'post_mod', width: 120, responsive: ['lg'] },
    { title: 'Start #', dataIndex: 'doc_starting_number', key: 'start', width: 80, align: 'right', responsive: ['xl'] },
    { title: 'Approval', dataIndex: 'doc_approval_required', key: 'approval', width: 90, align: 'center',
      render: v => <Tag color={v === 'Y' ? 'orange' : 'default'}>{v === 'Y' ? 'Yes' : 'No'}</Tag> },
    { title: 'Online Post', dataIndex: 'doc_online_posting', key: 'online', width: 100, align: 'center', responsive: ['xl'],
      render: v => <Tag color={v === 'Y' ? 'green' : 'default'}>{v === 'Y' ? 'Yes' : 'No'}</Tag> },
    ...(canEdit ? [{
      title: '', key: 'actions', width: 80, fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="Delete this document type?" onConfirm={() => handleDelete(record)} okText="Yes" cancelText="No" okButtonProps={{ danger: true }}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    }] : []),
  ];

  const filtered = searchText
    ? rows.filter(r =>
        (r.doc_type || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (r.doc_name || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (r.doc_module || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (r.doc_posting_module || '').toLowerCase().includes(searchText.toLowerCase()))
    : rows;

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', padding: isMobile ? '16px' : '32px' }}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card style={{ borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: 'none' }}
            styles={{ body: { padding: isMobile ? '20px' : '28px' } }}>
            <Row gutter={[16, 16]} align="middle" justify="space-between" style={{ marginBottom: 16 }}>
              <Col flex="auto">
                <Space>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: 'linear-gradient(135deg, #722ed1, #b37feb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📑</div>
                  <div>
                    <Title level={3} style={{ margin: 0, color: '#1f2937' }}>Document Type Master</Title>
                    <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 12 }}>Define document types for invoicing and transactions</p>
                  </div>
                </Space>
              </Col>
              <Col flex="auto" style={{ minWidth: 250 }}>
                <Input placeholder="🔍 Search type, name, module..."
                  value={searchText} onChange={e => setSearchText(e.target.value)} allowClear size="large" style={{ borderRadius: 8 }} />
              </Col>
              {canEdit && (
                <Col>
                  <Button type="primary" size="large" icon={<PlusOutlined />} onClick={openAdd}
                    style={{ borderRadius: 8, height: 40, fontWeight: 600 }}>
                    Add Type
                  </Button>
                </Col>
              )}
            </Row>

            <Table
              rowKey={r => `${r.doc_company}-${r.doc_type}`}
              columns={columns}
              dataSource={filtered}
              loading={loading}
              size={isMobile ? 'small' : 'middle'}
              scroll={{ x: 'max-content' }}
              bordered={false}
              pagination={{ pageSize: 20, showTotal: t => `${t} document types`, showSizeChanger: false }}
            />
          </Card>
        </Col>
      </Row>

      <Drawer
        title={
          <Space>
            <span style={{ fontSize: 18 }}>📑</span>
            <span>{editing ? `Edit: ${editing.doc_type}` : 'New Document Type'}</span>
          </Space>
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={Math.min(780, window.innerWidth * 0.95)}
        styles={{ body: { padding: '24px', background: '#f8f9fa' } }}
        extra={
          canEdit && (
            <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}
              style={{ background: '#52c41a', borderColor: '#52c41a' }}>
              Save
            </Button>
          )
        }
      >
        <Form form={form} layout="vertical">
          <Row gutter={[16, 0]}>

            {/* Identification */}
            <Col span={24}>
              <Card title="📄 Identification" size="small" style={{ borderRadius: 10, marginBottom: 16 }}>
                <Row gutter={16}>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item name="doc_type" label="Doc Type" rules={[{ required: true, message: 'Required' }, { max: 10 }]}>
                      <Input size="large" maxLength={10} disabled={!!editing} style={{ textTransform: 'uppercase' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item name="doc_prefix" label="Prefix" rules={[{ required: true, message: 'Required' }, { max: 5 }]}>
                      <Input size="large" maxLength={5} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item name="doc_short_name" label="Short Name" rules={[{ required: true, message: 'Required' }, { max: 10 }]}>
                      <Input size="large" maxLength={10} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item name="doc_starting_number" label="Starting Number" rules={[{ required: true, message: 'Required' }]}>
                      <InputNumber style={{ width: '100%' }} size="large" min={1} precision={0} />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item name="doc_name" label="Document Name" rules={[{ required: true, message: 'Required' }, { max: 75 }]}>
                      <Input size="large" maxLength={75} />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Module & Base */}
            <Col span={24}>
              <Card title="⚙️ Module & Base" size="small" style={{ borderRadius: 10, marginBottom: 16 }}>
                <Row gutter={16}>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="doc_module" label="Module" rules={[{ required: true, message: 'Required' }, { max: 50 }]}>
                      <Input size="large" maxLength={50} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="doc_base" label="Doc Base" rules={[{ required: true, message: 'Required' }, { max: 10 }]}>
                      <Input size="large" maxLength={10} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="doc_posting_module" label="Posting Module" rules={[{ required: true, message: 'Required' }, { max: 10 }]}>
                      <Input size="large" maxLength={10} />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Approval & Flags */}
            <Col span={24}>
              <Card title="✅ Approval & Flags" size="small" style={{ borderRadius: 10, marginBottom: 16 }}>
                <Row gutter={16}>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item name="doc_approval_required" label="Approval Required">
                      <Select size="large" options={YN_OPTIONS} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item name="doc_approval_numbers" label="Approval Levels">
                      <InputNumber style={{ width: '100%' }} size="large" min={0} max={99} precision={0} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item name="doc_printing" label="Printing">
                      <Select size="large" options={YN_OPTIONS} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item name="doc_online_posting" label="Online Posting">
                      <Select size="large" options={YN_OPTIONS} />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Print Settings */}
            <Col span={24}>
              <Card title="🖨️ Print Settings" size="small" style={{ borderRadius: 10, marginBottom: 16 }}>
                <Row gutter={16}>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item name="doc_printer" label="Printer">
                      <Input size="large" maxLength={50} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item name="doc_print_call_1" label="Print Call 1">
                      <Select size="large" options={YN_OPTIONS} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item name="doc_print_call_2" label="Print Call 2">
                      <Select size="large" options={YN_OPTIONS} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item name="doc_print_call_3" label="Print Call 3">
                      <Select size="large" options={YN_OPTIONS} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item name="doc_print_call_4" label="Print Call 4">
                      <Select size="large" options={YN_OPTIONS} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={9}>
                    <Form.Item name="doc_print_program" label="Print Program">
                      <Input size="large" maxLength={240} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={9}>
                    <Form.Item name="doc_print_path" label="Print Path">
                      <Input size="large" maxLength={240} />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item name="doc_print_command" label="Print Command">
                      <Input.TextArea rows={2} maxLength={2000} showCount />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Notes */}
            <Col span={24}>
              <Card title="📝 Notes" size="small" style={{ borderRadius: 10 }}>
                <Form.Item name="doc_notes" label="Notes">
                  <Input.TextArea rows={3} maxLength={2000} showCount />
                </Form.Item>
              </Card>
            </Col>

          </Row>
        </Form>
      </Drawer>
    </div>
  );
}
