import { Redirect, Stack } from "expo-router";

import {
  AuthProvider,
  useAuth,
} from "../context/AuthProvider";

function AppNavigator() {
  const {
    session,
    loading,
  } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <>
      <Stack>
        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="signup"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="record-session"
          options={{
            title: "Record Session",
          }}
        />

        <Stack.Screen
          name="edit-session"
          options={{
            title: "Edit Session",
          }}
        />

        <Stack.Screen
          name="game-sessions"
          options={{
            title: "Game Sessions",
          }}
        />

        <Stack.Screen
          name="session-details"
          options={{
            title: "",
          }}
        />
      </Stack>

      {!session ? (
        <Redirect href="/login" />
      ) : (
        <Redirect href="/(tabs)" />
      )}
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}