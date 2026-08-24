import { createStyles } from "@mantine/core";

export const useServiceDiscountStyles = createStyles((theme) => ({
    ribbonContainer: {
        position: 'absolute',
        height: '180px',
        width: '160px',
        background: 'dark ? theme.colors.dark[8] : "#fff" ',
        overflow: 'hidden',
        top: '235px',
    },

    cornerRibbon: {
        position: 'absolute',
        top: '25px',
        left: '-45px',
        transform: 'rotate(-45deg)',
        backgroundColor: '#ff6b01',
        color: 'white',
        padding: '5px 40px',
        fontSize: '15px',
        fontWeight: 600,
        textAlign: 'center',
        width: '205px',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden',
        zIndex: 10,
    },
}));




