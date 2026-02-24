import { useCallback, useMemo, useRef, useState } from 'react';

import { Box, Button } from '@mui/material';
import { AgGridReact } from 'ag-grid-react';
import { Badge, Input, Pagination, Tag, Typography } from 'antd';
import dayjs from 'dayjs';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import '@/style/table.scss';

import ListEditorialPlatForm from '../commons/ListEditorialPlatForm';
import { MOCK_USERS, UserRecord } from '../mockData/usersData';

const { Title } = Typography;
const { Search } = Input;

const RoleBadge: React.FC<{ isStaff: boolean; isSuperuser: boolean }> = ({
  isStaff,
  isSuperuser,
}) => {
  if (isSuperuser) return <Tag color="red">Superuser</Tag>;
  if (isStaff) return <Tag color="blue">Staff</Tag>;
  return <Tag color="default">Contributor</Tag>;
};

const StatusBadge: React.FC<{ isActive: boolean }> = ({ isActive }) =>
  isActive ? (
    <Badge status="success" text="Active" />
  ) : (
    <Badge status="error" text="Inactive" />
  );

const EditUser: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gridRef = useRef<any>(null);
  const [users] = useState<UserRecord[]>(MOCK_USERS);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q),
    );
  }, [users, search]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columnDefs = useMemo(
    () =>
      [
        {
          headerName: 'Username',
          field: 'username',
          flex: 1,
          minWidth: 150,
          sortable: true,
          tooltipField: 'username',
        },
        {
          headerName: 'Full Name',
          field: 'firstName',
          flex: 1,
          minWidth: 160,
          sortable: true,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          valueGetter: (p: any) =>
            p.data ? `${p.data.firstName} ${p.data.lastName}` : '',
        },
        {
          headerName: 'Email',
          field: 'email',
          flex: 2,
          minWidth: 220,
          sortable: true,
          tooltipField: 'email',
        },
        {
          headerName: 'Role',
          field: 'isStaff',
          width: 130,
          sortable: true,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          cellRenderer: (p: any) =>
            p.data ? (
              <RoleBadge
                isStaff={p.data.isStaff}
                isSuperuser={p.data.isSuperuser}
              />
            ) : null,
        },
        {
          headerName: 'Status',
          field: 'isActive',
          width: 120,
          sortable: true,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          cellRenderer: (p: any) =>
            p.data ? <StatusBadge isActive={p.data.isActive} /> : null,
        },
        {
          headerName: 'Date Joined',
          field: 'dateJoined',
          width: 180,
          sortable: true,
          valueFormatter: ({ value }: { value: string }) =>
            value ? dayjs(value).format('YYYY-MM-DD') : '—',
        },
        {
          headerName: 'Last Login',
          field: 'lastLogin',
          width: 180,
          sortable: true,
          sort: 'desc' as const,
          valueFormatter: ({ value }: { value: string | null }) =>
            value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '—',
        },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] as any[],
    [],
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      resizable: true,
      filter: false,
      cellStyle: { paddingTop: '10px', fontSize: '13px' },
    }),
    [],
  );

  const getRowStyle = useCallback(
    () => ({
      fontSize: '0.8rem',
      fontWeight: 500,
      color: '#000',
      fontFamily: 'sans-serif',
    }),
    [],
  );

  const handlePageChange = useCallback(
    (newPage: number, pageSize?: number) => {
      setPage(newPage);
      if (pageSize && pageSize !== rowsPerPage) setRowsPerPage(pageSize);
      gridRef.current?.api.paginationGoToPage(newPage - 1);
    },
    [rowsPerPage],
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      setPage(1);
    },
    [],
  );

  return (
    <Box sx={{ p: 2, width: '100%' }}>
      <ListEditorialPlatForm />

      {/* Header row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '16px',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <Title
          level={4}
          style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}
        >
          Edit Users
        </Title>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search
            placeholder="Search users..."
            value={search}
            onChange={handleSearchChange}
            onSearch={(val) => setSearch(val)}
            style={{ width: 260 }}
            allowClear
          />
          <Button
            variant="contained"
            onClick={() =>
              window.open('/admin/auth/user/', '_blank', 'noopener,noreferrer')
            }
            sx={{
              backgroundColor: 'rgb(55, 148, 141)',
              color: '#fff',
              textTransform: 'none',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              '&:hover': { backgroundColor: 'rgb(1, 136, 125)' },
            }}
          >
            Users on Live Admin
          </Button>
        </div>
      </div>

      {/* Table */}
      <div
        className="ag-theme-alpine compact-table"
        style={{
          height: 'calc(90vh - 360px)',
          minHeight: '300px',
          width: '100%',
          border: '1px solid #d9d9d9',
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        }}
      >
        <AgGridReact
          theme="legacy"
          ref={gridRef}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          rowData={filteredUsers as any[]}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          getRowStyle={getRowStyle}
          enableBrowserTooltips
          paginationPageSize={rowsPerPage}
          pagination
          suppressPaginationPanel
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          getRowClass={(params: any) =>
            params.rowIndex % 2 === 0 ? 'even-row' : 'odd-row'
          }
          headerHeight={36}
          rowHeight={42}
        />
      </div>

      {/* Pagination */}
      <div
        style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}
      >
        <Pagination
          current={page}
          total={filteredUsers.length}
          pageSize={rowsPerPage}
          showSizeChanger
          showTotal={(total, range) =>
            `Showing ${range[0]}–${range[1]} of ${total} users`
          }
          pageSizeOptions={['5', '10', '20', '50']}
          onChange={handlePageChange}
          onShowSizeChange={handlePageChange}
          style={{ margin: 0 }}
        />
      </div>
    </Box>
  );
};

export default EditUser;
