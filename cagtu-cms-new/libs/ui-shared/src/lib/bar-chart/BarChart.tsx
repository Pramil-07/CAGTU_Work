import { useDark } from '@cagtu-cms/util-formatter';
import { useMantineTheme } from '@mantine/core';
import { ResponsiveBar, BarSvgProps, BarDatum } from '@nivo/bar';
import { ReactNode } from 'react';

interface BarChartProps {
    data: any;
    keys: string[];
    indexBy: string;
    groupMode: 'grouped' | 'stacked';
    axisBottomLegendName?: ReactNode;
    axisBottomLegendPosition?: 'start' | 'middle' | 'end';
}

const BarChart = ({
    data,
    keys,
    indexBy,
    groupMode,
    axisBottomLegendName,
    axisBottomLegendPosition = 'middle',
    ...restProps
}: BarChartProps & Partial<BarSvgProps<BarDatum>>) => {
    const theme = useMantineTheme();
    const [dark] = useDark();

    return (
        <ResponsiveBar
            {...restProps}
            data={data}
            keys={keys}
            indexBy={indexBy}
            margin={{ top: 10, bottom: 40, left: 40 }}
            padding={0.5}
            groupMode={groupMode}
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={{ scheme: 'set2' }}
            borderColor={{
                from: 'color',
            }}
            axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: axisBottomLegendName,
                legendPosition: axisBottomLegendPosition,
                legendOffset: 32,
            }}
            labelSkipWidth={20}
            labelSkipHeight={12}
            theme={{
                axis: {
                    ticks: {
                        text: {
                            fill: dark ? theme.colors.gray['0'] : theme.colors.dark['6'],
                        },
                    },
                    legend: {
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

export default BarChart;
