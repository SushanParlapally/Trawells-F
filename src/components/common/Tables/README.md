# Data Table Components

A comprehensive set of reusable table components built with Material-UI for the Travel Desk
Management System.

## Components

### DataTable

The main table component that provides sorting, filtering, searching, pagination, and export
functionality.

#### Features

- **Responsive Design**: Automatically adapts to mobile devices with collapsible rows
- **Sorting**: Click column headers to sort data (configurable per column)
- **Searching**: Global search across all searchable columns
- **Filtering**: Column-specific filtering with different filter types
- **Pagination**: Built-in pagination with configurable page sizes (20, 50, 100)
- **Selection**: Row selection with bulk operations support
- **Export**: CSV export functionality
- **Loading States**: Built-in loading and empty state handling
- **Accessibility**: Full keyboard navigation and screen reader support

#### Basic Usage

```tsx
import { DataTable, TableColumn } from '../components/common/Tables';

interface User {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive';
}

const columns: TableColumn<User>[] = [
  {
    key: 'name',
    title: 'Name',
    dataIndex: 'name',
    sortable: true,
  },
  {
    key: 'email',
    title: 'Email',
    dataIndex: 'email',
    sortable: true,
  },
  {
    key: 'status',
    title: 'Status',
    dataIndex: 'status',
    filterable: true,
    render: status => <Chip label={status} color={status === 'active' ? 'success' : 'default'} />,
  },
];

const MyTable = () => {
  const [data, setData] = useState<User[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
  });

  return (
    <DataTable
      columns={columns}
      data={data}
      pagination={pagination}
      onPaginationChange={(page, pageSize) => setPagination(prev => ({ ...prev, page, pageSize }))}
      searchable
      exportable
      selectable
    />
  );
};
```

#### Advanced Usage

```tsx
const advancedColumns: TableColumn<User>[] = [
  {
    key: 'avatar',
    title: '',
    width: 60,
    responsive: ['xs'], // Hide on mobile
    render: (_, record) => <Avatar src={record.avatar}>{record.name[0]}</Avatar>,
  },
  {
    key: 'name',
    title: 'Name',
    dataIndex: 'name',
    sortable: true,
    fixed: 'left', // Sticky column
    render: (name, record) => (
      <Box>
        <Typography variant='body2' fontWeight={600}>
          {name}
        </Typography>
        <Typography variant='caption' color='text.secondary'>
          {record.email}
        </Typography>
      </Box>
    ),
  },
  {
    key: 'department',
    title: 'Department',
    dataIndex: 'department',
    filterable: true,
    filterType: 'select',
    filterOptions: [
      { label: 'Engineering', value: 'engineering' },
      { label: 'Marketing', value: 'marketing' },
    ],
  },
  {
    key: 'actions',
    title: 'Actions',
    width: 120,
    align: 'center',
    render: (_, record) => (
      <Box>
        <IconButton onClick={() => handleEdit(record)}>
          <Edit />
        </IconButton>
        <IconButton onClick={() => handleDelete(record)}>
          <Delete />
        </IconButton>
      </Box>
    ),
  },
];
```

### Pagination

Standalone pagination component with configurable options.

#### Usage

```tsx
import { Pagination } from '../components/common/Tables';

<Pagination
  current={1}
  pageSize={20}
  total={100}
  pageSizeOptions={[20, 50, 100]}
  showSizeChanger
  showQuickJumper
  showTotal
  onChange={(page, pageSize) => console.log(page, pageSize)}
/>;
```

### TableToolbar

Toolbar component with search, export, and custom actions.

#### Usage

```tsx
import { TableToolbar } from '../components/common/Tables';

<TableToolbar
  searchable
  searchPlaceholder='Search users...'
  onSearch={term => console.log(term)}
  exportable
  onExport={options => console.log(options)}
  title='User Management'
  actions={
    <Button variant='contained' onClick={handleAdd}>
      Add User
    </Button>
  }
/>;
```

## Column Configuration

### TableColumn Interface

```tsx
interface TableColumn<T = any> {
  key: string; // Unique column identifier
  title: string; // Column header text
  dataIndex?: string; // Path to data property (supports dot notation)
  width?: number | string; // Column width
  sortable?: boolean; // Enable sorting
  filterable?: boolean; // Enable filtering
  filterType?: 'text' | 'select' | 'date' | 'number';
  filterOptions?: Array<{ label: string; value: any }>;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right'; // Sticky column
  responsive?: string[]; // Breakpoints to hide column
}
```

### Column Types

#### Basic Column

```tsx
{
  key: 'name',
  title: 'Name',
  dataIndex: 'name',
  sortable: true
}
```

#### Custom Render Column

```tsx
{
  key: 'status',
  title: 'Status',
  dataIndex: 'status',
  render: (status) => (
    <Chip
      label={status}
      color={status === 'active' ? 'success' : 'error'}
    />
  )
}
```

#### Filterable Column

```tsx
{
  key: 'department',
  title: 'Department',
  dataIndex: 'department',
  filterable: true,
  filterType: 'select',
  filterOptions: [
    { label: 'Engineering', value: 'engineering' },
    { label: 'Marketing', value: 'marketing' }
  ]
}
```

#### Responsive Column

```tsx
{
  key: 'details',
  title: 'Details',
  dataIndex: 'details',
  responsive: ['xs', 'sm'], // Hide on mobile and small tablets
}
```

#### Fixed Column

```tsx
{
  key: 'actions',
  title: 'Actions',
  width: 120,
  fixed: 'right', // Sticky to right side
  render: (_, record) => <ActionButtons record={record} />
}
```

## Responsive Design

The table automatically adapts to different screen sizes:

- **Desktop**: Full table with all columns
- **Tablet**: Some columns may be hidden based on `responsive` configuration
- **Mobile**: Collapsible rows with primary columns visible and secondary columns in expandable
  sections

## Accessibility

- Full keyboard navigation support
- Screen reader compatible
- ARIA labels and roles
- Focus management
- High contrast support

## Performance

- Virtual scrolling for large datasets (planned)
- Memoized components to prevent unnecessary re-renders
- Efficient sorting and filtering algorithms
- Lazy loading support (planned)

## Export Functionality

Built-in CSV export with options:

```tsx
interface ExportOptions {
  filename?: string;
  format?: 'csv' | 'excel';
  includeHeaders?: boolean;
  selectedOnly?: boolean;
}
```

## Testing

Comprehensive test coverage including:

- Component rendering
- User interactions
- Sorting and filtering
- Pagination
- Export functionality
- Responsive behavior
- Accessibility compliance

Run tests:

```bash
npm test -- Tables
```

## Examples

See `DataTableExample.tsx` for a complete working example with:

- Sample data generation
- Column configuration
- Event handlers
- Selection management
- Export functionality
- Responsive design demonstration

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- React 18+
- Material-UI 5+
- TypeScript 4.5+

## Contributing

When adding new features:

1. Update TypeScript interfaces
2. Add comprehensive tests
3. Update documentation
4. Ensure accessibility compliance
5. Test responsive behavior
6. Update examples if needed
