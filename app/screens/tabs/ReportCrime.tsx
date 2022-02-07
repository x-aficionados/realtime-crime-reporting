import React from 'react';
import {Text, StatusBar, HStack, Alert, Select, CheckIcon, TextArea, Icon, Heading, ScrollView, WarningIcon, FormControl, Button, Input, Stack, WarningOutlineIcon, Box, Center, NativeBaseProvider } from "native-base";
import { Ionicons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
//import GetLocation from 'react-native-get-location'
// import Geolocation from 'react-native-geolocation-service';
import NodeGeocoder from 'node-geocoder';
// import OpenGeoCoder from "node-open-geocoder";
// import reverseGeoCoding from "reverse-geocoding";
// import fetch from "node-fetch";

function ReportCrime() {
    let [errors, setErrors] = React.useState({});
    let [crimeData, setCrimeData] = React.useState("");
    let [locationData, setLocation] = React.useState("");
    //const fetch = unfetch.bind()
    let options = {
        provider: 'openstreetmap'
      };
    let geoCoder = NodeGeocoder(options);
    const validate = () => {
        if (crimeData.crime_type === undefined) {
          setErrors({ ...errors,
            crime_type: 'Crime Type is required'
          });
          return false;
        }
        return true;
    };

    const onSubmit = () => {
      validate() ? console.log({crimeData}) : console.log('Validation Failed');
    };

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
    //       //              latitude: response.features[2].geometry.coordinates[0],
    //       //              longitude: response.features[2].geometry.coordinates[1],
    //       //              complete_adress: response.features[0].properties.address});
    //   })
    //   .then(result => {console.log(result)})
    //   .catch(err => {
    //   	console.error(err);
    //   });
    //   console.log(locationData);
    //  // return locationData.display_name;
    // }

    const getLocation = () => {
        console.log("In func");
        navigator.geolocation.getCurrentPosition(
            function(position) {
              console.log(position);
              console.log("Latitude is :", position.coords.latitude);
              console.log("Longitude is :", position.coords.longitude);
              // GET location name (remaining)
              //await getLocationName(position.coords.latitude, position.coords.longitude);
            },
            function(error) {
              console.error("Error Code = " + error.code + " - " + error.message);
            },
            {maximumAge: 600, timeout: 1000, enableHighAccuracy:true}
          );
        console.log(locationData);
        return locationData;
    };

    return (// eslint-disable-next-line react-native/no-inline-styles
        <Box alignItems="center">
            {/* <Header><Input variant="underlined" mb="5" InputLeftElement={<Icon as={<AntDesign name="enviroment" />} size={5} ml="2" color="muted.400" />} value="text"></Input></Header> */}
            <StatusBar  barStyle="light-content" />
      <Box safeAreaTop  />
      <HStack px="1" py="3" justifyContent="space-between" alignItems="center" w="100%" maxW="350">
        <HStack alignItems="center">
          <Input variant="underlined" mb="5" InputLeftElement={<Icon as={<AntDesign name="enviroment" />} size={5} ml="2" />} value={getLocation()}></Input>
        </HStack>
      </HStack>
            <Stack space={2.5} alignSelf="center" px="4" safeArea mt="4" w={{
                base: "100%",
                md: "25%"
                }}>
            </Stack>
            
            <Box w="90%" maxWidth="300px">
              {/* <Text bold fontSize="xl" mb="4">
                  Report Crime
              </Text> */}
              <FormControl w="3/4" maxW="300" isRequired isInvalid={'crime_type' in errors} b="5">
                <FormControl.Label _text={{
                bold: true
                }}>Crime Type</FormControl.Label>
                <Select selectedValue={crimeData.crime_type} minWidth="200" accessibilityLabel="Choose Service" placeholder="Choose Service" onValueChange={itemValue => setCrimeData({ ...crimeData,
                crime_type: itemValue
                })} _selectedItem={{
                bg: "cyan.600",
                endIcon: <CheckIcon size={4} />
                }} mt="1">
                    <Select.Item label="Robbery" value="roberry" />
                    <Select.Item label="Harassment" value="harassment" />
                    <Select.Item label="Hit 'N' Run" value="hit_n_run" />
                    <Select.Item label="Murder" value="murder" />
                    <Select.Item label="Mob Lynching" value="mob_lynching" />
                    <Select.Item label="Corruption" value="corruption" />
                    <Select.Item label="Police Misconduct" value="police_misconduct" />
                    <Select.Item label="Human Trafficking" value="human_trafficking" />
                </Select>
                {'crime_type' in errors && <FormControl.ErrorMessage leftIcon={<WarningIcon size="xs"/>}>Please make a selection!</FormControl.ErrorMessage>}
              </FormControl>
              <FormControl w="75%" minW="200" maxW="200">
                <FormControl.Label _text={{
                bold: true
                }} mt="5">Crime Description</FormControl.Label>
                    <TextArea h={20} placeholder="Describe crime in more detail" w="75%" minW="200" maxW="200" onChangeText={value => setCrimeData({ ...crimeData,
                    description: value
                    })}/>
              </FormControl>
              <Button _hover={{ bg: 'primary.700' }} leftIcon={<AntDesign name="pluscircleo" size="sm" color="white" />} onPress={onSubmit} mt="5" colorScheme="cyan">
                Report
            </Button>
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

