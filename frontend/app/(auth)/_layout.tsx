import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false // Désactive pour TOUS les écrans du groupe
      }}
    >
      <Stack.Screen name="login/index" />
      <Stack.Screen name="register/indexy" />
    </Stack>
  );
}