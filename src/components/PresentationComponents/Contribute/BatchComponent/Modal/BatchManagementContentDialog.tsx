import React, { FunctionComponent } from 'react';

import { PlusOutlined, FileTextOutlined } from '@ant-design/icons';
import {
  Button as MuiButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography as MuiTypography,
  Divider,
  CircularProgress,
} from '@mui/material';

import { useBatchManagement } from '@/hooks/useBatchManagement';

import BatchTable from '../Table/BatchTable';
interface BatchManagementContentDialogProps {
  visible: boolean;
  createModalVisible: boolean;
  setCreateModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const BatchManagementContentDialog: FunctionComponent<
  BatchManagementContentDialogProps
> = ({ visible, setCreateModalVisible }) => {
  const { batches, loading, filter, changeFilter } = useBatchManagement({
    autoFetch: visible,
  });
  return (
    <>
      <Box sx={{ mb: 4, mt: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel
            style={{
              fontSize: 12,
              color: '#4e4e4e',
            }}
          >
            Filter
          </InputLabel>
          <Select
            value={filter}
            onChange={(e) => changeFilter(e.target.value as any)}
            label="Filter"
            style={{
              textTransform: 'unset',
              height: 34,
              color: '#4e4e4e',
              fontSize: 14,
            }}
          >
            <MenuItem value="all">All Batches</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="published">Published</MenuItem>
          </Select>
        </FormControl>

        <MuiButton
          variant="contained"
          size="small"
          startIcon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
          sx={{
            textTransform: 'unset',
            height: 34,
            fontSize: 16,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #0f766e 0%, #047857 100%)',
            },
          }}
        >
          Create Batch
        </MuiButton>
      </Box>

      <Divider sx={{ mb: 3 }} />
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : batches.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <FileTextOutlined style={{ fontSize: '48px', color: '#ccc' }} />
          <MuiTypography
            variant="body1"
            sx={{ mt: 2, color: 'text.secondary' }}
          >
            No batches found
          </MuiTypography>
          <MuiButton
            variant="text"
            onClick={() => setCreateModalVisible(true)}
            sx={{ mt: 1 }}
          >
            Create your first batch
          </MuiButton>
        </Box>
      ) : (
        <BatchTable batches={batches} loading={loading} />
      )}
    </>
  );
};

export default BatchManagementContentDialog;
