import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { barebonesBoxedTailwindConfig } from "./theme";
import { BarebonesFonts } from "./theme-fonts";

interface PasswordResetEmailProps {
  companyName?: string;
  url?: string;
}

export const PasswordResetEmail = ({
  companyName = "PulseGuard",
  url = "{{.URL}}",
}: PasswordResetEmailProps) => {
  return (
    <Tailwind config={barebonesBoxedTailwindConfig}>
      <Html>
        <Head>
          <BarebonesFonts />
        </Head>
        <Preview>Reset your PulseGuard password</Preview>
        <Body className="bg-bg-1 m-0 py-10 px-4 font-sans text-text-primary">
          <Container className="max-w-[480px] bg-bg-2 border border-border rounded-lg p-8 mx-auto shadow-sm">
            <Section className="mb-6">
              <Heading className="text-sm font-bold text-text-primary m-0">
                Reset your password
              </Heading>
            </Section>
            <Section className="mb-6">
              <Text className="text-xs leading-relaxed text-text-secondary m-0">
                We received a request to reset the password associated with your account. Click the button below to choose a new password.
              </Text>
            </Section>
            <Section className="mb-6">
              <Button
                className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-md no-underline inline-block"
                href={url}
              >
                Reset Password
              </Button>
            </Section>
            <Section className="border-t border-border pt-4">
              <Text className="text-[10px] leading-relaxed text-text-muted m-0">
                This link will expire in 24 hours. If you did not request this password reset, you can safely ignore this email; your password will remain unchanged.
              </Text>
              <Text className="text-[10px] leading-relaxed text-text-muted mt-2 m-0">
                If the button above doesn't work, copy and paste this URL into your web browser:
                <br />
                <span className="text-text-secondary select-all">{url}</span>
              </Text>
            </Section>
          </Container>
          <Text className="text-center text-[10px] text-text-muted mt-6 m-0">
            © {new Date().getFullYear()} {companyName}. All rights reserved.
          </Text>
        </Body>
      </Html>
    </Tailwind>
  );
};

export default PasswordResetEmail;
