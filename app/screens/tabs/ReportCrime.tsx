import React, { useState, useEffect } from "react";
import {
  Text,
  StatusBar,
  HStack,
  IconButton,
  CloseIcon,
  Alert,
  Select,
  CheckIcon,
  TextArea,
  Icon,
  WarningIcon,
  FormControl,
  Button,
  Input,
  Heading,
  Box,
  Center,
  VStack,
  NativeBaseProvider,
} from "native-base";

import * as Permissions from "expo-permissions";
import * as Location from "expo-location";

import { AntDesign } from "@expo/vector-icons";
import { useReportCrime } from "../../hooks/useReportCrime";

function ReportCrime() {
  const { reportCrime } = useReportCrime();
  const { crimeReported } = useReportCrime();
  const [serverError, setServerError] = useState("");
  let [errors, setErrors] = useState({
    type: "",
    location: "",
  });
  let [crimeData, setCrimeData] = useState({
    type: "",
    description: "",
  });
  let [locationData, setLocation] = useState({
    display_name: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    lat: -200, // lat range from -90 to 90 and lon -180 to 180
    lon: -200,
  });

  const validate = () => {
    if (crimeData.type.length === 0) {
      setErrors({ ...errors, type: "Crime Type is required" });
      console.log("In if1");
      console.log(crimeData.type.length);
      return false;
    }
    if (locationData.lat === -200 || locationData.lon === -200) {
      setErrors({ ...errors, location: "Couldn't obtain location" });
      console.log("In if2");
      console.log(locationData.lat);
      console.log(locationData.lon);
      return false;
    }
    console.log("return true");
    return true;
  };

  const getLocationName = async (lat, lon) => {
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };
    const url = `https://nominatim.openstreetmap.org/reverse?format=geojson&lat=${lat}&lon=${lon}`;
    let response = await fetch(url, requestOptions);
    console.log(response);
    response = await response.json();
    return response;
  };

  useEffect(() => {
    const getLocation = async () => {
      const { status } = Permissions.askAsync(Permissions.LOCATION_FOREGROUND);
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        setErrors({
          ...errors,
          location: "Permission to access location was denied",
        });
      }
      const location = await Location.getCurrentPositionAsync({});
      setLocation({ ...locationData, lat: location.coords.latitude });
      setLocation({ ...locationData, lon: location.coords.longitude });
      console.log(location);
      const reverseLocation = await getLocationName(
        location.coords.latitude,
        location.coords.longitude
      );
      console.log("Returning from getLocation name");
      console.log(reverseLocation);
      setLocation({
        display_name: reverseLocation.features[0].properties.display_name,
        city: reverseLocation.features[0].properties.address.city,
        state: reverseLocation.features[0].properties.address.state,
        country: reverseLocation.features[0].properties.address.country,
        pincode: reverseLocation.features[0].properties.address.postcode,
        lat: reverseLocation.features[0].geometry.coordinates[0],
        lon: reverseLocation.features[0].geometry.coordinates[1],
      });
    };
    getLocation();
  }, []);

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
          Report Crime
        </Heading>
        <StatusBar barStyle="light-content" />
        <Box safeAreaTop />
        <HStack
          px={1}
          py={3}
          justifyContent="space-between"
          alignItems="center"
          w="100%"
          maxW={350}
        >
          <HStack alignItems="center">
            <Input
              variant="underlined"
              mb={5}
              InputLeftElement={
                <Icon as={<AntDesign name="enviroment" />} size={5} ml={2} />
              }
              value={locationData.display_name}
            ></Input>
          </HStack>
        </HStack>
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
          <FormControl isRequired isInvalid={!!errors.type}>
            <FormControl.Label>Crime Type</FormControl.Label>
            <Select
              accessibilityLabel="Choose Crime Type"
              placeholder="Choose Crime Type"
              onValueChange={(itemValue) => {
                setCrimeData({ ...crimeData, type: itemValue });
                setErrors({ ...errors, type: "" });
              }}
              _selectedItem={{
                bg: "cyan.600",
                endIcon: <CheckIcon size={4} />,
              }}
            >
              <Select.Item label="Robbery" value="roberry" />
              <Select.Item label="Harassment" value="harassment" />
              <Select.Item label="Hit 'N' Run" value="hit_n_run" />
              <Select.Item label="Murder" value="murder" />
              <Select.Item label="Mob Lynching" value="mob_lynching" />
              <Select.Item label="Corruption" value="corruption" />
              <Select.Item
                label="Police Misconduct"
                value="police_misconduct"
              />
              <Select.Item
                label="Human Trafficking"
                value="human_trafficking"
              />
            </Select>
            {errors.type.length > 0 && (
              <FormControl.ErrorMessage leftIcon={<WarningIcon size="xs" />}>
                Please make a selection!
              </FormControl.ErrorMessage>
            )}
          </FormControl>
          <FormControl>
            <FormControl.Label>Crime Description</FormControl.Label>
            <TextArea
              h={20}
              placeholder="Describe crime in more detail"
              onChangeText={(value) =>
                setCrimeData({ ...crimeData, description: value })
              }
            />
          </FormControl>
          <Button
            mt="2"
            colorScheme="indigo"
            leftIcon={<AntDesign name="pluscircleo" size="sm" color="white" />}
            onPress={() =>
              validate()
                ? reportCrime(
                    {
                      type: crimeData.type,
                      lat: locationData.lat,
                      lon: locationData.lon,
                      description: crimeData.description,
                      city: locationData.city,
                      state: locationData.state,
                      country: locationData.country,
                      pincode: locationData.pincode,
                    },
                    setServerError
                  )
                : null
            }
          >
            Report
          </Button>
          {crimeReported && (
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
                    Submitted successfully!
                  </Text>
                </HStack>
                <IconButton
                  variant="unstyled"
                  icon={<CloseIcon size={3} color="coolGray.600" />}
                />
              </HStack>
            </Alert>
          )}
        </VStack>
      </Box>
    </Center>
  );
}
export default () => {
  return (
    <NativeBaseProvider>
      <Center flex={1} px={3}>
        <ReportCrime />
      </Center>
    </NativeBaseProvider>
  );
};
