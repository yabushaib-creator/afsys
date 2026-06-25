import { useState } from 'react';
import { Card, Form, Input, Button, Alert, Typography, Space, Row, Col } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function ADTest() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleTest = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      setResult(null);
      const res = await fetch('http://localhost:5000/api/ad-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      if (err.message) setResult({ success: false, log: [], error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', padding: 32 }}>
      <Row justify="center">
        <Col xs={24} sm={20} md={14} lg={10}>
          <Card style={{ borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
            <Space direction="vertical" style={{ width: '100%' }} size={20}>
              <div>
                <Title level={3} style={{ margin: 0 }}>🔐 Active Directory Test</Title>
                <Text type="secondary">Test LDAP bind with your AD credentials</Text>
              </div>

              <Form form={form} layout="vertical" onFinish={handleTest}>
                <Form.Item name="server" label="AD Server" rules={[{ required: true, message: 'Required' }]}
                  extra="e.g. ldap://ad.milaha.com or 192.168.1.10">
                  <Input size="large" placeholder="ldap://your-ad-server" />
                </Form.Item>

                <Form.Item name="domain" label="Domain (optional)"
                  extra="e.g. MILAHA — leave blank if username includes domain">
                  <Input size="large" placeholder="MILAHA" />
                </Form.Item>

                <Form.Item name="username" label="Username" rules={[{ required: true, message: 'Required' }]}
                  extra="Just the username, e.g. yabushaib">
                  <Input size="large" placeholder="username" />
                </Form.Item>

                <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Required' }]}>
                  <Input.Password size="large" placeholder="password" />
                </Form.Item>

                <Button type="primary" size="large" htmlType="submit" loading={loading} block
                  style={{ height: 44, fontWeight: 600 }}>
                  {loading ? 'Testing...' : 'Test Connection'}
                </Button>
              </Form>

              {result && (
                <Alert
                  type={result.success ? 'success' : 'error'}
                  message={result.success ? '✅ Correct' : '❌ Wrong'}
                  showIcon={false}
                  style={{ textAlign: 'center', fontSize: 20, fontWeight: 700 }}
                />
              )}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
