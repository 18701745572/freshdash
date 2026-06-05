import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Tag, Button, Space, message, Select, Input, Modal } from 'antd';
import { DownloadOutlined, ThunderboltOutlined } from '@ant-design/icons';
import {
  fetchOrders,
  fetchSuppliers,
  dispatchOrder,
  autoDispatchOrders,
  revokeDispatch,
} from '../../services/api';
import type { AdminOrder } from '../../types';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../constants/order';
import { formatMoney, exportOrdersToExcel } from '../../utils/excel';

export default function OrderManage() {
  const navigate = useNavigate();
  const [data, setData] = useState<AdminOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>();
  const [supplierId, setSupplierId] = useState<string>();
  const [keyword, setKeyword] = useState('');
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([]);
  const [dispatchModal, setDispatchModal] = useState<{ open: boolean; orderId?: string; supplierId?: string }>({ open: false });

  const loadData = useCallback(() => {
    setLoading(true);
    fetchOrders({ page, pageSize: 10, status, supplierId, keyword: keyword || undefined })
      .then((res) => {
        setData(res.list);
        setTotal(res.total);
      })
      .catch((err) => message.error(err.message))
      .finally(() => setLoading(false));
  }, [page, status, supplierId, keyword]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    fetchSuppliers({ pageSize: 100 }).then((res) => setSuppliers(res.list)).catch(() => {});
  }, []);

  const handleDispatch = async () => {
    if (!dispatchModal.orderId || !dispatchModal.supplierId) return;
    try {
      await dispatchOrder(dispatchModal.orderId, dispatchModal.supplierId);
      message.success('派单成功');
      setDispatchModal({ open: false });
      loadData();
    } catch (e) {
      message.error((e as Error).message);
    }
  };

  const handleAutoDispatch = () => {
    Modal.confirm({
      title: '一键自动派单',
      content: '将按商品默认供应商自动派发所有待派单订单，是否继续？',
      onOk: async () => {
        const res = await autoDispatchOrders();
        message.success(`成功 ${res.success} 单，失败 ${res.failed} 单`);
        loadData();
      },
    });
  };

  const handleRevoke = (orderId: string) => {
    Modal.confirm({
      title: '撤销派单',
      content: '撤销后订单将回退到待派单状态，是否继续？',
      onOk: async () => {
        await revokeDispatch(orderId);
        message.success('已撤销派单');
        loadData();
      },
    });
  };

  const handleExport = async () => {
    const res = await fetchOrders({ status, supplierId, keyword, pageSize: 1000 });
    exportOrdersToExcel(res.list);
  };

  const columns = [
    { title: '订单号', dataIndex: 'orderNo' },
    { title: '用户昵称', dataIndex: 'userNickName' },
    { title: '商品数量', dataIndex: 'itemCount' },
    { title: '总价', dataIndex: 'totalAmount', render: (v: number) => formatMoney(v) },
    { title: '满减', dataIndex: 'discountAmount', render: (v: number) => (v ? `-${formatMoney(v)}` : '-') },
    { title: '实付', dataIndex: 'actualAmount', render: (v: number) => formatMoney(v) },
    {
      title: '状态',
      dataIndex: 'status',
      render: (v: keyof typeof ORDER_STATUS_LABELS) => (
        <Tag color={ORDER_STATUS_COLORS[v]}>{ORDER_STATUS_LABELS[v]}</Tag>
      ),
    },
    { title: '所属供应商', dataIndex: 'supplierName', render: (v: string) => v || '-' },
    {
      title: '发货状态',
      key: 'shipStatus',
      render: (_: unknown, record: AdminOrder) => {
        if (record.shippedAt) return `已发货 (${record.shippedAt})`;
        if (record.status === 'PENDING_SHIP') return '待发货';
        return '-';
      },
    },
    { title: '下单时间', dataIndex: 'createdAt' },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: AdminOrder) => (
        <Space>
          <Button type="link" onClick={() => navigate(`/orders/${record.id}`)}>详情</Button>
          {record.status === 'PENDING_DISPATCH' && (
            <Button type="link" onClick={() => setDispatchModal({ open: true, orderId: record.id })}>派单</Button>
          )}
          {record.status === 'PENDING_SHIP' && (
            <Button type="link" danger onClick={() => handleRevoke(record.id)}>撤销派单</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }} wrap>
        <Button icon={<ThunderboltOutlined />} type="primary" onClick={handleAutoDispatch}>一键自动派单</Button>
        <Button icon={<DownloadOutlined />} onClick={handleExport}>导出发货表</Button>
        <Select
          allowClear
          placeholder="订单状态"
          style={{ width: 130 }}
          options={Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
          onChange={setStatus}
        />
        <Select
          allowClear
          placeholder="供应商"
          style={{ width: 150 }}
          options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
          onChange={setSupplierId}
        />
        <Input.Search placeholder="搜索订单号/用户/供应商" allowClear onSearch={setKeyword} style={{ width: 240 }} />
      </Space>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        scroll={{ x: 1400 }}
        pagination={{ current: page, total, onChange: setPage }}
      />
      <Modal
        title="手动派单"
        open={dispatchModal.open}
        onOk={handleDispatch}
        onCancel={() => setDispatchModal({ open: false })}
      >
        <Select
          style={{ width: '100%' }}
          placeholder="选择供应商"
          options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
          onChange={(v) => setDispatchModal((prev) => ({ ...prev, supplierId: v }))}
        />
      </Modal>
    </div>
  );
}
