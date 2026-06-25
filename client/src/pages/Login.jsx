import { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const userData = await authApi.login(values.username, values.password);
      login(userData);
    } catch (err) {
      message.error(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f1419 0%, #1a202c 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 16,
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
          border: 'none',
        }}
        styles={{ body: { padding: '40px 36px' } }}
      >
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: 18,
            background: 'linear-gradient(135deg, #1890ff, #0a66c2)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            boxShadow: '0 8px 24px rgba(24,144,255,0.35)',
          }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 28, letterSpacing: 1 }}>A</span>
          </div>
          <Title level={2} style={{ margin: '0 0 6px', color: '#1f2937', fontWeight: 800 }}>
            AFSYS
          </Title>
          <Text style={{ color: '#6b7280', fontSize: 14 }}>
            Vessel Requests &amp; Invoicing
          </Text>
        </div>

        <Form layout="vertical" onFinish={handleSubmit} size="large" autoComplete="off">
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please enter your username' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#9ca3af' }} />}
              placeholder="Username"
              autoComplete="username"
              style={{ borderRadius: 8, height: 48 }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
            style={{ marginBottom: 24 }}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#9ca3af' }} />}
              placeholder="Password"
              autoComplete="current-password"
              style={{ borderRadius: 8, height: 48 }}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            style={{
              height: 48,
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #1890ff, #0a66c2)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(24,144,255,0.3)',
            }}
          >
            Sign In
          </Button>
        </Form>

        <div style={{ marginTop: 28, textAlign: 'center' }}>
          <Text style={{ color: '#9ca3af', fontSize: 12 }}>
            Milaha — Internal Operations System
          </Text>
        </div>
      </Card>
    </div>
  );
}
