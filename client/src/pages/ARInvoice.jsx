import { useEffect, useState } from 'react';
import {
  Table, Button, Form, Input, Select, DatePicker, InputNumber,
  Space, Popconfirm, message, Typography, Grid, Card, Row, Col,
  Drawer, Tag, Divider
} from 'antd';

const { RangePicker } = DatePicker;
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined, FileAddOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { arInvoiceApi, arMasterApi, currencyApi, supplyDetailsApi, docTypeMasterApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const fmtNum = (n) => n != null ? Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';
const fmt   = (d) => d ? new Date(d).toLocaleDateString() : '—';

const STATUS_OPTIONS = [
  { value: 'N', label: 'Open' },
  { value: 'P', label: 'Posted' },
];

export default function ARInvoice() {
  const { user, canEdit } = useAuth();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [invoices, setInvoices]           = useState([]);
  const [loading, setLoading]             = useState(false);
  const [searched, setSearched]           = useState(false);
  const [filters, setFilters]             = useState({});
  const [lineCache, setLineCache]         = useState({});
  const [loadingLines, setLoadingLines]   = useState({});
  const [drawerOpen, setDrawerOpen]       = useState(false);
  const [headerSaved, setHeaderSaved]     = useState(false);
  const [saving, setSaving]               = useState(false);
  const [currentKey, setCurrentKey]       = useState(null);
  const [details, setDetails]             = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // LOVs
  const [docTypes, setDocTypes]       = useState([]);
  const [arCodes, setArCodes]         = useState([]);
  const [currencies, setCurrencies]   = useState([]);

  // Supply line selection
  const [supplyArCode, setSupplyArCode]             = useState(null);
  const [supplyLines, setSupplyLines]               = useState([]);
  const [loadingSupply, setLoadingSupply]           = useState(false);
  const [selectedSupplyKeys, setSelectedSupplyKeys] = useState([]);
  const [addingLines, setAddingLines]               = useState(false);

  const [form] = Form.useForm();

  useEffect(() => {
    docTypeMasterApi.getAll('FVQ0050').then(setDocTypes).catch(() => {});
    arMasterApi.getAll().then(setArCodes).catch(() => {});
    currencyApi.getAll().then(setCurrencies).catch(() => {});
  }, []);

  const fetchInvoices = async (activeFilters) => {
    setLoading(true);
    try {
      setInvoices(await arInvoiceApi.getAll(activeFilters ?? filters));
      setSearched(true);
    }
    catch (err) { message.error(err.message); }
    finally { setLoading(false); }
  };

  const handleSearch = () => fetchInvoices(filters);

  const handleClearFilters = () => {
    setFilters({});
    setInvoices([]);
    setSearched(false);
    setLineCache({});
  };

  const handleExpand = async (expanded, record) => {
    const key = `${record.sub_ar_company}-${record.sub_ar_doc_type}-${record.sub_ar_doc_number}`;
    if (!expanded || lineCache[key]) return;
    setLoadingLines(prev => ({ ...prev, [key]: true }));
    try {
      const data = await arInvoiceApi.getOne(record.sub_ar_company, record.sub_ar_doc_type, record.sub_ar_doc_number);
      setLineCache(prev => ({ ...prev, [key]: data.details || [] }));
    } catch (err) { message.error(err.message); }
    finally { setLoadingLines(prev => ({ ...prev, [key]: false })); }
  };

  const fetchDetails = async (key) => {
    setLoadingDetails(true);
    try {
      const data = await arInvoiceApi.getOne(key.company, key.doc_type, key.doc_number);
      setDetails(data.details || []);
    } catch (err) { message.error(err.message); }
    finally { setLoadingDetails(false); }
  };

  const openAdd = () => {
    form.resetFields();
    const defaultType = docTypes.find(d => d.doc_type === 'INV') ? 'INV' : (docTypes[0]?.doc_type ?? undefined);
    form.setFieldsValue({
      sub_ar_status: 'N', sub_ar_ex_rate: 1, sub_ar_discount: 0, sub_ar_tax: 0,
      sub_ar_date: dayjs(), sub_ar_gl_date: dayjs(),
      sub_ar_due_date: dayjs().add(30, 'day'), sub_ar_age_date: dayjs(),
      sub_ar_doc_type: defaultType,
      sub_ar_currency: 'QAR',
    });
    setCurrentKey(null);
    setHeaderSaved(false);
    setDetails([]);
    setSupplyLines([]);
    setSupplyArCode(null);
    setSelectedSupplyKeys([]);
    setDrawerOpen(true);
  };

  const openEdit = async (record) => {
    const key = { company: record.sub_ar_company, doc_type: record.sub_ar_doc_type, doc_number: record.sub_ar_doc_number };
    setCurrentKey(key);
    setHeaderSaved(true);
    setSupplyLines([]);
    setSelectedSupplyKeys([]);
    setSupplyArCode(null);
    form.setFieldsValue({
      sub_ar_doc_type:        record.sub_ar_doc_type,
      sub_ar_doc_number:      record.sub_ar_doc_number,
      sub_ar_doc_base:        record.sub_ar_doc_base,
      sub_ar_code:            record.sub_ar_code,
      sub_ar_group:           record.sub_ar_group,
      sub_ar_other_reference: record.sub_ar_other_reference,
      sub_ar_currency:        record.sub_ar_currency,
      sub_ar_ex_rate:         parseFloat(record.sub_ar_ex_rate),
      sub_ar_date:            record.sub_ar_date     ? dayjs(record.sub_ar_date)     : null,
      sub_ar_gl_date:         record.sub_ar_gl_date  ? dayjs(record.sub_ar_gl_date)  : null,
      sub_ar_due_date:        record.sub_ar_due_date ? dayjs(record.sub_ar_due_date) : null,
      sub_ar_age_date:        record.sub_ar_age_date ? dayjs(record.sub_ar_age_date) : null,
      sub_ar_narration:       record.sub_ar_narration,
      sub_ar_notes:           record.sub_ar_notes,
      sub_ar_status:          record.sub_ar_status,
      sub_ar_discount:        parseFloat(record.sub_ar_discount || 0),
      sub_ar_tax:             parseFloat(record.sub_ar_tax || 0),
    });
    setDrawerOpen(true);
    await fetchDetails(key);
    handleLoadSupply(record.sub_ar_code);
  };

  const handleSaveHeader = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const fmtDate = (d) => d ? dayjs(d).format('YYYY-MM-DD') : null;
      const payload = {
        ...values,
        sub_ar_date:     fmtDate(values.sub_ar_date),
        sub_ar_gl_date:  fmtDate(values.sub_ar_gl_date),
        sub_ar_due_date: fmtDate(values.sub_ar_due_date),
        sub_ar_age_date: fmtDate(values.sub_ar_age_date),
        sub_ar_user:     user?.user_code,
      };
      if (currentKey) {
        await arInvoiceApi.update(currentKey.company, currentKey.doc_type, currentKey.doc_number, payload);
        message.success('Invoice header updated.');
        fetchInvoices();
      } else {
        const result = await arInvoiceApi.create(payload);
        const key = { company: result.sub_ar_company, doc_type: result.sub_ar_doc_type, doc_number: result.sub_ar_doc_number };
        setCurrentKey(key);
        message.success('Invoice created.');
        fetchInvoices();
      }
      setHeaderSaved(true);
      handleLoadSupply(values.sub_ar_code);
    } catch (err) {
      if (err.message) message.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLoadSupply = async (arCode) => {
    setSupplyArCode(arCode || null);
    setSupplyLines([]);
    setSelectedSupplyKeys([]);
    if (!arCode) return;
    setLoadingSupply(true);
    try { setSupplyLines(await supplyDetailsApi.getByArCode('QTC', arCode)); }
    catch (err) { message.error(err.message); }
    finally { setLoadingSupply(false); }
  };

  const handleAddSelected = async () => {
    if (!selectedSupplyKeys.length) return message.warning('Select at least one supply line.');
    setAddingLines(true);
    try {
      const lines = supplyLines.filter((_, i) => selectedSupplyKeys.includes(i));
      for (const line of lines) {
        await arInvoiceApi.addLine(currentKey.company, currentKey.doc_type, currentKey.doc_number, {
          sub_ard_currency:       line.qfs_currency,
          sub_ard_ex_rate:        line.qfs_exrate,
          sub_ard_foreign_amount: line.qfs_f_amount,
          sub_ard_local_amount:   line.qfs_l_amount,
          sub_ard_narration:      line.qfs_description,
          sub_ard_notes:          line.qfs_remarks,
          sub_ard_detail_1:       line.qfs_vessel,
          sub_ard_detail_2:       line.qfs_tariff,
          sub_ard_detail_3:       line.qfs_date ? dayjs(line.qfs_date).format('YYYY-MM-DD') : null,
          sub_ard_detail_4:       line.qfs_basis,
          sub_ard_detail_5:       String(line.qfs_quantity ?? ''),
          sub_ard_detail_6:       String(line.qfs_rate ?? ''),
          sub_ard_detail_7:       String(line.qfs_refno ?? ''),
        });
      }
      await fetchDetails(currentKey);
      await fetchInvoices();
      setSelectedSupplyKeys([]);
      message.success(`${lines.length} line(s) added.`);
    } catch (err) { message.error(err.message); }
    finally { setAddingLines(false); }
  };

  const handleDeleteLine = async (serial) => {
    try {
      await arInvoiceApi.removeLine(currentKey.company, currentKey.doc_type, currentKey.doc_number, serial);
      await fetchDetails(currentKey);
      await fetchInvoices();
      message.success('Line removed.');
    } catch (err) { message.error(err.message); }
  };

  const handleDeleteInvoice = async (record) => {
    try {
      await arInvoiceApi.remove(record.sub_ar_company, record.sub_ar_doc_type, record.sub_ar_doc_number);
      message.success('Invoice deleted.');
      fetchInvoices();
    } catch (err) { message.error(err.message); }
  };

  const totalF = details.reduce((s, r) => s + (Number(r.sub_ard_foreign_amount) || 0), 0);
  const totalL = details.reduce((s, r) => s + (Number(r.sub_ard_local_amount)   || 0), 0);

  const listColumns = [
    { title: 'Int#', dataIndex: 'sub_ar_internal_number', key: 'int', width: 70 },
    { title: 'Type', dataIndex: 'sub_ar_doc_type', key: 'type', width: 80 },
    { title: 'Doc Number', dataIndex: 'sub_ar_doc_number', key: 'docno', width: 150,
      render: v => <span style={{ fontWeight: 600, color: '#1890ff' }}>{v}</span> },
    { title: 'AR Code', dataIndex: 'sub_ar_code', key: 'code', width: 100 },
    { title: 'Group', dataIndex: 'sub_ar_group', key: 'group', width: 90, responsive: ['md'] },
    { title: 'Date', dataIndex: 'sub_ar_date', key: 'date', width: 100, render: fmt },
    { title: 'Currency', dataIndex: 'sub_ar_currency', key: 'cur', width: 80 },
    { title: 'F.Amount', dataIndex: 'sub_ar_f_amount', key: 'famt', width: 120, align: 'right', render: fmtNum },
    { title: 'L.Amount', dataIndex: 'sub_ar_l_amount', key: 'lamt', width: 120, align: 'right', render: fmtNum },
    { title: 'Lines', dataIndex: 'line_count', key: 'lines', width: 60, align: 'center' },
    { title: 'Status', dataIndex: 'sub_ar_status', key: 'status', width: 80,
      render: v => <Tag color={v === 'P' ? 'green' : 'orange'}>{v === 'P' ? 'Posted' : 'Open'}</Tag> },
    ...(canEdit ? [{
      title: '', key: 'actions', width: 80, fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="Delete this invoice and all its lines?" onConfirm={() => handleDeleteInvoice(record)} okText="Yes" cancelText="No" okButtonProps={{ danger: true }}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    }] : []),
  ];

  const detailColumns = [
    { title: '#',         dataIndex: 'sub_ard_serial',         key: 'serial', width: 50 },
    { title: 'Vessel',    dataIndex: 'sub_ard_detail_1',        key: 'vessel', width: 90 },
    { title: 'Tariff',    dataIndex: 'sub_ard_detail_2',        key: 'tariff', width: 110, render: v => <span style={{ fontWeight: 600 }}>{v}</span> },
    { title: 'Date',      dataIndex: 'sub_ard_detail_3',        key: 'date',   width: 100, render: fmt },
    { title: 'Basis',     dataIndex: 'sub_ard_detail_4',        key: 'basis',  width: 80 },
    { title: 'Qty',       dataIndex: 'sub_ard_detail_5',        key: 'qty',    width: 70, align: 'right' },
    { title: 'Currency',  dataIndex: 'sub_ard_currency',        key: 'cur',    width: 80 },
    { title: 'Ex.Rate',   dataIndex: 'sub_ard_ex_rate',         key: 'exrate', width: 80, align: 'right', render: fmtNum },
    { title: 'Rate',      dataIndex: 'sub_ard_detail_6',        key: 'rate',   width: 90, align: 'right' },
    { title: 'F.Amount',  dataIndex: 'sub_ard_foreign_amount',  key: 'famt',   width: 115, align: 'right', render: fmtNum },
    { title: 'L.Amount',  dataIndex: 'sub_ard_local_amount',    key: 'lamt',   width: 115, align: 'right', render: fmtNum },
    { title: 'Description', dataIndex: 'sub_ard_narration',     key: 'desc',   width: 180, ellipsis: true },
    { title: 'Remarks',   dataIndex: 'sub_ard_notes',           key: 'remarks',width: 140, ellipsis: true, responsive: ['xl'] },
    ...(canEdit ? [{
      title: '', key: 'del', width: 50, fixed: 'right',
      render: (_, r) => (
        <Popconfirm title="Remove this line?" onConfirm={() => handleDeleteLine(r.sub_ard_serial)} okText="Yes" cancelText="No" okButtonProps={{ danger: true }}>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    }] : []),
  ];

  const supplyColumns = [
    { title: 'Vessel',      dataIndex: 'qfs_vessel',      key: 'vessel', width: 80 },
    { title: 'Tariff',      dataIndex: 'qfs_tariff',      key: 'tariff', width: 110, render: v => <span style={{ fontWeight: 600 }}>{v}</span> },
    { title: 'Date',        dataIndex: 'qfs_date',        key: 'date',   width: 100, render: fmt },
    { title: 'Basis',       dataIndex: 'qfs_basis',       key: 'basis',  width: 80 },
    { title: 'Qty',         dataIndex: 'qfs_quantity',    key: 'qty',    width: 70, align: 'right', render: fmtNum },
    { title: 'Currency',    dataIndex: 'qfs_currency',    key: 'cur',    width: 80 },
    { title: 'Rate',        dataIndex: 'qfs_rate',        key: 'rate',   width: 90, align: 'right', render: fmtNum },
    { title: 'F.Amount',    dataIndex: 'qfs_f_amount',    key: 'famt',   width: 115, align: 'right', render: fmtNum },
    { title: 'L.Amount',    dataIndex: 'qfs_l_amount',    key: 'lamt',   width: 115, align: 'right', render: fmtNum },
    { title: 'Description', dataIndex: 'qfs_description', key: 'desc',   width: 180, ellipsis: true },
    { title: 'Remarks',     dataIndex: 'qfs_remarks',     key: 'remarks',width: 140, ellipsis: true },
  ];


  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', padding: isMobile ? '16px' : '32px' }}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card style={{ borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: 'none' }}
            styles={{ body: { padding: isMobile ? '20px' : '28px' } }}>
            <Row gutter={[16, 16]} align="middle" justify="space-between" style={{ marginBottom: 16 }}>
              <Col flex="auto">
                <Space>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: 'linear-gradient(135deg, #13c2c2, #87e8de)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🧾</div>
                  <div>
                    <Title level={3} style={{ margin: 0, color: '#1f2937' }}>Foreign Vessel Supplies Invoice</Title>
                    <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 12 }}>Manage supply invoices for vessel calls</p>
                  </div>
                </Space>
              </Col>
              <Col>
                <Space>
                  <Button size="large" loading={loading} onClick={handleSearch}
                    style={{ borderRadius: 8, height: 40, fontWeight: 600, background: '#1890ff', color: '#fff', border: 'none' }}>
                    Search
                  </Button>
                  <Button size="large" onClick={handleClearFilters} style={{ borderRadius: 8, height: 40 }}>
                    Clear
                  </Button>
                  {canEdit && (
                    <Button type="primary" size="large" icon={<PlusOutlined />} onClick={openAdd}
                      style={{ borderRadius: 8, height: 40, fontWeight: 600 }}>
                      New Invoice
                    </Button>
                  )}
                </Space>
              </Col>
            </Row>

            {/* Filter bar */}
            <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={12} md={4}>
                <Select allowClear size="large" style={{ width: '100%' }} placeholder="Doc Type"
                  options={docTypes.map(d => ({ value: d.doc_type, label: `${d.doc_type} — ${d.doc_name}` }))}
                  value={filters.doc_type || undefined}
                  onChange={v => setFilters(f => ({ ...f, doc_type: v }))} />
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Input size="large" placeholder="Doc Number" allowClear
                  value={filters.doc_number || ''}
                  onChange={e => setFilters(f => ({ ...f, doc_number: e.target.value }))}
                  onPressEnter={handleSearch} />
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Input size="large" placeholder="Doc Base" allowClear
                  value={filters.doc_base || ''}
                  onChange={e => setFilters(f => ({ ...f, doc_base: e.target.value }))}
                  onPressEnter={handleSearch} />
              </Col>
              <Col xs={24} sm={12} md={5}>
                <Select allowClear showSearch size="large" style={{ width: '100%' }} placeholder="AR Code"
                  filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                  options={arCodes.map(a => ({ value: a.ar_code, label: `${a.ar_code} — ${a.ar_name || ''}` }))}
                  value={filters.ar_code || undefined}
                  onChange={v => setFilters(f => ({ ...f, ar_code: v }))} />
              </Col>
              <Col xs={24} sm={12} md={3}>
                <Input size="large" placeholder="AR Group" allowClear
                  value={filters.ar_group || ''}
                  onChange={e => setFilters(f => ({ ...f, ar_group: e.target.value }))}
                  onPressEnter={handleSearch} />
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Select allowClear size="large" style={{ width: '100%' }} placeholder="Status"
                  options={STATUS_OPTIONS}
                  value={filters.status || undefined}
                  onChange={v => setFilters(f => ({ ...f, status: v }))} />
              </Col>
            </Row>

            {!searched ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🧾</div>
                <p style={{ margin: 0, fontSize: 15 }}>Click <strong>Search</strong> to load invoices</p>
              </div>
            ) : (
              <Table
                rowKey={r => `${r.sub_ar_company}-${r.sub_ar_doc_type}-${r.sub_ar_doc_number}`}
                columns={listColumns}
                dataSource={invoices}
                loading={loading}
                size={isMobile ? 'small' : 'middle'}
                scroll={{ x: 'max-content' }}
                bordered={false}
                pagination={{ pageSize: 20, showTotal: t => `${t} invoices`, showSizeChanger: false }}
                expandable={{
                  onExpand: handleExpand,
                  expandedRowRender: (record) => {
                    const key = `${record.sub_ar_company}-${record.sub_ar_doc_type}-${record.sub_ar_doc_number}`;
                    const lines = lineCache[key] || [];
                    const isLoading = !!loadingLines[key];
                    const totF = lines.reduce((s, r) => s + (Number(r.sub_ard_foreign_amount) || 0), 0);
                    const totL = lines.reduce((s, r) => s + (Number(r.sub_ard_local_amount)   || 0), 0);
                    return (
                      <Table
                        rowKey="sub_ard_serial"
                        columns={detailColumns}
                        dataSource={lines}
                        loading={isLoading}
                        size="small"
                        pagination={false}
                        scroll={{ x: 'max-content' }}
                        bordered={false}
                        style={{ margin: '8px 0' }}
                        summary={() => lines.length > 0 && (
                          <Table.Summary fixed>
                            <Table.Summary.Row style={{ fontWeight: 600, background: '#fafafa' }}>
                              <Table.Summary.Cell index={0} colSpan={9}>Total</Table.Summary.Cell>
                              <Table.Summary.Cell index={9}  align="right">{fmtNum(totF)}</Table.Summary.Cell>
                              <Table.Summary.Cell index={10} align="right">{fmtNum(totL)}</Table.Summary.Cell>
                              <Table.Summary.Cell index={11} colSpan={canEdit ? 3 : 2} />
                            </Table.Summary.Row>
                          </Table.Summary>
                        )}
                      />
                    );
                  },
                  rowExpandable: () => true,
                }}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Invoice Drawer */}
      <Drawer
        title={
          <Space>
            <span style={{ fontSize: 20 }}>🧾</span>
            <span>{currentKey ? `Invoice: ${currentKey.doc_number}` : 'New Invoice'}</span>
          </Space>
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={Math.min(1150, window.innerWidth * 0.97)}
        styles={{ body: { padding: '24px', background: '#f8f9fa', overflowY: 'auto' } }}
        extra={
          canEdit && (
            <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSaveHeader}
              style={{ background: '#52c41a', borderColor: '#52c41a' }}>
              Save Header
            </Button>
          )
        }
      >
        <Form form={form} layout="vertical">
          <Row gutter={[16, 16]}>

            {/* ── HEADER ── */}
            <Col span={24}>
              <Card title="📄 Header" size="small" style={{ borderRadius: 10 }}>
                <Row gutter={16}>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item name="sub_ar_doc_type" label="Document Type" rules={[{ required: true, message: 'Required' }]}>
                      <Select showSearch size="large" placeholder="Select type..." disabled={!!currentKey}
                        filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                        options={docTypes.map(d => ({ value: d.doc_type, label: `${d.doc_type} — ${d.doc_name}` }))} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item name="sub_ar_doc_number" label="Document Number" rules={[{ required: true, message: 'Required' }]}>
                      <Input size="large" maxLength={25} disabled={!!currentKey} />
                    </Form.Item>
                  </Col>
                  <Form.Item name="sub_ar_doc_base" hidden>
                    <Input />
                  </Form.Item>
                  <Form.Item name="sub_ar_status" hidden>
                    <Input />
                  </Form.Item>
                  <Col xs={24} sm={12} md={4}>
                    <Form.Item name="sub_ar_group" label="AR Group" rules={[{ required: true, message: 'Required' }]}>
                      <Input size="large" maxLength={10} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={10}>
                    <Form.Item name="sub_ar_code" label="AR Code" rules={[{ required: true, message: 'Required' }]}>
                      <Select showSearch size="large" placeholder="Select AR code..."
                        filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                        options={arCodes.map(a => ({ value: a.ar_code, label: `${a.ar_code} - ${a.ar_name || ''}` }))} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={14}>
                    <Form.Item name="sub_ar_other_reference" label="Other Reference">
                      <Input size="large" maxLength={50} />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* ── CURRENCY ── */}
            <Col xs={24} md={8}>
              <Card title="💱 Currency" size="small" style={{ borderRadius: 10 }}>
                <Form.Item name="sub_ar_currency" label="Currency" rules={[{ required: true, message: 'Required' }]}>
                  <Select showSearch size="large" placeholder="Select currency..."
                    filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                    options={currencies.map(c => ({ value: c.currency_code, label: `${c.currency_code} - ${c.currency_name || ''}` }))} />
                </Form.Item>
                <Form.Item name="sub_ar_ex_rate" label="Ex. Rate" rules={[{ required: true, message: 'Required' }]}>
                  <InputNumber style={{ width: '100%' }} size="large" min={0} step={0.0001} precision={4} />
                </Form.Item>
                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item name="sub_ar_discount" label="Discount">
                      <InputNumber style={{ width: '100%' }} size="large" min={0} precision={2} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="sub_ar_tax" label="Tax">
                      <InputNumber style={{ width: '100%' }} size="large" min={0} precision={2} />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* ── INVOICE DATES ── */}
            <Col xs={24} md={16}>
              <Card title="📅 Invoice Dates" size="small" style={{ borderRadius: 10 }}>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item name="sub_ar_date" label="Document Date" rules={[{ required: true, message: 'Required' }]}>
                      <DatePicker style={{ width: '100%' }} size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="sub_ar_gl_date" label="GL Date" rules={[{ required: true, message: 'Required' }]}>
                      <DatePicker style={{ width: '100%' }} size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="sub_ar_age_date" label="Age Date" rules={[{ required: true, message: 'Required' }]}>
                      <DatePicker style={{ width: '100%' }} size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="sub_ar_due_date" label="Due Date" rules={[{ required: true, message: 'Required' }]}>
                      <DatePicker style={{ width: '100%' }} size="large" />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* ── NARRATION & NOTES ── */}
            <Col span={24}>
              <Card title="📝 Narration & Notes" size="small" style={{ borderRadius: 10 }}>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item name="sub_ar_narration" label="Narration">
                      <Input.TextArea rows={3} maxLength={240} showCount />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="sub_ar_notes" label="Notes">
                      <Input.TextArea rows={3} maxLength={2000} showCount />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Form>

        {/* ── ADD LINES FROM SUPPLY ── */}
        {canEdit && (
          <Card
            title="📦 Add Lines from Supply"
            size="small"
            style={{ borderRadius: 10, border: `1px dashed ${headerSaved ? '#1890ff' : '#d9d9d9'}`, marginTop: 16, opacity: headerSaved ? 1 : 0.45 }}
            extra={
              <Button type="primary" icon={<FileAddOutlined />}
                loading={addingLines}
                disabled={!headerSaved || !selectedSupplyKeys.length}
                onClick={handleAddSelected}
                style={{ background: '#52c41a', borderColor: '#52c41a' }}>
                Add {selectedSupplyKeys.length > 0 ? selectedSupplyKeys.length : ''} Selected
              </Button>
            }
          >
            {!headerSaved && (
              <p style={{ color: '#9ca3af', margin: '0 0 8px', fontSize: 13 }}>
                Save the header first to enable adding supply lines.
              </p>
            )}
            {supplyArCode && (
              <div style={{ marginBottom: 8, color: '#595959', fontSize: 13 }}>
                Showing supply lines for AR Code: <strong>{supplyArCode}</strong>
                <Button type="link" size="small" style={{ padding: '0 4px' }} onClick={() => handleLoadSupply(form.getFieldValue('sub_ar_code'))}>
                  Reload
                </Button>
              </div>
            )}
            <Table
              rowKey={(_, i) => i}
              rowSelection={{
                type: 'checkbox',
                selectedRowKeys: selectedSupplyKeys,
                onChange: keys => setSelectedSupplyKeys(keys),
                getCheckboxProps: () => ({ disabled: !headerSaved }),
              }}
              columns={supplyColumns}
              dataSource={supplyLines}
              loading={loadingSupply}
              size="small"
              scroll={{ x: 'max-content' }}
              pagination={false}
              locale={{ emptyText: !headerSaved ? 'Save header first' : supplyArCode ? 'No supply lines found for this AR Code' : 'Save the header to load supply lines' }}
            />
          </Card>
        )}

        {/* ── INVOICE LINES ── */}
        <Card
          title="📋 Invoice Lines"
          size="small"
          style={{ borderRadius: 10, marginTop: 16 }}
          extra={
            details.length > 0 && (
              <Space>
                <Text strong>F.Total: <span style={{ color: '#1890ff' }}>{fmtNum(totalF)}</span></Text>
                <Divider type="vertical" />
                <Text strong>L.Total: <span style={{ color: '#52c41a' }}>{fmtNum(totalL)}</span></Text>
              </Space>
            )
          }
        >
          <Table
            rowKey="sub_ard_serial"
            columns={detailColumns}
            dataSource={details}
            loading={loadingDetails}
            size="small"
            scroll={{ x: 'max-content' }}
            bordered={false}
            pagination={false}
            locale={{ emptyText: !headerSaved ? 'Save header first, then add supply lines above' : 'No lines added yet — select supply lines above' }}
            summary={() => details.length > 0 && (
              <Table.Summary fixed>
                <Table.Summary.Row style={{ fontWeight: 600, background: '#fafafa' }}>
                  <Table.Summary.Cell index={0} colSpan={9}>Grand Total</Table.Summary.Cell>
                  <Table.Summary.Cell index={9}  align="right">{fmtNum(totalF)}</Table.Summary.Cell>
                  <Table.Summary.Cell index={10} align="right">{fmtNum(totalL)}</Table.Summary.Cell>
                  <Table.Summary.Cell index={11} colSpan={canEdit ? 3 : 2} />
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </Card>
      </Drawer>
    </div>
  );
}
