import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Login from "./screens/Login";
import SignUp from "./screens/SignUp";
import Root from "./screens/Root";
import Help from "./screens/modals/Help";
import { useAuth } from "./hooks/useAuth";
import { ReportCrimeProvider } from "./hooks/useReportCrime";
const Stack = createNativeStackNavigator();

export default function Layout() {
  const { authenticated } = useAuth();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {authenticated ? (
        // Screens for logged in users
        <Stack.Group>
          <ReportCrimeProvider>
            <Stack.Screen name="Root" component={Root} />
          </ReportCrimeProvider>
        </Stack.Group>
      ) : (
        // Auth screens
        <Stack.Group>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="SignUp" component={SignUp} />
        </Stack.Group>
      )}
      {/* Common modal screens */}
      <Stack.Group screenOptions={{ presentation: "modal" }}>
        <Stack.Screen name="Help" component={Help} />
      </Stack.Group>
      {/* <Center
        flex={1}
        _dark={{
          bg: "coolGray.800",
        }}
        _light={{
          bg: "warmGray.50",
        }}
      >
        <Text fontSize="lg" display="flex" mb="20">
          The active color mode is{" "}
          <Text bold fontSize="lg">
            {colorMode}
          </Text>
        </Text>
        <ThemeToggle />
        <Navigation />
      </Center> */}
    </Stack.Navigator>
  );
}
