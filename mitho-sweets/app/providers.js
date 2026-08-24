"use client";

import { MantineProvider } from "@mantine/core";


export function Providers({ children }) {
  return (
      <MantineProvider
          theme={{
            fontFamily: 'Inter, sans-serif', // Default font
            colors: {
              // Crimson red color scheme for primary elements
              brand: [
                '#fff5f5', // lightest
                '#ffe3e3',
                '#ffc1cc',
                '#ff9ebb',
                '#ff7a99',
                '#ff5777',
                '#ff3355', // primary crimson red
                '#e62e4d',
                '#cc2944',
                '#b3243c'  // darkest
              ],
              // Background color based on #F2F7F2
              background: [
                '#F2F7F2', // exact match for background
                '#e8ede8',
                '#dee3de',
                '#d4d9d4',
                '#cacfc9',
                '#c0c5c0',
                '#b6bbb6',
                '#acb1ac',
                '#a2a7a2',
                '#989d98'
              ]
            },
            primaryColor: 'brand', // Set crimson red as primary color
            components: {
              Button: {
                    vars: (theme, props) => ({
                  root: {
                            '--button-bg': props.variant === 'outline' ? 'transparent' : theme.colors.brand[7],
                            '--button-hover': props.variant === 'outline' ? theme.colors.brand[8] : theme.colors.brand[8],
                            '--button-color': props.variant === 'outline' ? theme.colors.brand[7] : '#fff',
                            '--button-hover-color': '#fff',
                            '--button-bd': props.variant === 'outline' ? `1px solid ${theme.colors.brand[7]}` : 'none',
                  },
                }),
              },
            },

                  DateInput: {
                      styles: (theme) => ({
                          input: {
                              borderColor: theme.colors.brand[5],
                              '&:focus': {
                                  borderColor: theme.colors.brand[7],
                                  boxShadow: `0 0 0 1px ${theme.colors.brand[7]}`,
                              },
                          },
                          calendar: {
                              backgroundColor: theme.white,
                              borderRadius: theme.radius.md,
                              boxShadow: theme.shadows.md,
                              border: `1px solid ${theme.colors.gray[3]}`,
                          },
                          day: {
                              '&[data-selected]': {
                                  backgroundColor: theme.colors.brand[5],
                                  color: theme.white,
                                  borderRadius: theme.radius.sm,
                              },
                              '&:hover': {
                                  backgroundColor: theme.colors.brand[3],
                              },
                          },
                      }),

              },
            // Apply background color globally
            globalStyles: (theme) => ({
              body: {
                backgroundColor: theme.colors.background[0], // #F2F7F2
                color: theme.colors.brand[9], // Dark crimson for text contrast
              },
            }),
          }}
          withGlobalStyles
          withNormalizeCSS
      >
        {children}
      </MantineProvider>
  );
}