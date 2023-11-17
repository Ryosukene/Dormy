import React from "react";
import {
  ChakraProvider,
  Box,
  VStack,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Divider,
  Link,
  Text,
  Heading,
  Center,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { EmailIcon, LockIcon } from "@chakra-ui/icons";
import Head from "next/head";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState } from "react";
import { useRouter } from "next/router";
import { useToast } from "@chakra-ui/react";

export default function LoginPage() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConf, setPasswordConf] = useState("");
  const toast = useToast();
  const onLogin = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (signInError) {
        if (signInError.message.includes("Invalid login credentials")) {
          // 登録されていないメールアドレス、または無効なパスワードの場合のエラー処理
          toast({
            title: "Login Failed",
            description: "Invalid email or password.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        } else if (password !== passwordConf) {
          toast({
            title: "Error",
            description: "Password does not match",
            status: "error",
            duration: 9000,
            isClosable: true,
          });
          return;
        } else {
          // その他のエラー
          toast({
            title: "Login Failed",
            description: signInError.message,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
        return;
      }
      if (signInError) {
        throw signInError;
      }
      await router.push("/");
    } catch {
      alert("Error Occurred");
    }
  };

  return (
    <Center h="100vh" bg="gray.50">
      <Box
        p={8}
        maxWidth="400px"
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
      >
        <Box textAlign="center">
          <Heading>Login</Heading>
        </Box>
        <Divider my={4} />
        <Box my={4} textAlign="left">
          <form onSubmit={onLogin}>
            <FormControl>
              <FormLabel>Your email address</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <EmailIcon color="gray.300" />
                </InputLeftElement>
                <Input
                  type="email"
                  required
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </InputGroup>
            </FormControl>
            <FormControl mt={6}>
              <FormLabel>Your password</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <LockIcon color="gray.300" />
                </InputLeftElement>
                <Input
                  type="password"
                  required
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </InputGroup>
            </FormControl>
            <Button width="full" mt={4} type="submit" colorScheme="green">
              Sign in
            </Button>
          </form>
        </Box>
        <Box textAlign="center">
          <Text>
            <Link color="teal.500" href="/sendemail">
              Forgot your password?
            </Link>
          </Text>
          <Text mt={4}>
            Don&apos;t have an account?
            <Link color="teal.500" href="/signup">
              Sign up
            </Link>
          </Text>
        </Box>
      </Box>
    </Center>
  );
}
