import React from "react";
import { useColorScheme } from "react-native";
import { NativeBaseProvider, extendTheme } from "native-base";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";

import Layout from "./Layout";
import { AuthProvider } from "./hooks/useAuth";

export default function App() {
  const scheme = useColorScheme();
  const config = {
    useSystemColorMode: true,
  };

  // extend the theme
  const customTheme = extendTheme({ config });
  return (
    <NavigationContainer theme={scheme === "dark" ? DarkTheme : DefaultTheme}>
      <NativeBaseProvider theme={customTheme}>
        <AuthProvider>
          <Layout />
        </AuthProvider>
      </NativeBaseProvider>
    </NavigationContainer>
  );
}
