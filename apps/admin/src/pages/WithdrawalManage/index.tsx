import { useCallback, useEffect, useState } from 'react';
import { Table, Button, Tag, Space, message, Modal, Input, Select } from 'antd';
import { fetchWithdrawals, approveWithdrawal, rejectWithdrawal } from '../../services/api';
import type { AdminWithdrawal } from '../../types';
import { formatMoney } from '../../utils/format';

const statusColors: Record<string, string> = {
  PENDING: 'orange',
  APPROVED: 'blue',
  REJECTED: 'red',
  PAID: 'green',
};

const statusLabels: Record<string, string> = {
  PENDING: '待审核',
  APPROVED: '已通过',
  REJECTED: '已驳回',
  PAID: '已打款',
};

export default function WithdrawalManage() {
  const [data, setData] = useState<AdminWithdrawal[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>();

  const loadData = useCallback(() => {
    setLoading(true);
    fetchWithdrawals({ page, pageSize: 10, status })
      .then((res) => {
        setData(res.list);
        setTotal(res.total);
      })
      .catch((err) => message.error(err.message))
      .finally(() => setLoading(false));
  }, [page, status]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApprove = (id: string) => {
    Modal.confirm({
      title: '确认通过',
      content: '通过后将触发企业付款到零钱，是否继续？',
      onOk: async () => {
        await approveWithdrawal(id);
        message.success('已通过并打款');
        loadData();
      },
    });
  };

  const handleReject = (id: string) => {
    let remark = '';
    Modal.confirm({
      title: '驳回提现',
      content: (
        <Input.TextArea placeholder="请输入驳回原因" onChange={(e) => { remark = e.target.value; }} />
      ),
      onOk: async () => {
        await rejectWithdrawal(id, remark);
        message.success('已驳回，余额已退回');
        loadData();
      },
    });
  };

  const columns = [
    { title: '推广员', dataIndex: 'promoterName' },
    { title: '提现金额', dataIndex: 'amount', render: (v: number) => formatMoney(v) },
    { title: '申请时间', dataIndex: 'createdAt' },
    {
      title: '状态',
      dataIndex: 'status',
      render: (v: string) => <Tag color={statusColors[v] || 'default'}>{statusLabels[v] || v}</Tag>,
    },
    { title: '备注', dataIndex: 'remark', render: (v: string) => v || '-' },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: AdminWithdrawal) => (
        <Space>
          {record.status === 'PENDING' && (
            <>
              <Button type="link" onClick={() => handleApprove(record.id)}>通过</Button>
              <Button type="link" danger onClick={() => handleReject(record.id)}>驳回</Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Select
        allowClear
        placeholder="状态筛选"
        style={{ width: 120, marginBottom: 16 }}
        options={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))}
        onChange={setStatus}
      />
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{ current: page, total, onChange: setPage }}
      />
    </div>
  );
}
