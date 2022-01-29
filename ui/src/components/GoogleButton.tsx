import { FcGoogle } from "react-icons/fc";
import { Button, Center, Text } from "@chakra-ui/react";
import { MouseEventHandler } from "react";

export default function GoogleButton({
  handleSignIn,
}: {
  handleSignIn: MouseEventHandler;
}) {
  return (
    <Center p={8}>
      <Button
        w={"full"}
        maxW={"md"}
        variant={"outline"}
        leftIcon={<FcGoogle />}
        onClick={handleSignIn}
      >
        <Center>
          <Text>Sign in with Google</Text>
        </Center>
      </Button>
    </Center>
  );
}
