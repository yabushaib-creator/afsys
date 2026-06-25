import { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, InputNumber, Select,
  Space, Popconfirm, message, Typography, Grid, Card, Row, Col, Alert
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { tariffApi, currencyApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import QuickAddSelect from '../components/QuickAddSelect';

const { Title } = Typography;
const { useBreakpoint } = Grid;
const DEFAULT_COMPANY = 'MILAHA';

export default function TariffMaster() {
  const { canEdit } = useAuth();
  const [data, setData] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const [currencyQForm] = Form.useForm();
  const [quickAddCurrency, setQuickAddCurrency] = useState(null);
  const [savingCurrency, setSavingCurrency] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const fetchData = async () => {
    setLoading(true);
    try {
      const rows = await tariffApi.getAll();
      setData(rows);
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrencies = async () => {
    try {
      const currenciesData = await currencyApi.getAll();
      setCurrencies(currenciesData);
    } catch (err) {
      console.error('Failed to load currencies:', err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchCurrencies();
  }, []);

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ qft_currency: 'QAR' });
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      qft_code: record.qft_code,
      qft_description: record.qft_description,
      qft_currency: record.qft_currency,
      qft_amount: parseFloat(record.qft_amount),
      qft_account: record.qft_account,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editing) {
        await tariffApi.update(editing.qft_company, editing.qft_code, values);
        message.success('Tariff updated.');
      } else {
        await tariffApi.create({ ...values, qft_company: DEFAULT_COMPANY });
        message.success('Tariff created.');
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
      await tariffApi.remove(record.qft_company, record.qft_code);
      message.success('Tariff deleted.');
      fetchData();
    } catch (err) {
      message.error(err.message);
    }
  };

  const fetchCurrenciesRefresh = async () => {
    const data = await currencyApi.getAll();
    setCurrencies(data);
    return data;
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
      const newCur = await currencyApi.create({ ...values, currency_company: DEFAULT_COMPANY });
      await fetchCurrenciesRefresh();
      form.setFieldsValue({ qft_currency: newCur.currency_code });
      setQuickAddCurrency(null);
      message.success(`Currency "${newCur.currency_code}" added.`);
    } catch (err) {
      if (err.message) message.error(err.message);
    } finally {
      setSavingCurrency(false);
    }
  };

  const filteredData = searchText
    ? data.filter(item =>
        (item.qft_code || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (item.qft_description || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (item.qft_currency || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (item.qft_account || '').toLowerCase().includes(searchText.toLowerCase())
      )
    : data;

  const columns = [
    {
      title: 'Code',
      dataIndex: 'qft_code',
      key: 'qft_code',
      width: 110,
      fixed: 'left',
      sorter: (a, b) => a.qft_code.localeCompare(b.qft_code),
    },
    {
      title: 'Description',
      dataIndex: 'qft_description',
      key: 'qft_description',
      width: 220,
    },
    {
      title: 'Currency',
      dataIndex: 'qft_currency',
      key: 'qft_currency',
      width: 90,
      responsive: ['sm'],
    },
    {
      title: 'Amount',
      dataIndex: 'qft_amount',
      key: 'qft_amount',
      width: 120,
      align: 'right',
      render: (val) => Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 }),
    },
    {
      title: 'Account',
      dataIndex: 'qft_account',
      key: 'qft_account',
      width: 180,
      responsive: ['md'],
    },
    ...(canEdit ? [{
      title: '',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
          />
          <Popconfirm
            title="Delete this tariff?"
            onConfirm={() => handleDelete(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    }] : []),
  ];

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', padding: isMobile ? '16px' : '32px' }}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card
            style={{ borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: 'none', background: '#ffffff' }}
            styles={{ body: { padding: isMobile ? '20px' : '28px' } }}
          >
            <Row gutter={[16, 16]} align="middle" justify="space-between" style={{ marginBottom: 16 }}>
              <Col flex="auto">
                <Space>
                  <div style={{
                    width: 48, height: 48, borderRadius: '10px',
                    background: 'linear-gradient(135deg, #faad14, #ffd666)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px',
                  }}>📋</div>
                  <div>
                    <Title level={3} style={{ margin: 0, color: '#1f2937' }}>Tariff Master</Title>
                    <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '12px' }}>Manage tariff codes and rates</p>
                  </div>
                </Space>
              </Col>
              <Col flex="auto" style={{ minWidth: '250px' }}>
                <Input
                  placeholder="🔍 Search code, description, currency, account..."
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
                    style={{ borderRadius: '8px', height: '40px', fontWeight: 600 }}
                  >
                    Add Tariff
                  </Button>
                </Col>
              )}
            </Row>

            <Table
              rowKey={(r) => `${r.qft_company}-${r.qft_code}`}
              columns={columns}
              dataSource={filteredData}
              loading={loading}
              size={isMobile ? 'small' : 'large'}
              bordered={false}
              scroll={{ x: 'max-content' }}
              pagination={{
                pageSize: isMobile ? 10 : 20,
                showTotal: (total) => searchText ? `${total} of ${data.length} (filtered)` : `${total} tariffs`,
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
            <span style={{ fontSize: 20 }}>📋</span>
            <span>{editing ? 'Edit Tariff' : 'Add Tariff'}</span>
          </Space>
        }
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="Save"
        cancelText="Cancel"
        confirmLoading={saving}
        destroyOnHidden
        width={isMobile ? '95vw' : 520}
        style={isMobile ? { top: 20 } : {}}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="qft_code"
            label="Code"
            rules={[{ required: true, message: 'Code is required' }]}
          >
            <Input maxLength={10} disabled={!!editing} />
          </Form.Item>
          <Form.Item
            name="qft_description"
            label="Description"
            rules={[{ required: true, message: 'Description is required' }]}
          >
            <Input maxLength={75} />
          </Form.Item>
          <Form.Item
            name="qft_currency"
            label="Currency"
            rules={[{ required: true, message: 'Currency is required' }]}
          >
            <QuickAddSelect
              allowClear
              placeholder="Select currency..."
              options={currencies.map(curr => ({
                value: curr.currency_code,
                label: `${curr.currency_code} - ${curr.currency_name}`,
              }))}
              onQuickAdd={handleQuickAddCurrency}
            />
          </Form.Item>
          <Form.Item
            name="qft_amount"
            label="Amount"
            rules={[{ required: true, message: 'Amount is required' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(v) => v.replace(/,/g, '')}
            />
          </Form.Item>
          <Form.Item
            name="qft_account"
            label="Account"
            rules={[{ required: true, message: 'Account is required' }]}
          >
            <Input maxLength={150} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={<Space><PlusOutlined /><span>Add New Currency</span></Space>}
        open={quickAddCurrency !== null}
        onOk={handleSaveQuickCurrency}
        onCancel={() => setQuickAddCurrency(null)}
        okText="Save" cancelText="Cancel"
        confirmLoading={savingCurrency}
        destroyOnHidden width={400}
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
    </div>
  );
}

