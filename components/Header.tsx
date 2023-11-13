import { Flex, IconButton, Box } from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import React from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Database } from "@/lib/schema";
import { FaHome } from "react-icons/fa";
export default function Header() {
  const supabase = useSupabaseClient<Database>();
  const session = useSession();
  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      padding="1.5rem"
      bg="gray.900"
      color="white"
    >
      <a href="/">
        <IconButton aria-label="Home" icon={<FaHome />} />
      </a>
      <Flex>
        <Box as="a" href="/Profile" marginRight="4" fontWeight="bold">
          Profile
        </Box>
        <Box as="a" href="/BarChart" marginRight="4" fontWeight="bold">
          Points
        </Box>
        <Box
          cursor="pointer"
          fontWeight="bold"
          onClick={async () => {
            const { error } = await supabase.auth.signOut();
            if (error) console.log("Error logging out:", error.message);
          }}
        >
          Logout
        </Box>
      </Flex>
    </Flex>
  );
}
``;
