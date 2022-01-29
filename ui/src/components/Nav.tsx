import React, { ReactNode } from "react";
import {
  Box,
  Flex,
  Link,
  Button,
  useColorModeValue,
  HStack,
  useColorMode,
  Container,
} from "@chakra-ui/react";
import { Link as RouterLink, To, useLocation } from "react-router-dom";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";

import { useGoogleAuth } from "../hooks/useGoogleAuth";

export const NavLink = ({ children, to }: { children: ReactNode; to: To }) => (
  <Link
    px={2}
    py={1}
    rounded={"md"}
    _hover={{
      textDecoration: "none",
      bg: useColorModeValue("gray.200", "gray.700"),
    }}
    as={RouterLink}
    to={to}
  >
    {children}
  </Link>
);

export function Nav({ children }: { children: ReactNode }) {
  const { colorMode, toggleColorMode } = useColorMode();
  const { signOut, authorized } = useGoogleAuth();
  const { pathname } = useLocation();
  return (
    <Box bg={useColorModeValue("gray.100", "gray.900")} px={4} w="100%">
      <Container
        as={Flex}
        h={16}
        alignItems={"center"}
        justifyContent={"space-between"}
        maxW={"6xl"}
        direction={{ base: "column", md: "row" }}
        justify={{ base: "center", md: "space-between" }}
        align={{ base: "center", md: "center" }}
      >
        <Box>
          <RouterLink to="/">Crime Network</RouterLink>
        </Box>

        <Flex alignItems={"center"}>
          <HStack as={"nav"} spacing={4}>
            {children}
            <Button onClick={toggleColorMode}>
              {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            </Button>
            {authorized && (
              <Button colorScheme="pink" variant="solid" onClick={signOut}>
                Sign Out
              </Button>
            )}
            {pathname !== "/signin" && !authorized && (
              <Button
                as={RouterLink}
                colorScheme="green"
                variant="solid"
                to="/signin"
              >
                Sign In
              </Button>
            )}
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}
