import { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber,
  Space, Popconfirm, message, Typography, Grid, Alert, Card, Row, Col, Descriptions
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { vesselCallApi, tariffApi, currencyApi, supplyDetailsApi, basisMasterApi } from '../services/api';
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
  headerBg: '#e6f4ff',
};

const TYPE_OPTIONS = [
  { value: 'A', label: 'A - Agency' },
  { value: 'O', label: 'O - Other Suppliers' },
];

const fmt = (date) => date ? new Date(date).toLocaleDateString() : '—';
const fmtNum = (n) => n != null ? Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';

export default function SupplyDetails() {
  const { user, canEdit } = useAuth();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [vesselCalls, setVesselCalls] = useState([]);
  const [tariffs, setTariffs] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [basisList, setBasisList] = useState([]);
  const [selectedCall, setSelectedCall] = useState(null);
  const [supplyData, setSupplyData] = useState([]);
  const [loadingCalls, setLoadingCalls] = useState(true);
  const [loadingSupply, setLoadingSupply] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const [tariffQForm] = Form.useForm();
  const [basisQForm] = Form.useForm();
  const [currencyQForm] = Form.useForm();
  const [quickAddTariff, setQuickAddTariff] = useState(null);
  const [quickAddBasis, setQuickAddBasis] = useState(null);
  const [quickAddCurrency, setQuickAddCurrency] = useState(null);
  const [savingTariff, setSavingTariff] = useState(false);
  const [savingBasis, setSavingBasis] = useState(false);
  const [savingCurrency, setSavingCurrency] = useState(false);

  useEffect(() => {
    Promise.all([
      vesselCallApi.getAll(),
      tariffApi.getAll(),
      currencyApi.getAll(),
      basisMasterApi.getAll(),
    ]).then(([calls, tars, curs, basis]) => {
      setVesselCalls(calls);
      setTariffs(tars);
      setCurrencies(curs);
      setBasisList(basis);
    }).catch(err => message.error('Failed to load data: ' + err.message))
      .finally(() => setLoadingCalls(false));
  }, []);

  const fetchSupply = async (call) => {
    setLoadingSupply(true);
    try {
      const rows = await supplyDetailsApi.getByCall(call.qfvc_company, call.qfvc_refno);
      setSupplyData(rows);
    } catch (err) {
      message.error('Failed to load supply details: ' + err.message);
    } finally {
      setLoadingSupply(false);
    }
  };

  const handleCallSelect = (value) => {
    const call = vesselCalls.find(c => `${c.qfvc_company}|${c.qfvc_refno}` === value);
    setSelectedCall(call || null);
    setSupplyData([]);
    if (call) fetchSupply(call);
  };

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ qfs_date: dayjs(), qfs_exrate: 1, qfs_supplier_rate: 0, qfs_currency: 'QAR', qfs_rate: 0, qfs_type: 'A' });
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      qfs_tariff: record.qfs_tariff,
      qfs_date: record.qfs_date ? dayjs(record.qfs_date) : null,
      qfs_basis: record.qfs_basis,
      qfs_quantity: record.qfs_quantity,
      qfs_currency: record.qfs_currency,
      qfs_exrate: record.qfs_exrate,
      qfs_rate: record.qfs_rate,
      qfs_f_amount: record.qfs_f_amount,
      qfs_l_amount: record.qfs_l_amount,
      qfs_description: record.qfs_description,
      qfs_remarks: record.qfs_remarks,
      qfs_type: record.qfs_type,
      qfs_supplier: record.qfs_supplier,
      qfs_supplier_rate: record.qfs_supplier_rate,
      qfs_supplier_ref: record.qfs_supplier_ref,
      qfs_inv_type: record.qfs_inv_type,
      qfs_inv_number: record.qfs_inv_number,
      qfs_rct_type: record.qfs_rct_type,
      qfs_rct_number: record.qfs_rct_number,
      qfs_inv_rct_date: record.qfs_inv_rct_date ? dayjs(record.qfs_inv_rct_date) : null,
    });
    setModalOpen(true);
  };

  const handleQuickAddTariff = (text) => {
    tariffQForm.resetFields();
    tariffQForm.setFieldsValue({ qft_code: text.toUpperCase(), qft_amount: 0 });
    setQuickAddTariff(text);
  };
  const handleSaveQuickTariff = async () => {
    try {
      const values = await tariffQForm.validateFields();
      setSavingTariff(true);
      const newT = await tariffApi.create({ ...values, qft_company: 'MILAHA', qft_status: 'A' });
      const list = await tariffApi.getAll();
      setTariffs(list);
      form.setFieldsValue({ qfs_tariff: newT.qft_code });
      setQuickAddTariff(null);
      message.success(`Tariff "${newT.qft_code}" added.`);
    } catch (err) { if (err.message) message.error(err.message); }
    finally { setSavingTariff(false); }
  };

  const handleQuickAddBasis = (text) => {
    basisQForm.resetFields();
    basisQForm.setFieldsValue({ basis_code: text.toUpperCase(), basis_flag: 'Y' });
    setQuickAddBasis(text);
  };
  const handleSaveQuickBasis = async () => {
    try {
      const values = await basisQForm.validateFields();
      setSavingBasis(true);
      const newB = await basisMasterApi.create(values);
      const list = await basisMasterApi.getAll();
      setBasisList(list);
      form.setFieldsValue({ qfs_basis: newB.basis_code });
      setQuickAddBasis(null);
      message.success(`Basis "${newB.basis_code}" added.`);
    } catch (err) { if (err.message) message.error(err.message); }
    finally { setSavingBasis(false); }
  };

  const handleQuickAddCurrency = (text) => {
    currencyQForm.resetFields();
    currencyQForm.setFieldsValue({ currency_code: text.toUpperCase() });
    setQuickAddCurrency(text);
  };
  const handleSaveQuickCurrency = async () => {
    try {
      const values = await currencyQForm.validateFields();
      setSavingCurrency(true);
      const newC = await currencyApi.create({ ...values, currency_company: 'MILAHA' });
      const list = await currencyApi.getAll();
      setCurrencies(list);
      form.setFieldsValue({ qfs_currency: newC.currency_code });
      setQuickAddCurrency(null);
      message.success(`Currency "${newC.currency_code}" added.`);
    } catch (err) { if (err.message) message.error(err.message); }
    finally { setSavingCurrency(false); }
  };

  const recalcAmounts = () => {
    const qty = form.getFieldValue('qfs_quantity') || 0;
    const rate = form.getFieldValue('qfs_rate') || 0;
    const exrate = form.getFieldValue('qfs_exrate') || 1;
    const fAmount = parseFloat((qty * rate).toFixed(2));
    const lAmount = parseFloat((fAmount * exrate).toFixed(2));
    form.setFieldsValue({ qfs_f_amount: fAmount, qfs_l_amount: lAmount });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const formatDate = (d) => d ? dayjs(d).format('YYYY-MM-DD') : null;

      const payload = {
        ...values,
        qfs_date: formatDate(values.qfs_date),
        qfs_inv_rct_date: formatDate(values.qfs_inv_rct_date),
        qfs_company: selectedCall.qfvc_company,
        qfs_refno: selectedCall.qfvc_refno,
        qfs_vessel: selectedCall.qfvc_vessel,
        qfs_party: selectedCall.qfvc_party,
      };

      if (editing) {
        payload.qfs_modified_by = user?.user_code;
        await supplyDetailsApi.update(editing.ctid, payload);
        message.success('Supply line updated.');
      } else {
        payload.qfs_created_by = user?.user_code;
        await supplyDetailsApi.create(payload);
        message.success('Supply line created.');
      }
      setModalOpen(false);
      fetchSupply(selectedCall);
    } catch (err) {
      if (err.message) message.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (record) => {
    try {
      await supplyDetailsApi.remove(record.ctid);
      message.success('Supply line deleted.');
      fetchSupply(selectedCall);
    } catch (err) {
      message.error(err.message);
    }
  };

  const callOptions = vesselCalls.map(c => ({
    value: `${c.qfvc_company}|${c.qfvc_refno}`,
    label: `Ref# ${c.qfvc_refno} | ${c.qfvc_vessel} - ${c.qfvc_name} | ${c.qfvc_party} | ETA: ${fmt(c.qfvc_eta)} | ETD: ${fmt(c.qfvc_etd)} | Capt: ${c.qfvc_captain || '—'}`,
  }));

  const tariffOptions = tariffs.map(t => ({
    value: t.qft_code,
    label: `${t.qft_code} - ${t.qft_description || ''}`,
  }));

  const currencyOptions = currencies.map(c => ({
    value: c.currency_code,
    label: `${c.currency_code} - ${c.currency_name || ''}`,
  }));

  const columns = [
    {
      title: 'Tariff',
      dataIndex: 'qfs_tariff',
      key: 'qfs_tariff',
      width: 120,
      render: t => <span style={{ fontWeight: 600, color: THEME.primary }}>{t}</span>,
    },
    { title: 'Date', dataIndex: 'qfs_date', key: 'qfs_date', width: 100, render: fmt },
    { title: 'Basis', dataIndex: 'qfs_basis', key: 'qfs_basis', width: 100 },
    { title: 'Qty', dataIndex: 'qfs_quantity', key: 'qfs_quantity', width: 80, align: 'right', render: fmtNum },
    { title: 'Curr', dataIndex: 'qfs_currency', key: 'qfs_currency', width: 70 },
    { title: 'Rate', dataIndex: 'qfs_rate', key: 'qfs_rate', width: 90, align: 'right', render: fmtNum },
    { title: 'F.Amount', dataIndex: 'qfs_f_amount', key: 'qfs_f_amount', width: 110, align: 'right', render: fmtNum },
    { title: 'L.Amount', dataIndex: 'qfs_l_amount', key: 'qfs_l_amount', width: 110, align: 'right', render: fmtNum },
    { title: 'Type', dataIndex: 'qfs_type', key: 'qfs_type', width: 60 },
    { title: 'Description', dataIndex: 'qfs_description', key: 'qfs_description', width: 180, ellipsis: true },
    ...(canEdit ? [{
      title: 'Actions',
      key: 'actions',
      width: 90,
      fixed: 'right',
      render: (_, record) => (
        <Space size={8}>
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} style={{ color: THEME.primary }} />
          <Popconfirm
            title="Delete this supply line?"
            onConfirm={() => handleDelete(record)}
            okText="Yes" cancelText="No" okButtonProps={{ danger: true }}
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    }] : []),
  ];

  return (
    <div style={{ background: THEME.background, minHeight: '100vh', padding: isMobile ? '16px' : '32px' }}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          {/* Header */}
          <Card style={{ borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: 'none', marginBottom: 16 }}
            styles={{ body: { padding: '20px 28px' } }}>
            <Space>
              <div style={{ width: 48, height: 48, borderRadius: '10px', background: 'linear-gradient(135deg, #1890ff, #69b1ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>⛽</div>
              <div>
                <Title level={3} style={{ margin: 0, color: '#1f2937' }}>Foreign Vessel Supply Entry</Title>
                <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 12 }}>Select a vessel call to view and manage supply entries</p>
              </div>
            </Space>
          </Card>

          {/* Vessel Call Selector */}
          <Card style={{ borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: 'none', marginBottom: 16 }}
            styles={{ body: { padding: '20px 28px' } }}>
            <Row gutter={16} align="middle">
              <Col flex="none">
                <span style={{ fontWeight: 600, color: '#374151' }}>Vessel Call:</span>
              </Col>
              <Col flex="auto">
                <Select
                  placeholder="Search and select a vessel call..."
                  showSearch
                  allowClear
                  loading={loadingCalls}
                  style={{ width: '100%' }}
                  size="large"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={callOptions}
                  onChange={handleCallSelect}
                />
              </Col>
            </Row>
          </Card>

          {/* Selected Call Summary */}
          {selectedCall && (
            <Card style={{ borderRadius: '12px', border: '1px solid #bae0ff', background: THEME.headerBg, marginBottom: 16 }}
              styles={{ body: { padding: '16px 28px' } }}>
              <Descriptions size="small" column={isMobile ? 2 : 6}>
                <Descriptions.Item label="Ref#"><b>{selectedCall.qfvc_refno}</b></Descriptions.Item>
                <Descriptions.Item label="Vessel">{selectedCall.qfvc_vessel} - {selectedCall.qfvc_name}</Descriptions.Item>
                <Descriptions.Item label="Party">{selectedCall.qfvc_party}</Descriptions.Item>
                <Descriptions.Item label="ETA">{fmt(selectedCall.qfvc_eta)}</Descriptions.Item>
                <Descriptions.Item label="ETD">{fmt(selectedCall.qfvc_etd)}</Descriptions.Item>
                <Descriptions.Item label="Captain">{selectedCall.qfvc_captain || '—'}</Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          {/* Supply Lines Table */}
          {selectedCall && (
            <Card style={{ borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: 'none' }}
              styles={{ body: { padding: isMobile ? '16px' : '28px' } }}>
              <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Col>
                  <span style={{ fontWeight: 600, color: '#374151', fontSize: 15 }}>
                    Supply Lines — {supplyData.length} record{supplyData.length !== 1 ? 's' : ''}
                  </span>
                </Col>
                {canEdit && (
                  <Col>
                    <Button type="primary" size="large" icon={<PlusOutlined />} onClick={openAdd}
                      style={{ borderRadius: '8px', height: '40px', fontWeight: 600 }}>
                      Add Supply
                    </Button>
                  </Col>
                )}
              </Row>

              <Table
                rowKey="ctid"
                columns={columns}
                dataSource={supplyData}
                loading={loadingSupply}
                size={isMobile ? 'small' : 'middle'}
                scroll={{ x: 'max-content' }}
                bordered={false}
                pagination={{ pageSize: 20, showTotal: t => `${t} lines`, showSizeChanger: false }}
              />
            </Card>
          )}
        </Col>
      </Row>

      {/* Quick-Add: Tariff */}
      <Modal
        title={<Space><PlusOutlined /><span>Add New Tariff</span></Space>}
        open={quickAddTariff !== null}
        onOk={handleSaveQuickTariff}
        onCancel={() => setQuickAddTariff(null)}
        okText="Save" cancelText="Cancel"
        confirmLoading={savingTariff}
        destroyOnHidden width={480}
      >
        <Form form={tariffQForm} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item name="qft_code" label="Code" rules={[{ required: true, message: 'Required' }]}>
            <Input maxLength={10} size="large" style={{ textTransform: 'uppercase' }} />
          </Form.Item>
          <Form.Item name="qft_description" label="Description" rules={[{ required: true, message: 'Required' }]}>
            <Input maxLength={75} size="large" />
          </Form.Item>
          <Form.Item name="qft_currency" label="Currency" rules={[{ required: true, message: 'Required' }]}>
            <Select showSearch placeholder="Select currency..." size="large"
              options={currencyOptions} />
          </Form.Item>
          <Form.Item name="qft_amount" label="Amount" rules={[{ required: true, message: 'Required' }]}>
            <InputNumber style={{ width: '100%' }} size="large" min={0} precision={2} />
          </Form.Item>
          <Form.Item name="qft_account" label="Account" rules={[{ required: true, message: 'Required' }]}>
            <Input maxLength={150} size="large" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Quick-Add: Basis */}
      <Modal
        title={<Space><PlusOutlined /><span>Add New Basis</span></Space>}
        open={quickAddBasis !== null}
        onOk={handleSaveQuickBasis}
        onCancel={() => setQuickAddBasis(null)}
        okText="Save" cancelText="Cancel"
        confirmLoading={savingBasis}
        destroyOnHidden width={400}
      >
        <Form form={basisQForm} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item name="basis_code" label="Basis Code" rules={[{ required: true, message: 'Required' }]}>
            <Input maxLength={10} size="large" style={{ textTransform: 'uppercase' }} />
          </Form.Item>
          <Form.Item name="basis_name" label="Basis Name" rules={[{ required: true, message: 'Required' }]}>
            <Input maxLength={75} size="large" />
          </Form.Item>
          <Form.Item name="basis_flag" label="Status" rules={[{ required: true, message: 'Required' }]}>
            <Select size="large" options={[{ value: 'Y', label: 'Active' }, { value: 'N', label: 'Inactive' }]} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Quick-Add: Currency */}
      <Modal
        title={<Space><PlusOutlined /><span>Add New Currency</span></Space>}
        open={quickAddCurrency !== null}
        onOk={handleSaveQuickCurrency}
        onCancel={() => setQuickAddCurrency(null)}
        okText="Save" cancelText="Cancel"
        confirmLoading={savingCurrency}
        destroyOnHidden width={480}
      >
        <Form form={currencyQForm} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item name="currency_code" label="Currency Code" rules={[{ required: true, message: 'Required' }]}>
            <Input maxLength={10} size="large" style={{ textTransform: 'uppercase' }} />
          </Form.Item>
          <Form.Item name="currency_name" label="Currency Name" rules={[{ required: true, message: 'Required' }]}>
            <Input maxLength={50} size="large" />
          </Form.Item>
          <Form.Item name="currency_corporate_rate" label="Corporate Rate" rules={[{ required: true, message: 'Required' }]}>
            <InputNumber style={{ width: '100%' }} size="large" min={0} precision={4} step={0.01} />
          </Form.Item>
          <Form.Item name="currency_customer_rate" label="Customer Rate" rules={[{ required: true, message: 'Required' }]}>
            <InputNumber style={{ width: '100%' }} size="large" min={0} precision={4} step={0.01} />
          </Form.Item>
          <Form.Item name="currency_market_rate" label="Market Rate" rules={[{ required: true, message: 'Required' }]}>
            <InputNumber style={{ width: '100%' }} size="large" min={0} precision={4} step={0.01} />
          </Form.Item>
          <Form.Item name="currency_other_rate" label="Other Rate" rules={[{ required: true, message: 'Required' }]}>
            <InputNumber style={{ width: '100%' }} size="large" min={0} precision={4} step={0.01} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add / Edit Modal */}
      <Modal
        title={
          <Space>
            <span style={{ fontSize: 20 }}>⛽</span>
            <span>{editing ? 'Edit Supply Line' : 'Add Supply Line'}</span>
          </Space>
        }
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="Save"
        cancelText="Cancel"
        confirmLoading={saving}
        destroyOnHidden
        width={isMobile ? '95vw' : 800}
        style={isMobile ? { top: 20 } : {}}
        styles={{ body: { maxHeight: '75vh', overflowY: 'auto' } }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 12 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="qfs_tariff" label="Tariff" rules={[{ required: true, message: 'Required' }]}>
                <QuickAddSelect placeholder="Select tariff..." size="large"
                  options={tariffOptions} onQuickAdd={handleQuickAddTariff} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="qfs_date" label="Date" rules={[{ required: true, message: 'Required' }]}>
                <DatePicker style={{ width: '100%' }} size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="qfs_basis" label="Basis" rules={[{ required: true, message: 'Required' }]}>
                <QuickAddSelect placeholder="Select basis..." size="large"
                  options={basisList.map(b => ({ value: b.basis_code, label: `${b.basis_code} - ${b.basis_name}` }))}
                  onQuickAdd={handleQuickAddBasis} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="qfs_type" label="Type" rules={[{ required: true, message: 'Required' }]}>
                <Select placeholder="Select type..." size="large" options={TYPE_OPTIONS} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="qfs_currency" label="Currency" rules={[{ required: true, message: 'Required' }]}>
                <QuickAddSelect placeholder="Currency..." size="large"
                  options={currencyOptions} onQuickAdd={handleQuickAddCurrency} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="qfs_exrate" label="Ex. Rate" rules={[{ required: true, message: 'Required' }]}>
                <InputNumber style={{ width: '100%' }} size="large" min={0} step={0.0001} onChange={recalcAmounts} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="qfs_quantity" label="Quantity" rules={[{ required: true, message: 'Required' }]}>
                <InputNumber style={{ width: '100%' }} size="large" min={0} onChange={recalcAmounts} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="qfs_rate" label="Rate" rules={[{ required: true, message: 'Required' }]}>
                <InputNumber style={{ width: '100%' }} size="large" min={0} step={0.01} onChange={recalcAmounts} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="qfs_f_amount" label="F. Amount" rules={[{ required: true, message: 'Required' }]}>
                <InputNumber style={{ width: '100%' }} size="large" step={0.01} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="qfs_l_amount" label="L. Amount" rules={[{ required: true, message: 'Required' }]}>
                <InputNumber style={{ width: '100%' }} size="large" step={0.01} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="qfs_description" label="Description">
            <Input.TextArea rows={2} maxLength={2000} showCount />
          </Form.Item>

          <Form.Item name="qfs_remarks" label="Remarks">
            <Input.TextArea rows={2} maxLength={2000} showCount />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="qfs_supplier" label="Supplier">
                <Input maxLength={10} size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="qfs_supplier_rate" label="Supplier Rate">
                <InputNumber style={{ width: '100%' }} size="large" min={0} step={0.01} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="qfs_supplier_ref" label="Supplier Ref">
            <Input maxLength={75} size="large" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="qfs_inv_type" label="Invoice Type">
                <Input maxLength={10} size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="qfs_inv_number" label="Invoice Number">
                <Input maxLength={25} size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="qfs_rct_type" label="Receipt Type">
                <Input maxLength={10} size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="qfs_rct_number" label="Receipt Number">
                <Input maxLength={25} size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="qfs_inv_rct_date" label="Invoice/Receipt Date">
            <DatePicker style={{ width: '100%' }} size="large" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
