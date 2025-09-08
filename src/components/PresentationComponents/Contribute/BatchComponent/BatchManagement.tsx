// Contribute/BatchComponent/Modal/BatchManagement.tsx
import React, { useState } from 'react';

import { Close } from '@mui/icons-material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button as MuiButton,
  Typography as MuiTypography,
} from '@mui/material';

import { PaperDraggableBatchManagement } from '@/components/SelectorComponents/Cascading/PaperDraggable';
import { useBatchManagement } from '@/hooks/useBatchManagement';
import { StyleDialog } from '@/styleMUI';

import BatchManagementContentDialog from './Modal/BatchManagementContentDialog';
import CreateBatchModal from './Modal/CreateBatchModal';

interface BatchManagementProps {
  visible: boolean;
  onClose: () => void;
  onBatchAssigned?: () => void;
}

const BatchManagement: React.FC<BatchManagementProps> = ({
  visible,
  onClose,
  onBatchAssigned,
}) => {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const { refreshBatches } = useBatchManagement({ autoFetch: visible });

  const handleClose = () => {
    onClose();
  };

  return (
    <>
      <Dialog
        open={visible}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        disableScrollLock={false}
        sx={{
          ...StyleDialog,
        }}
        PaperComponent={PaperDraggableBatchManagement}
        aria-labelledby="draggable-dialog-batch-management"
      >
        <DialogTitle
          sx={{
            cursor: 'move',
            position: 'relative',
            textAlign: 'center',
            fontWeight: 600,
            bgcolor: 'rgb(55, 148, 141)',
            color: '#fff',
            py: 2,
          }}
        >
          <MuiTypography variant="h6" component="div">
            Publication Batch Management
          </MuiTypography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <BatchManagementContentDialog
            visible={visible}
            createModalVisible={createModalVisible}
            setCreateModalVisible={setCreateModalVisible}
          />
        </DialogContent>

        <DialogActions sx={{ p: 3, bgcolor: 'grey.50' }}>
          <MuiButton
            onClick={handleClose}
            variant="outlined"
            style={{ textTransform: 'unset' }}
          >
            Close
          </MuiButton>
        </DialogActions>
      </Dialog>

      <CreateBatchModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSuccess={() => {
          refreshBatches();
          if (onBatchAssigned) onBatchAssigned();
        }}
      />
    </>
  );
};

export default BatchManagement;
