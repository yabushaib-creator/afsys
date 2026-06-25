import { Layout, Menu, Button, Drawer, Grid, Space, Avatar, Dropdown } from 'antd';
import { MenuOutlined, AntDesignOutlined, UserOutlined, LogoutOutlined, LockOutlined, HomeOutlined } from '@ant-design/icons';
import { useState } from 'react';
import TariffMaster from './pages/TariffMaster';
import VesselMaster from './pages/VesselMaster';
import LineMaster from './pages/LineMaster';
import CountryMaster from './pages/CountryMaster';
import CurrencyMaster from './pages/CurrencyMaster';
import OfficeLocationMaster from './pages/OfficeLocationMaster';
import UserMaster from './pages/UserMaster';
import ForeignVesselCallDetails from './pages/ForeignVesselCallDetails';
import ARMaster from './pages/ARMaster';
import SupplyDetails from './pages/SupplyDetails';
import SupplyInquiry from './pages/SupplyInquiry';
import BasisMaster from './pages/BasisMaster';
import Dashboard from './pages/Dashboard';
import ARInvoice from './pages/ARInvoice';
import DocTypeMaster from './pages/DocTypeMaster';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';

const { Sider, Header, Content } = Layout;
const { useBreakpoint } = Grid;

const THEME_COLORS = {
  primary: '#1890ff',
  secondary: '#0a66c2',
  sidebarGradient: 'linear-gradient(135deg, #0f1419 0%, #1a202c 100%)',
  header: '#ffffff',
  background: '#f8f9fa',
  text: '#1f2937',
  textLight: '#6b7280',
  border: '#e5e7eb',
};

const DOT = <span style={{ fontSize: 8, lineHeight: 1, opacity: 0.55 }}>●</span>;

const ALL_MENU_ITEMS = [
  {
    key: 'dashboard',
    icon: <HomeOutlined style={{ fontSize: '16px' }} />,
    label: 'Dashboard',
  },
  {
    key: 'setup',
    icon: <AntDesignOutlined style={{ fontSize: '16px' }} />,
    label: 'Setup',
    children: [
      { key: 'tariff',      icon: DOT, label: 'Tariff Master' },
      { key: 'currencies',  icon: DOT, label: 'Currency Master' },
      { key: 'lines',       icon: DOT, label: 'Line Master' },
      { key: 'countries',   icon: DOT, label: 'Country Master' },
      { key: 'offices',     icon: DOT, label: 'Office Location Master' },
      { key: 'ar-master',   icon: DOT, label: 'AR Master' },
      { key: 'basis-master',    icon: DOT, label: 'Basis Master' },
      { key: 'doc-type-master', icon: DOT, label: 'Document Type Master' },
      { key: 'vessels',     icon: DOT, label: 'Vessel Master' },
    ],
  },
  {
    key: 'operations',
    icon: <AntDesignOutlined style={{ fontSize: '16px' }} />,
    label: 'Operations',
    children: [
      { key: 'vessel-calls',    icon: DOT, label: 'Foreign Vessel Call Details' },
      { key: 'supply-details',  icon: DOT, label: 'Foreign Vessel Supply Entry' },
      { key: 'supply-inquiry',  icon: DOT, label: 'Supply Inquiry' },
      { key: 'ar-invoice',      icon: DOT, label: 'Foreign Vessel Supplies Invoice' },
    ],
  },
  {
    key: 'security',
    icon: <AntDesignOutlined style={{ fontSize: '16px' }} />,
    label: 'Security',
    children: [
      { key: 'users', icon: DOT, label: 'User Master' },
    ],
  },
];

const ALWAYS_ALLOWED = ['dashboard'];

function filterMenuItems(items, allowedScreens) {
  if (!allowedScreens) return items;
  return items
    .map(item => {
      if (ALWAYS_ALLOWED.includes(item.key)) return item;
      if (item.children) {
        const filtered = item.children.filter(c => allowedScreens.includes(c.key));
        return filtered.length > 0 ? { ...item, children: filtered } : null;
      }
      return allowedScreens.includes(item.key) ? item : null;
    })
    .filter(Boolean);
}

