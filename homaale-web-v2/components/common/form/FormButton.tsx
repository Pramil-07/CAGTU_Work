import type { ButtonProps } from "@mantine/core";
import { Button, Loader } from "@mantine/core";

import type { FormButtonProps } from "@/types/FormButtonProps";

const FormButton = ({
    tabIndex,
    name,
    isSubmitting,
    handleClick,
    id,
    background,
    disabled,
    icon,
    ...restProps
}: FormButtonProps & ButtonProps) => {
    return (
        <Button
            {...restProps}
            tabIndex={tabIndex}
            id={`form-button${id ? id : name}`}
            onClick={handleClick}
            disabled={isSubmitting || disabled}
            sx={{
                background: background,

            }}
        >
            {!isSubmitting ? (
                <span>{icon}{name}</span>
            ) : (
                <span>
                    <Loader size="sm" />
                </span>
            )}
        </Button>
    );
};

export default FormButton;
