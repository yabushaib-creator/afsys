import { useState } from 'react';
import { Select, Button, Divider } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

/**
 * A Select that shows a "+ Add" button inside the dropdown when the
 * typed text does not match any existing option.
 *
 * Props (in addition to all standard Ant Design Select props):
 *   options       – array of { value, label }
 *   onQuickAdd    – called with the current search text when user clicks Add
 */
export default function QuickAddSelect({ options = [], onQuickAdd, ...selectProps }) {
  const [searchValue, setSearchValue] = useState('');

  const hasMatch = options.some(opt =>
    String(opt.value ?? '').toLowerCase() === searchValue.toLowerCase() ||
    String(opt.label ?? '').toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickAdd && searchValue.trim()) {
      onQuickAdd(searchValue.trim());
    }
  };

  return (
    <Select
      showSearch
      {...selectProps}
      options={options}
      searchValue={searchValue}
      onSearch={setSearchValue}
      filterOption={(input, option) =>
        String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
      }
      dropdownRender={(menu) => (
        <>
          {menu}
          {searchValue.trim() && !hasMatch && (
            <>
              <Divider style={{ margin: '4px 0' }} />
              <div style={{ padding: '4px 8px 8px' }}>
                <Button
                  type="primary"
                  block
                  icon={<PlusOutlined />}
                  onMouseDown={handleAdd}
                  style={{ borderRadius: 6, background: '#52c41a', borderColor: '#52c41a' }}
                >
                  Add &quot;{searchValue}&quot;
                </Button>
              </div>
            </>
          )}
        </>
      )}
    />
  );
}
