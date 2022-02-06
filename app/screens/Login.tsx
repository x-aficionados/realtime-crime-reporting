import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Center,
  CloseIcon,
  FormControl,
  Heading,
  HStack,
  Icon,
  IconButton,
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [serverError, setServerError] = useState("");

  const validate = () => {
    if (email.length === 0) {
      setErrors({ ...errors, email: "Email ID is required" });
      return false;
    } else if (password.length === 0) {
      setErrors({ ...errors, password: "Password is required" });
      return false;
    }

    return true;
  };
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
          {serverError && (
            <Alert w="100%" status="error">
              <VStack space={2} flexShrink={1} w="100%">
                <HStack flexShrink={1} space={2} justifyContent="space-between">
                  <HStack space={2} flexShrink={1}>
                    <Alert.Icon mt="1" />
                    <Text fontSize="md" color="coolGray.800">
                      {serverError}
                    </Text>
                  </HStack>
                  <IconButton
                    variant="unstyled"
                    icon={<CloseIcon size="3" color="coolGray.600" />}
                    onPress={() => setServerError("")}
                  />
                </HStack>
              </VStack>
            </Alert>
          )}
          <FormControl isRequired isInvalid={!!errors.email}>
            <FormControl.Label>Email ID</FormControl.Label>
            <Input
              onChangeText={(value) => {
                setEmail(value);
                setErrors({ ...errors, email: "" });
              }}
            />
            {errors.email ? (
              <FormControl.ErrorMessage>
                {errors.email}
              </FormControl.ErrorMessage>
            ) : null}
          </FormControl>
          <FormControl isRequired isInvalid={!!errors.password}>
            <FormControl.Label>Password</FormControl.Label>
            <Input
              type="password"
              onChangeText={(value) => {
                setPassword(value);
                setErrors({ ...errors, password: "" });
              }}
            />
            {errors.password ? (
              <FormControl.ErrorMessage>
                {errors.password}
              </FormControl.ErrorMessage>
            ) : null}
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
          <Button
            mt="2"
            colorScheme="indigo"
            onPress={() =>
              validate() ? signIn({ email, password }, setServerError) : null
            }
          >
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
