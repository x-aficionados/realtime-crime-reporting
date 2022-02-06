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
  IconButton,
  Input,
  Link,
  VStack,
  Text,
} from "native-base";
import { useAuth } from "../hooks/useAuth";
import type { NavigationProp } from "@react-navigation/native";

export default function SignUp({
  navigation,
}: {
  navigation: NavigationProp<any>;
}) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    confirmPassword: "",
  });
  const [serverError, setServerError] = useState("");

  const validate = () => {
    if (password !== confirmPassword) {
      setErrors({ ...errors, confirmPassword: "Passwords do not match" });
      return false;
    } else if (email.length === 0) {
      setErrors({ ...errors, email: "Email ID is required" });
      return false;
    } else if (firstName.length === 0) {
      setErrors({ ...errors, firstName: "First name is required" });
      return false;
    } else if (lastName.length === 0) {
      setErrors({ ...errors, lastName: "Last name is required" });
      return false;
    } else if (password.length === 0) {
      setErrors({ ...errors, password: "Password is required" });
      return false;
    }

    return true;
  };
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
            <FormControl.Label>Email</FormControl.Label>
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
            ) : (
              <FormControl.HelperText>
                e.g. john.doe@xyz.com
              </FormControl.HelperText>
            )}
          </FormControl>
          <FormControl isRequired isInvalid={!!errors.firstName}>
            <FormControl.Label>First Name</FormControl.Label>
            <Input
              onChangeText={(value) => {
                setFirstName(value);
                setErrors({ ...errors, firstName: "" });
              }}
            />
            {errors.firstName ? (
              <FormControl.ErrorMessage>
                {errors.firstName}
              </FormControl.ErrorMessage>
            ) : (
              <FormControl.HelperText>e.g. John</FormControl.HelperText>
            )}
          </FormControl>
          <FormControl isRequired isInvalid={!!errors.lastName}>
            <FormControl.Label>Last Name</FormControl.Label>
            <Input
              onChangeText={(value) => {
                setLastName(value);
                setErrors({ ...errors, lastName: "" });
              }}
            />
            {errors.lastName ? (
              <FormControl.ErrorMessage>
                {errors.lastName}
              </FormControl.ErrorMessage>
            ) : (
              <FormControl.HelperText>e.g. Doe</FormControl.HelperText>
            )}
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
            ) : (
              <FormControl.HelperText>
                e.g. J@hnLikesHoRses24$even
              </FormControl.HelperText>
            )}
          </FormControl>
          <FormControl isRequired isInvalid={!!errors.confirmPassword}>
            <FormControl.Label>Confirm Password</FormControl.Label>
            <Input
              type="password"
              onChangeText={(value) => {
                setConfirmPassword(value);
                setErrors({ ...errors, confirmPassword: "" });
              }}
            />
            {errors.confirmPassword ? (
              <FormControl.ErrorMessage>
                {errors.confirmPassword}
              </FormControl.ErrorMessage>
            ) : null}
          </FormControl>
          <Button
            mt="2"
            colorScheme="indigo"
            onPress={() =>
              validate()
                ? signUp(
                    {
                      email,
                      password,
                      first_name: firstName,
                      last_name: lastName,
                    },
                    setServerError
                  )
                : null
            }
          >
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
