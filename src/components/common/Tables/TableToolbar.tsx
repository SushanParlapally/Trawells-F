import React from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  FileDownload as ExportIcon,
} from '@mui/icons-material';

interface TableToolbarProps {
  title?: string;
  searchable?: boolean;
  searchValue?: string;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  exportable?: boolean;
  onExport?: () => void;
  selectedCount?: number;
  actions?: React.ReactNode;
}

export const TableToolbar: React.FC<TableToolbarProps> = ({
  title,
  searchable = false,
  searchValue = '',
  onSearch,
  searchPlaceholder = 'Search...',
  exportable = false,
  onExport,
  selectedCount = 0,
  actions,
}) => {
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearch?.(event.target.value);
  };

  return (
    <Box
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {title && (
          <Typography variant='h6' component='div'>
            {title}
          </Typography>
        )}

        {selectedCount > 0 && (
          <Typography variant='body2' color='primary'>
            {selectedCount} selected
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {searchable && (
          <TextField
            size='small'
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon fontSize='small' />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
        )}

        {exportable && (
          <Button
            variant='outlined'
            size='small'
            startIcon={<ExportIcon />}
            onClick={onExport}
          >
            Export
          </Button>
        )}

        {actions}
      </Box>
    </Box>
  );
};

export default TableToolbar;
