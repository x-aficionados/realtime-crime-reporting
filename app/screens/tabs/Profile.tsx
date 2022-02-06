import React from "react";
import { Box, Text, Button } from "native-base";
import { useAuth } from "../../hooks/useAuth";

export default function Profile() {
  const { signOut } = useAuth();
  return (
    <Box alignItems="center">
      <Text>Profile</Text>
      <Button onPress={() => signOut()}>Logout</Button>
    </Box>
  );
}
