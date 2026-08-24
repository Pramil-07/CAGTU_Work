import type { Metadata } from "next";
import "./globals.css";
import {Jost} from "next/font/google";
import '@mantine/core/styles.css';
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import {CartProvider} from "../context/CartContext"
import Footer from "@/components/Footer";
import {AuthProvider} from "@/lib/AuthContext";
import {Notifications} from "@mantine/notifications";
import NotificationsProvider from "@/app/NotificationProvider";
import {ModalsProvider} from "@mantine/modals";
import {AuthModalProvider} from "@/components/authModalProvider";
import {AppProgressBar} from "next-nprogress-bar";
import ProgressBar from "@/components/common/ProgressBar";
import "react-quill/dist/quill.snow.css";
import {GoogleOAuthProvider} from "@react-oauth/google";

import '@mantine/dates/styles.css';

const jost = Jost({
  subsets: ['latin'],

})

export const metadata: Metadata = {
  title: "Sweet and Namkin shop",
  description: "Sweet  tasty and namkin desserts ",
    icons:"/assets/logo-bg.png"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
          style={{
            width:""
          }}
        className={jost.className}
      >
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!} >
        <Providers>



            <NotificationsProvider>
                <AuthModalProvider>
          <AuthProvider>
              <ModalsProvider>
          <CartProvider>
              <ProgressBar/>
                      <Navbar/>


          {children}

          <Footer/>
          </CartProvider>
                  </ModalsProvider>
          </AuthProvider>
                </AuthModalProvider>
            </NotificationsProvider>

          </Providers>
      </GoogleOAuthProvider>

        </body>
    </html>
  );
}
