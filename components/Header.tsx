import { Flex, IconButton, Box } from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import React from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Database } from "@/lib/schema";
import { FaHome } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Header() {
  const supabase = useSupabaseClient<Database>();
  const session = useSession();
  const router = useRouter();
  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      padding="1.5rem"
      bg="gray.900"
      color="white"
    >
      <Link href="/">
        <IconButton aria-label="Home" icon={<FaHome />} />
      </Link>
      <Flex>
        <Link href="/Profile">
          <Box marginRight="4" fontWeight="bold">
            Profile
          </Box>
        </Link>
        <Link href="/BarChart">
          <Box marginRight="4" fontWeight="bold">
            Points
          </Box>
        </Link>
        <Box
          cursor="pointer"
          fontWeight="bold"
          onClick={async () => {
            const { error } = await supabase.auth.signOut();
            if (error) console.log("Error logging out:", error.message);
            else {
              router.push("/");
            }
          }}
        >
          Logout
        </Box>
      </Flex>
    </Flex>
  );
}
