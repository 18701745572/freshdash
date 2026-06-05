import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Tag, Space, message, Modal } from 'antd';
import { fetchPromoters, freezePromoter } from '../../services/api';
import type { AdminPromoter } from '../../types';
import { formatMoney } from '../../utils/format';

export default function PromoterManage() {
  const navigate = useNavigate();
  const [data, setData] = useState<AdminPromoter[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const loadData = useCallback(() => {
    setLoading(true);
    fetchPromoters({ page, pageSize: 10 })
      .then((res) => {
        setData(res.list);
        setTotal(res.total);
      })
      .catch((err) => message.error(err.message))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleFreeze = (record: AdminPromoter) => {
    const frozen = record.status === 'ACTIVE';
    Modal.confirm({
      title: frozen ? '冻结推广员' : '解冻推广员',
      content: frozen ? '冻结后将停止计算新佣金，是否继续？' : '解冻后恢复佣金计算，是否继续？',
      onOk: async () => {
        await freezePromoter(record.id, frozen);
        message.success(frozen ? '已冻结' : '已解冻');
        loadData();
      },
    });
  };

  const columns = [
    { title: '姓名', dataIndex: 'name' },
    { title: '手机号', dataIndex: 'phone' },
    { title: '绑定客户数', dataIndex: 'boundCustomerCount' },
    { title: '累计佣金', dataIndex: 'totalCommission', render: (v: number) => formatMoney(v) },
    { title: '待结算', dataIndex: 'pendingCommission', render: (v: number) => formatMoney(v) },
    { title: '可提现余额', dataIndex: 'balance', render: (v: number) => formatMoney(v) },
    {
      title: '状态',
      dataIndex: 'status',
      render: (v: string) => <Tag color={v === 'ACTIVE' ? 'green' : 'red'}>{v === 'ACTIVE' ? '正常' : '已冻结'}</Tag>,
    },
    { title: '注册时间', dataIndex: 'createdAt' },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: AdminPromoter) => (
        <Space>
          <Button type="link" onClick={() => navigate(`/promoters/${record.id}/commissions`)}>佣金明细</Button>
          <Button type="link" danger={record.status === 'ACTIVE'} onClick={() => handleToggleFreeze(record)}>
            {record.status === 'ACTIVE' ? '冻结' : '解冻'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={{ current: page, total, onChange: setPage }}
    />
  );
}
