import { useState } from 'react';
import { Card, Form, Input, Button, Typography, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const AD_SERVER = 'ldap://172.25.24.210';
const AD_DOMAIN = 'QATARNAV';

export default function ADLoginTest() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleLogin = async () => {
    try {
      const { username, password } = await form.validateFields();
      setLoading(true);
      setResult(null);
      const res = await fetch('http://localhost:5000/api/ad-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ server: AD_SERVER, domain: AD_DOMAIN, username, password }),
      });
      const data = await res.json();
      setResult(data.success);
    } catch (err) {
      if (err.message) setResult(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <Card style={{ width: 380, borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
        styles={{ body: { padding: '40px 36px' } }}>
        <Space direction="vertical" style={{ width: '100%' }} size={24}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🔐</div>
            <Title level={3} style={{ margin: 0 }}>AD Login Test</Title>
            <Text type="secondary" style={{ fontSize: 13 }}>{AD_DOMAIN} — {AD_SERVER}</Text>
          </div>

          <Form form={form} layout="vertical" onFinish={handleLogin}>
            <Form.Item name="username" rules={[{ required: true, message: 'Enter username' }]} style={{ marginBottom: 16 }}>
              <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                size="large" placeholder="Username" autoComplete="username" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: 'Enter password' }]} style={{ marginBottom: 24 }}>
              <Input.Password prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                size="large" placeholder="Password" autoComplete="current-password" />
            </Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={loading}
              style={{ height: 46, fontWeight: 600, fontSize: 16, borderRadius: 8 }}>
              Test Login
            </Button>
          </Form>

          {result !== null && (
            <div style={{
              textAlign: 'center', padding: '16px',
              borderRadius: 8, fontSize: 22, fontWeight: 700,
              background: result ? '#f6ffed' : '#fff2f0',
              color: result ? '#52c41a' : '#ff4d4f',
              border: `1px solid ${result ? '#b7eb8f' : '#ffccc7'}`,
            }}>
              {result ? '✅ Correct' : '❌ Wrong'}
            </div>
          )}
        </Space>
      </Card>
    </div>
  );
}
