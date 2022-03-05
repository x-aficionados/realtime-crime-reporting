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
  ScrollView
} from "native-base";

export default function Profile() {
  const { signOut } = useAuth();
  const baseUrl = Constants.manifest.extra.apiUrl;
  const userInfoUrl = "/api/v1/userinfo"
  let [detailsUpdated, setDetailsUpdated] = useState(false);
  const [serverError, setServerError] = useState("");

  const [closeContact1, setCloseContact1] = useState({
    first_name: "",
    last_name: "",
    contact_no: "",
  });
  const [closeContact2, setCloseContact2] = useState({
    first_name: "",
    last_name: "",
    contact_no: "",
  });
  const [closeContact3, setCloseContact3] = useState({
    first_name: "",
    last_name: "",
    contact_no: "",
  });

  const [userData, setUserData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    contactNo: "",
  });
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    address: "",
    contactNo: "",
    closeContact1FirstName: "",
    closeContact1LastName: "",
    closeContact1ContactNo: "",
    closeContact2FirstName: "",
    closeContact2LastName: "",
    closeContact2ContactNo: "",
    closeContact3FirstName: "",
    closeContact3LastName: "",
    closeContact3ContactNo: "",
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
        () => setDetailsUpdated(true),
        (message: string) => {setServerError(message)}
      );
    };

    // const getIndividualCloseContacts = (close_contacts) => {
    //   for(const close_contact of close_contacts) {
    //     console.log(close_contact);
    //     setCloseContact1(close_contact);
    //   }
    // }

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
            });
            console.log(response.close_contacts);
            console.log(response.close_contacts[0]);
            const num_contacts = response.close_contacts.length;
            if(num_contacts > 0) {
              setCloseContact1({
                first_name: response.close_contacts[0].first_name || "",
                last_name: response.close_contacts[0].last_name || "",
                contact_no: response.close_contacts[0].contact_no || "",
              });
            }
            if(num_contacts > 1) {
              setCloseContact2({
                first_name: response.close_contacts[1].first_name || "",
                last_name: response.close_contacts[1].last_name || "",
                contact_no: response.close_contacts[1].contact_no || "",
              });
            }
            if(num_contacts > 2) {
              setCloseContact3({
                first_name: response.close_contacts[2].first_name || "",
                last_name: response.close_contacts[2].last_name || "",
                contact_no: response.close_contacts[2].contact_no || "",
              });
            }
          },
          (message: string) => setServerError(message)
        );
      };
      getUserDetails(setServerError);
    }, [])

    // const validateNames = (name: string, nameState: string) {
    //   if (name.length === 0) {
    //     setErrors({ ...errors, nameState: "First name is required" });
    //     return false;
    //   }
    // }

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
      } else if (!((userData.contactNo).match(/\d/g).length === 10)) {
        setErrors({ ...errors, contactNo: "Contact is not valid" });
        return false;
      }
      /*TODO: Add validation for close contacts*/
      return true;
    };

  return (
    <ScrollView>
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
        <Heading
          mt="1"
          color="coolGray.600"
          _dark={{
            color: "warmGray.200",
          }}
          fontWeight="medium"
          size="xs"
        >
          Close Contact 1
        </Heading>
        <FormControl isRequired isInvalid={!!errors.closeContact1FirstName}>
          <FormControl.Label>First Name</FormControl.Label>
          <Input value={closeContact1.first_name}
            onChangeText={(value) => {
              setCloseContact1({...closeContact1, first_name: value});
              setErrors({ ...errors, closeContact1FirstName: "" });
            }}
          />
          {errors.closeContact1FirstName ? (
            <FormControl.ErrorMessage>
              {errors.closeContact1FirstName}
            </FormControl.ErrorMessage>
          ) : (
            <FormControl.HelperText>e.g. John</FormControl.HelperText>
          )}
        </FormControl>
        <FormControl isRequired isInvalid={!!errors.closeContact1LastName}>
          <FormControl.Label>Last Name</FormControl.Label>
          <Input value={closeContact1.last_name}
            onChangeText={(value) => {
              setCloseContact1({...closeContact1, last_name: value});
              setErrors({ ...errors, closeContact1LastName: "" });
            }}
          />
          {errors.closeContact1LastName ? (
            <FormControl.ErrorMessage>
              {errors.closeContact1LastName}
            </FormControl.ErrorMessage>
          ) : (
            <FormControl.HelperText>e.g. Doe</FormControl.HelperText>
          )}
        </FormControl>
        <FormControl isRequired isInvalid={!!errors.closeContact1ContactNo}>
          <FormControl.Label>Contact Number</FormControl.Label>
          <Input value={closeContact1.contact_no}
            onChangeText={(value) => {
              setCloseContact1({...closeContact1, contact_no: value});
              setErrors({ ...errors, closeContact1ContactNo: "" });
            }}
          />
          {errors.closeContact1ContactNo ? (
            <FormControl.ErrorMessage>
              {errors.closeContact1ContactNo}
            </FormControl.ErrorMessage>
          ) : (
            <FormControl.HelperText>e.g. 123456789</FormControl.HelperText>
          )}
        </FormControl>
        <Heading
          mt="1"
          color="coolGray.600"
          _dark={{
            color: "warmGray.200",
          }}
          fontWeight="medium"
          size="xs"
        >
          Close Contact 2
        </Heading>
        <FormControl isRequired isInvalid={!!errors.closeContact2FirstName}>
          <FormControl.Label>First Name</FormControl.Label>
          <Input value={closeContact2.first_name}
            onChangeText={(value) => {
              setCloseContact2({...closeContact2, first_name: value});
              setErrors({ ...errors, closeContact2FirstName: "" });
            }}
          />
          {errors.closeContact2FirstName ? (
            <FormControl.ErrorMessage>
              {errors.closeContact2FirstName}
            </FormControl.ErrorMessage>
          ) : (
            <FormControl.HelperText>e.g. John</FormControl.HelperText>
          )}
        </FormControl>
        <FormControl isRequired isInvalid={!!errors.closeContact2LastName}>
          <FormControl.Label>Last Name</FormControl.Label>
          <Input value={closeContact2.last_name}
            onChangeText={(value) => {
              setCloseContact2({...closeContact2, last_name: value});
              setErrors({ ...errors, closeContact2LastName: "" });
            }}
          />
          {errors.closeContact2LastName ? (
            <FormControl.ErrorMessage>
              {errors.closeContact2LastName}
            </FormControl.ErrorMessage>
          ) : (
            <FormControl.HelperText>e.g. Doe</FormControl.HelperText>
          )}
        </FormControl>
        <FormControl isRequired isInvalid={!!errors.closeContact2ContactNo}>
          <FormControl.Label>Contact Number</FormControl.Label>
          <Input value={closeContact2.contact_no}
            onChangeText={(value) => {
              setCloseContact2({...closeContact2, contact_no: value});
              setErrors({ ...errors, closeContact2ContactNo: "" });
            }}
          />
          {errors.closeContact2ContactNo ? (
            <FormControl.ErrorMessage>
              {errors.closeContact2ContactNo}
            </FormControl.ErrorMessage>
          ) : (
            <FormControl.HelperText>e.g. 123456789</FormControl.HelperText>
          )}
        </FormControl>
        <Heading
          mt="1"
          color="coolGray.600"
          _dark={{
            color: "warmGray.200",
          }}
          fontWeight="medium"
          size="xs"
        >
          Close Contact 3
        </Heading>
        <FormControl isRequired isInvalid={!!errors.closeContact3FirstName}>
          <FormControl.Label>First Name</FormControl.Label>
          <Input value={closeContact3.first_name}
            onChangeText={(value) => {
              setCloseContact3({...closeContact3, first_name: value});
              setErrors({ ...errors, closeContact3FirstName: "" });
            }}
          />
          {errors.closeContact3FirstName ? (
            <FormControl.ErrorMessage>
              {errors.closeContact3FirstName}
            </FormControl.ErrorMessage>
          ) : (
            <FormControl.HelperText>e.g. John</FormControl.HelperText>
          )}
        </FormControl>
        <FormControl isRequired isInvalid={!!errors.closeContact3LastName}>
          <FormControl.Label>Last Name</FormControl.Label>
          <Input value={closeContact3.last_name}
            onChangeText={(value) => {
              setCloseContact3({...closeContact3, last_name: value});
              setErrors({ ...errors, closeContact3LastName: "" });
            }}
          />
          {errors.closeContact3LastName ? (
            <FormControl.ErrorMessage>
              {errors.closeContact3LastName}
            </FormControl.ErrorMessage>
          ) : (
            <FormControl.HelperText>e.g. Doe</FormControl.HelperText>
          )}
        </FormControl>
        <FormControl isRequired isInvalid={!!errors.closeContact3ContactNo}>
          <FormControl.Label>Contact Number</FormControl.Label>
          <Input value={closeContact3.contact_no}
            onChangeText={(value) => {
              setCloseContact3({...closeContact3, contact_no: value});
              setErrors({ ...errors, closeContact3ContactNo: "" });
            }}
          />
          {errors.closeContact3ContactNo ? (
            <FormControl.ErrorMessage>
              {errors.closeContact3ContactNo}
            </FormControl.ErrorMessage>
          ) : (
            <FormControl.HelperText>e.g. 123456789</FormControl.HelperText>
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
                    close_contacts: [closeContact1, closeContact2, closeContact3],
                  },
                  setServerError
                )
              : null
          }
        >
          Update Details
        </Button>
        {detailsUpdated && (
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
  </ScrollView>
  );
}