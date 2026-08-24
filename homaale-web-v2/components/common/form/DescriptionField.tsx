import type { TextareaProps } from "@mantine/core";
import { Text, Box, useMantineTheme } from "@mantine/core";
import { Field } from "formik";
import type { FieldProps } from "formik";
import { Editor } from "primereact/editor";
import type { FocusEvent } from "react";

import type { InputFieldProps } from "@/types/InputFieldProps";

const DescriptionField = ({
  name,
  label,
  error,
  touch,
  postClicked,
  marginIgnore,
  ...rest
}: InputFieldProps & TextareaProps) => {
  const theme = useMantineTheme();
  const errTouch = error && touch ? error : null;

  // Function to strip HTML tags
  const stripHtml = (html: string): string => {
    const doc = new DOMParser().parseFromString(html || "", "text/html");
    return doc.body.textContent || "";
  };

  return (
    <Field name={name}>
      {({ field, form }: FieldProps) => (
        <Box mb={marginIgnore ? 0 : 24}>
          {label && (
            <Text
              size="sm"
              mb={6}
              style={{
                color:
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[0]
                    : theme.colors.gray[8],
                fontWeight: 400,
              }}
            >
              {label}
              {postClicked  && (
    <Text component="span" color="red" inherit>
      {" "}
      *
    </Text>
  )}
            </Text>
          )}

          {/* <Editor
            value={field.value} // Use plain text as value
            onTextChange={(e) => {
              const plainText = stripHtml(e.htmlValue || "");
              form.setFieldValue(name, plainText);
            }}
            onBlur={(e: FocusEvent<HTMLDivElement>) => form.setFieldTouched(name, true)}
            headerTemplate={
              <span className="ql-formats">
                <button className="ql-bold" />
                <button className="ql-italic" />
                <button className="ql-link" />
              </span>
            }
            style={{
              minHeight: "150px",
              border:
                errTouch && theme.colorScheme === "light"
                  ? "1px solid red"
                  : "1px solid #ced4da",
              borderRadius: 6,
            }}
            {...rest}
          /> */}
              <Editor
              value={field.value}
              onTextChange={(e) => {
                // const plainText = stripHtml(e.htmlValue || "");
                form.setFieldValue(name, e.htmlValue);
              }}
              onBlur={() => form.setFieldTouched(name, true)}
              style={{
                minHeight: "150px",
                border:
                  errTouch && theme.colorScheme === "light"
                    ? "1px solid red"
                    : "1px solid #ced4da",
                borderRadius: 6,
              }}
            />

            {errTouch && (
            <Text size="xs" color="red" mt={4}>
              {error}
            </Text>
          )}
        </Box>
      )}
    </Field>
  );
};

export default DescriptionField;
