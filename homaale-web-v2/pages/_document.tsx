import { useBrandData } from "@/brand/BrandContext";
import { BrandData, cagtuBrand } from "@/brand/brandDataCagtu";
import { homaaleBrand } from "@/brand/brandDataHomaale";
import { useBrand } from "@/hooks/useBrand";
import { createStylesServer, ServerStyles } from "@mantine/next";
import type { DocumentContext } from "next/document";
import Document, { Head, Html, Main, NextScript } from "next/document";
import { hostname } from "os";

const stylesServer = createStylesServer();
//   const {brandData}=useBrandData()

class _Document extends Document<{brandData:BrandData}> {
    static async getInitialProps(ctx: DocumentContext) {
        const initialProps = await Document.getInitialProps(ctx);
        const host = ctx.req?.headers['x-forwarded-host'] || ctx.req?.headers.host || "localhost"||"test-develop.d1blvbd29a3yth.amplifyapp.com";
        const isCagtu = host === "cagtu"|| host.includes("localhost")||host.includes("test-develop.d1blvbd29a3yth.amplifyapp.com")||host.includes("cagtu.com.au");
    const brandData: BrandData = isCagtu ? cagtuBrand : homaaleBrand;
      console.log(brandData.favicon,"favicon2")
      console.log("isCagtu",isCagtu)
      console.log("host",host)

        return {
            ...initialProps,
            brandData,
        
            styles: [
                initialProps.styles,
                <ServerStyles
                    html={initialProps.html}
                    server={stylesServer}
                    key="styles"
                />,
            ],
        };
    }
    
    

    render() {
        const { brandData } = this.props;
        return (
            <Html lang="en">
                <Head key="site-head">
                    <meta
                        key="ie=edge"
                        httpEquiv="X-UA-Compatible"
                        content="ie=edge"
                    />
                    <meta
                        key="x-ua-compatible"
                        httpEquiv="x-ua-compatible"
                        content="ie=edge"
                    />
                    <meta key="author" name="author" content="Homaale" />
                    <meta property="og:locale" content="en_US" />
                    <meta property="og:type" content="website"></meta>
                    <meta property="og:image:type" content="image/*" />
                    <meta property="og:site_name" content={brandData.name} />
                    <meta name="twitter:card" content="summary_large_image" />
                    <meta name="theme-color" content="#fff" />

                    <link
                        rel="preconnect"
                        href="https://fonts.googleapis.com"
                    />
                    <link
                        rel="preconnect"
                        href="https://fonts.gstatic.com"
                        crossOrigin="use-credentials"
                    />
                    <link
                        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
                        rel="stylesheet"
                    />
                    <link
                        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
                        rel="stylesheet"
                    />

                    <link
                        rel="shortcut icon"
                        href={brandData.favicon}
                        type="image/x-icon"
                    />
                    <link
                        rel="apple-touch-icon"
                        href={brandData.favicon}
                    />
                    <link
                        rel="apple-touch-icon"
                        sizes="57x57"
                        href={brandData.favicon}
                    />
                    <link
                        rel="apple-touch-icon"
                        sizes="72x72"
                        href={brandData.favicon}
                    />
                    <link
                        rel="apple-touch-icon"
                        sizes="76x76"
                        href={brandData.favicon}
                    />
                    <link
                        rel="apple-touch-icon"
                        sizes="114x114"
                        href={brandData.favicon}
                    />
                    <link
                        rel="apple-touch-icon"
                        sizes="120x120"
                        href={brandData.favicon}
                    />
                    <link
                        rel="apple-touch-icon"
                        sizes="144x144"
                        href={brandData.favicon}
                    />
                    <link
                        rel="apple-touch-icon"
                        sizes="152x152"
                        href={brandData.favicon}
                    />
                    <link
                        rel="apple-touch-icon"
                        sizes="180x180"
                        href={brandData.favicon}
                    />
                    <link rel="apple-touch-icon" href="/icon.png" />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default _Document;