function AppContent() {
  const { user, logout, canEdit, allowedScreens } = useAuth();
  const [current, setCurrent] = useState('dashboard');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.lg;

  if (!user) return <Login />;

  const menuItems = filterMenuItems(ALL_MENU_ITEMS, allowedScreens);

  const handleMenuClick = ({ key }) => {
    setCurrent(key);
    setDrawerOpen(false);
  };

  const renderPage = () => {
    if (current === 'dashboard') return <Dashboard />;
    if (current === 'tariff') return <TariffMaster />;
    if (current === 'currencies') return <CurrencyMaster />;
    if (current === 'lines') return <LineMaster />;
    if (current === 'countries') return <CountryMaster />;
    if (current === 'offices') return <OfficeLocationMaster />;
    if (current === 'ar-master') return <ARMaster />;
    if (current === 'users') return <UserMaster />;
    if (current === 'vessels') return <VesselMaster />;
    if (current === 'vessel-calls') return <ForeignVesselCallDetails />;
    if (current === 'supply-details') return <SupplyDetails />;
    if (current === 'supply-inquiry') return <SupplyInquiry />;
    if (current === 'basis-master') return <BasisMaster />;
    if (current === 'ar-invoice') return <ARInvoice />;
    if (current === 'doc-type-master') return <DocTypeMaster />;
    return null;
  };

  const userDropdownItems = [
    {
      key: 'info',
      label: (
        <div style={{ padding: '4px 0', minWidth: 160 }}>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{user.user_name}</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>{user.user_code} · {user.user_default_company}</div>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'role',
      icon: <LockOutlined />,
      label: canEdit ? 'Administrator' : 'Standard User (View Only)',
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sign Out',
      danger: true,
      onClick: logout,
    },
  ];

  const menuEl = (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[current]}
      items={menuItems}
      onClick={handleMenuClick}
      style={{ background: 'transparent', border: 'none' }}
    />
  );

  return (
    <Layout style={{ minHeight: '100vh', background: THEME_COLORS.background }}>
      {!isMobile && (
        <Sider
          theme="dark"
          width={260}
          style={{
            position: 'fixed',
            height: '100vh',
            left: 0,
            zIndex: 100,
            background: THEME_COLORS.sidebarGradient,
            borderRight: '1px solid rgba(255,255,255,0.05)',
            overflowY: 'auto',
          }}
        >
          <div style={{
            color: '#ffffff',
            fontWeight: 800,
            fontSize: 24,
            padding: '32px 24px 28px',
            textAlign: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            letterSpacing: '1px',
            background: 'linear-gradient(135deg, rgba(24, 144, 255, 0.1), rgba(24, 144, 255, 0.05))',
          }}>
            AFSYS
          </div>
          <div className="afsys-sider" style={{ padding: '16px 0' }}>{menuEl}</div>
        </Sider>
      )}

      {isMobile && (
        <Drawer
          placement="left"
          onClose={() => setDrawerOpen(false)}
          open={drawerOpen}
          styles={{
            body: { padding: 0, background: THEME_COLORS.sidebarGradient },
            header: {
              background: 'linear-gradient(135deg, rgba(24, 144, 255, 0.1), rgba(24, 144, 255, 0.05))',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            },
          }}
          title={<span style={{ color: '#fff', fontWeight: 800, fontSize: 20 }}>AFSYS</span>}
          width={260}
        >
          <div className="afsys-sider">{menuEl}</div>
        </Drawer>
      )}

      <Layout style={{ marginLeft: isMobile ? 0 : 260, background: THEME_COLORS.background }}>
        <Header style={{
          background: THEME_COLORS.header,
          padding: '0 24px',
          borderBottom: `1px solid ${THEME_COLORS.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 99,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          height: 72,
        }}>
          <Space size={12} style={{ alignItems: 'center' }}>
            {isMobile && (
              <Button
                type="text"
                size="large"
                icon={<MenuOutlined style={{ fontSize: '20px' }} />}
                onClick={() => setDrawerOpen(true)}
                style={{ color: THEME_COLORS.text }}
              />
            )}
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: THEME_COLORS.primary,
              boxShadow: `0 0 12px ${THEME_COLORS.primary}`,
            }} />
            <span style={{
              fontWeight: 700,
              fontSize: isMobile ? 15 : 18,
              color: THEME_COLORS.text,
              letterSpacing: '0.5px',
            }}>
              Vessel Requests &amp; Invoicing
            </span>
          </Space>

          <Dropdown menu={{ items: userDropdownItems }} placement="bottomRight" trigger={['click']}>
            <Space
              style={{ cursor: 'pointer', padding: '6px 10px', borderRadius: 10, transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Avatar
                style={{
                  background: canEdit
                    ? 'linear-gradient(135deg, #1890ff, #0a66c2)'
                    : 'linear-gradient(135deg, #6b7280, #9ca3af)',
                  flexShrink: 0,
                }}
                icon={<UserOutlined />}
                size={36}
              />
              {!isMobile && (
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: THEME_COLORS.text, lineHeight: 1.3 }}>
                    {user.user_name}
                  </div>
                  <div style={{ fontSize: 11, color: THEME_COLORS.textLight, lineHeight: 1.3 }}>
                    {canEdit ? 'Administrator' : 'View Only'}
                  </div>
                </div>
              )}
            </Space>
          </Dropdown>
        </Header>

        <Content style={{
          background: THEME_COLORS.background,
          minHeight: 'calc(100vh - 72px)',
          padding: isMobile ? '20px' : '32px',
        }}>
          {renderPage()}
        </Content>
      </Layout>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
