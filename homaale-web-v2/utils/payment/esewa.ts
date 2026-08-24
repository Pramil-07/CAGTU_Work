interface EsewaProps {
    success: boolean;
    data: {
        amt: number;
        pdc: number;
        psc: number;
        txAmt: number;
        tAmt: number;
        pid: string;
        scd: string;
        su: string;
        fu: string;
    };
    intent_id: string;
}

export const handleEsewaMutation = (
    path: string,
    params: EsewaProps["data"]
) => {
    const form = document.createElement("form");
    form.setAttribute("method", "POST");
    form.setAttribute("action", path);

    for (const key in params) {
        const hiddenField = document.createElement("input");
        hiddenField.setAttribute("type", "hidden");
        hiddenField.setAttribute("name", key);
        hiddenField.setAttribute(
            "value",
            String(params[key as keyof EsewaProps["data"]])
        );
        form.appendChild(hiddenField);
    }

    document.body.appendChild(form);
    form.submit();
};
