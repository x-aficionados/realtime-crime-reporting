import React from "react";
import {
  Box,
  Button,
  Center,
  FormControl,
  Heading,
  HStack,
  Input,
  Link,
  VStack,
} from "native-base";
import { useAuth } from "../hooks/useAuth";
import type { NavigationProp } from "@react-navigation/native";

export default function SignUp({
  navigation,
}: {
  navigation: NavigationProp<any>;
}) {
  const { signUp } = useAuth();
  return (
    <Center w="100%">
      <Box safeArea p="2" w="90%" maxW="290" py="8">
        <Heading
          size="lg"
          color="coolGray.800"
          _dark={{
            color: "warmGray.50",
          }}
          fontWeight="semibold"
        >
          Welcome
        </Heading>
        <Heading
          mt="1"
          color="coolGray.600"
          _dark={{
            color: "warmGray.200",
          }}
          fontWeight="medium"
          size="xs"
        >
          Sign up to continue!
        </Heading>
        <VStack space={3} mt="5">
          <FormControl>
            <FormControl.Label>Email</FormControl.Label>
            <Input />
          </FormControl>
          <FormControl>
            <FormControl.Label>Password</FormControl.Label>
            <Input type="password" />
          </FormControl>
          <FormControl>
            <FormControl.Label>Confirm Password</FormControl.Label>
            <Input type="password" />
          </FormControl>
          <Button mt="2" colorScheme="indigo" onPress={signUp}>
            Sign up
          </Button>
          <HStack mt="6" justifyContent="center">
            <Link
              _text={{
                color: "indigo.500",
                fontWeight: "medium",
                fontSize: "sm",
              }}
              href="#"
              onPress={() => navigation.navigate("Login")}
            >
              Go back to sign in
            </Link>
          </HStack>
        </VStack>
      </Box>
    </Center>
  );
}
