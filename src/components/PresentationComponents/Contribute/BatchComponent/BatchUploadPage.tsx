import React, { useRef } from 'react';

import {
  DownloadOutlined,
  InboxOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { Box, Typography as MuiTypography } from '@mui/material';
import { Alert, Button, Progress, Select, Space, Spin, Typography } from 'antd';

import { UploadEntity } from '@/fetch/contributeFetch/batchUploadApi';
import { SUPPORTED_ENTITIES, useBatchUpload } from '@/hooks/useBatchUpload';

import ListEditorialPlatForm from '../commons/ListEditorialPlatForm';

const { Text } = Typography;
const { Option } = Select;

const BatchUploadPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    templateLoading,
    templateError,
    downloadTemplate,
    selectedEntity,
    setSelectedEntity,
    selectedFile,
    dragging,
    handleFileChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    clearFile,
    uploading,
    uploadError,
    jobStatus,
    handleUpload,
    progressPercent,
    isTerminal,
  } = useBatchUpload();

  return (
    <Box sx={{ pr: 4, pl: 2, pb: 4, width: '100%' }}>
      <Box
        sx={{
          position: 'sticky',
          top: '7rem',
          zIndex: 40,
          background: '#fff',
          pb: 1,
        }}
      >
        <ListEditorialPlatForm />
        <MuiTypography
          variant="h4"
          sx={{ mb: 1, fontSize: '24px', fontWeight: 600 }}
        >
          Batch Upload
        </MuiTypography>
      </Box>

      <MuiTypography variant="body2" sx={{ mb: 4, color: 'text.secondary' }}>
        Upload a CSV file to create contributions in bulk. Download the blank
        template below to ensure your file uses the correct column headers.
      </MuiTypography>

      {/* ── Step 1: Entity + template download ── */}
      <Box
        sx={{
          mb: 4,
          p: 3,
          border: '1px solid #e8e8e8',
          borderRadius: 2,
          background: '#fafafa',
        }}
      >
        <Text strong style={{ fontSize: 15 }}>
          Step 1 — Choose entity type and download the template
        </Text>

        <Box
          sx={{
            mt: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Select
            value={selectedEntity}
            onChange={(val) => setSelectedEntity(val as UploadEntity)}
            style={{ width: 160 }}
            size="middle"
          >
            {SUPPORTED_ENTITIES.map((e) => (
              <Option key={e} value={e}>
                {e}
              </Option>
            ))}
          </Select>

          <Button
            icon={<DownloadOutlined />}
            onClick={() => downloadTemplate(selectedEntity)}
            loading={templateLoading}
            disabled={templateLoading}
            style={{
              textTransform: 'unset',
              color: 'rgb(55, 148, 141)',
              border: '1px solid rgb(55, 148, 141)',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            Download template
          </Button>
        </Box>

        {templateError && (
          <Alert
            type="error"
            message={templateError}
            style={{ marginTop: 12 }}
            showIcon
          />
        )}

        <Text
          type="secondary"
          style={{ display: 'block', marginTop: 10, fontSize: 12 }}
        >
          The template contains all the column headers expected by the backend.
          Fill in the data rows and re-upload the file below.
        </Text>
      </Box>

      {/* ── Step 2: File drop zone ── */}
      <Box
        sx={{
          mb: 4,
          p: 3,
          border: '1px solid #e8e8e8',
          borderRadius: 2,
          background: '#fafafa',
        }}
      >
        <Text strong style={{ fontSize: 15 }}>
          Step 2 — Select your completed CSV file
        </Text>

        <Box
          sx={{ mt: 2 }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? '#37948d' : '#d9d9d9'}`,
            borderRadius: 8,
            padding: '32px 16px',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragging ? '#f0fffe' : '#fff',
            transition: 'border-color 0.2s, background 0.2s',
          }}
        >
          <InboxOutlined
            style={{ fontSize: 36, color: '#37948d', marginBottom: 8 }}
          />
          <div>
            <Text style={{ fontSize: 14 }}>
              {selectedFile
                ? selectedFile.name
                : 'Drag and drop a CSV file here, or click to select'}
            </Text>
          </div>
          {selectedFile && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {(selectedFile.size / 1024).toFixed(1)} KB
            </Text>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </Box>

        {uploadError && (
          <Alert
            type="error"
            message={uploadError}
            style={{ marginTop: 12 }}
            showIcon
          />
        )}
      </Box>

      {/* ── Step 3: Upload button ── */}
      <Box
        sx={{
          mb: 4,
          p: 3,
          border: '1px solid #e8e8e8',
          borderRadius: 2,
          background: '#fafafa',
        }}
      >
        <Text strong style={{ fontSize: 15 }}>
          Step 3 — Upload
        </Text>

        <Box sx={{ mt: 2 }}>
          <Space>
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              loading={uploading}
              style={{
                textTransform: 'unset',
                fontSize: '0.75rem',
                fontWeight: 600,
                border: 'none',
                color: '#fff',
                background:
                  !selectedFile || uploading ? '#b0b0b0' : 'rgb(55, 148, 141)',
                cursor: !selectedFile ? 'not-allowed' : 'pointer',
                opacity: !selectedFile ? 0.6 : 1,
                transition: 'background 0.2s, opacity 0.2s',
              }}
            >
              {uploading ? 'Uploading…' : 'Upload CSV'}
            </Button>

            {selectedFile && !uploading && !isTerminal && (
              <Button onClick={clearFile}>Clear</Button>
            )}
          </Space>
        </Box>

        {/* Progress */}
        {jobStatus && (
          <Box sx={{ mt: 3 }}>
            {(jobStatus.status === 'pending' ||
              jobStatus.status === 'running') && (
              <Space>
                <Spin size="small" />
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Processing rows… {jobStatus.progress.processed} /{' '}
                  {jobStatus.progress.total || '?'}
                </Text>
              </Space>
            )}

            {jobStatus.progress.total > 0 && (
              <Progress
                percent={progressPercent}
                status={
                  jobStatus.status === 'failed'
                    ? 'exception'
                    : jobStatus.status === 'completed'
                      ? 'success'
                      : 'active'
                }
                style={{ marginTop: 8, maxWidth: 480 }}
              />
            )}

            {jobStatus.status === 'completed' && jobStatus.result && (
              <Alert
                type="success"
                style={{ marginTop: 12 }}
                message={
                  <>
                    Import complete — <strong>{jobStatus.result.pushed}</strong>{' '}
                    contribution
                    {jobStatus.result.pushed !== 1 ? 's' : ''} created.
                    {jobStatus.progress.total - jobStatus.result.pushed > 0 && (
                      <>
                        {' '}
                        {jobStatus.progress.total - jobStatus.result.pushed} row
                        {jobStatus.progress.total - jobStatus.result.pushed !==
                        1
                          ? 's'
                          : ''}{' '}
                        were dropped by the mapper.
                      </>
                    )}
                  </>
                }
                showIcon
              />
            )}

            {jobStatus.status === 'failed' && (
              <Alert
                type="error"
                style={{ marginTop: 12 }}
                message={
                  jobStatus.failureReason ??
                  'Import failed. Check your CSV and try again.'
                }
                showIcon
              />
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default BatchUploadPage;
