import React, { useState } from "react";
import Head from "next/head";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
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

export default function PasswordReset() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const toast = useToast();
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
        description: "The passwords do not match.",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      return;
    }
    try {
      const { error: passwordResetError } = await supabase.auth.updateUser({
        password,
      });
      if (passwordResetError) {
        throw passwordResetError;
      }
      toast({
        title: "Success",
        description: "Your password has been changed successfully.",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
      await router.push("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while changing the password.",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  };

  return (
    <ChakraProvider>
      <Head>
        <title>Password Reset Page</title>
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
                <FormLabel>New Password (More than 5 characters.)</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Confirm New Password</FormLabel>
                <Input
                  type="password"
                  value={passwordConf}
                  onChange={(e) => setPasswordConf(e.target.value)}
                />
              </FormControl>
              <Button colorScheme="blue" width="full" mt={4} type="submit">
                Change Password
              </Button>
            </form>
          </VStack>
        </Box>
      </VStack>
    </ChakraProvider>
  );
}
