import { supabase } from "@/lib/initSupabase";
import "@/styles/app.css";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import type { AppProps } from "next/app";
import Header from "@/components/Header";
import { ChakraProvider } from "@chakra-ui/react";
export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <SessionContextProvider supabaseClient={supabase}>
        <Header />
        <Component {...pageProps} />
      </SessionContextProvider>
    </ChakraProvider>
  );
}
