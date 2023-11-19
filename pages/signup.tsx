import React, { useState } from "react";
import Head from "next/head";
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
export default function SignUp() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConf, setPasswordConf] = useState("");

  const onSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (password.length <= 5) {
      toast({
        title: "Error",
        description: "Password must be more than 5 characters.",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      return;
    }
    if (password !== passwordConf) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      return;
    }

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });
      if (signUpError) {
        throw signUpError;
      }
      toast({
        title: "Registration Successful",
        description: "Please Click Home Button",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: "Sign Up Error",
        description: error.error_description || error.message,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  };

  return (
    <ChakraProvider>
      <Head>
        <title>Sign Up Page</title>
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
                <FormLabel>Email Address</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>
                  Password (Password must be more than 5 characters.)
                </FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  type="password"
                  value={passwordConf}
                  onChange={(e) => setPasswordConf(e.target.value)}
                />
              </FormControl>
              <Button colorScheme="blue" width="full" mt={4} type="submit">
                Sign Up
              </Button>
            </form>
          </VStack>
        </Box>
      </VStack>
    </ChakraProvider>
  );
}
