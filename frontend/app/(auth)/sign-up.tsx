import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { createElement, useState } from "react";
import { ActivityIndicator, Platform, Text, TextInput, TouchableOpacity } from "react-native";

import { authStyles, PLACEHOLDER_COLOR } from "../../components/auth/authStyles";
import OceanAuthLayout from "../../components/auth/OceanAuthLayout";

// Clerk's bot-protection (Smart CAPTCHA) looks for this element by id on web
// during custom sign-up flows; without it, it silently falls back to a
// lower-trust invisible widget. Native platforms don't render it.
const CaptchaSlot = () =>
  Platform.OS === "web" ? createElement("div", { id: "clerk-captcha" }) : null;

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    setError(null);
    setIsSubmitting(true);
    try {
      await signUp.create({
        emailAddress: emailAddress.trim(),
        password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage ?? "Unable to sign up.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    setError(null);
    setIsSubmitting(true);
    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code });

      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        router.replace("/");
      } else {
        setError("Verification is incomplete. Double-check the code.");
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage ?? "Unable to verify email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pendingVerification) {
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
            <Text style={authStyles.buttonText}>Verify Email</Text>
          )}
        </TouchableOpacity>
      </OceanAuthLayout>
    );
  }

  return (
    <OceanAuthLayout
      title="Ocean Atlas"
      subtitle="Create an account to get started"
      footer={
        <>
          <Text style={authStyles.footerText}>Already have an account?</Text>
          <Link href="/sign-in" replace>
            <Text style={authStyles.footerLink}> Sign in</Text>
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

      <CaptchaSlot />

      <TouchableOpacity
        style={[authStyles.button, isSubmitting && authStyles.buttonDisabled]}
        onPress={onSignUpPress}
        disabled={isSubmitting}
        activeOpacity={0.85}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#04202D" />
        ) : (
          <Text style={authStyles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>
    </OceanAuthLayout>
  );
}
