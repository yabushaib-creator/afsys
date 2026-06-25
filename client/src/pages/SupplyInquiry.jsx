import { useState, useEffect } from 'react';
import {
  Table, Button, Form, Input, Select, DatePicker,
  Space, Typography, Grid, Card, Row, Col, Tag, Statistic, message
} from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import { supplyInquiryApi, vesselCallApi } from '../services/api';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { useBreakpoint } = Grid;

const TYPE_LABELS = { A: 'Agency', O: 'Other Suppliers' };
const TYPE_COLORS = { A: 'blue', O: 'orange' };

const fmt = (date) => date ? new Date(date).toLocaleDateString() : '—';
const fmtNum = (n) => n != null ? Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';

export default function SupplyInquiry() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [vesselCalls, setVesselCalls] = useState([]);

  useEffect(() => {
    vesselCallApi.getAll()
      .then(rows => setVesselCalls(rows))
      .catch(() => {});
  }, []);

  const handleSearch = async () => {
    try {
      const values = form.getFieldsValue();
      const filters = {};
      if (values.dateRange?.[0]) filters.date_from = values.dateRange[0].format('YYYY-MM-DD');
      if (values.dateRange?.[1]) filters.date_to   = values.dateRange[1].format('YYYY-MM-DD');
      if (values.refno)   filters.refno   = values.refno;
      if (values.vessel)  filters.vessel  = values.vessel;
      if (values.tariff)  filters.tariff  = values.tariff;
      if (values.type)    filters.type    = values.type;
      if (values.party)   filters.party   = values.party;

      setLoading(true);
      const rows = await supplyInquiryApi.search(filters);
      setData(rows);
      setSearched(true);
    } catch (err) {
      message.error('Search failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    form.resetFields();
    setData([]);
    setSearched(false);
  };

  const totalF = data.reduce((s, r) => s + (Number(r.qfs_f_amount) || 0), 0);
  const totalL = data.reduce((s, r) => s + (Number(r.qfs_l_amount) || 0), 0);

  const columns = [
    {
      title: 'Ref#',
      dataIndex: 'qfs_refno',
      key: 'qfs_refno',
      width: 90,
      fixed: 'left',
      render: v => <span style={{ fontWeight: 600, color: '#1890ff' }}>{v}</span>,
    },
    {
      title: 'Vessel',
      key: 'vessel',
      width: 180,
      render: (_, r) => (
        <span>{r.qfs_vessel}{r.vessel_name ? ` - ${r.vessel_name}` : ''}</span>
      ),
    },
    {
      title: 'Party',
      dataIndex: 'qfs_party',
      key: 'qfs_party',
      width: 120,
      ellipsis: true,
    },
    {
      title: 'ETA',
      dataIndex: 'vessel_eta',
      key: 'vessel_eta',
      width: 100,
      render: fmt,
      responsive: ['md'],
    },
    {
      title: 'ETD',
      dataIndex: 'vessel_etd',
      key: 'vessel_etd',
      width: 100,
      render: fmt,
      responsive: ['lg'],
    },
    {
      title: 'Tariff',
      dataIndex: 'qfs_tariff',
      key: 'qfs_tariff',
      width: 110,
      render: v => <span style={{ fontWeight: 600 }}>{v}</span>,
    },
    {
      title: 'Date',
      dataIndex: 'qfs_date',
      key: 'qfs_date',
      width: 100,
      render: fmt,
    },
    {
      title: 'Basis',
      dataIndex: 'qfs_basis',
      key: 'qfs_basis',
      width: 90,
      responsive: ['md'],
    },
    {
      title: 'Qty',
      dataIndex: 'qfs_quantity',
      key: 'qfs_quantity',
      width: 80,
      align: 'right',
      render: fmtNum,
    },
    {
      title: 'Curr',
      dataIndex: 'qfs_currency',
      key: 'qfs_currency',
      width: 70,
    },
    {
      title: 'Rate',
      dataIndex: 'qfs_rate',
      key: 'qfs_rate',
      width: 90,
      align: 'right',
      render: fmtNum,
      responsive: ['md'],
    },
    {
      title: 'F.Amount',
      dataIndex: 'qfs_f_amount',
      key: 'qfs_f_amount',
      width: 110,
      align: 'right',
      render: fmtNum,
    },
    {
      title: 'L.Amount',
      dataIndex: 'qfs_l_amount',
      key: 'qfs_l_amount',
      width: 110,
      align: 'right',
      render: fmtNum,
    },
    {
      title: 'Type',
      dataIndex: 'qfs_type',
      key: 'qfs_type',
      width: 110,
      render: v => v ? <Tag color={TYPE_COLORS[v]}>{TYPE_LABELS[v] || v}</Tag> : '—',
    },
    {
      title: 'Description',
      dataIndex: 'qfs_description',
      key: 'qfs_description',
      width: 180,
      ellipsis: true,
      responsive: ['lg'],
    },
  ];

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', padding: isMobile ? '16px' : '32px' }}>
      <Row gutter={[24, 24]}>
        <Col span={24}>

          {/* Header */}
          <Card style={{ borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: 'none', marginBottom: 16 }}
            styles={{ body: { padding: '20px 28px' } }}>
            <Space>
              <div style={{ width: 48, height: 48, borderRadius: '10px', background: 'linear-gradient(135deg, #722ed1, #b37feb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🔍</div>
              <div>
                <Title level={3} style={{ margin: 0, color: '#1f2937' }}>Supply Inquiry</Title>
                <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 12 }}>Search all supply lines across all vessel calls</p>
              </div>
            </Space>
          </Card>

          {/* Filter Bar */}
          <Card style={{ borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: 'none', marginBottom: 16 }}
            styles={{ body: { padding: '20px 28px' } }}>
            <Form form={form} layout="vertical">
              <Row gutter={[16, 0]}>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item name="dateRange" label="Date Range">
                    <RangePicker style={{ width: '100%' }} size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item name="refno" label="Vessel Call (Ref #)">
                    <Select
                      showSearch allowClear size="large"
                      placeholder="Select or search vessel call..."
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      options={vesselCalls.map(c => ({
                        value: c.qfvc_refno,
                        label: `${c.qfvc_refno} | ${c.qfvc_vessel} - ${c.qfvc_name || ''} | ${c.qfvc_party || ''}`,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={5}>
                  <Form.Item name="vessel" label="Vessel Code / Name">
                    <Input placeholder="Search vessel..." size="large" allowClear />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4}>
                  <Form.Item name="tariff" label="Tariff">
                    <Input placeholder="Search tariff..." size="large" allowClear />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={3}>
                  <Form.Item name="type" label="Type">
                    <Select placeholder="All" size="large" allowClear
                      options={[{ value: 'A', label: 'Agency' }, { value: 'O', label: 'Other Suppliers' }]} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={2} style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 24 }}>
                  <Space>
                    <Button type="primary" size="large" icon={<SearchOutlined />} onClick={handleSearch}
                      style={{ borderRadius: 8, fontWeight: 600 }}>
                      Search
                    </Button>
                    <Button size="large" icon={<ClearOutlined />} onClick={handleClear}
                      style={{ borderRadius: 8 }} />
                  </Space>
                </Col>
              </Row>
            </Form>
          </Card>

          {/* Totals */}
          {searched && (
            <Card style={{ borderRadius: '12px', border: '1px solid #d9d9d9', marginBottom: 16 }}
              styles={{ body: { padding: '16px 28px' } }}>
              <Row gutter={32}>
                <Col>
                  <Statistic title="Total Records" value={data.length} />
                </Col>
                <Col>
                  <Statistic title="Total F.Amount" value={totalF} precision={2} groupSeparator="," />
                </Col>
                <Col>
                  <Statistic title="Total L.Amount" value={totalL} precision={2} groupSeparator="," />
                </Col>
              </Row>
            </Card>
          )}

          {/* Results Table */}
          {searched && (
            <Card style={{ borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: 'none' }}
              styles={{ body: { padding: isMobile ? '16px' : '28px' } }}>
              <Table
                rowKey={(r, i) => `${r.qfs_refno}-${r.qfs_tariff}-${i}`}
                columns={columns}
                dataSource={data}
                loading={loading}
                size={isMobile ? 'small' : 'middle'}
                scroll={{ x: 'max-content' }}
                bordered={false}
                pagination={{ pageSize: 50, showTotal: t => `${t} lines`, showSizeChanger: true, pageSizeOptions: ['25', '50', '100'] }}
                summary={() => data.length > 0 && (
                  <Table.Summary fixed>
                    <Table.Summary.Row style={{ background: '#fafafa', fontWeight: 600 }}>
                      <Table.Summary.Cell index={0} colSpan={11}>Grand Total</Table.Summary.Cell>
                      <Table.Summary.Cell index={11} align="right">{fmtNum(totalF)}</Table.Summary.Cell>
                      <Table.Summary.Cell index={12} align="right">{fmtNum(totalL)}</Table.Summary.Cell>
                      <Table.Summary.Cell index={13} colSpan={2} />
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </Card>
          )}

          {!searched && (
            <Card style={{ borderRadius: '12px', border: '1px dashed #d9d9d9', textAlign: 'center' }}
              styles={{ body: { padding: '60px 28px' } }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🔍</div>
              <p style={{ color: '#9ca3af', margin: 0 }}>Set filters above and click Search to view supply lines</p>
            </Card>
          )}

        </Col>
      </Row>
    </div>
  );
}
