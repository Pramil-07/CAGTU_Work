import { useDark } from '@cagtu-cms/util-formatter';
import { useMantineTheme } from '@mantine/core';
import { ResponsiveLine, LineSvgProps } from '@nivo/line';

interface LineChartProps {
    data: any;
}

const LineChart = ({ data, ...restProps }: LineChartProps & Partial<LineSvgProps>) => {
    const theme = useMantineTheme();
    const [dark] = useDark();

    return (
        <ResponsiveLine
            {...restProps}
            data={data}
            colors={{ scheme: 'set2' }}
            margin={{ top: 10, bottom: 25, left: 50, right: 15 }}
            xScale={{ type: 'point' }}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            useMesh={true}
            enableArea
            enableGridX={false}
            enableSlices="x"
            theme={{
                axis: {
                    ticks: {
                        text: {
                            fill: dark ? theme.colors.gray['0'] : theme.colors.dark['6'],
                        },
                    },
                },
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

export default LineChart;
