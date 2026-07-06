import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Text, TextInput, TouchableOpacity } from "react-native";

import { authStyles, PLACEHOLDER_COLOR } from "../../components/auth/authStyles";
import OceanAuthLayout from "../../components/auth/OceanAuthLayout";

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [needsSecondFactor, setNeedsSecondFactor] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSignInPress = async () => {
    if (!isLoaded) return;

    setError(null);
    setIsSubmitting(true);
    try {
      const attempt = await signIn.create({
        identifier: emailAddress.trim(),
        password,
      });

      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        router.replace("/");
      } else if (attempt.status === "needs_second_factor") {
        await signIn.prepareSecondFactor({ strategy: "email_code" });
        setNeedsSecondFactor(true);
      } else {
        setError("Additional verification is required to sign in.");
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage ?? "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    setError(null);
    setIsSubmitting(true);
    try {
      const attempt = await signIn.attemptSecondFactor({
        strategy: "email_code",
        code,
      });

      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        router.replace("/");
      } else {
        setError("Verification is incomplete. Double-check the code.");
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage ?? "Unable to verify code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (needsSecondFactor) {
    return (
      <OceanAuthLayout
        title="Check your email"
        subtitle={`Enter the verification code we sent to ${emailAddress}`}
      >
        <TextInput
          style={authStyles.input}
          placeholder="Verification code"
          placeholderTextColor={PLACEHOLDER_COLOR}
          keyboardType="number-pad"
          value={code}
          onChangeText={setCode}
        />

        {error ? <Text style={authStyles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[authStyles.button, isSubmitting && authStyles.buttonDisabled]}
          onPress={onVerifyPress}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#04202D" />
          ) : (
            <Text style={authStyles.buttonText}>Verify</Text>
          )}
        </TouchableOpacity>
      </OceanAuthLayout>
    );
  }

  return (
    <OceanAuthLayout
      title="Ocean Atlas"
      subtitle="Sign in to chart your dives"
      footer={
        <>
          <Text style={authStyles.footerText}>Don&apos;t have an account?</Text>
          <Link href="/sign-up" replace>
            <Text style={authStyles.footerLink}> Sign up</Text>
          </Link>
        </>
      }
    >
      <TextInput
        style={authStyles.input}
        placeholder="Email"
        placeholderTextColor={PLACEHOLDER_COLOR}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        value={emailAddress}
        onChangeText={setEmailAddress}
      />
      <TextInput
        style={authStyles.input}
        placeholder="Password"
        placeholderTextColor={PLACEHOLDER_COLOR}
        secureTextEntry
        autoCapitalize="none"
        value={password}
        onChangeText={setPassword}
      />

      {error ? <Text style={authStyles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={[authStyles.button, isSubmitting && authStyles.buttonDisabled]}
        onPress={onSignInPress}
        disabled={isSubmitting}
        activeOpacity={0.85}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#04202D" />
        ) : (
          <Text style={authStyles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>
    </OceanAuthLayout>
  );
}
