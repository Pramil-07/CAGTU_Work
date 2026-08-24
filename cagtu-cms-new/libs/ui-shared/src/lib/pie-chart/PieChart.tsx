import { useDark } from '@cagtu-cms/util-formatter';
import { useMantineTheme } from '@mantine/core';
import { ResponsivePie, PieSvgProps, DefaultRawDatum } from '@nivo/pie';

interface PieChartProps {
    data: any;
}

const PieChart = ({ data, ...restProps }: PieChartProps & Partial<PieSvgProps<DefaultRawDatum>>) => {
    const theme = useMantineTheme();
    const [dark] = useDark();

    return (
        <ResponsivePie
            {...restProps}
            data={data}
            margin={{ top: 30, bottom: 30, right: 30, left: 30 }}
            innerRadius={0.6}
            padAngle={1}
            cornerRadius={5}
            activeOuterRadiusOffset={8}
            borderWidth={1}
            borderColor={{
                from: 'color',
            }}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor={dark ? theme.colors.gray['0'] : theme.colors.dark['6']}
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: 'color' }}
            arcLabelsSkipAngle={10}
            colors={{ scheme: 'set2' }}
            theme={{
                tooltip: {
                    container: {
                        color: dark ? theme.colors.gray['0'] : theme.colors.dark['6'],
                        background: dark ? theme.colors.dark['7'] : theme.white,
                    },
                },
            }}
        />
    );
};

export default PieChart;
