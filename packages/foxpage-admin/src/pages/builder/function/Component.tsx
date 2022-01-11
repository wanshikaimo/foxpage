import React, { useCallback, useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Divider, Drawer, message, Popconfirm, Radio, Spin, Table } from 'antd';
import { DrawerProps } from 'antd/lib/drawer';
import styled from 'styled-components';

// import { RootState } from 'typesafe-actions';
import { Pagination } from '@/components/common/index';
import RightCloseIcon from '@/pages/builder/component/close';
import * as ACTIONS from '@/store/actions/builder/function';
import { FuncItem } from '@/types/application/function';

import BuilderContext from '../BuilderContext';

import EditDrawer from './EditDrawer';

const PAGE_SIZE = 10;

const OPTIONS = [
  { label: 'Project', value: 'project' },
  { label: 'Application', value: 'application' },
];

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const mapStateToProps = (state: any) => ({
  applicationId: state.builder.page.applicationId,
  folderId: state.builder.page.folderId,
  pageNum: state.builder.fn.pageNum,
  total: state.builder.fn.total,
  fetching: state.builder.fn.fetching,
  list: state.builder.fn.list,
});

const mapDispatchToProps = {
  changeOffset: ACTIONS.changeOffset,
  openDrawer: ACTIONS.updateFunctionDrawerVisible,
  fetchList: ACTIONS.fetchList,
  deleteCondition: ACTIONS.deleteFunction,
  clearAll: ACTIONS.clearAll,
};

interface DProps extends Omit<DrawerProps, 'onClose'> {
  onClose?: () => void;
}

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & DProps;

function Component(props: IProps) {
  const {
    applicationId,
    folderId,
    onClose,
    pageNum,
    total,
    fetching,
    list,
    changeOffset,
    openDrawer,
    fetchList,
    deleteCondition,
    clearAll,
  } = props;
  const { container } = useContext(BuilderContext);
  const [group, setGroup] = useState<'project' | 'application'>('project');

  useEffect(() => {
    return () => {
      clearAll();
    };
  }, []);

  useEffect(() => {
    fetchFunctionList();
  }, [applicationId, folderId, group, pageNum, fetchList]);

  const fetchFunctionList = () => {
    if (applicationId) {
      const params =
        group === 'project' && !!folderId
          ? {
              applicationId,
              folderId,
              page: pageNum,
              size: PAGE_SIZE,
            }
          : {
              applicationId,
              page: pageNum,
              size: PAGE_SIZE,
            };

      fetchList(params);
    }
  };

  const handleConditionDelete = useCallback(
    id => {
      if (id && applicationId) {
        deleteCondition({
          applicationId,
          id,
          status: true,
        });
      } else {
        message.warning('Delete function failed, please retry later');
      }
    },
    [applicationId, folderId, deleteCondition],
  );

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (_text: string, record: FuncItem) => {
        const type = record.content?.schemas[0]?.props?.async || '';

        return <span>{type ? 'async' : 'sync'}</span>;
      },
    },
    {
      title: 'Action',
      dataIndex: '',
      key: '',
      width: 100,
      render: (_text: string, record: FuncItem) => (
        <>
          {group === 'project' ? (
            <>
              <Button
                size="small"
                shape="circle"
                icon={<EditOutlined />}
                onClick={() => openDrawer(true, record, 'edit')}
              />
              <Divider type="vertical" />
              <Popconfirm
                title="Are you sure to delete this condition?"
                okText="Yes"
                cancelText="No"
                onConfirm={() => handleConditionDelete(record.id)}
              >
                <Button size="small" shape="circle" icon={<DeleteOutlined />} />
              </Popconfirm>
            </>
          ) : (
            <Button
              size="small"
              shape="circle"
              icon={<EyeOutlined />}
              onClick={() => openDrawer(true, record, 'view')}
            />
          )}
        </>
      ),
    },
  ];

  const handleGroupChange = useCallback(e => {
    const _value = e.target.value;
    setGroup(_value);
  }, []);

  return (
    <>
      <Drawer
        title="Function"
        placement="left"
        mask={false}
        visible
        getContainer={container}
        onClose={onClose}
        bodyStyle={{ padding: 12 }}
        style={{
          position: 'absolute',
          top: 8,
          height: 'calc(100% - 16px)',
          transition: 'none',
          left: 46,
          maxHeight: 600,
          overflowY: 'auto',
          width: '500px',
        }}
        closable={false}
        extra={<RightCloseIcon onClose={onClose} />}
      >
        <Toolbar>
          <Radio.Group size="small" options={OPTIONS} optionType="button" value={group} onChange={handleGroupChange} />
          {group === OPTIONS[0].value && (
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => openDrawer(true, undefined, 'new')}
            >
              Add Function
            </Button>
          )}
        </Toolbar>
        <Spin spinning={fetching}>
          <Table
            columns={columns}
            bordered={false}
            rowKey={(record: FuncItem) => record.id.toString()}
            pagination={false}
            dataSource={list}
            size="small"
          />
          <Pagination size="small" pageSize={PAGE_SIZE} current={pageNum} total={total} onChange={changeOffset} />
        </Spin>
      </Drawer>
      <EditDrawer onSuccess={fetchFunctionList} />
    </>
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Component);