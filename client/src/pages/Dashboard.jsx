import { useEffect, useState } from 'react';
import {
  Card, Row, Col, Statistic, Table, Tag, Typography, Space, Progress, Spin, Grid
} from 'antd';
import { dashboardApi } from '../services/api';
import { message } from 'antd';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const fmt = (date) => date ? new Date(date).toLocaleDateString() : '—';
const fmtNum = (n) => n != null ? Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';

const TYPE_LABELS = { A: 'Agency', O: 'Other Suppliers' };
const TYPE_COLORS = { A: '#1890ff', O: '#fa8c16' };

const STAT_CARDS = [
  {
    key: 'vessel_calls',
    title: 'Vessel Calls',
    emoji: '🚢',
    gradient: 'linear-gradient(135deg, #1890ff, #69b1ff)',
    precision: 0,
  },
  {
    key: 'supply_lines',
    title: 'Supply Lines',
    emoji: '📋',
    gradient: 'linear-gradient(135deg, #52c41a, #95de64)',
    precision: 0,
  },
  {
    key: 'total_f_amount',
    title: 'Total F. Amount',
    emoji: '💵',
    gradient: 'linear-gradient(135deg, #faad14, #ffd666)',
    precision: 2,
  },
  {
    key: 'total_l_amount',
    title: 'Total L. Amount (QAR)',
    emoji: '📊',
    gradient: 'linear-gradient(135deg, #722ed1, #b37feb)',
    precision: 2,
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [stats, setStats] = useState(null);
  const [recentCalls, setRecentCalls] = useState([]);
  const [byType, setByType] = useState([]);
  const [topTariffs, setTopTariffs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.get()
      .then(data => {
        setStats(data.stats);
        setRecentCalls(data.recentCalls);
        setByType(data.byType);
        setTopTariffs(data.topTariffs);
      })
      .catch(err => message.error('Failed to load dashboard: ' + err.message))
      .finally(() => setLoading(false));
  }, []);

  const totalLByType = byType.reduce((s, r) => s + Number(r.total_l_amount || 0), 0);

  const recentColumns = [
    {
      title: 'Ref #',
      dataIndex: 'qfvc_refno',
      key: 'qfvc_refno',
      width: 90,
      render: v => <span style={{ fontWeight: 600, color: '#1890ff' }}>{v}</span>,
    },
    {
      title: 'Vessel',
      key: 'vessel',
      render: (_, r) => `${r.qfvc_vessel}${r.qfvc_name ? ' - ' + r.qfvc_name : ''}`,
      ellipsis: true,
    },
    {
      title: 'Party',
      dataIndex: 'qfvc_party',
      key: 'qfvc_party',
      ellipsis: true,
    },
    {
      title: 'ETA',
      dataIndex: 'qfvc_eta',
      key: 'qfvc_eta',
      width: 100,
      render: fmt,
    },
    {
      title: 'ETD',
      dataIndex: 'qfvc_etd',
      key: 'qfvc_etd',
      width: 100,
      render: fmt,
    },
    {
      title: 'Captain',
      dataIndex: 'qfvc_captain',
      key: 'qfvc_captain',
      width: 130,
      ellipsis: true,
      responsive: ['xl'],
      render: v => v || '—',
    },
  ];

  const tariffColumns = [
    {
      title: 'Tariff',
      dataIndex: 'qfs_tariff',
      key: 'qfs_tariff',
      render: v => <span style={{ fontWeight: 600 }}>{v}</span>,
    },
    {
      title: 'Lines',
      dataIndex: 'line_count',
      key: 'line_count',
      width: 70,
      align: 'right',
    },
    {
      title: 'L. Amount',
      dataIndex: 'total_l_amount',
      key: 'total_l_amount',
      align: 'right',
      render: fmtNum,
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', padding: isMobile ? '16px' : '32px' }}>

      {/* Welcome */}
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, color: '#1f2937' }}>
          Welcome back, {user?.user_name || user?.user_code}
        </Title>
        <Text style={{ color: '#6b7280' }}>Here's a summary of the current data</Text>
      </div>

      {/* Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {STAT_CARDS.map(card => (
          <Col key={card.key} xs={24} sm={12} xl={6}>
            <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
              styles={{ body: { padding: '20px 24px' } }}>
              <Space size={16} align="start">
                <div style={{
                  width: 56, height: 56, borderRadius: 12, flexShrink: 0,
                  background: card.gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28,
                }}>
                  {card.emoji}
                </div>
                <Statistic
                  title={<span style={{ color: '#6b7280', fontSize: 13 }}>{card.title}</span>}
                  value={stats?.[card.key] ?? 0}
                  precision={card.precision}
                  groupSeparator=","
                  valueStyle={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: '#1f2937' }}
                />
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {/* Recent Vessel Calls */}
        <Col xs={24} xl={14}>
          <Card
            title={
              <Space>
                <span>🚢</span>
                <span style={{ fontWeight: 600 }}>Recent Vessel Calls</span>
                <Tag color="blue">{recentCalls.length}</Tag>
              </Space>
            }
            style={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', height: '100%' }}
            styles={{ body: { padding: '0 0 8px' } }}
          >
            <Table
              rowKey="qfvc_refno"
              columns={recentColumns}
              dataSource={recentCalls}
              size="small"
              pagination={false}
              scroll={{ x: 'max-content' }}
              bordered={false}
            />
          </Card>
        </Col>

        {/* Right column */}
        <Col xs={24} xl={10}>
          <Row gutter={[16, 16]}>

            {/* Supply by Type */}
            <Col span={24}>
              <Card
                title={
                  <Space>
                    <span>📊</span>
                    <span style={{ fontWeight: 600 }}>Supply by Type</span>
                  </Space>
                }
                style={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
              >
                {byType.length === 0 ? (
                  <Text type="secondary">No data</Text>
                ) : (
                  <Space direction="vertical" style={{ width: '100%' }} size={16}>
                    {byType.map(row => {
                      const pct = totalLByType > 0 ? Math.round((Number(row.total_l_amount) / totalLByType) * 100) : 0;
                      return (
                        <div key={row.qfs_type}>
                          <Row justify="space-between" style={{ marginBottom: 4 }}>
                            <Col>
                              <Tag color={TYPE_COLORS[row.qfs_type]}>
                                {TYPE_LABELS[row.qfs_type] || row.qfs_type || '—'}
                              </Tag>
                              <Text type="secondary" style={{ fontSize: 12 }}>{row.line_count} lines</Text>
                            </Col>
                            <Col>
                              <Text strong>{fmtNum(row.total_l_amount)}</Text>
                            </Col>
                          </Row>
                          <Progress
                            percent={pct}
                            strokeColor={TYPE_COLORS[row.qfs_type]}
                            showInfo={false}
                            size="small"
                          />
                        </div>
                      );
                    })}
                  </Space>
                )}
              </Card>
            </Col>

            {/* Top Tariffs */}
            <Col span={24}>
              <Card
                title={
                  <Space>
                    <span>📋</span>
                    <span style={{ fontWeight: 600 }}>Top 5 Tariffs by Amount</span>
                  </Space>
                }
                style={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                styles={{ body: { padding: '0 0 8px' } }}
              >
                <Table
                  rowKey="qfs_tariff"
                  columns={tariffColumns}
                  dataSource={topTariffs}
                  size="small"
                  pagination={false}
                  bordered={false}
                />
              </Card>
            </Col>

          </Row>
        </Col>
      </Row>
    </div>
  );
}
