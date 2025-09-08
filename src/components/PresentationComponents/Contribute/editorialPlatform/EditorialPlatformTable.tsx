// //* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useMemo, useRef, useState } from 'react';

import {
  EditOutlined,
  ClearOutlined,
  SearchOutlined,
  DownOutlined,
  UpOutlined,
  SettingOutlined,
  TeamOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import {
  ChangeSet,
  getSchema,
  materializeNew,
  PropertyAccessLevel,
  ContributionStatus,
} from '@dotproductdev/voyages-contribute';
import { AgGridReact } from 'ag-grid-react';
import {
  Button,
  Select,
  DatePicker,
  Row,
  Col,
  Card,
  Tag,
  Space,
  Typography,
  Form,
  Pagination,
  Input,
  Badge,
  Divider,
  message,
  Dropdown,
  Menu,
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import '@/style/table.scss';
import { BASEURLNODE } from '@/share/AUTH_BASEURL';
import '@/style/contributeContent.scss';

import BatchManagement from '../BatchComponent/BatchManagement';
import BatchAssignmentModal from '../BatchComponent/Modal/BatchAssignmentModal';
import ListEditorialPlatForm from '../commons/ListEditorialPlatForm';
import StatusCellRenderer from '../commons/StatusCellRenderer';
import { ContributionForm } from '../ContributionForm';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Constants
const PUBLICATION_BATCHES = [
  'Batch 2024-Q1',
  'Batch 2024-Q2',
  'Batch 2024-Q3',
  'Batch 2024-Q4',
];

const SEARCH_DEBOUNCE_DELAY = 500;

// Types
interface ContributionFilters {
  status: ContributionStatus | 'all';
  author: string;
  voyageId: string;
  shipName: string;
  nationality: string;
  dateRange: [Dayjs | null, Dayjs | null] | null;
  publicationBatch: string;
  reviewer: string;
  search?: string;
}

interface EditorialPlatformPlatProps {
  openSideBar: boolean;
}

const initialFilters: ContributionFilters = {
  status: 'all',
  author: '',
  voyageId: '',
  shipName: '',
  nationality: '',
  dateRange: null,
  publicationBatch: '',
  reviewer: '',
  search: '',
};

// Helper functions
const extractShipData = (changeSetData: any, property: string) => {
  const shipChange = changeSetData.changes?.[0]?.changes?.find(
    (c: any) => c.kind === 'owned' && c.property === 'Voyage_Ship',
  );
  return (
    shipChange?.changes?.find((s: any) => s.property === property)?.changed ||
    ''
  );
};

const extractLinkedShipData = (
  changeSetData: any,
  property: string,
  dataKey: string,
) => {
  const shipChange = changeSetData.changes?.[0]?.changes?.find(
    (c: any) => c.kind === 'owned' && c.property === 'Voyage_Ship',
  );
  return (
    shipChange?.changes?.find((s: any) => s.property === property)?.changed
      ?.data?.[dataKey] || ''
  );
};

const extractItineraryData = (changeSetData: any) => {
  const itineraryChange = changeSetData.changes?.[0]?.changes?.find(
    (c: any) => c.kind === 'owned' && c.property === 'Voyage_Itinerary',
  );
  return (
    itineraryChange?.changes?.find(
      (c: any) => c.property === 'VoyageItinerary_port_of_departure_id',
    )?.changed?.data?.Name || ''
  );
};

const transformContributionData = (contribution: any) => {
  const changeSetData = contribution.changeSet || contribution;
  const changeStatus = contribution?.status;

  return {
    ...changeSetData,
    voyageId: changeSetData.changes?.[0]?.entityRef?.id || '',
    status: changeStatus,
    shipName: extractShipData(changeSetData, 'VoyageShip_ship_name'),
    portOfDeparture: extractItineraryData(changeSetData),
    nationality: extractLinkedShipData(
      changeSetData,
      'VoyageShip_nationality_ship_id',
      'Nation name',
    ),
    tonnage: extractShipData(changeSetData, 'VoyageShip_tonnage'),
  };
};

// Custom hooks
const useSearchEditRequestsFilters = (form: any, gridRef: any) => {
  const [filters, setFilters] = useState<ContributionFilters>(initialFilters);

  const buildFilterQuery = useCallback(
    (filters: ContributionFilters): string => {
      const params = new URLSearchParams();

      if (filters.status !== 'all')
        params.append('status', String(filters.status));
      if (filters.author) params.append('author', String(filters.author));
      if (filters.voyageId) params.append('voyageId', String(filters.voyageId));
      if (filters.shipName) params.append('shipName', String(filters.shipName));
      if (filters.nationality)
        params.append('nationality', filters.nationality);
      if (filters.publicationBatch)
        params.append('publicationBatch', filters.publicationBatch);
      if (filters.reviewer) params.append('reviewer', filters.reviewer);
      if (filters.search) params.append('search', filters.search);
      if (filters.dateRange?.[0])
        params.append('dateFrom', filters.dateRange[0].toISOString());
      if (filters.dateRange?.[1])
        params.append('dateTo', filters.dateRange[1].toISOString());

      return params.toString();
    },
    [],
  );

  const handleFilterChange = useCallback(
    (field: keyof ContributionFilters, value: any) => {
      setFilters((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleClearFilters = useCallback(() => {
    setFilters(initialFilters);
    form.resetFields();
    gridRef.current?.api.refreshInfiniteCache();
  }, [form, gridRef]);

  const handleApplyFilters = useCallback(() => {
    gridRef.current?.api.refreshInfiniteCache();
  }, [gridRef]);

  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'status') return value !== 'all';
      if (key === 'dateRange')
        return value !== null && (value[0] !== null || value[1] !== null);
      return value !== '';
    });
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'status') return value !== 'all';
      if (key === 'dateRange')
        return value !== null && (value[0] !== null || value[1] !== null);
      return value !== '';
    }).length;
  }, [filters]);

  return {
    filters,
    setFilters,
    buildFilterQuery,
    handleFilterChange,
    handleClearFilters,
    handleApplyFilters,
    hasActiveFilters,
    activeFilterCount,
  };
};

