import { useMantineTheme } from '@mantine/core';
import { ResponsivePie, PieSvgProps } from '@nivo/pie';
import { useDark } from '@/utils/helpers';

interface PieChartDatum {
    id: string | number;
    label: string;
    value: number;
}

interface PieChartProps {
    data: PieChartDatum[];
}

const PieChart = ({ data, ...restProps }: PieChartProps & Partial<PieSvgProps<PieChartDatum>>) => {
    const theme = useMantineTheme();
    const dark = useDark();

    // console.log('PieChart data:', data);

    return (
        <div style={{ height: '100%', width: '100%' }}>
            <ResponsivePie
                {...restProps}
                data={data}
                margin={{ top: 0, right: 30, bottom: 70, left: 30 }}
                innerRadius={0.6}
                padAngle={1}
                cornerRadius={5}
                activeOuterRadiusOffset={8}
                borderWidth={1}
                borderColor={{ from: 'color' }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor={dark ? theme.colors.gray[0] : theme.colors.dark[6]}
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: 'color' }}
                arcLabelsSkipAngle={10}
                colors={{ scheme: 'set2' }}
                theme={{
                    tooltip: {
                        container: {
                            color: dark ? theme.colors.gray[0] : theme.colors.dark[6],
                            background: dark ? theme.colors.dark[7] : theme.white,
                        },
                    },
                }}
            />
        </div>
    );
};

export default PieChart;
