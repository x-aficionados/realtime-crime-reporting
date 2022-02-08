import React, {useState} from 'react';
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
  Stack,
  Box,
  Center,
  NativeBaseProvider
} from "native-base";

import { AntDesign } from '@expo/vector-icons';
//import GetLocation from 'react-native-get-location'
// import Geolocation from 'react-native-geolocation-service';
import NodeGeocoder from 'node-geocoder';
// import OpenGeoCoder from "node-open-geocoder";
// import reverseGeoCoding from "reverse-geocoding";
// import fetch from "node-fetch";
import { useReportCrime } from "../../hooks/useReportCrime";

function ReportCrime() {
    const {reportCrime} = useReportCrime();
    const {crimeReported} = useReportCrime();
    const [serverError, setServerError] = useState("");
    let [errors, setErrors] = useState({
      crime_type: "",
      location: "",
    });
    let [crimeData, setCrimeData] = useState({
      crime_type: "",
      description: "",
    });
    let [locationData, setLocation] = useState({
      display_name: "",
      road: "",
      city: "",
      state: "",
      country: "",
      pincode: "",
      lat: -200, // lat range from -90 to 90 and long -180 to 180
      long: -200,
    });
    //const fetch = unfetch.bind()
    let options = {
        provider: 'openstreetmap'
      };
    let geoCoder = NodeGeocoder(options);
    const validate = () => {
        if (crimeData.crime_type.length === 0) {
          setErrors({ ...errors,
            crime_type: 'Crime Type is required'
          });
          console.log("In if1");
          console.log(crimeData.crime_type.length);
          return false;
        }
        if (locationData.lat === -200 || locationData.long === -200) {
          setErrors({ ...errors,
            location: 'Couldn\'t obtain location'
          });
          console.log("In if2");
          console.log(locationData.lat);
          console.log(locationData.long);
          return false;
        }
        console.log("return true");
        return true;
    };

    // const onSubmit = () => {
    //   validate() ? console.log({crimeData}) : console.log('Validation Failed');
    // };

    // const getLocationName = async(lat, long) => {
    //   let requestOptions = {
    //       method: 'GET',
    //       redirect: 'follow'
    //   };
    //   let url = `https://nominatim.openstreetmap.org/reverse?format=geojson&lat=${lat}&lon=${long}`;
    //   fetch(url, requestOptions)
    //   .then(response => {
	//       console.log(response.text());
    //       //console.log((response.text()).features[0])
    //       // setLocation({display_name: response.features[0].properties.display_name,
    //       //              road: response.features[0].properties.address.road,
    //       //              city: response.features[0].properties.address.city,
    //       //              state: response.features[0].properties.address.state,
    //       //              country: response.features[0].properties.address.country,
    //       //              pincode: response.features[0].properties.address.postcode,
    //       //              lat: response.features[2].geometry.coordinates[0],
    //       //              long: response.features[2].geometry.coordinates[1],
    //       //              complete_adress: response.features[0].properties.address});
    //   })
    //   .then(result => {console.log(result)})
    //   .catch(err => {
    //   	console.error(err);
    //   });
    //   console.log(locationData);
    //  // return locationData.display_name;
    // }
    const successHandler = (position) => {
      console.log(position);
      console.log("Latitude is :", position.coords.latitude);
      console.log("Longitude is :", position.coords.longitude);
      // GET location name (remaining)
      //await getLocationName(position.coords.latitude, position.coords.longitude);
    }

    const errorHandler = (error) => {
      console.error("Error Code = " + error.code + " - " + error.message);
    }
    const getLocation = () => {
        console.log("In func");
        navigator.geolocation.getCurrentPosition(
            successHandler,
            errorHandler,
            {maximumAge: 10000, timeout: 1000, enableHighAccuracy:true}
          );
        console.log(locationData);
        return locationData.display_name;
    };

    return (// eslint-disable-next-line react-native/no-inline-styles
        <Box alignItems="center">
            <StatusBar  barStyle="light-content" />
            <Box safeAreaTop  />
            <HStack px="1" py="3" justifyContent="space-between" alignItems="center" w="100%" maxW="350">
              <HStack alignItems="center">
                <Input
                  variant="underlined"
                  mb="5"
                  InputLeftElement={
                    <Icon as={<AntDesign name="enviroment" />}
                    size={5}
                    ml="2"
                    />}
                  value={getLocation()}>
                </Input>
              </HStack>
            </HStack>
            <Stack space={3} alignSelf="center" px="4" safeArea mt="4" w={{
                base: "100%",
                md: "25%"
                }}>
            </Stack>
            {serverError && (
            <Alert w="100%" status="error" mb="2">
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
            </Alert>
          )}

            <Box w="90%" maxWidth="300px">
              <FormControl w="3/4" maxW="300" isRequired isInvalid={!!errors.crime_type} b="5">
                <FormControl.Label
                  _text={{bold: true}}
                >
                Crime Type
                </FormControl.Label>
                <Select
                  selectedValue={crimeData.crime_type} minWidth="200"
                  accessibilityLabel="Choose Service" placeholder="Choose Service"
                  onValueChange={itemValue => {
                    setCrimeData({ ...crimeData, crime_type: itemValue});
                    setErrors({ ...errors, crime_type: ""});
                  }}
                  _selectedItem=
                  {{
                    bg: "cyan.600",
                    endIcon: <CheckIcon size={4} />
                  }}
                  mt="1"
                  >
                    <Select.Item label="Robbery" value="roberry" />
                    <Select.Item label="Harassment" value="harassment" />
                    <Select.Item label="Hit 'N' Run" value="hit_n_run" />
                    <Select.Item label="Murder" value="murder" />
                    <Select.Item label="Mob Lynching" value="mob_lynching" />
                    <Select.Item label="Corruption" value="corruption" />
                    <Select.Item label="Police Misconduct" value="police_misconduct" />
                    <Select.Item label="Human Trafficking" value="human_trafficking" />
                </Select>
                {(errors.crime_type.length > 0) &&
                <FormControl.ErrorMessage
                  leftIcon={<WarningIcon size="xs"/>}
                >
                  Please make a selection!
                </FormControl.ErrorMessage>}
              </FormControl>
              <FormControl w="75%" minW="200" maxW="200">
                <FormControl.Label
                  _text=
                  {{
                    bold: true
                  }}
                  mt="5"
                >
                  Crime Description
                </FormControl.Label>
                <TextArea
                  h={20}
                  placeholder="Describe crime in more detail"
                  w="75%" minW="200" maxW="200"
                  onChangeText=
                  {
                    value => setCrimeData({ ...crimeData, description: value})
                  }
                />
              </FormControl>
              <Button
                _hover={{ bg: 'primary.700' }}
                leftIcon={<AntDesign name="pluscircleo" size="sm" color="white" />}
                onPress={() =>
                  validate()
                    ? reportCrime(
                        {
                          crime_type: crimeData.crime_type,
                          lat: locationData.lat,
                          long: locationData.long,
                          description: crimeData.description,
                          city: locationData.city,
                          state: locationData.state,
                          country: locationData.country,
                          road: locationData.road,
                          pincode: locationData.pincode,
                        },
                        setServerError
                      )
                    : null
                }
                mt="5" colorScheme="cyan"
              >
                Report
              </Button>
              {crimeReported &&
                <Alert w="90%" maxW="400" status="success" colorScheme="success" mt="2">
                    <HStack flexShrink={1} space={2} alignItems="center" justifyContent="space-between">
                      <HStack flexShrink={1} space={2} alignItems="center">
                        <Alert.Icon />
                        <Text fontSize="md" fontWeight="medium" color="coolGray.800">
                          Submitted successfully!
                        </Text>
                      </HStack>
                      <IconButton variant="unstyled" icon={<CloseIcon size="3" color="coolGray.600" />} />
                    </HStack>
                </Alert>}
            </Box>
        </Box>
      );
}
export default () => {
    return (
      <NativeBaseProvider>
        <Center flex={1} px="3">
            <ReportCrime />
        </Center>
      </NativeBaseProvider>
    );
};