// Components
const SearchInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <Input
    placeholder="Search contributions..."
    prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
    value={value}
    onChange={onChange}
    style={{
      width: '300px',
      borderRadius: '8px',
      height: '32px',
    }}
    allowClear
  />
);

const FilterToggleButton = ({
  showFilters,
  onClick,
}: {
  showFilters: boolean;
  onClick: () => void;
}) => (
  <Button
    type={showFilters ? 'primary' : 'default'}
    icon={showFilters ? <UpOutlined /> : <DownOutlined />}
    onClick={onClick}
    style={{
      borderRadius: '6px',
      height: '30px',
      paddingLeft: '10px',
      paddingRight: '10px',
      background: showFilters
        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        : 'white',
      border: showFilters ? 'none' : '1px solid #d1d5db',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }}
  >
    {showFilters ? 'Hide Filters' : 'Show Filters'}
  </Button>
);

const ActiveFiltersTag = ({
  count,
  onClose,
}: {
  count: number;
  onClose: () => void;
}) => (
  <Badge count={count} offset={[-8, 8]}>
    <Tag
      closable
      onClose={onClose}
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '20px',
        padding: '4px 12px',
        fontSize: '12px',
      }}
    >
      {count} filter{count > 1 ? 's' : ''} active
    </Tag>
  </Badge>
);

