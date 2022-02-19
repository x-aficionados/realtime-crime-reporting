import React from "react";
import { AntDesign } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import Feed from "./tabs/Feed";
import Profile from "./tabs/Profile";
import ReportCrime from "./tabs/ReportCrime";
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

            if (route.name === "Feed") {
              iconName = focused ? "profile" : "bars";
            } else if (route.name === "Report Crime") {
              iconName = focused ? "pluscircleo" : "pluscircle";
            } else if (route.name === "Profile") {
              iconName = focused ? "smile-circle" : "smileo";
            }

            // You can return any component that you like here!
            return <AntDesign name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "tomato",
          tabBarInactiveTintColor: "gray",
          headerShown: false,
        })}
      >
        <Tab.Screen name="Feed" component={Feed} />
        <Tab.Screen name="Report Crime" component={ReportCrime}></Tab.Screen>
        <Tab.Screen name="Profile" component={Profile} />
      </Tab.Navigator>
    </ReportCrimeProvider>
  );
}
