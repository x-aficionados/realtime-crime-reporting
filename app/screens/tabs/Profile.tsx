import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { faExclamationCircle } from "@fortawesome/fontawesome-free-solid";
import { makeFetch } from "../../util/util";
import Constants from "expo-constants";
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

export default function Profile() {
  const { signOut } = useAuth();
  const baseUrl = Constants.manifest.extra.apiUrl;
  const userInfoUrl = "/api/v1/userinfo"
  let [detailsUpdated, setDetailsUpdated] = useState(false);
  const [serverError, setServerError] = useState("");
  const [userData, setUserData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    contactNo: "",
    closeContacts: [
      {
          "first_name": "Jane",
          "last_name": "Doe",
          "contact_no": "1234567890"
      }
  ],
  });
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    address: "",
    contactNo: "",
  });

  const updateUserDetails = async (
      data: {
        email: string,
        first_name: string;
        last_name: string;
        contact_no: string;
        address: string;
        close_contacts: any;
      },
      setServerError: (message: string) => void
    ) => {
      makeFetch(
        { uri: userInfoUrl, method: "POST", body: data },
        () => {setDetailsUpdated(true);},
        (message: string) => setServerError(message)
      );
    };

    useEffect(() => {
      const getUserDetails = async (
        setServerError: (message: string) => void
      ) => {
        makeFetch(
          { uri: userInfoUrl, method: "GET", body: {} },
          (response: string) => {
            console.log(response);
            setUserData({
              email: response.email || "",
              firstName: response.first_name || "",
              lastName: response.last_name || "",
              contactNo: response.contact_no || "",
              address: response.address || "",
              closeContacts: response.close_contacts || [
                {
                    "first_name": "Jane",
                    "last_name": "Doe",
                    "contact_no": "1234567890"
                }
            ],
            });
          },
          (message: string) => setServerError(message)
        );
      };
      getUserDetails(setServerError);
    }, [])


    const validate = () => {
      if (userData.firstName.length === 0) {
        setErrors({ ...errors, firstName: "First name is required" });
        return false;
      } else if (userData.lastName.length === 0) {
        setErrors({ ...errors, lastName: "Last name is required" });
        return false;
      } else if (userData.contactNo.length === 0) {
        setErrors({ ...errors, contactNo: "Contact is required" });
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
        Profile Details
      </Heading>
      <VStack space={3} mt="5">
        {serverError ? (
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
        ) : null}
        <FormControl isRequired>
          <FormControl.Label>Email</FormControl.Label>
          <Input value={userData.email}
            isDisabled={true}
          />
        </FormControl>
        <FormControl isRequired isInvalid={!!errors.firstName}>
          <FormControl.Label>First Name</FormControl.Label>
          <Input value={userData.firstName}
            onChangeText={(value) => {
              setUserData({...userData, firstName: value});
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
          <Input value={userData.lastName}
            onChangeText={(value) => {
              setUserData({...userData, lastName: value});
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
        <FormControl isRequired isInvalid={!!errors.contactNo}>
          <FormControl.Label>Contact Number</FormControl.Label>
          <Input value={userData.contactNo}
            onChangeText={(value) => {
              setUserData({...userData, contactNo: value});
              setErrors({ ...errors, contactNo: "" });
            }}
          />
          {errors.contactNo ? (
            <FormControl.ErrorMessage>
              {errors.contactNo}
            </FormControl.ErrorMessage>
          ) : (
            <FormControl.HelperText>e.g. 123456789</FormControl.HelperText>
          )}
        </FormControl>
        <FormControl isInvalid={!!errors.address}>
          <FormControl.Label>Address</FormControl.Label>
          <Input value={userData.address}
            onChangeText={(value) => {
              setUserData({...userData, address: value});
              setErrors({ ...errors, address: "" });
            }}
          />
          {errors.address ? (
            <FormControl.ErrorMessage>
              {errors.address}
            </FormControl.ErrorMessage>
          ) : (
            <FormControl.HelperText>
              e.g. 12, ABC street, Baroda, Gujarat, India
            </FormControl.HelperText>
          )}
        </FormControl>

        <Button
          mt="2"
          colorScheme="indigo"
          onPress={() =>
            validate()
              ? updateUserDetails(
                  {
                    email: userData.email,
                    first_name: userData.firstName,
                    last_name: userData.lastName,
                    contact_no: userData.contactNo,
                    address: userData.address,
                    close_contacts: userData.closeContacts,
                  },
                  setServerError
                )
              : null
          }
        >
          Update Details
        </Button>
        {/*TODO: line 250 to 277 are not working */
            detailsUpdated && (
            <Alert
              w="90%"
              maxW={400}
              status="success"
              colorScheme="success"
              mt={2}
            >
              <HStack
                flexShrink={1}
                space={2}
                alignItems="center"
                justifyContent="space-between"
              >
                <HStack flexShrink={1} space={2} alignItems="center">
                  <Alert.Icon />
                  <Text fontSize="md" fontWeight="medium" color="coolGray.800">
                    Updated successfully!
                  </Text>
                </HStack>
                <IconButton
                  variant="unstyled"
                  icon={<CloseIcon size={3} color="coolGray.600" />}
                  onPress={() => {setDetailsUpdated(false)}}
                />
              </HStack>
            </Alert>
          )}
        <Button onPress={() => signOut()}>Logout</Button>
      </VStack>
    </Box>
  </Center>
  );
}