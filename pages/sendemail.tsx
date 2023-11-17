import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import {
  ChakraProvider,
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  useToast,
} from "@chakra-ui/react";

export default function SendEmail() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const toast = useToast();
  const [email, setEmail] = useState("");

  const onSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      const { error: sendEmailError } =
        await supabase.auth.resetPasswordForEmail(email, {
          //   redirectTo: "http://localhost:3000/PasswordReset/",
          redirectTo: process.env.NEXT_PUBLIC_PASSWORD_RESET_URL,
        });
      if (sendEmailError) {
        throw sendEmailError;
      }
      toast({
        title: "Success",
        description: "Check your email to reset your password.",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while sending the email.",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  };

  return (
    <ChakraProvider>
      <Head>
        <title>Password Reset Email</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <VStack
        align="center"
        justify="center"
        height="100vh"
        spacing={4}
        bg="gray.50"
      >
        <Box
          p={8}
          maxWidth="400px"
          borderWidth={1}
          borderRadius={8}
          boxShadow="lg"
          bg="white"
        >
          <VStack spacing={4}>
            <form onSubmit={onSubmit}>
              <FormControl isRequired>
                <FormLabel>Registered Email Address</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>
              <Button colorScheme="blue" width="full" mt={4} type="submit">
                Send Email
              </Button>
            </form>
          </VStack>
        </Box>
      </VStack>
    </ChakraProvider>
  );
}
