import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { auth } from '../api';

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);

  const onFinish = async (v) => {
  setLoading(true);
  try {
    // SORTED: Lowercase and trim to match the DB
    const cleanEmail = v.email.toLowerCase().trim();
    await auth.forgotPassword(cleanEmail);
    message.success('Reset link sent to your email!');
  } catch (e) {
    message.error(e.response?.data?.message || 'Failed to send email');
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: '0 24px' }}>
      <Card title="Forgot Password" extra={<Link to="/login"><ArrowLeftOutlined /> Back</Link>}>
        <p style={{ color: '#666', marginBottom: 20 }}>
          Enter your email and we'll send you a link to reset your password.
        </p>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
            <Input prefix={<MailOutlined />} placeholder="Enter your email" size="large" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            Send Reset Link
          </Button>
        </Form>
      </Card>
    </div>
  );
}