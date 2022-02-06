import React from "react";
import {
  Box,
  Button,
  Center,
  FormControl,
  Heading,
  HStack,
  Icon,
  Input,
  Link,
  Text,
  VStack,
} from "native-base";
import type { NavigationProp } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import { useAuth } from "../hooks/useAuth";

export default function Login({
  navigation,
}: {
  navigation: NavigationProp<any>;
}) {
  const { signIn, signInWithGoogle } = useAuth();
  return (
    <Center w="100%">
      <Box safeArea p="2" py="8" w="90%" maxW="290">
        <Heading
          size="lg"
          fontWeight="600"
          color="coolGray.800"
          _dark={{
            color: "warmGray.50",
          }}
        >
          Welcome
        </Heading>
        <Heading
          mt="1"
          _dark={{
            color: "warmGray.200",
          }}
          color="coolGray.600"
          fontWeight="medium"
          size="xs"
        >
          Sign in to continue!
        </Heading>

        <VStack space={3} mt="5">
          <FormControl>
            <FormControl.Label>Email ID</FormControl.Label>
            <Input />
          </FormControl>
          <FormControl>
            <FormControl.Label>Password</FormControl.Label>
            <Input type="password" />
            <Link
              _text={{
                fontSize: "xs",
                fontWeight: "500",
                color: "indigo.500",
              }}
              alignSelf="flex-end"
              mt="1"
            >
              Forget Password?
            </Link>
          </FormControl>
          <Button mt="2" colorScheme="indigo" onPress={signIn}>
            Sign in
          </Button>
          <Button
            mt="2"
            colorScheme="light"
            leftIcon={<Icon as={AntDesign} name="google" size="sm" />}
            onPress={signInWithGoogle}
          >
            Sign in with Google
          </Button>
          <HStack mt="6" justifyContent="center">
            <Text
              fontSize="sm"
              color="coolGray.600"
              _dark={{
                color: "warmGray.200",
              }}
            >
              I'm a new user.{" "}
            </Text>
            <Link
              _text={{
                color: "indigo.500",
                fontWeight: "medium",
                fontSize: "sm",
              }}
              href="#"
              onPress={() => navigation.navigate("SignUp")}
            >
              Sign Up
            </Link>
          </HStack>
        </VStack>
      </Box>
    </Center>
  );
}