const FilterPanel = ({
  filters,
  form,
  onFilterChange,
  onClearFilters,
  onApplyFilters,
  hasActiveFilters,
}: {
  filters: ContributionFilters;
  form: any;
  onFilterChange: (field: keyof ContributionFilters, value: any) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
  hasActiveFilters: boolean;
}) => (
  <Card
    style={{
      marginBottom: '16px',
      borderRadius: '6px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.03)',
      background: 'white',
    }}
    styles={{ body: { padding: '16px' } }}
  >
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
      }}
    >
      <Title level={5} style={{ margin: 0, color: '#374151' }}>
        Filter Options
      </Title>

      <Space size="small">
        <Button
          icon={<ClearOutlined />}
          onClick={onClearFilters}
          style={{
            borderRadius: '4px',
            border: '1px solid #fca5a5',
            color: '#dc2626',
            background: '#fef2f2',
            height: '28px',
            fontSize: '12px',
          }}
          disabled={!hasActiveFilters}
          size="small"
        >
          Clear All
        </Button>
        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={onApplyFilters}
          style={{
            borderRadius: '4px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            border: 'none',
            boxShadow: '0 1px 2px rgba(16, 185, 129, 0.2)',
            height: '28px',
            fontSize: '12px',
          }}
          size="small"
        >
          Apply Filters
        </Button>
      </Space>
    </div>

    <Divider style={{ margin: '12px 0' }} />

    <Form form={form} layout="vertical">
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} md={6} lg={3}>
          <Form.Item
            label={
              <span
                style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}
              >
                Status
              </span>
            }
            name="status"
            style={{ marginBottom: '12px' }}
          >
            <Select
              value={filters.status}
              onChange={(value) => onFilterChange('status', value)}
              placeholder="All Statuses"
              style={{ borderRadius: '4px' }}
              size="small"
            >
              <Option value="all">All Statuses</Option>
              <Option value={ContributionStatus.WorkInProgress}>
                Work In Progress
              </Option>
              <Option value={ContributionStatus.Submitted}>Submitted</Option>
              <Option value={ContributionStatus.Accepted}>Accepted</Option>
              <Option value={ContributionStatus.Rejected}>Rejected</Option>
              <Option value={ContributionStatus.Published}>Published</Option>
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={6} lg={3}>
          <Form.Item
            label={
              <span
                style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}
              >
                Publication Batch
              </span>
            }
            name="publicationBatch"
            style={{ marginBottom: '12px' }}
          >
            <Select
              value={filters.publicationBatch}
              onChange={(value) => onFilterChange('publicationBatch', value)}
              placeholder="All Batches"
              allowClear
              style={{ borderRadius: '4px' }}
              size="small"
            >
              {PUBLICATION_BATCHES.map((batch) => (
                <Option key={batch} value={batch}>
                  {batch}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={6} lg={4}>
          <Form.Item
            label={
              <span
                style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}
              >
                Date Range
              </span>
            }
            name="dateRange"
            style={{ marginBottom: '12px' }}
          >
            <RangePicker
              value={filters.dateRange}
              onChange={(dates) => onFilterChange('dateRange', dates)}
              style={{ width: '100%', borderRadius: '4px' }}
              size="small"
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  </Card>
);

// Main component
const EditorialPlatformTable: React.FC<EditorialPlatformPlatProps> = ({
  openSideBar,
}) => {
  const [active, setActive] = useState<ChangeSet | undefined>(undefined);
  const [contribs, setContribs] = useState<ChangeSet[]>([]);
  const [page, setPage] = useState(1);
  const [totalResultsCount, setTotalResultsCount] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [batchManagementVisible, setBatchManagementVisible] = useState(false);
  const [batchAssignmentVisible, setBatchAssignmentVisible] = useState(false);
  const [form] = Form.useForm();
  const gridRef = useRef<any>(null);

  const {
    filters,
    setFilters,
    buildFilterQuery,
    handleFilterChange,
    handleClearFilters,
    handleApplyFilters,
    hasActiveFilters,
    activeFilterCount,
  } = useSearchEditRequestsFilters(form, gridRef);

  // Auto-apply search filter with debounce
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      handleFilterChange('search', value);

      setTimeout(() => {
        if (filters.search === value) {
          handleApplyFilters();
        }
      }, SEARCH_DEBOUNCE_DELAY);
    },
    [filters.search, handleApplyFilters, handleFilterChange],
  );

  // Handle row selection
  const onSelectionChanged = useCallback(() => {
    const selectedNodes = gridRef.current?.api.getSelectedNodes();
    const selectedIds = selectedNodes?.map((node: any) => node.data.id) || [];
    setSelectedRows(selectedIds);
  }, []);

  // Bulk actions menu
  const bulkActionsMenu = (
    <Menu>
      <Menu.Item
        key="assign-batch"
        icon={<TeamOutlined />}
        onClick={() => {
          if (selectedRows.length === 0) {
            message.warning('Please select contributions to assign');
            return;
          }
          setBatchAssignmentVisible(true);
        }}
      >
        Assign to Batch
      </Menu.Item>
      <Menu.Item
        key="approve"
        icon={<CheckCircleOutlined />}
        onClick={() => {
          if (selectedRows.length === 0) {
            message.warning('Please select contributions to approve');
            return;
          }
          // Handle bulk approval
          message.info('Bulk approval functionality coming soon');
        }}
      >
        Bulk Approve
      </Menu.Item>
    </Menu>
  );

  const columnDefs = useMemo(
    () =>
      [
        {
          headerName: '',
          field: undefined,
          checkboxSelection: true,
          headerCheckboxSelection: true,
          width: 50,
          minWidth: 50,
          maxWidth: 50,
          sortable: false,
          resizable: false,
          suppressMovable: true,
          pinned: 'left',
        },
        {
          headerName: 'Type',
          field: undefined as any,
          cellRenderer: () => (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
              }}
            >
              <Button
                type="text"
                icon={<EditOutlined />}
                size="small"
                style={{ color: 'rgb(55, 148, 141)' }}
              />
            </div>
          ),
          width: 60,
          minWidth: 60,
          maxWidth: 60,
          sortable: false,
          resizable: false,
          suppressMovable: true,
          pinned: 'left',
          cellStyle: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
          },
        },
        {
          headerName: 'Title',
          field: 'title' as any,
          tooltipField: 'title',
          width: 200,
        },
        {
          headerName: 'Contributor',
          field: 'author' as any,
          valueGetter: (params: any) => params.data?.author || 'Unknown',
          width: 120,
          tooltipField: 'author',
        },
        {
          headerName: 'Comments',
          field: 'comments' as any,
          tooltipField: 'comments',
          width: 250,
        },
        {
          headerName: 'Date',
          field: 'timestamp' as any,
          valueFormatter: ({ value }: { value: number }) =>
            dayjs(value).format('MM/DD/YYYY'),
          width: 100,
        },
        {
          headerName: 'Voyage ID',
          field: 'voyageId' as any,
          tooltipValueGetter: (params: any) =>
            `Voyage ID: ${params.data?.voyageId}`,
          width: 100,
          flex: 1,
        },
        {
          headerName: 'Ship',
          field: 'shipName' as any,
          width: 150,
          flex: 1,
          tooltipField: 'shipName',
        },
        {
          headerName: 'Port of Departure',
          field: 'portOfDeparture' as any,
          tooltipField: 'portOfDeparture',
          width: 200,
        },
        {
          headerName: 'Nationality',
          field: 'nationality' as any,
          width: 120,
          flex: 1,
          tooltipField: 'nationality',
        },
        {
          headerName: 'Tonnage',
          field: 'tonnage' as any,
          width: 100,
          flex: 1,
          tooltipField: 'tonnage',
        },
        {
          headerName: 'Reviewer',
          field: undefined as any,
          valueGetter: () => 'David Ellis',
          width: 120,
          flex: 1,
        },
        {
          headerName: 'Status',
          field: 'status' as any,
          cellRenderer: StatusCellRenderer,
          width: 120,
          flex: 1,
        },
      ] as any[],
    [],
  );

  const datasource = useMemo(
    () => ({
      getRows: async (params: any) => {
        const currentPage = Math.floor(params.startRow / rowsPerPage) + 1;
        const filterQuery = buildFilterQuery(filters);

        try {
          const url = `${BASEURLNODE}/contributions?page=${currentPage}&limit=${rowsPerPage}${filterQuery ? `&${filterQuery}` : ''}`;
          const res = await fetch(url);
          const data = await res.json();

          const transformedRows = (data.data || data).map(
            transformContributionData,
          );

          params.successCallback(
            transformedRows,
            data.total || transformedRows.length,
          );
          setTotalResultsCount(data.total || transformedRows.length);
          setContribs(transformedRows);
        } catch (err) {
          console.error('Error fetching data:', err);
          params.failCallback();
        }
      },
    }),
    [rowsPerPage, buildFilterQuery, filters],
  );

  const handlePageChange = useCallback(
    (newPage: number, pageSize?: number) => {
      setPage(newPage);
      if (pageSize && pageSize !== rowsPerPage) {
        setRowsPerPage(pageSize);
      }
      gridRef.current?.api.paginationGoToPage(newPage - 1);
    },
    [rowsPerPage],
  );

  const empty = useMemo(() => {
    if (!active) return undefined;
    const schema = active.changes[0].entityRef.schema;
    const id = active.changes[0].entityRef.id;
    return materializeNew(getSchema(schema), id);
  }, [active]);

  const getRowRowStyle = useCallback(
    () => ({
      fontSize: '0.8rem',
      fontWeight: 500,
      color: '#000',
      fontFamily: 'sans-serif',
    }),
    [],
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      resizable: true,
      filter: false,
      cellStyle: {
        paddingTop: '8px',
        paddingBottom: '8px',
        fontSize: '13px',
        lineHeight: '1.2',
      },
    }),
    [],
  );

  if (active) {
    return (
      <div style={{ padding: '16px', width: '100%' }}>
        <div style={{ marginBottom: '16px' }}>
          <Button
            onClick={() => setActive(undefined)}
            style={{
              marginBottom: '16px',
              borderRadius: '8px',
              height: '40px',
              paddingLeft: '16px',
              paddingRight: '16px',
            }}
          >
            ← Back to Table
          </Button>
          <Title level={4}>Contribution from {active?.author}</Title>
        </div>
        <div className="contribute-content">
          {empty && (
            <ContributionForm
              entity={empty}
              changeSet={active}
              onChange={setActive}
              accessLevel={PropertyAccessLevel.Editor}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', width: '100%' }}>
      <ListEditorialPlatForm />

      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: '12px 12px 4px 4px',
          padding: '12px',
          marginBottom: '12px',
          border: '1px solid #e8f0fe',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <Title level={2} style={{ margin: 0, color: '#333' }}>
              Edit Requests
            </Title>
            <div style={{ marginTop: '4px', color: '#6b7280' }}>
              Manage and review Edit Requests
            </div>
          </div>

          <Space size="middle">
            <SearchInput
              value={filters.search || ''}
              onChange={handleSearchChange}
            />
            {hasActiveFilters && (
              <ActiveFiltersTag
                count={activeFilterCount}
                onClose={handleClearFilters}
              />
            )}
            <FilterToggleButton
              showFilters={showFilters}
              onClick={() => setShowFilters(!showFilters)}
            />
            <Button
              icon={<SettingOutlined />}
              onClick={() => setBatchManagementVisible(true)}
              style={{
                borderRadius: '6px',
                height: '30px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                color: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              Batch Management
            </Button>
          </Space>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedRows.length > 0 && (
        <Card
          style={{
            marginBottom: '16px',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
            background: '#f8fafc',
          }}
          styles={{ body: { padding: '12px 16px' } }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <Badge
                count={selectedRows.length}
                style={{ backgroundColor: '#1890ff' }}
              />
              <span style={{ marginLeft: '8px', fontWeight: 500 }}>
                {selectedRows.length} contribution(s) selected
              </span>
            </div>
            <Space>
              <Dropdown overlay={bulkActionsMenu} trigger={['click']}>
                <Button
                  type="primary"
                  style={{
                    background:
                      'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                    border: 'none',
                  }}
                >
                  Bulk Actions <DownOutlined />
                </Button>
              </Dropdown>
              <Button
                size="small"
                onClick={() => {
                  gridRef.current?.api.deselectAll();
                  setSelectedRows([]);
                }}
              >
                Clear Selection
              </Button>
            </Space>
          </div>
        </Card>
      )}

      {/* Filters */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          form={form}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          onApplyFilters={handleApplyFilters}
          hasActiveFilters={hasActiveFilters}
        />
      )}

      {/* Table */}
      <div
        className="ag-theme-alpine compact-table"
        style={{
          height: 'calc(90vh - 280px)',
          width: openSideBar ? 'calc(100vw - 340px)' : 'calc(100vw - 120px)',
          border: '1px solid #d9d9d9',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        }}
      >
        <AgGridReact<ChangeSet>
          theme="legacy"
          ref={gridRef}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          getRowStyle={getRowRowStyle}
          enableBrowserTooltips={true}
          rowModelType="infinite"
          datasource={datasource}
          cacheBlockSize={rowsPerPage}
          paginationPageSize={rowsPerPage}
          onRowClicked={({ data }) => setActive(data)}
          pagination={true}
          suppressPaginationPanel={true}
          getRowClass={(params) =>
            params.rowIndex % 2 === 0 ? 'even-row' : 'odd-row'
          }
          rowHeight={40}
          headerHeight={36}
          suppressHorizontalScroll={false}
          rowSelection="multiple"
          onSelectionChanged={onSelectionChanged}
          suppressRowClickSelection={true}
        />
      </div>

      {/* Pagination */}
      <div
        style={{
          marginTop: '16px',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Pagination
          current={page}
          total={totalResultsCount}
          pageSize={rowsPerPage}
          showSizeChanger
          showTotal={(total, range) =>
            `Showing ${range[0]}-${range[1]} of ${total} contributions`
          }
          pageSizeOptions={['5', '10', '20', '50', '100']}
          onChange={handlePageChange}
          onShowSizeChange={handlePageChange}
          style={{ margin: 0 }}
        />
      </div>

      {/* Batch Management Modal */}
      <BatchManagement
        visible={batchManagementVisible}
        onClose={() => setBatchManagementVisible(false)}
        onBatchAssigned={() => {
          handleApplyFilters();
          message.success('Batch updated successfully');
        }}
      />

      {/* Batch Assignment Modal */}
      <BatchAssignmentModal
        visible={batchAssignmentVisible}
        onClose={() => setBatchAssignmentVisible(false)}
        contributionIds={selectedRows}
        onSuccess={() => {
          setBatchAssignmentVisible(false);
          setSelectedRows([]);
          gridRef.current?.api.deselectAll();
          handleApplyFilters();
        }}
      />
    </div>
  );
};

export default EditorialPlatformTable;
