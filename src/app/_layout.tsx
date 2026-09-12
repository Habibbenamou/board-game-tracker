import {
  DarkTheme,
  Redirect,
  Stack,
  ThemeProvider,
} from "expo-router";

import {
  AuthProvider,
  useAuth,
} from "../context/AuthContext";

import {
  GroupProvider,
  useGroup,
} from "../context/GroupContext";

function AppNavigator() {
  const {
    session,
    loading: authLoading,
  } = useAuth();

  const {
    groups,
    loading: groupLoading,
  } = useGroup();

  if (
    authLoading ||
    groupLoading
  ) {
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
          name="group-setup"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="player-profile"
          options={{
            title: "Player Profile",
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
      ) : groups.length === 0 ? (
        <Redirect href="/group-setup" />
      ) : (
        <Redirect href="/(tabs)" />
      )}
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <GroupProvider>
        <ThemeProvider value={DarkTheme}>
          <AppNavigator />
        </ThemeProvider>
      </GroupProvider>
    </AuthProvider>
  );
}