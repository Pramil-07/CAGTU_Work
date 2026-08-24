import React, { useState, useMemo, useEffect, forwardRef } from 'react';
import { Select, Text, Box, Group, Stack } from '@mantine/core';
import { IconFolder, IconChevronRight, IconFile } from '@tabler/icons-react';

type NestedCategory = {
  id: number;
  name: string;
  child?: NestedCategory[];
};

type FlatCategory = {
  value: string;
  label: string;
  depth: number;
  parentIds: number[];
  hasChildren: boolean;
  isMatch?: boolean;
};

interface HierarchicalCategorySelectProps {
  categories: NestedCategory[];
  value?: string;
  onChange?: (value: string | null) => void;
  error?: string | React.ReactNode;
  touched?: boolean;
  placeholder?: string;
  label?: string;
  withAsterisk?: boolean;
  searchable?: boolean;
  clearable?: boolean;

}

// Custom select item component
interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  label: string;
  depth: number;
  hasChildren: boolean;
  isMatch?: boolean;
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ label, depth, hasChildren, isMatch, ...others }: ItemProps, ref) => {
    const getIcon = () => {
      if (depth === 0) {
        return <IconFolder size={16} />;
      } else if (depth === 1) {
        return <IconChevronRight size={16} />;
      } else {
        return <IconChevronRight size={16} />;
      }
    };

    return (
      <div ref={ref} {...others}>
        <Group spacing="xs" noWrap>
          <Box
            sx={{
              marginLeft: depth * 20,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {getIcon()}
          </Box>
          <Text
            size="sm"
            weight={isMatch ? 700 : 400}
          >
            {label}
          </Text>
        </Group>
      </div>
    );
  }
);

SelectItem.displayName = 'SelectItem';

const HierarchicalCategorySelect: React.FC<HierarchicalCategorySelectProps> = ({
  categories,
  value,
  onChange,
  error,
  touched,
  placeholder = "Select a category",
  label = "Category",
  withAsterisk = false,
  searchable = true,
  clearable = true,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [selectedPath, setSelectedPath] = useState<string[]>([]);

  // Flatten categories while preserving hierarchy
  const flattenCategories = (
    cats: NestedCategory[],
    depth: number ,
    parentIds: number[] = []
  ): FlatCategory[] => {
    let result: FlatCategory[] = [];

    cats.forEach((cat) => {
      result.push({
        value: cat.id.toString(),
        label: cat.name,
        depth,
        parentIds: [...parentIds],
        hasChildren: !!(cat.child && cat.child.length > 0),
      });

      if (cat.child && cat.child.length > 0) {
        result = result.concat(
          flattenCategories(cat.child, depth + 1, [...parentIds, cat.id])
        );
      }
    });

    return result;
  };

  const flatCategories = useMemo(() => flattenCategories(categories,0), [categories]);

  // Build a map for quick lookup
  const categoryMap = useMemo(() => {
    const map = new Map<string, FlatCategory>();
    flatCategories.forEach((cat) => map.set(cat.value, cat));
    return map;
  }, [flatCategories]);

  // Filter categories based on search - maintaining hierarchical structure
  const filteredCategories = useMemo(() => {
    if (!searchValue.trim()) {
      return flatCategories.map(cat => ({ ...cat, isMatch: false }));
    }

    const searchLower = searchValue.toLowerCase();
    const matchingIds = new Set<string>();
    const includedIds = new Set<string>();

    // Find all directly matching categories
    flatCategories.forEach((cat) => {
      if (cat.label.toLowerCase().includes(searchLower)) {
        matchingIds.add(cat.value);
      }
    });

    // Helper to get all descendants of a category
    const getAllDescendants = (parentValue: string) => {
      const descendants: string[] = [];
      flatCategories.forEach((cat) => {
        if (cat.parentIds.includes(parseInt(parentValue))) {
          descendants.push(cat.value);
          if (cat.hasChildren) {
            descendants.push(...getAllDescendants(cat.value));
          }
        }
      });
      return descendants;
    };

    // Helper to get all ancestors of a category
    const getAllAncestors = (categoryValue: string): string[] => {
      const cat = flatCategories.find(c => c.value === categoryValue);
      if (!cat || cat.parentIds.length === 0) return [];

      const ancestors: string[] = [];
      cat.parentIds.forEach((parentId) => {
        const parentIdStr = parentId.toString();
        ancestors.push(parentIdStr);
        ancestors.push(...getAllAncestors(parentIdStr));
      });
      return ancestors;
    };

    // For each match, include it, all its ancestors, and all its descendants
    matchingIds.forEach((matchId) => {
      includedIds.add(matchId);

      // Add all ancestors
      getAllAncestors(matchId).forEach(id => includedIds.add(id));

      // Add all descendants
      getAllDescendants(matchId).forEach(id => includedIds.add(id));
    });

    // Filter and preserve original hierarchical order
    const filtered = flatCategories
      .filter((cat) => includedIds.has(cat.value))
      .map(cat => ({
        ...cat,
        isMatch: matchingIds.has(cat.value)
      }));

    // The original order from flattenCategories already maintains parent-child hierarchy
    // We just need to ensure we're returning items in that order
    return filtered;
  }, [flatCategories, searchValue]);

  // Update breadcrumb path when value changes
  useEffect(() => {
    if (value) {
      const category = categoryMap.get(value);
      if (category) {
        const path: string[] = [];

        // Build path from parent IDs
        category.parentIds.forEach((parentId) => {
          const parent = categoryMap.get(parentId.toString());
          if (parent) {
            path.push(parent.label);
          }
        });

        // Add current category
        path.push(category.label);

        setSelectedPath(path);
      }
    } else {
      setSelectedPath([]);
    }
  }, [value, categoryMap]);

  return (
    <Stack spacing="xs"mb={15}>
      <Select
      size='md'
      radius={'md'}
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onSearchChange={setSearchValue}
        searchValue={searchValue}
        searchable={searchable}
        clearable={clearable}
        withAsterisk={withAsterisk}
        error={touched && error ? error : undefined}
        data={filteredCategories.map((cat) => ({
          value: cat.value,
          label: cat.label,
          depth: cat.depth,
          hasChildren: cat.hasChildren,
          isMatch: cat.isMatch,
        }))}
        itemComponent={SelectItem}
        filter={() => true} // We handle filtering manually
        maxDropdownHeight={400}
        nothingFound="No categories found"
        styles={{
          dropdown: {
            maxHeight: 400,
            overflowY: 'auto',
          },
        }}
      />

      {selectedPath.length > 0 && (
        <Box
          sx={(theme) => ({
            padding: '8px 12px',
            backgroundColor: theme.colors.gray[0],
            borderRadius: theme.radius.sm,
            border: `1px solid ${theme.colors.gray[3]}`,
          })}
        >
          <Group spacing={4}>
            <Text size="xs" color="dimmed" weight={500}>
              Hierarchy:
            </Text>
            <Text size="xs" color="blue">
              {selectedPath.join(' → ')}
            </Text>
          </Group>
        </Box>
      )}
    </Stack>
  );
};

export default HierarchicalCategorySelect;
