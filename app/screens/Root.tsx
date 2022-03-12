import React from "react";
import { AntDesign } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import Feed from "./tabs/Feed";
import Profile from "./tabs/Profile";
import ReportCrime from "./tabs/ReportCrime";
import History from "./tabs/History";
import { icon } from "@fortawesome/fontawesome-svg-core";
import { ReportCrimeProvider } from "../hooks/useReportCrime";

const Tab = createBottomTabNavigator();

export default function Root() {
  return (
    <ReportCrimeProvider>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName = "questioncircle";

            if (route.name === "History") {
              iconName = focused ? "profile" : "bars";
            } else if (route.name === "Report Crime") {
              iconName = focused ? "pluscircleo" : "pluscircle";
            } else if (route.name === "Profile") {
              iconName = focused ? "user" : "user";
            }

            // You can return any component that you like here!
            return <AntDesign name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "tomato",
          tabBarInactiveTintColor: "gray",
          headerShown: false,
        })}
      >
        <Tab.Screen name="Profile" component={Profile} />
        <Tab.Screen name="Report Crime" component={ReportCrime}></Tab.Screen>
        <Tab.Screen name="History" component={History} />
      </Tab.Navigator>
    </ReportCrimeProvider>
  );
}
