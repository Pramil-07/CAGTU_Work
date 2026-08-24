import type { SelectProps } from "@mantine/core";
import { useMantineTheme } from "@mantine/core";
import { Select } from "@mantine/core";
import type { FieldProps } from "formik";
import { Field } from "formik";

import type { InputFieldProps } from "@/types/InputFieldProps";
import {useEffect, useMemo, useState} from "react";

interface SelectOption {
    value: string;
    label: string;
    ancestors?: string[];
    fontWeight?: 'bold' | 'normal';
}

const SelectField = ({
  name,
  error,
  touch,
  marginIgnore,
  handleChange,
  data,
  creatable,
 hierarchical =false,
    filter,

  ...rest
}: InputFieldProps & SelectProps & React.RefAttributes<HTMLInputElement>) => {
  const errTouch = error && touch ? error : null;
  const theme = useMantineTheme();
  const [options, setOptions] = useState(data || []);
    const defaultHierarchicalFilter = useMemo(
        () => (
            value: string,
            item: SelectOption
        ): boolean => {
            const searchTerm = value.toLowerCase().trim();
            if (!searchTerm) return true;

            const matchesLabel = item.label.toLowerCase().includes(searchTerm);
            const hasMatchingChild = options.some((option:any) =>
                option.ancestors?.includes(item.value) &&
                option.label.toLowerCase().includes(searchTerm)
            );
            const hasMatchingParent = item.ancestors?.some((ancestorId) =>
                options.some(
                    (option:any) =>
                        option.value === ancestorId &&
                        option.label.toLowerCase().includes(searchTerm)
                )
            );

            return matchesLabel || hasMatchingChild || hasMatchingParent;
        },
        [options] // Depend on options to access the latest data
    );

  // Update options when data prop changes
  useEffect(() => {
    setOptions(data || []);
  }, [data]);

  return (
    <Field name={name}>
      {({ field, form }: FieldProps) => {
        return (
          <Select
            {...field}
            {...rest}
            name={name}
            data={options}
            onChange={
              handleChange
                ? handleChange
                : (value) => form.setFieldValue(name, value)
            }
            mb={marginIgnore ? 0 : 24}
            error={errTouch}
            radius="md"
            onBlurCapture={() => form.setFieldTouched(name, true)}
            sx={{
              ["& .mantine-Select-label"]: {
                color:
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[0]
                    : theme.colors.gray[8],
                fontWeight: 400,
                marginBottom: 6,
              },
            }}

            size="md"
            creatable={creatable}
            getCreateLabel={(query) => `+ Create ${query}`}
            onCreate={
              creatable
                ? (query) => {
                    const newOption = { value: query, label: query };
                    setOptions((current:any) => [...current, newOption]);
                    form.setFieldValue(name, query);
                    handleChange?.(query);
                    return newOption;
                  }
                : undefined
            }
            filter={hierarchical ? (filter || defaultHierarchicalFilter) : undefined}
          />
        );
      }}
    </Field>
  );
};

export default SelectField;
