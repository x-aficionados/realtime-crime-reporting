import React from "react";
import { Box, Text, Button } from "native-base";
import type { NavigationProp } from "@react-navigation/native";

export default function Help({
  navigation,
}: {
  navigation: NavigationProp<any>;
}) {
  return (
    <Box alignItems="center">
      <Text>Help</Text>
      <Button
        size="sm"
        colorScheme="secondary"
        onPress={() => navigation.navigate("Login")}
      >
        Close
      </Button>
    </Box>
  );
}
